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
    }
  },
  it(name, ctx) {
    if (isAndroid) {
      it(name, ctx);
    }
  },
};
global.ios = {
  describe(name, ctx) {
    if (isIOS) {
      describe(name, ctx);
    }
  },
  it(name, ctx) {
    if (isIOS) {
      it(name, ctx);
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
