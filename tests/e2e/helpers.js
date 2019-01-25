const { resolve } = require('path');
const { existsSync } = require('fs');
const requireAll = require('require-all');

/**
 *
 * @param packageName
 */
function requirePackageTests(packageName) {
  const e2eDir = `./../packages/${packageName}/e2e`;
  if (existsSync(e2eDir)) {
    console.log(`Loaded tests from ${e2eDir}/*`);
    requireAll({
      dirname: resolve(e2eDir),
      filter: /(.+e2e)\.js$/,
      excludeDirs: /^\.(git|svn)$/,
      recursive: true,
    });
  } else {
    console.log(`No tests directory found for ${e2eDir}/*`);
  }
}

global.sleep = d => new Promise(r => setTimeout(r, d));

Object.defineProperty(global, 'firebase', {
  get() {
    return jet.module;
  },
});

Object.defineProperty(global, 'NativeModules', {
  get() {
    return jet.NativeModules;
  },
});

Object.defineProperty(global, 'NativeEventEmitter', {
  get() {
    return jet.NativeEventEmitter;
  },
});

global.isAndroid = process.argv.join('').includes('android.emu');
global.isIOS = process.argv.join('').includes('ios.emu');
global.android = {
  describe(name, ctx) {
    if (isAndroid) {
      describe(name, ctx);
    } else {
      xdescribe('SKIP: ANDROID ONLY - ' + name, ctx);
    }
  },
  it(name, ctx) {
    if (isAndroid) {
      it(name, ctx);
    } else {
      xit('SKIP: ANDROID ONLY - ' + name, ctx);
    }
  },
};
global.ios = {
  describe(name, ctx) {
    if (isIOS) {
      describe(name, ctx);
    } else {
      xdescribe('SKIP: IOS ONLY - ' + name, ctx);
    }
  },
  it(name, ctx) {
    if (isIOS) {
      it(name, ctx);
    } else {
      xit('SKIP: IOS ONLY - ' + name, ctx);
    }
  },
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

module.exports.requirePackageTests = requirePackageTests;

const androidTestConfig = {
  // firebase android sdk completely ignores client id
  clientId: '305229645282-j8ij0jev9ut24odmlk9i215pas808ugn.apps.googleusercontent.com',
  appId: '1:305229645282:android:af36d4d29a83e04c',
  apiKey: 'AIzaSyCzbBYFyX8d6VdSu7T4s10IWYbPc-dguwM',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
  projectId: 'rnfirebase-b9ad4',
};

const iosTestConfig = {
  clientId: '305229645282-22imndi01abc2p6esgtu1i1m9mqrd0ib.apps.googleusercontent.com',
  androidClientId: androidTestConfig.clientId,
  appId: '1:305229645282:ios:af36d4d29a83e04c',
  apiKey: 'AIzaSyAcdVLG5dRzA1ck_fa_xd4Z0cY7cga7S5A',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
  projectId: 'rnfirebase-b9ad4',
};

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

global.TestHelpers = {
  core: {
    config() {
      const config = device.getPlatform() === 'ios' ? iosTestConfig : androidTestConfig;
      return { ...config };
    },
  },
};
