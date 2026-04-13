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
  isFunction,
  isIOS,
  isNumber,
  isObject,
  isString,
  isUndefined,
  parseListenerOrObserver,
} from '@react-native-firebase/app/dist/module/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
  type ModuleConfig,
} from '@react-native-firebase/app/dist/module/internal';
import NativeFirebaseError from '@react-native-firebase/app/dist/module/internal/NativeFirebaseError';
import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import RemoteConfigValue from './RemoteConfigValue';
import { LastFetchStatus, ValueSource } from './statics';
import type {
  ConfigDefaults,
  ConfigSettings,
  ConfigUpdate,
  ConfigUpdateObserver,
  ConfigValue,
  ConfigValues,
  LastFetchStatusType,
  RemoteConfig,
} from './types/remote-config';
import type { FirebaseRemoteConfigTypes } from './types/namespaced';
import type {
  ConfigSettingsStateInternal,
  NativeRemoteConfigConstants,
  NativeRemoteConfigResult,
  RemoteConfigUpdateErrorEventInternal,
  RemoteConfigUpdateErrorInternal,
  RemoteConfigUpdateSuccessEventInternal,
  StoredConfigValueInternal,
} from './types/internal';
import { version } from './version';
import fallBackModule from './web/RNFBConfigModule';

function isSuccessEvent(
  event: RemoteConfigUpdateSuccessEventInternal | RemoteConfigUpdateErrorEventInternal,
): event is RemoteConfigUpdateSuccessEventInternal {
  return event.resultType === 'success';
}

function toConfigUpdate(updatedKeys: string[]): ConfigUpdate {
  return {
    getUpdatedKeys: () => new Set(updatedKeys),
  };
}

function toNativeFirebaseError(
  errorEvent: RemoteConfigUpdateErrorInternal,
): ReactNativeFirebase.NativeFirebaseError {
  return NativeFirebaseError.fromEvent(
    errorEvent,
    namespace,
  ) as ReactNativeFirebase.NativeFirebaseError;
}

const statics = {
  LastFetchStatus,
  ValueSource,
};

const namespace = 'remoteConfig';
const nativeModuleName = 'RNFBConfigModule' as const;

class FirebaseConfigModule extends FirebaseModule<typeof nativeModuleName> implements RemoteConfig {
  private _settings: ConfigSettingsStateInternal;
  private _lastFetchTime: number;
  private _lastFetchStatus: LastFetchStatusType;
  private _values: Record<string, StoredConfigValueInternal>;
  private _configUpdateListenerCount: number;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    customUrlOrRegion?: string | null,
  ) {
    super(app, config, customUrlOrRegion);
    this._settings = {
      // defaults to 1 minute.
      fetchTimeMillis: 60000,
      // defaults to 12 hours.
      minimumFetchIntervalMillis: 43200000,
    };
    this._lastFetchTime = -1;
    this._lastFetchStatus = 'no_fetch_yet';
    this._values = {};
    this._configUpdateListenerCount = 0;
  }

  get defaultConfig(): ConfigDefaults {
    const updatedDefaultConfig: ConfigDefaults = {};
    Object.keys(this._values).forEach(key => {
      // Need to make it an object with key and literal value. Not `Value` instance.
      const configValue = this._values[key];
      if (configValue) {
        updatedDefaultConfig[key] = configValue.value;
      }
    });

    return updatedDefaultConfig;
  }

  set defaultConfig(defaults: ConfigDefaults) {
    if (!isObject(defaults)) {
      throw new Error("firebase.remoteConfig().defaultConfig: 'defaults' must be an object.");
    }

    // To make Firebase web v9 API compatible, we update the config first so it immediately
    // updates defaults on the instance. We then pass to underlying SDK to update. We do this because
    // there is no way to "await" a setter.
    this._values = Object.freeze(
      Object.fromEntries(
        Object.entries(defaults).map(([key, value]) => [
          key,
          { value, source: 'default' as const },
        ]),
      ),
    );
    void this.setDefaults(defaults, true);
  }

  get settings(): ConfigSettings {
    return this._settings;
  }

  set settings(settings: ConfigSettings) {
    // To make Firebase web v9 API compatible, we update the settings first so it immediately
    // updates settings on the instance. We then pass to underlying SDK to update. We do this because
    // there is no way to "await" a setter. We can't delegate to `setConfigSettings()` as it is setup
    // for native.
    this._settings = {
      ...this._settings,
      ...settings,
    };
    void this.setConfigSettings(settings, true);
  }

  getValue(key: string): ConfigValue {
    if (!isString(key)) {
      throw new Error("firebase.remoteConfig().getValue(): 'key' must be a string value.");
    }

    if (typeof this._values === 'undefined' || !hasOwnProperty(this._values, key)) {
      return new RemoteConfigValue({
        value: '',
        source: 'static',
      });
    }

    const configValue = this._values[key]!;
    return new RemoteConfigValue({ value: `${configValue.value}`, source: configValue.source });
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

  getAll(): ConfigValues {
    const values: ConfigValues = {};
    Object.keys(this._values).forEach(key => {
      values[key] = this.getValue(key);
    });
    return values;
  }

  get fetchTimeMillis(): number {
    // android returns -1 if no fetch yet and iOS returns 0
    return this._lastFetchTime;
  }

  get lastFetchStatus(): LastFetchStatusType {
    return this._lastFetchStatus;
  }

  /**
   * Deletes all activated, fetched and defaults configs and resets all Firebase Remote Config settings.
   * @returns {Promise<null>}
   */
  reset(): Promise<void> {
    if (isIOS) {
      return Promise.resolve(null as unknown as void);
    }

    return this._promiseWithConstants(this.native.reset());
  }

  setConfigSettings(settings: ConfigSettings, fromSettingsSetter = false): Promise<void> {
    const updatedSettings = {
      fetchTimeout: this._settings.fetchTimeMillis / 1000,
      minimumFetchInterval: this._settings.minimumFetchIntervalMillis / 1000,
    };

    const apiCalled = fromSettingsSetter ? 'settings' : 'setConfigSettings';
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

    return this._promiseWithConstants(this.native.setConfigSettings(updatedSettings));
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
   *
   * @param expirationDurationSeconds
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
    );
  }

  fetchAndActivate(): Promise<boolean> {
    return this._promiseWithConstants(this.native.fetchAndActivate());
  }

  ensureInitialized(): Promise<void> {
    return this._promiseWithConstants(this.native.ensureInitialized());
  }

  /**
   * Sets defaults.
   *
   * @param defaults
   */
  setDefaults(defaults: ConfigDefaults, fromDefaultConfigSetter = false): Promise<null> {
    const apiCalled = fromDefaultConfigSetter ? 'defaultConfig' : 'setDefaults';
    if (!isObject(defaults)) {
      throw new Error(`firebase.remoteConfig().${apiCalled}(): 'defaults' must be an object.`);
    }

    return this._promiseWithConstants(this.native.setDefaults(defaults));
  }

  /**
   * Sets defaults based on resource.
   * @param resourceName
   */
  setDefaultsFromResource(resourceName: string): Promise<null> {
    if (!isString(resourceName)) {
      throw new Error(
        "firebase.remoteConfig().setDefaultsFromResource(): 'resourceName' must be a string value.",
      );
    }

    return this._promiseWithConstants(this.native.setDefaultsFromResource(resourceName));
  }

  /**
   * Registers an observer to changes in the configuration.
   *
   * @param observer - The observer to be notified of config updates.
   * @returns An unsubscribe function to remove the listener.
   */
  onConfigUpdate(observer: ConfigUpdateObserver): () => void {
    if (!isObject(observer) || !isFunction(observer.next) || !isFunction(observer.error)) {
      throw new Error("'observer' expected an object with 'next' and 'error' functions.");
    }

    // We maintaine our pre-web-support native interface but bend it to match
    // the official JS SDK API by assuming the callback is an Observer, and sending it a ConfigUpdate
    // compatible parameter that implements the `getUpdatedKeys` method
    let unsubscribed = false;
    const subscription = this.emitter.addListener(
      this.eventNameForApp('on_config_updated'),
      (event: RemoteConfigUpdateSuccessEventInternal | RemoteConfigUpdateErrorEventInternal) => {
        if (isSuccessEvent(event)) {
          observer.next(toConfigUpdate(event.updatedKeys));
          return;
        }

        observer.error(toNativeFirebaseError(event));
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
   *
   * @param listenerOrObserver - function called on config change
   * @returns unsubscribe listener
   * @deprecated use official firebase-js-sdk onConfigUpdate now that web supports realtime
   */
  onConfigUpdated(listenerOrObserver: unknown): () => void {
    const listener = parseListenerOrObserver(
      listenerOrObserver as FirebaseRemoteConfigTypes.CallbackOrObserver<FirebaseRemoteConfigTypes.OnConfigUpdatedListenerCallback>,
    ) as (event?: { updatedKeys: string[] }, error?: RemoteConfigUpdateErrorInternal) => void;
    let unsubscribed = false;
    const subscription = this.emitter.addListener(
      this.eventNameForApp('on_config_updated'),
      (event: RemoteConfigUpdateSuccessEventInternal | RemoteConfigUpdateErrorEventInternal) => {
        if (isSuccessEvent(event)) {
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

  private _updateFromConstants(constants: NativeRemoteConfigConstants): void {
    // Wrapped this as we update using sync getters initially for `defaultConfig` & `settings`
    if (constants.lastFetchTime !== undefined) {
      this._lastFetchTime = constants.lastFetchTime;
    }

    // Wrapped this as we update using sync getters initially for `defaultConfig` & `settings`
    if (constants.lastFetchStatus !== undefined) {
      this._lastFetchStatus = constants.lastFetchStatus;
    }

    if (constants.fetchTimeout !== undefined && constants.minimumFetchInterval !== undefined) {
      this._settings = {
        fetchTimeMillis: constants.fetchTimeout * 1000,
        minimumFetchIntervalMillis: constants.minimumFetchInterval * 1000,
      };
    }

    if (constants.values !== undefined) {
      this._values = Object.freeze(constants.values);
    }
  }

  private _promiseWithConstants<T>(promise: Promise<NativeRemoteConfigResult<T>>): Promise<T> {
    return promise.then(({ result, constants }) => {
      this._updateFromConstants(constants);
      return result;
    });
  }
}

// import { SDK_VERSION } from '@react-native-firebase/remote-config';
export const SDK_VERSION = version;

const remoteConfigNamespace = createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: ['on_config_updated'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseConfigModule,
});

type RemoteConfigNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseRemoteConfigTypes.Module,
  FirebaseRemoteConfigTypes.Statics
> & {
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

// import remoteConfig from '@react-native-firebase/remote-config';
// remoteConfig().X(...);
export default remoteConfigNamespace as unknown as RemoteConfigNamespace;

// import remoteConfig, { firebase } from '@react-native-firebase/remote-config';
// remoteConfig().X(...);
// firebase.remoteConfig().X(...);
export const firebase =
  getFirebaseRoot() as unknown as ReactNativeFirebase.FirebaseNamespacedExport<
    'remoteConfig',
    FirebaseRemoteConfigTypes.Module,
    FirebaseRemoteConfigTypes.Statics,
    false
  >;

// Register the interop module for non-native platforms.
setReactNativeModule(nativeModuleName, fallBackModule as unknown as Record<string, unknown>);
