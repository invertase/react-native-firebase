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

Object.defineProperty(global, 'DeviceInfo', {
  get() {
    return jet.DeviceInfo;
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

Object.defineProperty(global, 'functionsModular', {
  get() {
    return jet.functionsModular;
  },
});

Object.defineProperty(global, 'analyticsModular', {
  get() {
    return jet.analyticsModular;
  },
});

Object.defineProperty(global, 'remoteConfigModular', {
  get() {
    return jet.remoteConfigModular;
  },
});

Object.defineProperty(global, 'perfModular', {
  get() {
    return jet.perfModular;
  },
});

Object.defineProperty(global, 'messagingModular', {
  get() {
    return jet.messagingModular;
  },
});

Object.defineProperty(global, 'appCheckModular', {
  get() {
    return jet.appCheckModular;
  },
});

Object.defineProperty(global, 'storageModular', {
  get() {
    return jet.storageModular;
  },
});

Object.defineProperty(global, 'installationsModular', {
  get() {
    return jet.installationsModular;
  },
});

Object.defineProperty(global, 'dynamicLinksModular', {
  get() {
    return jet.dynamicLinksModular;
  },
});

global.isCI = !!process.env.CI;
