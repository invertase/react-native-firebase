/* eslint-disable no-console */
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

// DO NOT USE EXCEPT FOR THIS REACT NATIVE FIREBASE TESTING PROJECT - YOU HAVE
// BEEN WARNED 🙃
require('@react-native-firebase/private-tests-helpers');

const detox = require('detox');
const jet = require('jet/platform/node');
const { requirePackageTests } = require('./helpers');
const { detox: config } = require('../package.json');

const PACKAGES = [
  // 'app',
  // 'iid',
  // 'perf',
  // 'fiam',
  // 'functions',
  // 'analytics',
  // 'config',
  // 'crashlytics',
  // 'utils',
  // 'mlkit',
  'ml-natural-language',
  // 'invites',
  // 'fiam',
  // 'auth',
  // // 'firestore',
  // 'links',
  // // 'messaging',
  // 'storage',
];

for (let i = 0; i < PACKAGES.length; i++) {
  requirePackageTests(PACKAGES[i]);
}
before(async () => {
  await detox.init(config);
  await jet.init();
});

beforeEach(async function beforeEach() {
  if (jet.context && jet.root && jet.root.setState) {
    jet.root.setState({
      currentTest: this.currentTest,
    });
  }

  const retry = this.currentTest.currentRetry();

  if (retry > 0) {
    if (retry === 1) {
      console.log('');
      console.warn('⚠️ A test failed:');
      console.warn(`️   ->  ${this.currentTest.title}`);
    }

    if (retry > 1) {
      console.warn(`   🔴  Retry #${retry - 1} failed...`);
    }

    console.warn(`️   ->  Retrying... (${retry})`);
    await Utils.sleep(3000);
  }
});

after(async () => {
  console.log('Cleaning up...');
  await device.terminateApp();
});
