import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateAudit } from './audit-policy.mjs';

const braces = {
  value: 'braces',
  children: {
    ID: 1240992,
    URL: 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
    Severity: 'high',
    'Tree Versions': ['3.0.3'],
  },
};
test('accepts only the verified backport and preserves other findings', () => {
  assert.equal(evaluateAudit(JSON.stringify(braces), 1, true).mitigated, 1);
  assert.throws(
    () => evaluateAudit(JSON.stringify(braces), 1, false),
    /Unmitigated/
  );
  for (const record of [
    { ...braces, value: 'other' },
    { ...braces, children: { ...braces.children, ID: 999 } },
    {
      ...braces,
      children: { ...braces.children, 'Tree Versions': ['3.0.2', '3.0.3'] },
    },
    {
      ...braces,
      children: {
        ...braces.children,
        URL: 'https://github.com/advisories/new-advisory',
      },
    },
  ])
    assert.throws(
      () => evaluateAudit(JSON.stringify(record), 1, true),
      /Unmitigated/
    );
});
test('fails closed on transport failure and invalid audit output', () => {
  assert.throws(() => evaluateAudit('', 1, true));
  assert.throws(() => evaluateAudit('', null, true));
  assert.throws(() => evaluateAudit('not json', 1, true));
  assert.throws(() => evaluateAudit('{"type":"error"}', 1, true));
  assert.throws(() =>
    evaluateAudit(
      JSON.stringify({
        ...braces,
        children: { ...braces.children, Severity: 'unknown' },
      }),
      1,
      true
    )
  );
  assert.equal(evaluateAudit('', 0, true).mitigated, 0);
});
