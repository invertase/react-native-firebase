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
  isIOS,
} from '@react-native-firebase/app/lib/common';
import Value from './RemoteConfigValue';
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

class FirebaseConfigModule extends FirebaseModule {
  constructor(...args) {
    super(...args);
    this._settings = {
      // defaults to 1 minute.
      fetchTimeMillis: 60000,
      // defaults to 12 hours.
      minimumFetchIntervalMillis: 43200000,
    };
    this._lastFetchTime = -1;
  }

  getValue(key) {
    if (!isString(key)) {
      throw new Error("firebase.remoteConfig().getValue(): 'key' must be a string value.");
    }

    if (typeof this._values === 'undefined' || !hasOwnProperty(this._values, key)) {
      return new Value({
        value: '',
        source: 'static',
      });
    }

    return new Value({ value: `${this._values[key].value}`, source: this._values[key].source });
  }

  getBoolean(key) {
    return this.getValue(key).asBoolean();
  }

  getNumber(key) {
    return this.getValue(key).asNumber();
  }

  getString(key) {
    return this.getValue(key).asString();
  }

  getAll() {
    const values = {};

    Object.keys(this._values).forEach(key => (values[key] = this.getValue(key)));

    return values;
  }

  get settings() {
    return this._settings;
  }

  get fetchTimeMillis() {
    // android returns -1 if no fetch yet and iOS returns 0
    return this._lastFetchTime;
  }

  get lastFetchStatus() {
    return this._lastFetchStatus;
  }

  /**
   * Deletes all activated, fetched and defaults configs and resets all Firebase Remote Config settings.
   * @returns {Promise<null>}
   */
  reset() {
    if (isIOS) {
      return Promise.resolve(null);
    }

    return this._promiseWithConstants(this.native.reset());
  }

  setConfigSettings(settings) {
    const nativeSettings = {
      //iOS & Android expect seconds
      fetchTimeout: this._settings.fetchTimeMillis / 1000,
      minimumFetchInterval: this._settings.minimumFetchIntervalMillis / 1000,
    };

    if (!isObject(settings)) {
      throw new Error('firebase.remoteConfig().setConfigSettings(*): settings must set an object.');
    }

    if (hasOwnProperty(settings, 'minimumFetchIntervalMillis')) {
      if (!isNumber(settings.minimumFetchIntervalMillis)) {
        throw new Error(
          "firebase.remoteConfig().setConfigSettings(): 'settings.minimumFetchIntervalMillis' must be a number type in milliseconds.",
        );
      } else {
        nativeSettings.minimumFetchInterval = settings.minimumFetchIntervalMillis / 1000;
      }
    }

    if (hasOwnProperty(settings, 'fetchTimeMillis')) {
      if (!isNumber(settings.fetchTimeMillis)) {
        throw new Error(
          "firebase.remoteConfig().setConfigSettings(): 'settings.fetchTimeMillis' must be a number type in milliseconds.",
        );
      } else {
        nativeSettings.fetchTimeout = settings.fetchTimeMillis / 1000;
      }
    }

    // this._settings = settings;
    return this._promiseWithConstants(this.native.setConfigSettings(nativeSettings));
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
    return this._promiseWithConstants(this.native.ensureInitialized());
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

    this._settings = {
      fetchTimeMillis: constants.fetchTimeout * 1000,
      minimumFetchIntervalMillis: constants.minimumFetchInterval * 1000,
    };

    this._values = Object.freeze(constants.values);
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
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseConfigModule,
});

// import config, { firebase } from '@react-native-firebase/remote-config';
// config().X(...);
// firebase.remoteConfig().X(...);
export const firebase = getFirebaseRoot();
