import { spawnSync } from 'node:child_process';

const pattern = String.raw`(?x)
  >[^<{\n][^<{]*<
  |
  \b(?:title|placeholder|aria-label|alt)=['"][A-Za-z][^"']*['"]
`;

const result = spawnSync(
  'rg',
  [
    '--pcre2',
    '--multiline',
    '--glob',
    'src/app/**/*.{ts,tsx}',
    '--glob',
    'src/components/**/*.{ts,tsx}',
    '--glob',
    '!src/app/globals.css',
    pattern,
  ],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
  }
);

if (result.error) {
  throw result.error;
}

const output = `${result.stdout}${result.stderr}`.trim();

if (result.status === 1) {
  process.exit(0);
}

if (output) {
  process.stderr.write(`${output}\n`);
  process.exit(1);
}
