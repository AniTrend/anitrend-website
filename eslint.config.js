const next = require('eslint-config-next');

const [baseConfig, tsConfig, ...rest] = next;

const enhancedTsConfig = {
  ...tsConfig,
  rules: {
    ...tsConfig.rules,
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
  baseConfig,
  enhancedTsConfig,
  ...rest,
];
