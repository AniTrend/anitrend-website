import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

// Backport of micromatch/braces#72 at 28d440b5dd449dbf1fe6f3506cf94ecca4d02660.
// Keep the package's real name/version and advisory visible until upstream releases a fix.
const hashes = {
  'lib/compile.js':
    'b651f7715e6db8942ce61d3394357b4d81c8ece88240aa31a458ea1165edd195',
  'lib/constants.js':
    'f9fb688959232eee3e6ad7906a5b0e3234815db49ee857ef86983d65b917dc7c',
  'lib/expand.js':
    '7ea3e14c2b2b256ef244fd3d83b8fcaa20aa2232b4e6d768c3bb6ab567f66cf5',
  'lib/parse.js':
    '72aabaadaa555cdfbd07fbd7c7f743373e4dc8eec04a97550cc57bbeec30eb6c',
  'lib/stringify.js':
    '49dc2d8bafa74f34715a18a845bcb82ce66caaf3bab4cf117998e06b1f9a50a9',
};

function installedBraces(modules, result = []) {
  if (!existsSync(modules)) return result;
  for (const entry of readdirSync(modules, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const dir = path.join(modules, entry.name);
    if (entry.name.startsWith('@')) {
      installedBraces(dir, result);
      continue;
    }
    if (entry.name === 'braces') result.push(dir);
    installedBraces(path.join(dir, 'node_modules'), result);
  }
  return result;
}

export function verifyBracesMitigation(root = process.cwd()) {
  const copies = installedBraces(path.join(root, 'node_modules'));
  assert.ok(
    copies.length > 0,
    'No installed braces found; immutable install is required'
  );
  for (const dir of copies) {
    const pkg = JSON.parse(
      readFileSync(path.join(dir, 'package.json'), 'utf8')
    );
    assert.equal(pkg.name, 'braces');
    assert.equal(
      pkg.version,
      '3.0.3',
      'Review/remove the backport when braces changes'
    );
    for (const [file, expected] of Object.entries(hashes)) {
      const actual = createHash('sha256')
        .update(readFileSync(path.join(dir, file)))
        .digest('hex');
      assert.equal(
        actual,
        expected,
        `Unverified braces source: ${dir}/${file}`
      );
    }
    const require = createRequire(path.join(dir, 'package.json'));
    const braces = require(dir);
    for (const depth of [101, 1000, 4000]) {
      for (const pattern of [
        '{'.repeat(depth) + 'a,b' + '}'.repeat(depth),
        '('.repeat(depth) + 'a' + ')'.repeat(depth),
      ]) {
        for (const method of ['parse', 'compile', 'expand', 'stringify']) {
          assert.throws(() => braces[method](pattern), /exceeds max depth/);
        }
      }
    }
    let ast = { type: 'text', value: 'a' };
    for (let i = 0; i < 4000; i++) ast = { type: 'brace', nodes: [ast] };
    ast = { type: 'root', nodes: [ast] };
    for (const method of ['compile', 'expand', 'stringify']) {
      assert.throws(() => braces[method](ast), /exceeds max depth/);
    }
    assert.doesNotThrow(() =>
      braces.parse('{'.repeat(100) + 'a,b' + '}'.repeat(100))
    );
    assert.throws(
      () => braces.parse('{{a,b},c}', { maxDepth: 1.5 }),
      /exceeds max depth/
    );
    assert.throws(
      () =>
        braces.parse('{'.repeat(101) + 'a,b' + '}'.repeat(101), {
          maxDepth: Infinity,
        }),
      /exceeds max depth/
    );
    assert.deepEqual(braces.expand('a/{b,c}/d'), ['a/b/d', 'a/c/d']);
    assert.deepEqual(braces.expand('foo/({a,b})'), ['foo/(a)', 'foo/(b)']);
    for (const pattern of [
      '{{a}}',
      '{a,{b}}',
      '{{x}y}',
      '{a,{b,{c}}',
      '{}{a}',
    ]) {
      assert.equal(
        braces.stringify(braces.parse(pattern), { escapeInvalid: true }),
        pattern
      );
    }
    const cycle = { type: 'paren', nodes: [{ type: 'text', value: 'a' }] };
    cycle.parent = cycle;
    assert.throws(() => braces.expand(cycle), /parent chain contains a cycle/);
  }
  return copies.length;
}
