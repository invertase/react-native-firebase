'use strict';

module.exports = {
  recursive: true,
  timeout: 2000000,
  reporter: 'spec',
  slow: 1000000,
  bail: true,
  exit: true,
  spec: ['e2e/init.js'],
};
