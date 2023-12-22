/** @type { import("eslint").Linter.FlatConfig } */
module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    extraFileExtensions: ['.svelte'],
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  overrides: [
    {
      files: ['*.svelte'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:svelte/recommended',
        'plugin:svelte/prettier',
      ],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: {
          ts: '@typescript-eslint/parser',
          js: 'espree',
          typescript: '@typescript-eslint/parser',
        },
      },
    },
    {
      files: ['*.ts'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        extraFileExtensions: ['.svelte'],
      },
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['**/*.cjs', '**/*.mjs'],
      extends: ['eslint:recommended', 'plugin:prettier/recommended'],
      rules: {
        'prettier/prettier': 'warn',
      },
    },
  ],
  rules: {
    'prettier/prettier': 'warn',
  },
};
