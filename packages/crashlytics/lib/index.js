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

import { isBoolean, isError, isObject, isString } from '@react-native-firebase/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import StackTrace from 'stacktrace-js';
import {
  createNativeErrorObj,
  setGlobalErrorHandler,
  setOnUnhandledPromiseRejectionHandler,
} from './handlers';
import version from './version';

const statics = {};

const namespace = 'crashlytics';

const nativeModuleName = 'RNFBCrashlyticsModule';

class FirebaseCrashlyticsModule extends FirebaseModule {
  constructor(...args) {
    super(...args);
    setGlobalErrorHandler(this.native);
    setOnUnhandledPromiseRejectionHandler(this.native);
    this._isCrashlyticsCollectionEnabled = this.native.isCrashlyticsCollectionEnabled;
  }

  get isCrashlyticsCollectionEnabled() {
    return this._isCrashlyticsCollectionEnabled;
  }

  crash() {
    this.native.crash();
  }

  log(message) {
    this.native.log(`${message}`);
  }

  setAttribute(name, value) {
    if (!isString(name)) {
      throw new Error(
        'firebase.crashlytics().setAttribute(*, _): The supplied property name must be a string.',
      );
    }

    if (!isString(value)) {
      throw new Error(
        'firebase.crashlytics().setAttribute(_, *): The supplied property value must be a string value.',
      );
    }

    return this.native.setAttribute(name, value);
  }

  setAttributes(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.crashlytics().setAttributes(*): The supplied arg must be an object of key value strings.',
      );
    }

    return this.native.setAttributes(object);
  }

  setUserId(userId) {
    if (!isString(userId)) {
      throw new Error(
        'firebase.crashlytics().setUserId(*): The supplied userId must be a string value.',
      );
    }

    return this.native.setUserId(userId);
  }

  recordError(error) {
    if (isError(error)) {
      StackTrace.fromError(error, { offline: true }).then(stackFrames => {
        this.native.recordError(createNativeErrorObj(error, stackFrames, false));
      });
    } else {
      console.warn(
        'firebase.crashlytics().recordError(*) expects an instance of Error. Non Errors will be ignored.',
      );
    }
  }

  setCrashlyticsCollectionEnabled(enabled) {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.crashlytics().setCrashlyticsCollectionEnabled(*) 'enabled' must be a boolean.",
      );
    }

    this._isCrashlyticsCollectionEnabled = enabled;
    return this.native.setCrashlyticsCollectionEnabled(enabled);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/crashlytics';
export const SDK_VERSION = version;

// import crashlytics from '@react-native-firebase/crashlytics';
// crashlytics().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseCrashlyticsModule,
});

// import crashlytics, { firebase } from '@react-native-firebase/crashlytics';
// crashlytics().X(...);
// firebase.crashlytics().X(...);
export const firebase = getFirebaseRoot();
firebase.crashlytics();
