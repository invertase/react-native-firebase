'use strict';

module.exports = {
  recursive: true,
  timeout: 1500000,
  reporter: 'spec',
  // Remote Mocha has 4 retries per individual test,
  // this retries is if the remote suite fails even after
  // all it retries have been exhausted. We retry the entire
  // suite but restart the application in case it was in
  // a bad state.
  retries: 3,
  slow: 1000000,
  bail: true,
  exit: true,
  spec: ['e2e/init.js'],
};
