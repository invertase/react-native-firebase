import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import mochaPlugin from 'eslint-plugin-mocha';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  mochaPlugin.configs.recommended,
  {
    ignores: [
      'src/version.js',
      'packages/**/node_modules/**/*',
      'packages/**/plugin/build/**/*',
      '**/node_modules',
      '**/scripts/',
      '**/coverage',
      '**/docs',
      'packages/template/project/**/*',
      '**/app.playground.js',
      '**/type-test.ts',
      'packages/**/modular/dist/**/*',
      'src/version.js',
      'packages/**/node_modules/**/*',
      'packages/**/plugin/build/**/*',
      '**/node_modules',
      '**/scripts/',
      '**/coverage',
      '**/docs',
      'packages/template/project/**/*',
      '**/app.playground.js',
      '**/type-test.ts',
      'packages/**/modular/dist/**/*',
      'packages/ai/__tests__/test-utils',
      'packages/**/dist/**/*',
    ],
  },
  ...compat
    .extends(
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
      'plugin:prettier/recommended',
    )
    .map(config => ({
      ...config,
      files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    })),
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],

    languageOptions: {
      globals: {
        __DEV__: true,
        __RNFB__: true,
        firebase: true,
        should: true,
        Utils: true,
        window: true,
      },

      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',
    },

    settings: {
      react: {
        version: '17.0.20',
      },
    },

    rules: {
      'jest/no-identical-title': 0,
      'eslint-comments/no-unlimited-disable': 0,
      'no-new': 0,
      'no-continue': 0,
      'no-extend-native': 0,
      'import/no-dynamic-require': 0,
      'global-require': 'off',
      'class-methods-use-this': 0,
      'no-console': 1,
      'no-plusplus': 0,
      'no-undef': 0,
      'no-shadow': 0,
      'no-catch-shadow': 0,
      'no-underscore-dangle': 'off',
      'no-use-before-define': 0,
      'import/no-unresolved': 0,
      'prefer-const': 0,
      'prefer-rest-params': 0,
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-ignore': 'off',
      'mocha/no-pending-tests': 'off',
      'mocha/no-top-level-hooks': 'off',
      'mocha/no-hooks-for-single-case': 'off',
      'mocha/no-setup-in-describe': 'off',
    },
  },
];
