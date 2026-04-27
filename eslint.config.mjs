import eslintJs from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';

import eslintTypescriptParser from '@typescript-eslint/parser';

import eslintPluginJest from 'eslint-plugin-jest';
import eslintPluginMocha from 'eslint-plugin-mocha';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginTypescript from 'typescript-eslint';
import * as eslintPluginMdx from 'eslint-plugin-mdx';

export default defineConfig([
  globalIgnores([
    'packages/**/dist/',
    '**/type-test.ts',
    'packages/ai/__tests__/test-utils'
  ]),

  {
    name: 'JavaScript',
    ...eslintJs.configs.recommended,
    ...eslintJs.configs.all,
    rules: {
      'prefer-const': ['error', { destructuring: 'all' }],
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
      'no-unused-vars': 'off',
    },
  },
  {
    name: 'Jest',
    ...eslintPluginJest.configs['flat/recommended'],
    rules: {
      'jest/expect-expect': 0,
      'jest/no-disabled-tests': 0,
      'jest/no-test-prefixes': 0,
    },
  },
  {
    name: 'Mocha',
    ...eslintPluginMocha.configs.recommended,
    rules: {
      'mocha/no-pending-tests': 'off',
      'mocha/no-top-level-hooks': 'off',
      'mocha/no-hooks-for-single-case': 'off',
      'mocha/no-setup-in-describe': 'off',
    },
  },
  {
    name: 'Prettier',
    ...eslintPluginPrettierRecommended.recommended,
  },
  {
    name: 'React',
    ...eslintPluginReact.configs.flat.recommended,
    ...eslintPluginReact.configs.flat['jsx-runtime'],
  },
  {
    name: 'Typescript',
    extends: [eslintPluginTypescript.configs.recommended],
    ignores: ['*.mdx'],
    rules: {
      'prefer-const': 0,
      'prefer-rest-params': 0,
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
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

      // Allow `{}` in type positions and empty interfaces (e.g. T extends {}, placeholder pipeline types), matches firebase-js-sdk.
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowObjectTypes: 'always', allowInterfaces: 'always' },
      ],
    },
  },

  {
    name: 'MDX',
    files: ['**/*.mdx'],
    ...eslintPluginMdx.flat,
  },
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

      parser: eslintTypescriptParser,
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    settings: {
      react: {
        version: '17.0.20',
      },
    },
  },
]);
