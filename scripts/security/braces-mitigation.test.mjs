import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { verifyBracesMitigation } from './braces-mitigation.mjs';

test('installed backport rejects hostile inputs and preserves ordinary behavior', () => {
  assert.ok(verifyBracesMitigation() > 0);
});

test('missing or altered installed mitigation fails closed', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'braces-security-test-'));
  try {
    assert.throws(() => verifyBracesMitigation(root), /No installed braces/);
    const target = path.join(root, 'node_modules', 'braces');
    mkdirSync(path.dirname(target), { recursive: true });
    cpSync(path.resolve('node_modules/braces'), target, { recursive: true });
    writeFileSync(
      path.join(target, 'lib/parse.js'),
      'module.exports = input => input;\n'
    );
    assert.throws(
      () => verifyBracesMitigation(root),
      /Unverified braces source/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
