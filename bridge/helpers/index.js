/* eslint-disable global-require */
global.sinon = require('sinon');
require('should-sinon');
global.should = require('should');

Object.defineProperty(global, 'firebase', {
  get() {
    return bridge.module;
  },
});

// TODO move as part of bridge
const { Uint8Array } = global;
Object.defineProperty(global, 'Uint8Array', {
  get() {
    const { stack } = new Error();
    if (
      (stack.includes('Context.it') || stack.includes('Context.beforeEach')) &&
      global.bridge &&
      global.bridge.context
    ) {
      return bridge.context.window.Uint8Array;
    }
    return Uint8Array;
  },
});

// TODO move as part of bridge
const { Array } = global;
Object.defineProperty(global, 'Array', {
  get() {
    const { stack } = new Error();
    if (
      (stack.includes('Context.it') || stack.includes('Context.beforeEach')) &&
      global.bridge &&
      global.bridge.context
    ) {
      return bridge.context.window.Array;
    }
    return Array;
  },
});

global.isObject = function isObject(item) {
  return item
    ? typeof item === 'object' && !Array.isArray(item) && item !== null
    : false;
};

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
global.testRunId = randomString(4, 'aA#');

/** ------------------
 *    Init WEB SDK
 ---------------------*/

/** ------------------
 *   Init ADMIN SDK
 ---------------------*/
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
    (args[0].toLowerCase().includes('deprecated') ||
      args[0].toLowerCase().includes('restrictions in the native sdk'))
  ) {
    return undefined;
  }

  return originalLog(...args);
};

global.TestHelpers = {
  firestore: require('./firestore'),
  database: require('./database'),
};
