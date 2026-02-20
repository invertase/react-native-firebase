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
  isFunction,
  parseListenerOrObserver,
} from '@react-native-firebase/app/dist/module/common';
import Value from './RemoteConfigValue';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/dist/module/internal';
import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
// Web fallback module; type inferred from implementation (RNFBConfigModule.ts)
const fallBackModule = require('./web/RNFBConfigModule') as {
  activate: (appName: string) => Promise<unknown>;
  setConfigSettings: (appName: string, settings: unknown) => Promise<unknown>;
  fetch: (appName: string, expirationDurationSeconds: number) => Promise<unknown>;
  fetchAndActivate: (appName: string) => Promise<unknown>;
  ensureInitialized: (appName: string) => Promise<unknown>;
  setDefaults: (appName: string, defaults: unknown) => Promise<unknown>;
  setCustomSignals: (appName: string, customSignals: unknown) => Promise<unknown>;
  onConfigUpdated: (appName: string) => void;
  removeConfigUpdateRegistration: (appName: string) => void;
};
import { version } from './version';
import { LastFetchStatus, ValueSource } from './statics';
import type { FirebaseRemoteConfigTypes } from './types/namespaced';
import type { ReactNativeFirebase } from '@react-native-firebase/app';

const statics = {
  LastFetchStatus,
  ValueSource,
};

const namespace = 'remoteConfig';
const nativeModuleName = 'RNFBConfigModule';

interface ConstantsUpdate {
  lastFetchTime?: number;
  lastFetchStatus?: string;
  fetchTimeout: number;
  minimumFetchInterval: number;
  values: Record<string, { value: string; source: string }>;
}

interface NativeConstantsResult {
  result: unknown;
  constants: ConstantsUpdate;
}

class FirebaseConfigModule extends FirebaseModule {
  _settings: FirebaseRemoteConfigTypes.ConfigSettings;
  _lastFetchTime: number;
  _values: Record<string, { value: string; source: string }>;
  _lastFetchStatus!: FirebaseRemoteConfigTypes.LastFetchStatusType;
  _configUpdateListenerCount: number;

  constructor(...args: ConstructorParameters<typeof FirebaseModule>) {
    super(...args);
    this._settings = {
      // defaults to 1 minute.
      fetchTimeMillis: 60000,
      fetchTimeoutMillis: 60000,
      // defaults to 12 hours.
      minimumFetchIntervalMillis: 43200000,
    };
    this._lastFetchTime = -1;
    this._values = {};
    this._configUpdateListenerCount = 0;
  }

  get defaultConfig(): FirebaseRemoteConfigTypes.ConfigDefaults {
    const updatedDefaultConfig: FirebaseRemoteConfigTypes.ConfigDefaults = {};
    Object.keys(this._values).forEach(key => {
      const entry = this._values[key];
      // Need to make it an object with key and literal value. Not `Value` instance.
      if (entry) updatedDefaultConfig[key] = entry.value;
    });
    return updatedDefaultConfig;
  }

  set defaultConfig(defaults: FirebaseRemoteConfigTypes.ConfigDefaults) {
    if (!isObject(defaults)) {
      throw new Error("firebase.remoteConfig().defaultConfig: 'defaults' must be an object.");
    }
    // To make Firebase web v9 API compatible, we update the config first so it immediately
    // updates defaults on the instance. We then pass to underlying SDK to update. We do this because
    // there is no way to "await" a setter.
    this._updateFromConstants(defaults);
    (
      this.setDefaults as (
        d: FirebaseRemoteConfigTypes.ConfigDefaults,
        internal?: boolean,
      ) => Promise<null>
    ).call(this, defaults, true);
  }

  get settings(): FirebaseRemoteConfigTypes.ConfigSettings {
    return this._settings;
  }

  set settings(settings: FirebaseRemoteConfigTypes.ConfigSettings) {
    // To make Firebase web v9 API compatible, we update the settings first so it immediately
    // updates settings on the instance. We then pass to underlying SDK to update. We do this because
    // there is no way to "await" a setter. We can't delegate to `setConfigSettings()` as it is setup
    // for native.
    this._updateFromConstants(settings);

    (
      this.setConfigSettings as (
        s: FirebaseRemoteConfigTypes.ConfigSettings,
        internal?: boolean,
      ) => Promise<void>
    ).call(this, settings, true);
  }

  getValue(key: string): FirebaseRemoteConfigTypes.ConfigValue {
    if (!isString(key)) {
      throw new Error("firebase.remoteConfig().getValue(): 'key' must be a string value.");
    }

    if (typeof this._values === 'undefined' || !hasOwnProperty(this._values, key)) {
      return new Value({
        value: '',
        source: 'static',
      });
    }

    const entry = this._values[key];
    return new Value({
      value: `${entry?.value ?? ''}`,
      source: (entry?.source ?? 'static') as 'remote' | 'default' | 'static',
    });
  }

  getBoolean(key: string): boolean {
    return this.getValue(key).asBoolean();
  }

  getNumber(key: string): number {
    return this.getValue(key).asNumber();
  }

  getString(key: string): string {
    return this.getValue(key).asString();
  }

  getAll(): FirebaseRemoteConfigTypes.ConfigValues {
    const values: FirebaseRemoteConfigTypes.ConfigValues = {};
    Object.keys(this._values).forEach(key => {
      values[key] = this.getValue(key);
    });
    return values;
  }

  get fetchTimeMillis(): number {
    // android returns -1 if no fetch yet and iOS returns 0
    return this._lastFetchTime;
  }

  get lastFetchStatus(): FirebaseRemoteConfigTypes.LastFetchStatusType {
    return this._lastFetchStatus;
  }

  /**
   * Deletes all activated, fetched and defaults configs and resets all Firebase Remote Config settings.
   * @returns {Promise<null>}
   */
  reset(): Promise<null | void> {
    if (isIOS) {
      return Promise.resolve(null);
    }
    return this._promiseWithConstants(this.native.reset()) as Promise<null>;
  }

  setConfigSettings(settings: FirebaseRemoteConfigTypes.ConfigSettings): Promise<void> {
    const updatedSettings: {
      fetchTimeout: number;
      minimumFetchInterval: number;
    } = {
      fetchTimeout: (this._settings.fetchTimeMillis ?? 60000) / 1000,
      minimumFetchInterval: (this._settings.minimumFetchIntervalMillis ?? 43200000) / 1000,
    };

    const apiCalled =
      (arguments as unknown as [unknown, unknown])[1] === true ? 'settings' : 'setConfigSettings';

    if (!isObject(settings)) {
      throw new Error(`firebase.remoteConfig().${apiCalled}(*): settings must set an object.`);
    }

    if (hasOwnProperty(settings, 'minimumFetchIntervalMillis')) {
      if (!isNumber(settings.minimumFetchIntervalMillis)) {
        throw new Error(
          `firebase.remoteConfig().${apiCalled}(): 'settings.minimumFetchIntervalMillis' must be a number type in milliseconds.`,
        );
      } else {
        updatedSettings.minimumFetchInterval = settings.minimumFetchIntervalMillis / 1000;
      }
    }

    if (hasOwnProperty(settings, 'fetchTimeMillis')) {
      if (!isNumber(settings.fetchTimeMillis)) {
        throw new Error(
          `firebase.remoteConfig().${apiCalled}(): 'settings.fetchTimeMillis' must be a number type in milliseconds.`,
        );
      } else {
        updatedSettings.fetchTimeout = settings.fetchTimeMillis / 1000;
      }
    }

    return this._promiseWithConstants(
      this.native.setConfigSettings(updatedSettings),
    ) as Promise<void>;
  }

  /**
   * Activates the Fetched RemoteConfig, so that the fetched key-values take effect.
   * @returns {Promise<boolean>}
   */
  activate(): Promise<boolean> {
    return this._promiseWithConstants(this.native.activate());
  }

  /**
   * Fetches parameter values for your app.
   * @param {number} expirationDurationSeconds
   * @returns {Promise}
   */
  fetch(expirationDurationSeconds?: number): Promise<void> {
    if (!isUndefined(expirationDurationSeconds) && !isNumber(expirationDurationSeconds)) {
      throw new Error(
        "firebase.remoteConfig().fetch(): 'expirationDurationSeconds' must be a number value.",
      );
    }

    return this._promiseWithConstants(
      this.native.fetch(expirationDurationSeconds !== undefined ? expirationDurationSeconds : -1),
    ) as Promise<void>;
  }

  fetchAndActivate(): Promise<boolean> {
    return this._promiseWithConstants(this.native.fetchAndActivate());
  }

  ensureInitialized(): Promise<void> {
    return this._promiseWithConstants(this.native.ensureInitialized()) as Promise<void>;
  }

  /**
   * Sets defaults.
   * @param {object} defaults
   */
  setDefaults(defaults: FirebaseRemoteConfigTypes.ConfigDefaults): Promise<null> {
    const apiCalled =
      (arguments as unknown as [unknown, unknown])[1] === true ? 'defaultConfig' : 'setDefaults';

    if (!isObject(defaults)) {
      throw new Error(`firebase.remoteConfig().${apiCalled}(): 'defaults' must be an object.`);
    }

    return this._promiseWithConstants(this.native.setDefaults(defaults)) as Promise<null>;
  }

  /**
   * Sets defaults based on resource.
   * @param {string} resourceName
   */
  setDefaultsFromResource(resourceName: string): Promise<null> {
    if (!isString(resourceName)) {
      throw new Error(
        "firebase.remoteConfig().setDefaultsFromResource(): 'resourceName' must be a string value.",
      );
    }

    return this._promiseWithConstants(
      this.native.setDefaultsFromResource(resourceName),
    ) as Promise<null>;
  }

  /**
   * Registers an observer to changes in the configuration.
   * @param observer - The {@link ConfigUpdateObserver} to be notified of config updates.
   * @returns An {@link Unsubscribe} function to remove the listener.
   */
  onConfigUpdate(
    observer: FirebaseRemoteConfigTypes.ConfigUpdateObserver,
  ): FirebaseRemoteConfigTypes.Unsubscribe {
    if (!isObject(observer) || !isFunction(observer.next) || !isFunction(observer.error)) {
      throw new Error("'observer' expected an object with 'next' and 'error' functions.");
    }

    // We maintain our pre-web-support native interface but bend it to match
    // the official JS SDK API by assuming the callback is an Observer, and sending it a ConfigUpdate
    // compatible parameter that implements the `getUpdatedKeys` method
    let unsubscribed = false;

    const subscription = this.emitter.addListener(
      this.eventNameForApp('on_config_updated'),
      (event: {
        resultType: string;
        updatedKeys: string[];
        code: string;
        message: string;
        nativeErrorMessage: string;
      }) => {
        const { resultType } = event;

        if (resultType === 'success') {
          observer.next({
            getUpdatedKeys: () => new Set(event.updatedKeys),
          });
          return;
        }

        observer.error(
          Object.assign(new Error(event.message), {
            code: event.code,
            message: event.message,
            nativeErrorMessage: event.nativeErrorMessage,
          }),
        );
      },
    );

    if (this._configUpdateListenerCount === 0) {
      this.native.onConfigUpdated();
    }

    this._configUpdateListenerCount++;

    return () => {
      if (unsubscribed) {
        // there is no harm in calling this multiple times to unsubscribe,
        // but anything after the first call is a no-op
        return;
      }
      unsubscribed = true;
      subscription.remove();

      this._configUpdateListenerCount--;

      if (this._configUpdateListenerCount === 0) {
        this.native.removeConfigUpdateRegistration();
      }
    };
  }

  /**
   * Registers a listener to changes in the configuration.
   * @param listenerOrObserver - function called on config change
   * @returns {function} unsubscribe listener
   * @deprecated use official firebase-js-sdk onConfigUpdate now that web supports realtime
   */
  onConfigUpdated(
    listenerOrObserver: FirebaseRemoteConfigTypes.CallbackOrObserver<FirebaseRemoteConfigTypes.OnConfigUpdatedListenerCallback>,
  ): () => void {
    const listener = parseListenerOrObserver(listenerOrObserver) as (
      event?: { updatedKeys: string[] },
      error?: { code: string; message: string; nativeErrorMessage: string },
    ) => void;
    let unsubscribed = false;

    const subscription = this.emitter.addListener(
      this.eventNameForApp('on_config_updated'),
      (event: {
        resultType: string;
        updatedKeys: string[];
        code: string;
        message: string;
        nativeErrorMessage: string;
      }) => {
        const { resultType } = event;

        if (resultType === 'success') {
          listener({ updatedKeys: event.updatedKeys }, undefined);
          return;
        }

        listener(undefined, {
          code: event.code,
          message: event.message,
          nativeErrorMessage: event.nativeErrorMessage,
        });
      },
    );

    if (this._configUpdateListenerCount === 0) {
      this.native.onConfigUpdated();
    }

    this._configUpdateListenerCount++;

    return () => {
      if (unsubscribed) {
        // there is no harm in calling this multiple times to unsubscribe,
        // but anything after the first call is a no-op
        return;
      }

      unsubscribed = true;
      subscription.remove();

      this._configUpdateListenerCount--;

      if (this._configUpdateListenerCount === 0) {
        this.native.removeConfigUpdateRegistration();
      }
    };
  }

  _updateFromConstants(
    constants:
      | ConstantsUpdate
      | FirebaseRemoteConfigTypes.ConfigDefaults
      | FirebaseRemoteConfigTypes.ConfigSettings,
  ): void {
    const c = constants as Record<string, unknown>;
    // Wrapped this as we update using sync getters initially for `defaultConfig` & `settings`
    if (typeof c.lastFetchTime === 'number') {
      this._lastFetchTime = c.lastFetchTime;
    }

    // Wrapped this as we update using sync getters initially for `defaultConfig` & `settings`
    if (typeof c.lastFetchStatus === 'string') {
      this._lastFetchStatus = c.lastFetchStatus as FirebaseRemoteConfigTypes.LastFetchStatusType;
    }

    if (typeof c.fetchTimeout === 'number' && typeof c.minimumFetchInterval === 'number') {
      const timeoutMillis = c.fetchTimeout * 1000;

      this._settings = {
        fetchTimeMillis: timeoutMillis,
        fetchTimeoutMillis: timeoutMillis,
        minimumFetchIntervalMillis: c.minimumFetchInterval * 1000,
      };
    } else if (
      typeof (c as unknown as FirebaseRemoteConfigTypes.ConfigSettings).fetchTimeMillis ===
        'number' ||
      typeof (c as unknown as FirebaseRemoteConfigTypes.ConfigSettings).fetchTimeoutMillis ===
        'number' ||
      typeof (c as unknown as FirebaseRemoteConfigTypes.ConfigSettings)
        .minimumFetchIntervalMillis === 'number'
    ) {
      const s = c as unknown as FirebaseRemoteConfigTypes.ConfigSettings;
      const timeoutMillis =
        s.fetchTimeoutMillis ?? s.fetchTimeMillis ?? this._settings.fetchTimeoutMillis;

      this._settings = {
        fetchTimeMillis: timeoutMillis,
        fetchTimeoutMillis: timeoutMillis,
        minimumFetchIntervalMillis:
          s.minimumFetchIntervalMillis ?? this._settings.minimumFetchIntervalMillis,
      };
    }

    if (c.values && typeof c.values === 'object' && !Array.isArray(c.values)) {
      this._values = Object.freeze(c.values) as Record<string, { value: string; source: string }>;
    }
  }

  _promiseWithConstants<T>(promise: Promise<NativeConstantsResult>): Promise<T> {
    return promise.then(({ result, constants }) => {
      this._updateFromConstants(constants);
      return result as T;
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
  nativeEvents: ['on_config_updated'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseConfigModule,
});

// import config, { firebase } from '@react-native-firebase/remote-config';
// config().X(...);
// firebase.remoteConfig().X(...);
export const firebase =
  getFirebaseRoot() as unknown as ReactNativeFirebase.FirebaseNamespacedExport<
    'remoteConfig',
    FirebaseRemoteConfigTypes.Module,
    FirebaseRemoteConfigTypes.Statics,
    false
  >;

setReactNativeModule(nativeModuleName, fallBackModule);
