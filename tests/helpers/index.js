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
      process.env.FIREBASE_SERVICE_ACCOUNT ||
        Buffer.from(
          'ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAicm5maXJlYmFzZS1iOWFkNCIsCiAgInByaXZhdGVfa2V5X2lkIjogIjViMWI5ODZiYmRiNWM5MzljNTUyMWMyMGNkMjY0ZTQyZjNmM2I3MGEiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2Z0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktnd2dnU2tBZ0VBQW9JQkFRRHgxTkk5SWRHb1dDKytcbnZMQ2h1R2U5VUtacDBrV202TXZ1SVAvNTczRzR2QkQwUU9rcnZ2dXVPRHgxMkp0N3IwMUtrZ3Uwc3FwcEJsQ2Zcbk1FR2x5elZTdUVwY3R1TXVrNDYyclV0VWtoZ3JqYmo5eWlDT0k3ZFFZVEdPU0hNYVpYdVdvTmhwTHFMazkxNnNcbiszcmtXSnFYSlRYcG9qZ2pleTM2NjRzNXJ1ZWVha1JPNCt6aE9LYmozcUs1NVpnbnFZT3hLMlFYT3dhUFF6ZUxcbm5jL0V4M0kvNEp3aWM2Q09lOUowWVlwNzI3ME5EWG1KTnJPenhDVGtaUHVCRURtd0Nyc21pelo5OHVDRG96ZmZcbnlSbUhROHlJQ2t5dVJOTlpqN1k2ODR3SXdtTnJrOGFLNTZVYXFNaUNaeElCeWJpTW44aWRNbkU4UVZxd0ZFNFZcblhxeXJwaDNYQWdNQkFBRUNnZ0VBTnpZcUc3ZmxhSVJkdmpQUk5kTG1xR1BKNHA0VnRlSXZjUG9LeHhMQ1NYVnlcbmYzbDBZcjd6TWhiM3dzWUYxWXF6NEVNUXRod1dhT3orcWlGMzAzVGVBems5RFFiYVBrK0ZCVEx5WUdnTWFhRXRcbks1QWl0NkR5NE1DWDhrNmJMTnNmaU1mSE1OaHJhMUFJeHdDUlVhSGpCWUFDMjRqa1BVR0p3V0JXaElCb3RCTklcblVPZ1AzZnBRdFlYWnJ5cU5XRnk5cFNqS3BDaFFqUnJMQ2YwblZWVzd3d0tCcGtUNS8xT3FJWHBoeTRDTEZYYjFcbmFzQ2FXYzFETDAvUC9VUFNKRHZST3J4S2lTcHhKTzVGb0VNSFVXZmhaeUVuTm40SUhJWHdLczBhT1c3SFJPU2dcblhqZTRnWTlEQk1VVXg3dExMd0kyYXNnVEFiNjczN25ocUEyRisvcGxwUUtCZ1FENW1NdStmZ1lqU1JFKzBRTXlcbmc1RFdMVXdwTWphcW5vazc4OU1HQUtRYi9LL0ZLQ0VkYVVldTZTK0FSMi9ZOXAwdzYxR3JNcTdxdW1Zc0w4bDNcbmF6SEdmVmhscmR2dVlPUjhTRDV6TEEyMUlVVFAweENsRTR1cWxMbzZ0aVpVaXBvMjBic0dCUkRzcHRzRXJBbWdcbkM5OEwrZEs4WEF3VGVZWGVVN01FcmowZXF3S0JnUUQ0Q1Fhb0RWSnBVODVBTVlicHBFemNpSmhrVHhJVi9XR3ZcbjR5eE1RcE5lTUVOZDFwaDhQcnBxR2NKNUhESis4ZTlVOHZaamxGUkFBNkxUQjJhdG1ZeG9vTGh0WFc1Y2VSczdcbjUxUXVPVFlnLytyRm1tWEwzaHY4cGhkSlc0N0xlMWFIbHlqQ2FSbU1DcUZyd2JGTUtPT2RvSjZQeTFBNU4rREVcbjZVMHRZQU9OaFFLQmdRRHJqUmlUQU9vWCtNZnVxV0JFRnNma2FNRmNpNGZ0dzBvdUt6QTJsUHBMYzFBS1Y1SFFcbjZOOStvWkJ6bG5kbW9XNjlrUWIwOHhNQ2NNRWw2RDlRbFBoWG8wbCtRL0t2NS84Wmp6Qm9qdVdzeitYWjRBM3dcblRCN2Q4QmhFZWt4NE1vblJQR010RGpEbnRad3lyNDB4M3FJejhpUEFJWHBBRXNxVWhCY0pUc3BkbXdLQmdCR2Fcbk9tRzB5Rk4zUWh6bUp1ZnY1QkNHbFNJUlJueFBCaDdBWllWbitDTm9FMi9XYWUzdldiVnI3SlJCdndlcFRjM2VcbmpFUFc0Ly9EQWt3dHEwaklxK0ZFL3JHc1BzZkxSSGFFM1VHR2grUGhwWnl1YjJqL2MwY0Qxb1U3UFRBTnFiOW5cbnA5bmNNWmJ4cmpFQ2h2MmJyVU9qZ1gwODlZMkovS2FjMUFCVFh3MHRBb0dCQUlIVkUwUUl3cGJ1UzJrM0UxUVdcbnlmSlp6bHNkS3BvaU44OGlDTDVyeHZzT0FFblZ0b0wzVEZTc0FheERwbkh4VU5BdUxJbXVyS1RDN0NiRExyRGxcbkQybWxTRlhTczkyRXdmMEtsWGZ0bjFBR3B2bjRUd1lydldTYWY4RjhaYjdyVVFveGNMK2JmWUFnRTJSMWFpU2hcbk5XVFlzOUhSQldVMS9uS3JaUnN1bytYZVxuLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLVxuIiwKICAiY2xpZW50X2VtYWlsIjogImZpcmViYXNlLWFkbWluc2RrLTh6NTM2QHJuZmlyZWJhc2UtYjlhZDQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJjbGllbnRfaWQiOiAiMTEyMTI0ODExODM3MjE3MDgwMDgyIiwKICAiYXV0aF91cmkiOiAiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGgiLAogICJ0b2tlbl91cmkiOiAiaHR0cHM6Ly9vYXV0aDIuZ29vZ2xlYXBpcy5jb20vdG9rZW4iLAogICJhdXRoX3Byb3ZpZGVyX3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwKICAiY2xpZW50X3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vcm9ib3QvdjEvbWV0YWRhdGEveDUwOS9maXJlYmFzZS1hZG1pbnNkay04ejUzNiU0MHJuZmlyZWJhc2UtYjlhZDQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iCn0=',
          'base64'
        ).toString('utf-8')
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
      args[0].toLowerCase().includes('require cycle') ||
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
