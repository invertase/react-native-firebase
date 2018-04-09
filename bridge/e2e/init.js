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

Object.defineProperty(global, 'firebase', {
  get() {
    return bridge.module;
  },
});

global.sleep = duration =>
  new Promise(resolve => {
    setTimeout(resolve, duration);
  });
