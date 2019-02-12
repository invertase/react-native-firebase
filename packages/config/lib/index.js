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
import version from './version';

const statics = {};

const namespace = 'config';

const nativeModuleName = 'RNFBConfigModule';

class FirebaseConfigModule extends FirebaseModule {
  /**
   * Activates the Fetched Config, so that the fetched key-values take effect.
   * @returns {boolean}
   */
  activateFetched() {}

  /**
   * Fetches parameter values for your app.
   * @param {number} cacheExpirationSeconds
   * @returns {Promise}
   */
  async fetch(cacheExpirationSeconds = null) {}

  /**
   * Returns FirebaseRemoteConfig singleton
   *  lastFetchTime,
   *  lastFetchStatus.
   *  isDeveloperModeEnabled
   * @returns {Object}
   */
  async getConfigSettings() {}

  /**
   * Gets the set of keys that start with the given prefix.
   * Optionally in the given namespace.
   * @param {string} prefix
   * @param {string} namespace
   * @returns {string[]}
   */
  async getKeysByPrefix(prefix, namespace = null) {}

  /**
   * Gets the FirebaseRemoteConfigValue corresponding to the specified key.
   * Optionally in the specified namespace.
   * @param {string} key
   * @param {string} namespace
   */
  async getValue(key, namespace = null) {}

  /**
   * Gets the FirebaseRemoteConfigValue array corresponding to the specified keys.
   * Optionally in the specified namespace.
   * @param {string[]} key
   * @param {string} namespace
   */
  async getValues(keys, namespace = null) {}

  /**
   * Changes the settings for the FirebaseRemoteConfig object's operations,
   * such as turning the developer mode on.
   * @param {object} settings
   * @description Android & iOS
   */
  setConfigSettings(settings) {}

  /**
   * Sets defaults.
   * Optionally in the default namespace.
   * @param {object} defaults
   * @param {string} namespace
   */
  setDefaults(defaults, namespace = null) {}

  /**
   * Sets defaults based on resource.
   * @param {string | number} resource
   */
  setDefaultsFromSource(resource, namespace = null) {}
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
