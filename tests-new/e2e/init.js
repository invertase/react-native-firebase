const detox = require('detox');
const config = require('../package.json').detox;

global.sinon = require('sinon');
require('should-sinon');
global.should = require('should');

before(async () => {
  await detox.init(config);
});

after(async () => {
  await detox.cleanup();
});

bridge.beforeContextReset = () => {
  console.log('reset');
};
