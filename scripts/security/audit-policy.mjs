import assert from 'node:assert/strict';

export function evaluateAudit(stdout, status, bracesVerified) {
  assert.ok(
    status === 0 || status === 1,
    `Audit command failed with status ${status}`
  );
  const lines = stdout.trim() ? stdout.trim().split(/\r?\n/) : [];
  assert.ok(
    status === 0 || lines.length > 0,
    'Audit failed without a valid report'
  );
  const blocked = [];
  let mitigated = 0;
  for (const line of lines) {
    const record = JSON.parse(line);
    const detail = record.children;
    assert.ok(
      typeof record.value === 'string' &&
        detail &&
        typeof detail.Severity === 'string',
      'Malformed audit record'
    );
    assert.ok(
      ['info', 'low', 'moderate', 'high', 'critical'].includes(detail.Severity),
      'Unknown audit severity'
    );
    if (!['high', 'critical'].includes(detail.Severity)) continue;
    const patchedBraces =
      record.value === 'braces' &&
      detail.URL === 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm' &&
      String(detail.ID) === '1240992' &&
      detail['Tree Versions']?.length === 1 &&
      detail['Tree Versions'][0] === '3.0.3' &&
      bracesVerified;
    if (patchedBraces) mitigated++;
    else
      blocked.push(
        `${record.value}: ${detail.Issue} (${detail.URL ?? detail.ID})`
      );
  }
  assert.equal(
    blocked.length,
    0,
    `Unmitigated high/critical vulnerabilities:\n${blocked.join('\n')}`
  );
  return { mitigated };
}
