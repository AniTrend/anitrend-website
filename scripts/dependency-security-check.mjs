import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import semver from 'semver';

const DEFAULT_AUDIT_REPORT_FILE = 'audit-report.txt';
const AUDIT_TRANSPORT_FAILURE_PATTERN =
  /The remote server failed to provide the requested resource|Response code 400|HTTPError/;

const auditReportPath = path.resolve(
  process.cwd(),
  process.env.AUDIT_REPORT_FILE || DEFAULT_AUDIT_REPORT_FILE
);
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const rootPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const rootDependencies = new Set([
  ...Object.keys(rootPackageJson.dependencies || {}),
  ...Object.keys(rootPackageJson.devDependencies || {}),
]);

const npmInfoCache = new Map();

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, '');
}

function stripTimestampFromLine(line) {
  return line.replace(/^\d{4}-\d{2}-\d{2}T[^ ]+\s+/, '');
}

function normalizePackageName(specifier) {
  const atIndex = specifier.lastIndexOf('@');
  return atIndex > 0 ? specifier.slice(0, atIndex) : specifier;
}

function normalizePackageVersion(specifier) {
  const atIndex = specifier.lastIndexOf('@');
  return atIndex > 0
    ? specifier
        .slice(atIndex + 1)
        .replace(/^npm:/, '')
        .replace(/\s+\[[^\]]+\]$/, '')
    : '';
}

function execNpmView(args) {
  const cacheKey = args.join('\0');

  if (npmInfoCache.has(cacheKey)) {
    return npmInfoCache.get(cacheKey);
  }

  const raw = execFileSync('npm', ['view', ...args, '--json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

  const parsed = raw ? JSON.parse(raw) : null;
  npmInfoCache.set(cacheKey, parsed);

  return parsed;
}

function getFixVersion(advisory) {
  const versions = execNpmView([advisory.packageName, 'versions']);
  const candidates = Array.isArray(versions) ? versions : [];
  // Audit output can include non-semver entries after metadata decoration, so only
  // compare published versions that semver can reason about.
  const currentTreeVersions = advisory.treeVersions.filter((value) =>
    semver.valid(value)
  );

  return candidates.find((candidate) => {
    if (!semver.valid(candidate)) {
      return false;
    }

    if (currentTreeVersions.length > 0) {
      const isSameOrNewer = currentTreeVersions.some((currentVersion) =>
        semver.gte(candidate, currentVersion)
      );

      if (!isSameOrNewer) {
        return false;
      }
    }

    return !semver.satisfies(candidate, advisory.vulnerableVersions, {
      includePrerelease: true,
    });
  });
}

function getDependencyRange(packageName, packageVersion, dependencyName) {
  const dependencies = execNpmView([
    `${packageName}@${packageVersion}`,
    'dependencies',
  ]);

  if (!dependencies || typeof dependencies !== 'object') {
    return null;
  }

  return dependencies[dependencyName] ?? null;
}

/**
 * Classifies whether a high/critical advisory can be fixed directly, through a
 * normal dependency refresh, through a Yarn resolution override, or only by an
 * upstream package release.
 *
 * @param {{
 *   packageName: string;
 * }} advisory
 * @param {{
 *   packageName: string;
 *   packageVersion: string;
 *   isWorkspaceRoot: boolean;
 * }} dependent
 * @param {string} fixVersion
 * @returns {{
 *   classification:
 *     | 'direct-upgrade'
 *     | 'workspace-lockfile-resolution'
 *     | 'direct-dependency-refresh'
 *     | 'transitive-lockfile-resolution'
 *     | 'direct-dependent-upgrade'
 *     | 'upstream-dependent-upgrade'
 *     | 'workspace-resolution-override'
 *     | 'upstream-blocked';
 *   recommendation: string;
 * }}
 */
function classifyDependent(advisory, dependent, fixVersion) {
  if (dependent.isWorkspaceRoot) {
    const directDependency = rootDependencies.has(advisory.packageName);

    return {
      classification: directDependency
        ? 'direct-upgrade'
        : 'workspace-lockfile-resolution',
      recommendation: directDependency
        ? `Upgrade ${advisory.packageName} to ${fixVersion}`
        : `Refresh the lockfile so ${advisory.packageName} resolves to ${fixVersion}`,
    };
  }

  const currentRange = getDependencyRange(
    dependent.packageName,
    dependent.packageVersion,
    advisory.packageName
  );

  if (
    currentRange &&
    semver.valid(fixVersion) &&
    semver.satisfies(fixVersion, currentRange, {includePrerelease: true})
  ) {
    return {
      classification: rootDependencies.has(dependent.packageName)
        ? 'direct-dependency-refresh'
        : 'transitive-lockfile-resolution',
      recommendation: `Refresh ${dependent.packageName} so ${advisory.packageName} resolves to ${fixVersion}`,
    };
  }

  const latestVersion = execNpmView([dependent.packageName, 'version']);

  if (typeof latestVersion === 'string') {
    const latestRange = getDependencyRange(
      dependent.packageName,
      latestVersion,
      advisory.packageName
    );

    if (
      latestRange &&
      semver.valid(fixVersion) &&
      semver.satisfies(fixVersion, latestRange, {includePrerelease: true})
    ) {
      return {
        classification: rootDependencies.has(dependent.packageName)
          ? 'direct-dependent-upgrade'
          : 'upstream-dependent-upgrade',
        recommendation: rootDependencies.has(dependent.packageName)
          ? `Upgrade ${dependent.packageName} to ${latestVersion} so ${advisory.packageName} can resolve to ${fixVersion}`
          : `Wait for or adopt ${dependent.packageName}@${latestVersion} so ${advisory.packageName} can resolve to ${fixVersion}`,
      };
    }
  }

  // Yarn lets the workspace pin transitive packages with `resolutions`, which
  // gives us a pragmatic mitigation path even when an upstream package uses an
  // exact or otherwise incompatible semver range.
  if ((rootPackageJson.packageManager || '').startsWith('yarn@')) {
    return {
      classification: 'workspace-resolution-override',
      recommendation: `Add or refresh a root resolution so ${advisory.packageName} resolves to ${fixVersion}`,
    };
  }

  return {
    classification: 'upstream-blocked',
    recommendation: `No compatible published fix was found through ${dependent.packageName}`,
  };
}

function parseAuditReport(rawReport) {
  const lines = stripAnsi(rawReport)
    .split('\n')
    .map(stripTimestampFromLine);

  const advisories = [];
  let current = null;
  let mode = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line) {
      continue;
    }

    const packageMatch = line.match(/^[├└]─\s+([^ ]+)$/);
    if (packageMatch) {
      if (current) {
        advisories.push(current);
      }

      current = {
        packageName: packageMatch[1],
        severity: null,
        vulnerableVersions: null,
        treeVersions: [],
        dependents: [],
        issue: null,
      };
      mode = null;
      continue;
    }

    if (!current) {
      continue;
    }

    if (line.includes('├─ Tree Versions')) {
      mode = 'treeVersions';
      continue;
    }

    if (line.includes('└─ Dependents')) {
      mode = 'dependents';
      continue;
    }

    const issueMatch = line.match(/Issue:\s+(.+)$/);
    if (issueMatch) {
      current.issue = issueMatch[1];
      continue;
    }

    const severityMatch = line.match(/Severity:\s+(.+)$/);
    if (severityMatch) {
      current.severity = severityMatch[1];
      continue;
    }

    const vulnerableMatch = line.match(/Vulnerable Versions:\s+(.+)$/);
    if (vulnerableMatch) {
      current.vulnerableVersions = vulnerableMatch[1];
      continue;
    }

    if (mode === 'treeVersions') {
      const treeVersionMatch = line.match(/[├└]─\s+([^\s]+)$/);
      if (treeVersionMatch) {
        current.treeVersions.push(treeVersionMatch[1]);
      }
      continue;
    }

    if (mode === 'dependents') {
      const dependentMatch = line.match(/[├└]─\s+(.+)$/);
      if (!dependentMatch) {
        continue;
      }

      const specifier = dependentMatch[1];
      const packageName = normalizePackageName(specifier);
      const packageVersion = normalizePackageVersion(specifier);

      current.dependents.push({
        raw: specifier,
        packageName,
        packageVersion,
        isWorkspaceRoot: specifier.includes('workspace:.'),
      });
    }
  }

  if (current) {
    advisories.push(current);
  }

  return advisories;
}

function getAuditReport() {
  if (process.env.AUDIT_REPORT_FILE) {
    return fs.readFileSync(auditReportPath, 'utf8');
  }

  try {
    const stdout = execFileSync(
      'yarn',
      ['npm', 'audit', '--all', '--recursive'],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

    fs.writeFileSync(auditReportPath, stdout);
    return stdout;
  } catch (error) {
    const stdout = error.stdout?.toString() ?? '';
    const stderr = error.stderr?.toString() ?? '';
    const combinedOutput = [stdout, stderr].filter(Boolean).join('\n').trim();

    if (combinedOutput) {
      console.error(
        '⚠️ yarn npm audit exited non-zero; analyzing the captured output for actionable vulnerabilities'
      );
    }

    fs.writeFileSync(auditReportPath, combinedOutput);
    return combinedOutput;
  }
}

function main() {
  const rawReport = getAuditReport();
  const advisories = parseAuditReport(rawReport).filter(
    (advisory) =>
      advisory.packageName &&
      advisory.vulnerableVersions &&
      ['high', 'critical'].includes(advisory.severity)
  );

  if (
    advisories.length === 0 &&
    AUDIT_TRANSPORT_FAILURE_PATTERN.test(rawReport)
  ) {
    console.error(
      '❌ Unable to complete the dependency audit because the registry response looked like a transport failure; check npm registry availability or audit request handling.'
    );
    process.exitCode = 1;
    return;
  }

  if (advisories.length === 0) {
    console.log('✅ No high or critical vulnerabilities found');
    return;
  }

  const actionable = [];
  const blocked = [];

  for (const advisory of advisories) {
    const fixVersion = getFixVersion(advisory);

    if (!fixVersion) {
      blocked.push({
        advisory,
        recommendation: 'No fixed version is currently published in npm metadata',
      });
      continue;
    }

    const dependentResults = advisory.dependents.map((dependent) => ({
      dependent,
      ...classifyDependent(advisory, dependent, fixVersion),
    }));

    const hasActionableDependent = dependentResults.some(
      ({classification}) => classification !== 'upstream-blocked'
    );

    const result = {
      advisory,
      fixVersion,
      dependentResults,
    };

    if (hasActionableDependent) {
      actionable.push(result);
    } else {
      blocked.push(result);
    }
  }

  if (blocked.length > 0) {
    console.log('⚠️ Remaining upstream-blocked vulnerabilities:');

    for (const result of blocked) {
      const {advisory, fixVersion, dependentResults = []} = result;
      const currentVersions = advisory.treeVersions.join(', ');
      console.log(
        `- ${advisory.packageName} (${advisory.severity}) ${currentVersions} -> ${
          fixVersion || 'no published fix'
        }`
      );
      console.log(`  ${advisory.issue}`);

      for (const dependentResult of dependentResults) {
        console.log(
          `  • ${dependentResult.dependent.raw}: ${dependentResult.recommendation}`
        );
      }
    }
  }

  if (actionable.length === 0) {
    console.log('✅ No actionable high or critical vulnerabilities remain');
    return;
  }

  console.log('❌ Actionable high or critical vulnerabilities found:');

  for (const {advisory, fixVersion, dependentResults} of actionable) {
    const currentVersions = advisory.treeVersions.join(', ');
    console.log(
      `- ${advisory.packageName} (${advisory.severity}) ${currentVersions} -> ${fixVersion}`
    );
    console.log(`  ${advisory.issue}`);

    for (const dependentResult of dependentResults) {
      if (dependentResult.classification === 'upstream-blocked') {
        continue;
      }

      console.log(
        `  • ${dependentResult.dependent.raw}: ${dependentResult.recommendation}`
      );
    }
  }

  process.exitCode = 1;
}

main();
