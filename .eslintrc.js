module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:react/recommended',
    'plugin:mocha/recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
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
    '@typescript-eslint/ban-ts-comment': 'off', // keep it professional when you use them though please
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    // off for validation tests
    '@typescript-eslint/ban-ts-ignore': 'off',
    'mocha/no-skipped-tests': 'off', // we skip tests for a reason, frequently
    'mocha/no-top-level-hooks': 'off', // potentially has value if anyone wants to refactor
    'mocha/no-hooks-for-single-case': 'off', // potentially has value
    'mocha/no-setup-in-describe': 'off', // potentially has value, large refactor here though
  },
  globals: {
    __DEV__: true,
    __RNFB__: true,
    firebase: true,
    should: true,
    Utils: true,
    window: true,
  },
};
