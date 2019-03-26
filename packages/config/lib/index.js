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
  hasOwnProperty,
  isNumber,
  isString,
  isBoolean,
  isArray,
  isUndefined,
  isObject,
} from '@react-native-firebase/common';
import version from './version';

const statics = {};

const namespace = 'config';

const nativeModuleName = 'RNFBConfigModule';

/**
 *
 * @param nativeValue
 * @returns {*}
 */
function nativeValueToJS(nativeValue) {
  return {
    source: nativeValue.source,
    get value() {
      const { boolValue, stringValue, numberValue } = nativeValue;

      // undefined
      if (boolValue === false && numberValue === 0 && !stringValue.length) {
        return undefined;
      }

      // boolean
      if (
        boolValue !== null &&
        (stringValue === 'true' || stringValue === 'false' || stringValue === null)
      ) {
        return boolValue;
      }

      // number
      if (
        numberValue !== null &&
        numberValue !== undefined &&
        (stringValue == null || stringValue === '' || numberValue.toString() === stringValue || parseInt(stringValue, 10) === numberValue)
      ) {
        return numberValue;
      }

      // string
      return stringValue;
    },
  };
}

class FirebaseConfigModule extends FirebaseModule {
  /**
   * Activates the Fetched Config, so that the fetched key-values take effect.
   * @returns {Promise<boolean>}
   */
  activateFetched() {
    return this.native.activateFetched();
  }

  /**
   * Fetches parameter values for your app.

   * @param {number} cacheExpirationSeconds
   * @returns {Promise}
   */
  fetch(cacheExpirationSeconds) {
    if (!isUndefined(cacheExpirationSeconds) && !isNumber(cacheExpirationSeconds)) {
      throw new Error(
        `firebase.config().fetch(): 'cacheExpirationSeconds' must be a number value.`,
      );
    }

    return this.native.fetch(cacheExpirationSeconds !== undefined ? cacheExpirationSeconds : -1, false);
  }

  /**
   * TODO(salakar) return boolean always?
   * @param cacheExpirationSeconds
   * @returns {Promise|never|Promise<Response>}
   */
  fetchAndActivate(cacheExpirationSeconds) {
    if (!isUndefined(cacheExpirationSeconds) && !isNumber(cacheExpirationSeconds)) {
      throw new Error(
        `firebase.config().fetchAndActivate(): 'cacheExpirationSeconds' must be a number value.`,
      );
    }

    return this.native.fetch(cacheExpirationSeconds !== undefined ? cacheExpirationSeconds : -1, true);
  }

  /**
   * Returns FirebaseRemoteConfig singleton
   *  lastFetchTime,
   *  lastFetchStatus.
   *  isDeveloperModeEnabled
   * @returns {Object}
   */
  getConfigSettings() {
    return this.native.getConfigSettings();
  }

  /**
   * Gets the set of keys that start with the given prefix.
   *
   * @param {string} prefix
   * @returns {string[]}
   */
  getKeysByPrefix(prefix) {
    if (!isUndefined(prefix) && !isString(prefix)) {
      throw new Error(`firebase.config().getKeysByPrefix(): 'prefix' must be a string value.`);
    }

    return this.native.getKeysByPrefix(prefix);
  }

  /**
   *
   * @param prefix
   * @returns {Promise<void>}
   */
  async getValuesByKeysPrefix(prefix) {
    if (!isUndefined(prefix) && !isString(prefix)) {
      throw new Error(
        `firebase.config().getValuesByKeysPrefix(): 'prefix' must be a string value.`,
      );
    }

    const output = {};
    const entries = Object.entries(await this.native.getValuesByKeysPrefix(prefix));

    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      output[key] = nativeValueToJS(value);
    }

    return output;
  }

  /**
   * Gets the FirebaseRemoteConfigValue corresponding to the specified key.
   *
   * @param {string} key
   */
  async getValue(key) {
    if (!isString(key)) {
      throw new Error(`firebase.config().getValue(): 'key' must be a string value.`);
    }

    return nativeValueToJS(await this.native.getValue(key));
  }

  /**
   * Gets the FirebaseRemoteConfigValue array corresponding to the specified keys.
   *
   * @param keys
   */
  async getValues(keys) {
    if (!isArray(keys) || !keys.length) {
      throw new Error(`firebase.config().getValues(): 'keys' must be an non empty array.`);
    }

    if (!isString(keys[0])) {
      throw new Error(`firebase.config().getValues(): 'keys' must be an array of strings.`);
    }

    const valuesObject = {};
    const keyValues = await this.native.getValues(keys);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      valuesObject[key] = nativeValueToJS(keyValues[i]);
    }

    return valuesObject;
  }

  /**
   * Changes the settings for the FirebaseRemoteConfig object's operations,
   * such as turning the developer mode on.
   * @param {object} settings
   * @description Android & iOS
   */
  setConfigSettings(settings = {}) {
    if (!isObject(settings) || !hasOwnProperty(settings, 'isDeveloperModeEnabled')) {
      throw new Error(
        `firebase.config().setConfigSettings(): 'settings' must be an object with a 'isDeveloperModeEnabled' key.`,
      );
    }

    if (!isBoolean(settings.isDeveloperModeEnabled)) {
      throw new Error(
        `firebase.config().setConfigSettings(): 'settings.isDeveloperModeEnabled' must be a boolean value.`,
      );
    }

    return this.native.setConfigSettings(settings);
  }

  /**
   * Sets defaults.
   *
   * @param {object} defaults
   */
  setDefaults(defaults) {
    if (!isObject(defaults)) {
      throw new Error(
        `firebase.config().setDefaults(): 'defaults' must be an object.`,
      );
    }

    return this.native.setDefaults(defaults);
  }

  /**
   * Sets defaults based on resource.
   * @param {string} resourceName
   */
  setDefaultsFromResource(resourceName) {
    if (!isString(resourceName)) {
      throw new Error(
        `firebase.config().setDefaultsFromResource(): 'resourceName' must be a string value.`,
      );
    }

    return this.native.setDefaultsFromResource(resourceName);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/config';
export const SDK_VERSION = version;

// import config from '@react-native-firebase/config';
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

// import config, { firebase } from '@react-native-firebase/config';
// config().X(...);
// firebase.config().X(...);
export const firebase = getFirebaseRoot();
