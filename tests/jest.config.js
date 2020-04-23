const packageJson = require('./package.json');

module.exports = {
  name: packageJson.name,
  displayName: packageJson.name,
  preset: 'react-native',
  setupFiles: ['<rootDir>/__tests__/jest.setup.js'],
  testMatch: ['**/__tests__/*.test.js'],
  modulePaths: ['node_modules', '../node_modules'],
  maxConcurrency: 10,
};
