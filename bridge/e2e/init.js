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

global.randomString = (length, chars) => {
  let mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  let result = '';
  for (let i = length; i > 0; --i) {
    result += mask[Math.round(Math.random() * (mask.length - 1))];
  }
  return result;
};
