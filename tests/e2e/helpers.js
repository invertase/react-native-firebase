/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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
    console.log(`Loaded tests from ${resolve(e2eDir)}/*`);
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

module.exports.requirePackageTests = requirePackageTests;
