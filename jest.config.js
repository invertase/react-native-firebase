module.exports = {
  maxConcurrency: 10,
  preset: './tests/node_modules/react-native/jest-preset.js',
  setupFiles: ['./jest.setup.js'],
  testMatch: ['**/packages/**/__tests__/**/*.test.js'],
  modulePaths: ['node_modules', './tests/node_modules'],
  testPathIgnorePatterns: ['./packages/template'],
};
