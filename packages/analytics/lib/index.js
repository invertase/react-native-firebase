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
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import {
  isAlphaNumericUnderscore,
  isNull,
  isObject,
  isOneOf,
  isString,
  isUndefined,
} from '@react-native-firebase/common';

import version from './version';

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
      throw new Error(
        `firebase.analytics().logEvent(*): First argument 'name' is required and must be a string value.`,
      );
    }

    if (!isUndefined(params) && !isObject(params)) {
      throw new Error(
        `firebase.analytics().logEvent(_, *): Second optional argument 'params' must be an object if provided.`,
      );
    }

    // check name is not a reserved event name
    if (isOneOf(name, ReservedEventNames)) {
      throw new Error(
        `firebase.analytics().logEvent(*): event name '${name}' is a reserved event name and can not be used.`,
      );
    }

    // name format validation
    if (!isAlphaNumericUnderscore(name)) {
      throw new Error(
        `firebase.analytics().logEvent(*): Event name '${name}' is invalid. Names should contain 1 to 32 alphanumeric characters or underscores.`,
      );
    }

    // maximum number of allowed params check
    if (params && Object.keys(params).length > 25)
      throw new Error(
        'firebase.analytics().logEvent(_, *): Maximum number of parameters exceeded (25).',
      );

    // Parameter names can be up to 24 characters long and must start with an
    // alphabetic character and contain only alphanumeric characters and
    // underscores. Only String, long and double param types are supported.
    // String parameter values can be up to 36 characters long. The "firebase_"
    // prefix is reserved and should not be used for parameter names.
    return this.native.logEvent(name, params);
  }

  setAnalyticsCollectionEnabled(enabled) {
    return this.native.setAnalyticsCollectionEnabled(enabled);
  }

  setCurrentScreen(screenName, screenClassOverride) {
    if (!isString(screenName)) {
      throw new Error('firebase.analytics().setCurrentScreen(*): screenName must be a string.');
    }

    if (!isUndefined(screenClassOverride) && !isString(screenClassOverride)) {
      throw new Error(
        'firebase.analytics().setCurrentScreen(_, *): screenClassOverride must be undefined or a string.',
      );
    }

    return this.native.setCurrentScreen(screenName, screenClassOverride);
  }

  setMinimumSessionDuration(milliseconds = 10000) {
    return this.native.setMinimumSessionDuration(milliseconds);
  }

  setSessionTimeoutDuration(milliseconds = 1800000) {
    return this.native.setSessionTimeoutDuration(milliseconds);
  }

  setUserId(id) {
    if (!isNull(id) && !isString(id)) {
      throw new Error(
        'firebase.analytics().setUserId(*): The supplied userId must be a string value or null.',
      );
    }

    return this.native.setUserId(id);
  }

  setUserProperty(name, value) {
    if (!isString(name)) {
      throw new Error(
        'firebase.analytics().setUserProperty(*): The supplied property name must be a string.',
      );
    }

    if (value !== null && !isString(value)) {
      throw new Error(
        'firebase.analytics().setUserProperty(_, *): The supplied property value must be a string value or null.',
      );
    }

    return this.native.setUserProperty(name, value);
  }

  setUserProperties(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().setUserProperties(*): The supplied arg must be an object of key value strings.',
      );
    }

    return this.native.setUserProperties(object);
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
