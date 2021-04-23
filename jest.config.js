module.exports = {
  maxConcurrency: 10,
  preset: './tests_modular/node_modules/react-native-web/jest-preset.js',
  transform: {
    '^.+\\.(js)$': '<rootDir>/node_modules/babel-jest',
    '\\.(ts|tsx)$': 'ts-jest',
  },
  setupFiles: ['./jest.setup.ts'],
  testMatch: [
    // '**/packages/**/__tests__/**/*.test.(ts|js)',
    '**/packages/**/modular/__tests__/**/*.test.(ts|js)',
  ],
  modulePaths: ['node_modules', './tests/node_modules', './tests_modular/node_modules'],
  testPathIgnorePatterns: ['./packages/template'],
  moduleDirectories: ['node_modules', './tests/node_modules'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
};
