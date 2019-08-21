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

import {
  isAlphaNumericUnderscore,
  isNull,
  isObject,
  isOneOf,
  isString,
  isNumber,
  isUndefined,
} from '@react-native-firebase/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import version from './version';
import { isBoolean } from '../../app/lib/common';

const ReservedEventNames = [
  'app_clear_data',
  'app_uninstall',
  'app_update',
  'error',
  'first_open',
  'in_app_purchase',
  'notification_dismiss',
  'notification_foreground',
  'notification_open',
  'notification_receive',
  'os_update',
  'session_start',
  'user_engagement',
];

const statics = {};

const namespace = 'analytics';

const nativeModuleName = 'RNFBAnalyticsModule';

class FirebaseAnalyticsModule extends FirebaseModule {
  logEvent(name, params = {}) {
    if (!isString(name)) {
      throw new Error("firebase.analytics().logEvent(*) 'name' expected a string value.");
    }

    if (!isUndefined(params) && !isObject(params)) {
      throw new Error("firebase.analytics().logEvent(_, *) 'params' expected an object value.");
    }

    // check name is not a reserved event name
    if (isOneOf(name, ReservedEventNames)) {
      throw new Error(
        `firebase.analytics().logEvent(*) 'name' the event name '${name}' is reserved and can not be used.`,
      );
    }

    // name format validation
    if (!isAlphaNumericUnderscore(name)) {
      throw new Error(
        `firebase.analytics().logEvent(*) 'name' invalid event name '${name}'. Names should contain 1 to 32 alphanumeric characters or underscores.`,
      );
    }

    // maximum number of allowed params check
    if (params && Object.keys(params).length > 25) {
      throw new Error(
        "firebase.analytics().logEvent(_, *) 'params' maximum number of parameters exceeded (25).",
      );
    }

    const entries = Object.entries(params);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      if (!isString(value) && !isNumber(value) && !isBoolean(value)) {
        throw new Error(
          `firebase.analytics().logEvent(_, *) 'params' value for parameter '${key}' is invalid, expected a string or number value.`,
        );
      }
    }

    return this.native.logEvent(name, params);
  }

  setAnalyticsCollectionEnabled(enabled) {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.analytics().setAnalyticsCollectionEnabled(*) 'enabled' expected a boolean value.",
      );
    }

    return this.native.setAnalyticsCollectionEnabled(enabled);
  }

  setCurrentScreen(screenName, screenClassOverride) {
    if (!isString(screenName)) {
      throw new Error(
        "firebase.analytics().setCurrentScreen(*) 'screenName' expected a string value.",
      );
    }

    if (!isUndefined(screenClassOverride) && !isString(screenClassOverride)) {
      throw new Error(
        "firebase.analytics().setCurrentScreen(_, *) 'screenClassOverride' expected a string value.",
      );
    }

    return this.native.setCurrentScreen(screenName, screenClassOverride);
  }

  setMinimumSessionDuration(milliseconds = 10000) {
    if (!isNumber(milliseconds)) {
      throw new Error(
        "firebase.analytics().setMinimumSessionDuration(*) 'milliseconds' expected a number value.",
      );
    }

    if (milliseconds < 0) {
      throw new Error(
        "firebase.analytics().setMinimumSessionDuration(*) 'milliseconds' expected a positive number value.",
      );
    }

    return this.native.setMinimumSessionDuration(milliseconds);
  }

  setSessionTimeoutDuration(milliseconds = 1800000) {
    if (!isNumber(milliseconds)) {
      throw new Error(
        "firebase.analytics().setSessionTimeoutDuration(*) 'milliseconds' expected a number value.",
      );
    }

    if (milliseconds < 0) {
      throw new Error(
        "firebase.analytics().setSessionTimeoutDuration(*) 'milliseconds' expected a positive number value.",
      );
    }

    return this.native.setSessionTimeoutDuration(milliseconds);
  }

  setUserId(id) {
    if (!isNull(id) && !isString(id)) {
      throw new Error("firebase.analytics().setUserId(*) 'id' expected a string value.");
    }

    return this.native.setUserId(id);
  }

  setUserProperty(name, value) {
    if (!isString(name)) {
      throw new Error("firebase.analytics().setUserProperty(*) 'name' expected a string value.");
    }

    if (value !== null && !isString(value)) {
      throw new Error(
        "firebase.analytics().setUserProperty(_, *) 'value' expected a string value.",
      );
    }

    return this.native.setUserProperty(name, value);
  }

  setUserProperties(properties) {
    if (!isObject(properties)) {
      throw new Error(
        "firebase.analytics().setUserProperties(*) 'properties' expected an object of key/value pairs.",
      );
    }

    const entries = Object.entries(properties);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      if (!isNull(value) && (!isString(value) && !isNumber(value))) {
        throw new Error(
          `firebase.analytics().setUserProperties(*) 'properties' value for parameter '${key}' is invalid, expected a string or number value.`,
        );
      }
    }

    return this.native.setUserProperties(properties);
  }

  resetAnalyticsData() {
    return this.native.resetAnalyticsData();
  }
}

// import { SDK_VERSION } from '@react-native-firebase/analytics';
export const SDK_VERSION = version;

// import analytics from '@react-native-firebase/analytics';
// analytics().logEvent(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseAnalyticsModule,
});

// import analytics, { firebase } from '@react-native-firebase/analytics';
// analytics().logEvent(...);
// firebase.analytics().logEvent(...);
export const firebase = getFirebaseRoot();
