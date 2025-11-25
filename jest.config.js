module.exports = {
  maxConcurrency: 10,
  preset: './tests/node_modules/react-native/jest-preset.js',

  // This is a large departure from most react-native jest testing
  // they use a variant of 'jsdom' (tailored for react-native) so they
  // load web bundles etc.
  //
  // This is a problem during the CJS / ESM transition though - firebase
  // creates a web bundle that uses ESM modules now and defines standard
  // entry points for web bundle loaders to use them. So jest tries to load
  // the ESM bundle and Jest / ts-jest attempt to transform / use them, but
  // they don't support ESM well.
  //
  // So we just brutally alter the test environment to 'node'. No web testing
  // is possible, but that's okay for us, and it loads the non-ESM bundle now.
  testEnvironment: 'node',

  transform: {
    '^.+\\.(js)$': '<rootDir>/node_modules/babel-jest',
    '\\.(ts|tsx)$': ['ts-jest', { tsconfig: './tsconfig-jest.json' }],
  },
  setupFiles: ['./jest.setup.ts'],
  testMatch: ['**/packages/**/__tests__/**/*.test.(ts|js)'],
  modulePaths: ['node_modules', './tests/node_modules'],
  testPathIgnorePatterns: ['./packages/template'],
  moduleDirectories: ['node_modules', './tests/node_modules'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@firebase|@react-native(-community)?))',
  ],
};
