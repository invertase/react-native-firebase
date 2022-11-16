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

Object.defineProperty(global, 'A2A', {
  get() {
    return require('a2a');
  },
});

let testApiInstance;
Object.defineProperty(global, 'TestAdminApi', {
  get() {
    if (testApiInstance) return testApiInstance;
    testApiInstance = TestingApi;
    return testApiInstance;
  },
});

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

Object.defineProperty(global, 'TestsAPI', {
  get() {
    return new TestingApi();
  },
});

Object.defineProperty(global, 'modular', {
  get() {
    return jet.modular;
  },
});

global.isCI = !!process.env.CI;
