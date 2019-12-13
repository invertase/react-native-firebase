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
  isBoolean,
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

  get lastFetchTime() {
    // android returns -1 if no fetch yet and iOS returns 0
    return this._lastFetchTime === -1 ? 0 : this._lastFetchTime;
  }

  get lastFetchStatus() {
    return this._lastFetchStatus;
  }

  get isDeveloperModeEnabled() {
    return this._isDeveloperModeEnabled;
  }

  get minimumFetchInterval() {
    return this._minimumFetchInterval;
  }

  setConfigSettings(settings = {}) {
    if (!isObject(settings) || !hasOwnProperty(settings, 'isDeveloperModeEnabled')) {
      throw new Error(
        "firebase.remoteConfig().setConfigSettings(): 'settings' must be an object with a 'isDeveloperModeEnabled' key.",
      );
    }

    if (!isBoolean(settings.isDeveloperModeEnabled)) {
      throw new Error(
        "firebase.remoteConfig().setConfigSettings(): 'settings.isDeveloperModeEnabled' must be a boolean value.",
      );
    }

    if (
      hasOwnProperty(settings, 'minimumFetchInterval') &&
      !isNumber(settings.minimumFetchInterval)
    ) {
      throw new Error(
        "firebase.remoteConfig().setConfigSettings(): 'settings.minimumFetchInterval' must be a number value.",
      );
    }

    return this._promiseWithConstants(this.native.setConfigSettings(settings));
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

  /**
   * Sets defaults.
   *
   * @param {object} defaults
   */
  setDefaults(defaults) {
    if (!isObject(defaults)) {
      throw new Error("firebase.remoteConfig().setDefaults(): 'defaults' must be an object.");
    }

    return this._promiseWithConstants(this.native.setDefaults(defaults));
  }

  /**
   * Sets defaults based on resource.
   * @param {string} resourceName
   */
  setDefaultsFromResource(resourceName) {
    if (!isString(resourceName)) {
      throw new Error(
        "firebase.remoteConfig().setDefaultsFromResource(): 'resourceName' must be a string value.",
      );
    }

    return this._promiseWithConstants(this.native.setDefaultsFromResource(resourceName));
  }

  _updateFromConstants(constants) {
    this._lastFetchTime = constants.lastFetchTime;
    this._lastFetchStatus = constants.lastFetchStatus;
    this._values = convertNativeConfigValues(constants.values);
    this._isDeveloperModeEnabled = constants.isDeveloperModeEnabled;
    this._minimumFetchInterval = constants.minimumFetchInterval;
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
