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
  hasOwnProperty,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from '@react-native-firebase/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import version from './version';

const statics = {
  LastFetchStatus: {
    SUCCESS: 'success',
    FAILURE: 'failure',
    THROTTLED: 'throttled',
    NO_FETCH_YET: 'no_fetch_yet',
  },
  ValueSource: {
    REMOTE: 'remote',
    DEFAULT: 'default',
    STATIC: 'static',
  },
};

const namespace = 'remoteConfig';
const nativeModuleName = 'RNFBConfigModule';

function convertNativeConfigValues(configValues) {
  const convertedValues = {};
  const entries = Object.entries(configValues);

  for (let i = 0; i < entries.length; i++) {
    const convertedValue = {};
    const [key, nativeValue] = entries[i];
    const { source, boolValue, stringValue, numberValue } = nativeValue;
    let value = stringValue;

    if (
      boolValue !== null &&
      (stringValue === 'true' || stringValue === 'false' || stringValue === null)
    ) {
      value = boolValue;
    } else if (
      numberValue !== null &&
      numberValue !== undefined &&
      (stringValue === null || stringValue === '' || !isNaN(stringValue))
    ) {
      value = numberValue;
    }

    convertedValue.value = value;
    convertedValue.source = source;
    Object.freeze(convertedValue);
    convertedValues[key] = convertedValue;
  }

  Object.freeze(convertedValues);
  return convertedValues;
}

class FirebaseConfigModule extends FirebaseModule {
  constructor(...args) {
    super(...args);
    this._defaultConfig = {};
    this._settings = {};
    this._lastFetchStatus = null;
    this._lastFetchTime = null;
    // TODO(salakar) iOS does not yet support multiple apps, for now we'll use the default app always
    this._updateFromConstants(this.native.REMOTE_CONFIG_APP_CONSTANTS['[DEFAULT]']);
  }

  getValue(key) {
    if (!isString(key)) {
      throw new Error("firebase.remoteConfig().getValue(): 'key' must be a string value.");
    }

    if (!hasOwnProperty(this._values, key)) {
      return {
        value: undefined,
        source: 'static',
      };
    }

    return this._values[key];
  }

  getAll() {
    return Object.assign({}, this._values);
  }

  get defaultConfig() {
    return this._defaultConfig;
  }

  set defaultConfig(defaults) {
    if (!isObject(defaults)) {
      throw new Error('firebase.remoteConfig().defaultConfig: must set an object.');
    }

    this._defaultConfig = defaults;
    this._promiseWithConstants(this.native.setDefaults(defaults));
  }

  get settings() {
    return this._settings;
  }

  set settings(settings = {}) {
    const nativeSettings = {};

    if (!isObject(settings)) {
      throw new Error('firebase.remoteConfig().settings: must set an object.');
    }

    if (hasOwnProperty(settings, 'isDeveloperModeEnabled')) {
      console.warn(
        "firebase.remoteConfig().settings: 'settings.isDeveloperModeEnabled' has now been removed. Please consider setting 'settings.minimumFetchIntervalMillis'",
      );
    }

    if (hasOwnProperty(settings, 'minimumFetchInterval')) {
      console.warn(
        "firebase.remoteConfig().settings: 'settings.minimumFetchInterval' has now been removed. Please consider setting 'settings.minimumFetchIntervalMillis'",
      );
    }

    if (hasOwnProperty(settings, 'minimumFetchIntervalMillis')) {
      if (!isNumber(settings.minimumFetchIntervalMillis)) {
        throw new Error(
          "firebase.remoteConfig().settings: 'settings.minimumFetchIntervalMillis' must be a number type in milliseconds.",
        );
      } else {
        //iOS & Android expect seconds
        nativeSettings.minimumFetchInterval = settings.minimumFetchIntervalMillis / 1000;
      }
    }

    if (hasOwnProperty(settings, 'fetchTimeMillis')) {
      if (!isNumber(settings.fetchTimeMillis)) {
        throw new Error(
          "firebase.remoteConfig().settings: 'settings.fetchTimeMillis' must be a number type in milliseconds.",
        );
      } else {
        //iOS & Android expect seconds
        nativeSettings.fetchTimeout = settings.fetchTimeMillis / 1000;
      }
    }

    this._settings = settings;
    this._promiseWithConstants(this.native.setConfigSettings(nativeSettings));
  }

  get lastFetchTime() {
    // android returns -1 if no fetch yet and iOS returns 0
    return this._lastFetchTime === -1 ? 0 : this._lastFetchTime;
  }

  get lastFetchStatus() {
    return this._lastFetchStatus;
  }

  get isDeveloperModeEnabled() {
    console.warn(
      'firebase.remoteConfig().isDeveloperModeEnabled has now been removed. Please consider setting `settings.minimumFetchIntervalMillis` in remoteConfig.Settings',
    );
  }

  get minimumFetchInterval() {
    console.warn(
      'firebase.remoteConfig().minimumFetchInterval has now been removed. Please consider setting `settings.minimumFetchIntervalMillis` in remoteConfig.Settings',
    );
  }

  setConfigSettings() {
    console.warn(
      "firebase.remoteConfig().setConfigSettings({ [key]: string}) has now been removed. Please use 'firebase.remoteConfig().settings = { ...[key]: string, }' instead'",
    );
  }

  /**
   * Activates the Fetched RemoteConfig, so that the fetched key-values take effect.
   * @returns {Promise<boolean>}
   */
  activate() {
    return this._promiseWithConstants(this.native.activate());
  }

  /**
   * Fetches parameter values for your app.

   * @param {number} expirationDurationSeconds
   * @returns {Promise}
   */
  fetch(expirationDurationSeconds) {
    if (!isUndefined(expirationDurationSeconds) && !isNumber(expirationDurationSeconds)) {
      throw new Error(
        "firebase.remoteConfig().fetch(): 'expirationDurationSeconds' must be a number value.",
      );
    }

    return this._promiseWithConstants(
      this.native.fetch(expirationDurationSeconds !== undefined ? expirationDurationSeconds : -1),
    );
  }

  fetchAndActivate() {
    return this._promiseWithConstants(this.native.fetchAndActivate());
  }

  ensureInitialized() {
    return this.native.ensureInitialized();
  }

  /**
   * Removed. Use defaultConfig instead to get/set default values
   */
  setDefaults() {
    console.warn(
      "firebase.remoteConfig().setDefaults({ [key]: string}) has now been removed. Please use 'firebase.remoteConfig().defaultConfig = { ...[key]: string, }' instead",
    );
  }

  /**
   * Removed. Use defaultConfig instead to get/set default values
   */
  setDefaultsFromResource() {
    console.warn(
      "firebase.remoteConfig().setDefaultsFromResource('resourceName') has now been removed. Please use 'firebase.remoteConfig().defaultConfig = { ...[key]: string, }' instead",
    );
  }

  _updateFromConstants(constants) {
    this._lastFetchTime = constants.lastFetchTime;
    this._lastFetchStatus = constants.lastFetchStatus;
    this._values = convertNativeConfigValues(constants.values);
  }

  _promiseWithConstants(promise) {
    return promise.then(({ result, constants }) => {
      this._updateFromConstants(constants);
      return result;
    });
  }
}

// import { SDK_VERSION } from '@react-native-firebase/remote-config';
export const SDK_VERSION = version;

// import config from '@react-native-firebase/remote-config';
// config().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseConfigModule,
});

// import config, { firebase } from '@react-native-firebase/remote-config';
// config().X(...);
// firebase.remoteConfig().X(...);
export const firebase = getFirebaseRoot();
