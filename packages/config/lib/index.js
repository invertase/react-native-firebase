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
import { isNumber, isUndefined } from '@react-native-firebase/common';
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
  console.dir(nativeValue)
  return {
    source: nativeValue.source,
    get value() {
      const { boolValue, stringValue, numberValue, dataValue } = nativeValue;

      // undefined
      if (boolValue === false && numberValue === 0 && !stringValue.length && !dataValue.length) {
        return undefined;
      }

      // boolean
      if (
        boolValue !== null &&
        (stringValue === 'true' ||
          stringValue === 'false' ||
          stringValue === null)
      ) {
        return boolValue;
      }

      // number
      if (
        numberValue !== null &&
        numberValue !== undefined &&
        (stringValue == null ||
          stringValue === '' ||
          numberValue.toString() === stringValue)
      ) {
        return numberValue;
      }

      // data
      if (
        dataValue !== stringValue &&
        (stringValue == null || stringValue === '')
      ) {
        return dataValue;
      }

      // string
      return stringValue;
    },
  };
}


// TODO(salakar) remove namespacing of remote config - internal firebase use only
// "Namespaces are intended for introducing future Google services that leverage Remote Config to provide a feature. They are not meant for setting user assigned values."
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
   * TODO(salakar) add activate flag - (fetch & activate)
   * @param {number} cacheExpirationSeconds
   * @returns {Promise}
   */
  fetch(cacheExpirationSeconds = undefined) {
    if (!isUndefined(cacheExpirationSeconds) && !isNumber(cacheExpirationSeconds)) {
      throw new Error(`config.fetch(): 'cacheExpirationSeconds' is must be a number value.`);
    }

    if (isNumber(cacheExpirationSeconds)) {
      return this.native.fetch(cacheExpirationSeconds);
    }

    return this.native.fetch(cacheExpirationSeconds !== undefined ? cacheExpirationSeconds : -1);
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
   * Optionally in the given namespace.
   * @param {string} prefix
   * @param {string} namespace
   * @returns {string[]}
   */
  getKeysByPrefix(prefix, configNamespace = null) {
    // TODO(salakar) validate args
    return this.native.getKeysByPrefix(prefix, configNamespace);
  }

  // TODO(salakar) implement natively
  getValuesByKeysPrefix(prefix, configNamespace = null) {}

  /**
   * Gets the FirebaseRemoteConfigValue corresponding to the specified key.
   * Optionally in the specified namespace.
   * @param {string} key
   * @param {string} namespace
   */
  getValue(key, configNamespace = null) {}

  /**
   * Gets the FirebaseRemoteConfigValue array corresponding to the specified keys.
   * Optionally in the specified namespace.
   * @param keys
   * @param configNamespace
   */
  async getValues(keys, configNamespace = null) {
    // TODO(salakar) validate args
    const valuesObject = {};
    const keyValues = await this.native.getValues(keys, configNamespace);

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
    // TODO(salakar) validate isDeveloperModeEnabled
    return this.native.setConfigSettings(settings);
  }

  /**
   * Sets defaults.
   * Optionally in the default namespace.
   * @param {object} defaults
   * @param {string} namespace
   */
  setDefaults(defaults, configNamespace = null) {}

  /**
   * Sets defaults based on resource.
   * @param {string} resource
   */
  // TODO(salakar) will remove resourceId and support resource name - won't need to find the id then
  setDefaultsFromResource(resource, configNamespace = null) {}
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
