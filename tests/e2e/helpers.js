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

module.exports.requirePackageTests = requirePackageTests;
