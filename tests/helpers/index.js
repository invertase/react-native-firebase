/* eslint-disable global-require */
global.sinon = require('sinon');
require('should-sinon');
global.should = require('should');

Object.defineProperty(global, 'firebase', {
  get() {
    return jet.module;
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
  credential: firebaseAdmin.credential.cert(
    JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT
    )
  ),
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

/**
 * Old style deferred promise shim - for niceness
 *
 * @returns {{resolve: null, reject: null}}
 */
Promise.defer = function defer() {
  const deferred = {
    resolve: null,
    reject: null,
  };

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
};

const androidTestConfig = {
  // firebase android sdk completely ignores client id
  clientId:
    '305229645282-j8ij0jev9ut24odmlk9i215pas808ugn.apps.googleusercontent.com',
  appId: '1:305229645282:android:af36d4d29a83e04c',
  apiKey: 'AIzaSyCzbBYFyX8d6VdSu7T4s10IWYbPc-dguwM',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
  projectId: 'rnfirebase-b9ad4',
};

const iosTestConfig = {
  clientId:
    '305229645282-22imndi01abc2p6esgtu1i1m9mqrd0ib.apps.googleusercontent.com',
  androidClientId: androidTestConfig.clientId,
  appId: '1:305229645282:ios:af36d4d29a83e04c',
  apiKey: 'AIzaSyAcdVLG5dRzA1ck_fa_xd4Z0cY7cga7S5A',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
  projectId: 'rnfirebase-b9ad4',
};

global.TestHelpers = {
  functions: {
    data: require('./../functions/test-data'),
  },
  firestore: require('./firestore'),
  database: require('./database'),
  core: {
    config() {
      const config =
        device.getPlatform() === 'ios' ? iosTestConfig : androidTestConfig;
      return { ...config };
    },
  },
};
