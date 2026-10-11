import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { verifyBracesMitigation } from './security/braces-mitigation.mjs';
import { evaluateAudit } from './security/audit-policy.mjs';

const copies = verifyBracesMitigation();
console.log(
  `Verified depth-limit backport in all ${copies} installed braces copies.`
);
const result = spawnSync(
  'yarn',
  ['npm', 'audit', '--all', '--recursive', '--json'],
  {
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 10 * 1024 * 1024,
  }
);
writeFileSync('audit-report.json', result.stdout ?? '');
process.stdout.write(result.stdout ?? '');
process.stderr.write(result.stderr ?? '');
if (result.error) throw result.error;
const { mitigated } = evaluateAudit(result.stdout, result.status, true);
console.log(
  `No unmitigated high/critical findings. ${mitigated} visible braces advisory record(s) covered by the verified backport.`
);
