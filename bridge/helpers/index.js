global.sinon = require('sinon');
require('should-sinon');
global.should = require('should');

Object.defineProperty(global, 'firebase', {
  get() {
    return bridge.module;
  },
});

global.sleep = duration =>
  new Promise(resolve => setTimeout(resolve, duration));

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

global.firebaseAdmin = require('firebase-admin');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(require('./service-account')),
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
});

const originalLog = console.log;
console.log = (...args) => {
  if (
    args &&
    args[0] &&
    typeof args[0] === 'string' &&
    args[0].includes('Deprecated ')
  ) {
    return undefined;
  }

  return originalLog(...args);
};
