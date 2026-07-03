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
import type { FirebaseApp } from '@react-native-firebase/app';
import {
  FirebaseModule,
  getOrCreateModularInstance,
} from '@react-native-firebase/app/dist/module/internal';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import NativeFirebaseError from '@react-native-firebase/app/dist/module/internal/NativeFirebaseError';
import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import RemoteConfigValue from './RemoteConfigValue';
import { LastFetchStatus, ValueSource } from './statics';
import type {
  ConfigUpdate,
  ConfigUpdateObserver,
  CustomSignals,
  FetchStatus,
  LogLevel,
  RemoteConfig,
  RemoteConfigSettings,
  Unsubscribe,
  Value,
} from './types/remote-config';
import type {
  CallbackOrObserver,
  ConfigSettingsStateInternal,
  NativeRemoteConfigConstants,
  NativeRemoteConfigResult,
  OnConfigUpdatedListenerCallback,
  RemoteConfigInternal,
  RemoteConfigUpdateErrorEventInternal,
  RemoteConfigUpdateErrorInternal,
  RemoteConfigUpdateSuccessEventInternal,
  StoredConfigValueInternal,
} from './types/internal';
import { version } from './version';
import fallBackModule from './web/RNFBConfigModule';
import './types/internal';

type ConfigDefaults = Record<string, string | number | boolean>;
type ConfigSettings = {
  minimumFetchIntervalMillis?: number;
  fetchTimeMillis?: number;
  fetchTimeoutMillis?: number;
};
type ConfigValues = Record<string, Value>;

const namespace = 'remoteConfig';
const nativeModuleName = 'NativeRNFBTurboConfig' as const;

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

function rc(remoteConfig: RemoteConfig): RemoteConfigInternal {
  return remoteConfig as RemoteConfigInternal;
}

class FirebaseConfigModule extends FirebaseModule<typeof nativeModuleName> {
  private _settings: ConfigSettingsStateInternal;
  private _lastFetchTime: number;
  private _lastFetchStatus: FetchStatus;
  private _values: Record<string, StoredConfigValueInternal>;
  private _configUpdateListenerCount: number;
  private _nativeMutationQueue: Promise<void>;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    customUrlOrRegion?: string | null,
  ) {
    super(app, config, customUrlOrRegion);
    this._settings = {
      // defaults to 1 minute.
      fetchTimeoutMillis: 60000,
      // defaults to 12 hours.
      minimumFetchIntervalMillis: 43200000,
    };
    this._lastFetchTime = -1;
    this._lastFetchStatus = 'no_fetch_yet';
    this._values = {};
    this._configUpdateListenerCount = 0;
    this._nativeMutationQueue = Promise.resolve();
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
    const nonDefaultValues = Object.fromEntries(
      Object.entries(this._values).filter(([, configValue]) => configValue?.source !== 'default'),
    );

    this._values = Object.freeze({
      ...Object.fromEntries(
        Object.entries(defaults).map(([key, value]) => [
          key,
          { value, source: 'default' as const },
        ]),
      ),
      ...nonDefaultValues,
    });
    void this.setDefaults(defaults, true);
  }

  get settings(): RemoteConfigSettings & { fetchTimeMillis: number } {
    return {
      minimumFetchIntervalMillis: this._settings.minimumFetchIntervalMillis,
      fetchTimeoutMillis: this._settings.fetchTimeoutMillis,
      fetchTimeMillis: this._settings.fetchTimeoutMillis,
    };
  }

  set settings(settings: ConfigSettings | RemoteConfigSettings) {
    // To make Firebase web v9 API compatible, we update the settings first so it immediately
    // updates settings on the instance. We then pass to underlying SDK to update. We do this because
    // there is no way to "await" a setter. We can't delegate to `setConfigSettings()` as it is setup
    // for native.
    this._settings = {
      minimumFetchIntervalMillis:
        settings.minimumFetchIntervalMillis ?? this._settings.minimumFetchIntervalMillis,
      fetchTimeoutMillis:
        ('fetchTimeoutMillis' in settings ? settings.fetchTimeoutMillis : undefined) ??
        ('fetchTimeMillis' in settings ? settings.fetchTimeMillis : undefined) ??
        this._settings.fetchTimeoutMillis,
    };
    void this.setConfigSettings(settings, true);
  }

  getValue(key: string): Value {
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

  get lastFetchStatus(): FetchStatus {
    return this._lastFetchStatus;
  }

  /**
   * Deletes all activated, fetched and defaults configs and resets all Firebase Remote Config settings.
   * @returns {Promise<void>}
   */
  reset(): Promise<void> {
    if (isIOS) {
      return Promise.resolve();
    }

    return this._enqueueNativeMutation(() => this._promiseWithConstants(this.native.reset()));
  }

  setConfigSettings(
    settings: ConfigSettings | RemoteConfigSettings,
    fromSettingsSetter = false,
  ): Promise<void> {
    const updatedSettings: {
      fetchTimeout: number;
      minimumFetchInterval: number;
    } = {
      fetchTimeout: this._settings.fetchTimeoutMillis / 1000,
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
      }

      updatedSettings.fetchTimeout = settings.fetchTimeMillis / 1000;
    } else if (hasOwnProperty(settings, 'fetchTimeoutMillis')) {
      if (!isNumber(settings.fetchTimeoutMillis)) {
        throw new Error(
          `firebase.remoteConfig().${apiCalled}(): 'settings.fetchTimeoutMillis' must be a number type in milliseconds.`,
        );
      }

      updatedSettings.fetchTimeout = settings.fetchTimeoutMillis / 1000;
    }

    const nextSettings = {
      fetchTimeoutMillis: updatedSettings.fetchTimeout * 1000,
      minimumFetchIntervalMillis: updatedSettings.minimumFetchInterval * 1000,
    };

    // Keep JS reads in sync immediately. Native can report stale settings constants
    // for this call because native setConfigSettingsAsync completes after the bridge resolves.
    this._settings = nextSettings;

    return this._enqueueNativeMutation(() =>
      this.native.setConfigSettings(updatedSettings).then(({ result, constants }) => {
        // Preserve the eagerly computed settings above and only refresh the rest of the cache.
        this._updateFromConstants({
          ...constants,
          fetchTimeout: undefined,
          minimumFetchInterval: undefined,
        });
        return result;
      }),
    );
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

    return this._enqueueNativeMutation(() =>
      this._promiseWithConstants(this.native.setDefaults(defaults)),
    );
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

    return this._enqueueNativeMutation(() =>
      this._promiseWithConstants(this.native.setDefaultsFromResource(resourceName)),
    );
  }

  /**
   * Registers an observer to changes in the configuration.
   *
   * @param observer - The observer to be notified of config updates.
   * @returns An unsubscribe function to remove the listener.
   */
  onConfigUpdate(observer: ConfigUpdateObserver): Unsubscribe {
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
  onConfigUpdated(listenerOrObserver: unknown): Unsubscribe {
    const listener = parseListenerOrObserver(
      listenerOrObserver as CallbackOrObserver<OnConfigUpdatedListenerCallback>,
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
        fetchTimeoutMillis: constants.fetchTimeout * 1000,
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

  private _enqueueNativeMutation<T>(task: () => Promise<T>): Promise<T> {
    // Some callers (like property setters) discard the returned promise; serialize all mutations
    // so later writes like reset() cannot be overwritten by an earlier async completion.
    const next = this._nativeMutationQueue.then(task, task);
    this._nativeMutationQueue = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }
}

const config: ModuleConfig = {
  namespace,
  nativeModuleName,
  nativeEvents: ['on_config_updated'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  turboModule: true,
};

export { LastFetchStatus, ValueSource };
export const SDK_VERSION = version;

/**
 * Returns a RemoteConfig instance for the given app.
 * @param app - FirebaseApp. Optional.
 */
export function getRemoteConfig(app?: FirebaseApp): RemoteConfig {
  return getOrCreateModularInstance(FirebaseConfigModule, config, app) as unknown as RemoteConfig;
}

/**
 * Returns a Boolean which resolves to true if the current call
 * activated the fetched configs.
 */
export function activate(remoteConfig: RemoteConfig): Promise<boolean> {
  return rc(remoteConfig).activate();
}

/**
 * Ensures the last activated config are available to the getters.
 */
export function ensureInitialized(remoteConfig: RemoteConfig): Promise<void> {
  return rc(remoteConfig).ensureInitialized();
}

/**
 * Performs a fetch and returns a Boolean which resolves to true
 * if the current call activated the fetched configs.
 */
export function fetchAndActivate(remoteConfig: RemoteConfig): Promise<boolean> {
  return rc(remoteConfig).fetchAndActivate();
}

/**
 * Fetches and caches configuration from the Remote Config service.
 */
export function fetchConfig(remoteConfig: RemoteConfig): Promise<void> {
  return rc(remoteConfig).fetch();
}

/**
 * Gets all config.
 */
export function getAll(remoteConfig: RemoteConfig): Record<string, Value> {
  return rc(remoteConfig).getAll();
}

/**
 * Gets the value for the given key as a boolean.
 */
export function getBoolean(remoteConfig: RemoteConfig, key: string): boolean {
  return rc(remoteConfig).getBoolean(key);
}

/**
 * Gets the value for the given key as a number.
 */
export function getNumber(remoteConfig: RemoteConfig, key: string): number {
  return rc(remoteConfig).getNumber(key);
}

/**
 * Gets the value for the given key as a string.
 */
export function getString(remoteConfig: RemoteConfig, key: string): string {
  return rc(remoteConfig).getString(key);
}

/**
 * Gets the value for the given key.
 */
export function getValue(remoteConfig: RemoteConfig, key: string): Value {
  return rc(remoteConfig).getValue(key);
}

/**
 * Defines the log level to use.
 */
export function setLogLevel(remoteConfig: RemoteConfig, logLevel: LogLevel): void {
  void remoteConfig;
  void logLevel;
  // Intentionally ignored on native. The modular API matches the JS SDK and returns void.
}

/**
 * Checks two different things.
 * 1. Check if IndexedDB exists in the browser environment.
 * 2. Check if the current browser context allows IndexedDB open() calls.
 */
export function isSupported(): Promise<boolean> {
  // always return "true" for now. Web only.
  return Promise.resolve(true);
}

/**
 * Deletes all activated, fetched and defaults configs and
 * resets all Firebase Remote Config settings.
 *
 * @remarks **Android only.** iOS does not clear activated, fetched, or default configs.
 */
export function reset(remoteConfig: RemoteConfig): Promise<void> {
  return rc(remoteConfig).reset();
}

/**
 * Sets defaults based on a native resource file.
 *
 * @remarks Loads defaults from a platform resource — iOS `.plist` or Android XML — identified
 * by `resourceName`. No firebase-js-sdk modular equivalent.
 */
export function setDefaultsFromResource(
  remoteConfig: RemoteConfig,
  resourceName: string,
): Promise<null> {
  return rc(remoteConfig).setDefaultsFromResource(resourceName);
}

/**
 * Registers a listener to changes in the configuration.
 *
 */
export function onConfigUpdate(
  remoteConfig: RemoteConfig,
  observer: ConfigUpdateObserver,
): Unsubscribe {
  return rc(remoteConfig).onConfigUpdate(observer);
}

/**
 * Sets the custom signals for the app instance.
 */
export async function setCustomSignals(
  remoteConfig: RemoteConfig,
  customSignals: CustomSignals,
): Promise<void> {
  for (const [key, value] of Object.entries(customSignals)) {
    if (typeof value !== 'string' && typeof value !== 'number' && value !== null) {
      throw new Error(
        `firebase.remoteConfig().setCustomSignals(): Invalid type for custom signal '${key}': ${typeof value}. Expected 'string', 'number', or 'null'.`,
      );
    }
  }

  return rc(remoteConfig)._promiseWithConstants(
    rc(remoteConfig).native.setCustomSignals(customSignals),
  );
}

export type {
  ConfigUpdate,
  ConfigUpdateObserver,
  CustomSignals,
  FetchStatus,
  LogLevel,
  RemoteConfig,
  RemoteConfigSettings,
  Unsubscribe,
  Value,
} from './types/remote-config';

// Register the interop module for non-native platforms.
setReactNativeModule(nativeModuleName, fallBackModule as unknown as Record<string, unknown>);
