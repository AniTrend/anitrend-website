const next = require('eslint-config-next');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

const customTypescriptConfig = {
  files: ['**/*.{js,jsx,ts,tsx}'],
  plugins: {
    '@typescript-eslint': typescriptEslint,
  },
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};

module.exports = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'node_modules/**',
      'eslint.config.js',
      'next.config.ts',
      'tailwind.config.ts',
      'postcss.config.mjs',
      'commitlint.config.js',
    ],
  },
  ...next,
  customTypescriptConfig,
];
