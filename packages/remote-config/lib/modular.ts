import { getApp } from '@react-native-firebase/app';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type {
  ConfigUpdateObserver,
  CustomSignals,
  RemoteConfig,
  Unsubscribe,
} from './types/modular';
import type {
  CallbackOrObserver,
  ConfigDefaults,
  ConfigSettings,
  ConfigValue,
  ConfigValues,
  LastFetchStatusType,
  OnConfigUpdatedListenerCallback,
  RemoteConfigLogLevel,
  RemoteConfigWithDeprecationArg,
} from './types/internal';

export type { CustomSignals };

/**
 * Returns a RemoteConfig instance for the given app.
 * @param app - FirebaseApp. Optional.
 * @returns RemoteConfig instance
 */
export function getRemoteConfig(app?: ReactNativeFirebase.FirebaseApp): RemoteConfig {
  if (app) {
    return getApp(app.name).remoteConfig() as RemoteConfig;
  }
  return getApp().remoteConfig() as RemoteConfig;
}

function rc(remoteConfig: RemoteConfig): RemoteConfigWithDeprecationArg {
  return remoteConfig as RemoteConfigWithDeprecationArg;
}

/**
 * Returns a Boolean which resolves to true if the current call activated the fetched configs.
 * @param remoteConfig - RemoteConfig instance
 * @returns Promise<boolean>
 */
export function activate(remoteConfig: RemoteConfig): Promise<boolean> {
  return rc(remoteConfig).activate.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Ensures the last activated config are available to the getters.
 * @param remoteConfig - RemoteConfig instance
 * @returns Promise<void>
 */
export function ensureInitialized(remoteConfig: RemoteConfig): Promise<void> {
  return rc(remoteConfig).ensureInitialized.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Performs a fetch and returns a Boolean which resolves to true if the current call activated the fetched configs.
 * @param remoteConfig - RemoteConfig instance
 * @returns Promise<boolean>
 */
export function fetchAndActivate(remoteConfig: RemoteConfig): Promise<boolean> {
  return rc(remoteConfig).fetchAndActivate.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Fetches and caches configuration from the Remote Config service.
 * @param remoteConfig - RemoteConfig instance
 * @returns Promise<void>
 */
export function fetchConfig(remoteConfig: RemoteConfig): Promise<void> {
  const r = rc(remoteConfig);
  if (r.fetchConfig) {
    return r.fetchConfig.call(remoteConfig, MODULAR_DEPRECATION_ARG);
  }
  return Promise.resolve();
}

/**
 * Gets all config.
 * @param remoteConfig - RemoteConfig instance
 * @returns ConfigValues
 */
export function getAll(remoteConfig: RemoteConfig): ConfigValues {
  return rc(remoteConfig).getAll.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets the value for the given key as a boolean.
 * @param remoteConfig - RemoteConfig instance
 * @param key - key for boolean value
 * @returns boolean
 */
export function getBoolean(remoteConfig: RemoteConfig, key: string): boolean {
  return rc(remoteConfig).getBoolean.call(remoteConfig, key, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets the value for the given key as a number.
 * @param remoteConfig - RemoteConfig instance
 * @param key - key for number value
 * @returns number
 */
export function getNumber(remoteConfig: RemoteConfig, key: string): number {
  return rc(remoteConfig).getNumber.call(remoteConfig, key, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets the value for the given key as a string.
 * @param remoteConfig - RemoteConfig instance
 * @param key - key for string value
 * @returns string
 */
export function getString(remoteConfig: RemoteConfig, key: string): string {
  return rc(remoteConfig).getString.call(remoteConfig, key, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets the value for the given key.
 * @param remoteConfig - RemoteConfig instance
 * @param key - key for the given value
 * @returns ConfigValue
 */
export function getValue(remoteConfig: RemoteConfig, key: string): ConfigValue {
  return rc(remoteConfig).getValue.call(remoteConfig, key, MODULAR_DEPRECATION_ARG);
}

/**
 * Defines the log level to use.
 * @param _remoteConfig - RemoteConfig instance
 * @param _logLevel - The log level to set
 * @returns RemoteConfigLogLevel
 */
export function setLogLevel(
  _remoteConfig: RemoteConfig,
  _logLevel: RemoteConfigLogLevel,
): RemoteConfigLogLevel {
  // always return the "error" log level for now as the setter is ignored on native. Web only.
  return 'error';
}

/**
 * Checks two different things.
 * 1. Check if IndexedDB exists in the browser environment.
 * 2. Check if the current browser context allows IndexedDB open() calls.
 * @returns Promise<boolean>
 */
export function isSupported(): Promise<boolean> {
  // always return "true" for now. Web only.
  return Promise.resolve(true);
}

/**
 * Indicates the default value in milliseconds to abandon a pending fetch request made to the Remote Config server. Defaults to 60000 (One minute).
 * @param remoteConfig - RemoteConfig instance
 * @returns number
 */
export function fetchTimeMillis(remoteConfig: RemoteConfig): number {
  return remoteConfig.fetchTimeMillis;
}

/**
 * Returns a ConfigSettings object which provides the properties `minimumFetchIntervalMillis` & `fetchTimeMillis` if they have been set
 * using setConfigSettings({ fetchTimeMillis: number, minimumFetchIntervalMillis: number }).
 * @param remoteConfig - RemoteConfig instance
 * @returns ConfigSettings
 */
export function settings(remoteConfig: RemoteConfig): ConfigSettings {
  return remoteConfig.settings;
}

/**
 * The status of the latest Remote Config fetch action.
 * @param remoteConfig - RemoteConfig instance
 * @returns LastFetchStatusType
 */
export function lastFetchStatus(remoteConfig: RemoteConfig): LastFetchStatusType {
  return remoteConfig.lastFetchStatus;
}

/**
 * Deletes all activated, fetched and defaults configs and resets all Firebase Remote Config settings.
 * Android only. iOS does not reset anything.
 * @param remoteConfig - RemoteConfig instance
 * @returns Promise<void>
 */
export function reset(remoteConfig: RemoteConfig): Promise<void> {
  return rc(remoteConfig).reset.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Set the Remote Config settings, currently able to set `fetchTimeMillis` & `minimumFetchIntervalMillis`.
 * @param remoteConfig - RemoteConfig instance
 * @param settings - ConfigSettings instance
 * @returns Promise<void>
 */
export function setConfigSettings(
  remoteConfig: RemoteConfig,
  settings: ConfigSettings,
): Promise<void> {
  return rc(remoteConfig).setConfigSettings.call(remoteConfig, settings, MODULAR_DEPRECATION_ARG);
}

/**
 * Fetches parameter values for your app.
 * @param remoteConfig - RemoteConfig instance
 * @param expirationDurationSeconds - number
 * @returns Promise<void>
 */
export function fetch(
  remoteConfig: RemoteConfig,
  expirationDurationSeconds?: number,
): Promise<void> {
  return rc(remoteConfig).fetch.call(
    remoteConfig,
    expirationDurationSeconds,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Fetches parameter values for your app (setDefaults).
 * @param remoteConfig - RemoteConfig instance
 * @param defaults - ConfigDefaults
 * @returns Promise<null>
 */
export function setDefaults(remoteConfig: RemoteConfig, defaults: ConfigDefaults): Promise<null> {
  return rc(remoteConfig).setDefaults.call(remoteConfig, defaults, MODULAR_DEPRECATION_ARG);
}

/**
 * Fetches parameter values for your app (setDefaultsFromResource).
 * @param remoteConfig - RemoteConfig instance
 * @param resourceName - string
 * @returns Promise<null>
 */
export function setDefaultsFromResource(
  remoteConfig: RemoteConfig,
  resourceName: string,
): Promise<null> {
  return rc(remoteConfig).setDefaultsFromResource.call(
    remoteConfig,
    resourceName,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Registers a listener to changes in the configuration.
 * @param remoteConfig - RemoteConfig instance
 * @param observer - to be notified of config updates
 * @returns Unsubscribe function to remove the listener
 */
export function onConfigUpdate(
  remoteConfig: RemoteConfig,
  observer: ConfigUpdateObserver,
): Unsubscribe {
  return rc(remoteConfig).onConfigUpdate.call(remoteConfig, observer, MODULAR_DEPRECATION_ARG);
}

/**
 * Registers a listener to changes in the configuration.
 * @param remoteConfig - RemoteConfig instance
 * @param callback - function called on config change
 * @returns unsubscribe listener
 * @deprecated use official firebase-js-sdk onConfigUpdate now that web supports realtime
 */
export function onConfigUpdated(
  remoteConfig: RemoteConfig,
  callback: CallbackOrObserver<OnConfigUpdatedListenerCallback>,
): () => void {
  return rc(remoteConfig).onConfigUpdated.call(remoteConfig, callback, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the custom signals for the app instance.
 * @param remoteConfig - RemoteConfig instance
 * @param customSignals - CustomSignals
 * @returns Promise<null>
 */
export async function setCustomSignals(
  remoteConfig: RemoteConfig,
  customSignals: CustomSignals,
): Promise<null> {
  for (const [key, value] of Object.entries(customSignals)) {
    if (typeof value !== 'string' && typeof value !== 'number' && value !== null) {
      throw new Error(
        `firebase.remoteConfig().setCustomSignals(): Invalid type for custom signal '${key}': ${typeof value}. Expected 'string', 'number', or 'null'.`,
      );
    }
  }

  const rcInstance = remoteConfig as unknown as {
    _promiseWithConstants: (
      p: Promise<{ result: unknown; constants: unknown }>,
    ) => Promise<unknown>;
    native: { setCustomSignals: (s: CustomSignals) => Promise<unknown> };
  };

  await rcInstance._promiseWithConstants(
    rcInstance.native.setCustomSignals(customSignals) as Promise<{
      result: unknown;
      constants: unknown;
    }>,
  );

  return null;
}

export { LastFetchStatus, ValueSource } from './statics';
