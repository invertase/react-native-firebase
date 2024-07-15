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

import 'sinon';
import 'should-sinon';
import 'should';
import shouldMatchers from 'should';

// This flag toggles on detailed debugging logging for RNFB internals.
//
// It tracks and logs the following:
//  - (🔵 -> 🟢/🔴) Native module method calls, their arguments and results.
//      e.g.:
//            [RNFB->Native][🔵] RNFBAppModule.eventsPing -> ["pong",{"foo":"bar"}]
//            [RNFB<-Native][🟢] RNFBAppModule.eventsPing <- undefined
//            [RNFB->Native][🔵] RNFBFunctionsModule.httpsCallable -> ["[DEFAULT]","us-central1","localhost",5001, ...]
//            [RNFB<-Native][🔴] RNFBFunctionsModule.httpsCallable <- {"code":"functions/deadline-exceeded", ...}
//  - (👂 -> 📣) Subscriptions to native event emitters and receiving of events from native emitters.
//      e.g.:
//            [RNFB-->Event][👂] storage_event -> listening
//            [RNFB<--Event][📣] storage_event <- {"body":{...},"appName":"[DEFAULT]","taskId":32,"eventName":"state_changed"}
//  - (💡) Possible leaking tests detection. This is a heuristic based on the assumption that
//        tests should not be receiving events when no tests are running. This is not perfect
//        but it's better than nothing.
//      e.g.:
//            [TEST--->Leak][💡] Possible leaking test detected! ... The last test that ran was: "...".
//  - (🧪 -> ✅/❌) Start and end of each test, mainly for grouping logs.
//      e.g.:
//            [TEST-->Start][🧪] uploads a base64url string
//            [RNFB->Native][🔵] RNFBStorageModule.putString [...]
//            [RNFB<--Event][📣] storage_event <- {...}
//            [RNFB<--Event][📣] storage_event <- {...}
//            [RNFB<-Native][🟢] RNFBStorageModule.putString <- {...}
//            [TEST->Finish][✅] uploads a base64url string
global.RNFBDebug = false;

// RNFB packages.
import '@react-native-firebase/analytics';
import '@react-native-firebase/app-check';
import '@react-native-firebase/app-distribution';
import '@react-native-firebase/app/lib/utils';
import '@react-native-firebase/auth';
import '@react-native-firebase/crashlytics';
import '@react-native-firebase/database';
import '@react-native-firebase/dynamic-links';
import '@react-native-firebase/firestore';
import '@react-native-firebase/in-app-messaging';
import '@react-native-firebase/installations';
import '@react-native-firebase/messaging';
import '@react-native-firebase/ml';
import '@react-native-firebase/remote-config';
import '@react-native-firebase/storage';
import firebase, * as modular from '@react-native-firebase/app';
import * as analyticsModular from '@react-native-firebase/analytics';
import * as appCheckModular from '@react-native-firebase/app-check';
import * as appDistributionModular from '@react-native-firebase/app-distribution';
import * as authModular from '@react-native-firebase/auth';
import * as firestoreModular from '@react-native-firebase/firestore';
import * as functionsModular from '@react-native-firebase/functions';
import * as messagingModular from '@react-native-firebase/messaging';
import * as perfModular from '@react-native-firebase/perf';
import * as remoteConfigModular from '@react-native-firebase/remote-config';
import * as storageModular from '@react-native-firebase/storage';
import * as databaseModular from '@react-native-firebase/database';
import * as inAppMessagingModular from '@react-native-firebase/in-app-messaging';
import * as installationsModular from '@react-native-firebase/installations';
import * as crashlyticsModular from '@react-native-firebase/crashlytics';
import * as dynamicLinksModular from '@react-native-firebase/dynamic-links';
import * as mlModular from '@react-native-firebase/ml';

import { Platform } from 'react-native';
import NativeEventEmitter from '@react-native-firebase/app/lib/internal/RNFBNativeEventEmitter';
import { getReactNativeModule } from '@react-native-firebase/app/lib/internal/nativeModule';

global.should = shouldMatchers;
global.sinon = require('sinon');

global.Platform = {
  android: Platform.OS === 'android',
  ios: Platform.OS === 'ios',
  // TODO: macos could technically be supported through the same codebase
  // as iOS but for now we're treating it as an 'other' platform as that
  // is a larger task to implement.
  other: Platform.OS !== 'android' && Platform.OS !== 'ios',
};

global.Utils = {
  sleep: d => new Promise(r => setTimeout(r, d)),
  randString(length, chars) {
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
  },
  spyToBeCalledOnceAsync(spy, timeout = 5000) {
    let interval;
    const { resolve, reject, promise } = Promise.defer();
    const timer = setTimeout(() => {
      clearInterval(interval);
      reject(new Error('Spy was not called within timeout period.'));
    }, timeout);

    interval = setInterval(() => {
      if (spy.callCount > 0) {
        clearTimeout(timer);
        clearInterval(interval);
        resolve();
      }
    }, 25);

    return promise;
  },
  spyToBeCalledTimesAsync(spy, times = 2, timeout = 5000) {
    let interval;
    const { resolve, reject, promise } = Promise.defer();
    const timer = setTimeout(() => {
      clearInterval(interval);
      reject(new Error('Spy was not called within timeout period.'));
    }, timeout);

    interval = setInterval(() => {
      if (spy.callCount >= times) {
        clearTimeout(timer);
        clearInterval(interval);
        resolve();
      }
    }, 25);

    return promise;
  },
};

let cachedId;
global.FirebaseHelpers = {
  get id() {
    if (cachedId) return cachedId;
    cachedId = global.Utils.randString(5, '#aA');
    return cachedId;
  },
  app: {
    config() {
      if (global.Platform.ios) {
        return {
          clientId: '448618578101-28tsenal97nceuij1msj7iuqinv48t02.apps.googleusercontent.com',
          androidClientId:
            '448618578101-pdjje2lkv3p941e03hkrhfa7459cr2v8.apps.googleusercontent.com',
          appId: '1:448618578101:ios:cc6c1dc7a65cc83c',
          apiKey: 'AIzaSyAHAsf51D0A407EklG1bs-5wA7EbyfNFg0',
          authDomain: 'react-native-firebase-testing.firebaseapp.com',
          databaseURL: 'https://react-native-firebase-testing.firebaseio.com',
          projectId: 'react-native-firebase-testing',
          storageBucket: 'react-native-firebase-testing.appspot.com',
          messagingSenderId: '448618578101',
        };
      }
      return {
        clientId: '448618578101-pdjje2lkv3p941e03hkrhfa7459cr2v8.apps.googleusercontent.com',
        appId: '1:448618578101:android:cc6c1dc7a65cc83c',
        apiKey: 'AIzaSyCuu4tbv9CwwTudNOweMNstzZHIDBhgJxA',
        authDomain: 'react-native-firebase-testing.firebaseapp.com',
        databaseURL: 'https://react-native-firebase-testing.firebaseio.com',
        projectId: 'react-native-firebase-testing',
        storageBucket: 'react-native-firebase-testing.appspot.com',
        messagingSenderId: '448618578101',
        // TODO RNFB is using the old gaTrackingId property, we should remove this in the future
        // in favor of the measurementId property.
        gaTrackingId: 'G-HX0JQKHZEB',
      };
    },
  },
  async fetchAppCheckToken() {
    const tokenRequest = await fetch(
      'https://us-central1-react-native-firebase-testing.cloudfunctions.net/fetchAppCheckToken',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            appId: global.FirebaseHelpers.app.config().appId,
          },
        }),
        redirect: 'follow',
      },
    );
    const { result } = await tokenRequest.json();
    return result;
  },
};

global.android = {
  describe(name, ctx) {
    if (global.Platform.android) {
      global.describe(name, ctx);
    } else {
      global.xdescribe('SKIP: ANDROID ONLY - ' + name, ctx);
    }
  },
  it(name, ctx) {
    if (global.Platform.android) {
      global.it(name, ctx);
    } else {
      global.xit('SKIP: ANDROID ONLY - ' + name, ctx);
    }
  },
};

global.ios = {
  describe(name, ctx) {
    if (global.Platform.ios) {
      global.describe(name, ctx);
    } else {
      global.xdescribe('SKIP: IOS ONLY - ' + name, ctx);
    }
  },
  it(name, ctx) {
    if (global.Platform.ios) {
      global.it(name, ctx);
    } else {
      global.xit('SKIP: IOS ONLY - ' + name, ctx);
    }
  },
};

global.TestingApi = class TestingApi {
  constructor(idToken) {
    this.instance = require('axios').create({
      baseURL: 'http://api.rnfirebase.io/',
      timeout: 10500,
      headers: { Authorization: 'Bearer ' + idToken },
    });
  }

  messaging() {
    const api = this;
    return {
      sendToTopic(topic, payload) {
        return api.instance.post(`/messaging/send`, { topic, ...payload }).then(r => r.data);
      },

      sendToDevice(token, payload) {
        return api.instance.post(`/messaging/send`, { token, ...payload }).then(r => r.data);
      },
    };
  }

  firestore() {
    const api = this;
    return {
      clearCollection(collectionName) {
        return api.instance
          .delete(`/firestore/collection/${collectionName}`, {
            collectionName,
          })
          .then(r => r.data);
      },
    };
  }

  auth() {
    const api = this;
    return {
      createCustomToken(uid, claims) {
        return api.instance
          .post(`/auth/user/${uid}/custom-token`, { claims })
          .then(r => r.data.token);
      },
    };
  }
};

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
    return firebase;
  },
});

Object.defineProperty(global, 'NativeModules', {
  get() {
    return new Proxy(
      {},
      {
        get: (target, moduleName) => {
          if (moduleName.startsWith('RNF')) {
            return getReactNativeModule(moduleName);
          }
          return target[moduleName] || (() => {});
        },
      },
    );
  },
});

Object.defineProperty(global, 'NativeEventEmitter', {
  get() {
    return NativeEventEmitter;
  },
});

Object.defineProperty(global, 'TestsAPI', {
  get() {
    return new TestingApi();
  },
});

Object.defineProperty(global, 'modular', {
  get() {
    return modular;
  },
});

if (global.Platform.other) {
  firebase.initializeApp(global.FirebaseHelpers.app.config());
  firebase.initializeApp(global.FirebaseHelpers.app.config(), 'secondaryFromNative');
}

Object.defineProperty(global, 'functionsModular', {
  get() {
    return functionsModular;
  },
});

Object.defineProperty(global, 'analyticsModular', {
  get() {
    return analyticsModular;
  },
});

Object.defineProperty(global, 'authModular', {
  get() {
    return authModular;
  },
});

Object.defineProperty(global, 'remoteConfigModular', {
  get() {
    return remoteConfigModular;
  },
});

Object.defineProperty(global, 'perfModular', {
  get() {
    return perfModular;
  },
});

Object.defineProperty(global, 'messagingModular', {
  get() {
    return messagingModular;
  },
});

Object.defineProperty(global, 'appCheckModular', {
  get() {
    return appCheckModular;
  },
});

Object.defineProperty(global, 'appDistributionModular', {
  get() {
    return appDistributionModular;
  },
});

Object.defineProperty(global, 'storageModular', {
  get() {
    return storageModular;
  },
});

Object.defineProperty(global, 'inAppMessagingModular', {
  get() {
    return inAppMessagingModular;
  },
});

Object.defineProperty(global, 'installationsModular', {
  get() {
    return installationsModular;
  },
});

Object.defineProperty(global, 'crashlyticsModular', {
  get() {
    return crashlyticsModular;
  },
});

Object.defineProperty(global, 'dynamicLinksModular', {
  get() {
    return dynamicLinksModular;
  },
});

Object.defineProperty(global, 'databaseModular', {
  get() {
    return databaseModular;
  },
});

Object.defineProperty(global, 'firestoreModular', {
  get() {
    return firestoreModular;
  },
});

Object.defineProperty(global, 'mlModular', {
  get() {
    return mlModular;
  },
});

global.jet = {
  // TODO refactor tests to not use this anymore
  contextify(input) {
    return input;
  },
};

// TODO toggle this correct in CI only.
global.isCI = true;
// Used to tell our internals that we are running tests.
global.RNFBTest = true;
