/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.js'],
  testTimeout: 3600000,
  maxWorkers: 1,
  // babel-plugin-transform-inline-environment-variables in tests/.babelrc inlines
  // RNFB_* at transform time. Jest's transform cache does not include those env
  // values, so a slotted run would poison a later serial :test-cover (Metro :12007).
  cache: false,
  // After a failed launchApp, Detox Jest can keep open handles (yarn/jet
  // grandchildren from shell:true spawn). Without forceExit, `:test-cover`
  // hangs after FAIL (`Jest did not exit one second after the test run`).
  forceExit: true,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};
