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
import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseRemoteConfigTypes } from '..';

import RemoteConfig = FirebaseRemoteConfigTypes.Module;
import ConfigValues = FirebaseRemoteConfigTypes.ConfigValues;
import ConfigValue = FirebaseRemoteConfigTypes.ConfigValue;
import ConfigDefaults = FirebaseRemoteConfigTypes.ConfigDefaults;
import ConfigSettings = FirebaseRemoteConfigTypes.ConfigSettings;
import LastFetchStatusType = FirebaseRemoteConfigTypes.LastFetchStatusType;
import RemoteConfigLogLevel = FirebaseRemoteConfigTypes.RemoteConfigLogLevel;
import FirebaseApp = ReactNativeFirebase.FirebaseApp;
import LastFetchStatusInterface = FirebaseRemoteConfigTypes.LastFetchStatus;
import ValueSourceInterface = FirebaseRemoteConfigTypes.ValueSource;
import ConfigUpdateObserver = FirebaseRemoteConfigTypes.ConfigUpdateObserver;
import Unsubscribe = FirebaseRemoteConfigTypes.Unsubscribe;
// deprecated: from pre-Web realtime remote-config support - remove with onConfigUpdated
import CallbackOrObserver = FirebaseRemoteConfigTypes.CallbackOrObserver;
// deprecated: from pre-Web realtime remote-config support - remove with onConfigUpdated
import OnConfigUpdatedListenerCallback = FirebaseRemoteConfigTypes.OnConfigUpdatedListenerCallback;

export const LastFetchStatus: LastFetchStatusInterface;
export const ValueSource: ValueSourceInterface;

/**
 * Returns a RemoteConfig instance for the given app.
 * @param app - FirebaseApp. Optional.
 * @returns {RemoteConfig}
 */
export function getRemoteConfig(app?: FirebaseApp): RemoteConfig;

/**
 * Returns a Boolean which resolves to true if the current call
 * activated the fetched configs.
 * @param remoteConfig - RemoteConfig instance
 * @returns {Promise<boolean>}
 */
export function activate(remoteConfig: RemoteConfig): Promise<boolean>;

/**
 * Ensures the last activated config are available to the getters.
 * @param remoteConfig - RemoteConfig instance
 * @returns {Promise<void>}
 */
export function ensureInitialized(remoteConfig: RemoteConfig): Promise<void>;

/**
 * Performs a fetch and returns a Boolean which resolves to true
 * if the current call activated the fetched configs.
 * @param remoteConfig - RemoteConfig instance
 * @returns {Promise<boolean>}
 */
export function fetchAndActivate(remoteConfig: RemoteConfig): Promise<boolean>;

/**
 * Fetches and caches configuration from the Remote Config service.
 * @param remoteConfig - RemoteConfig instance
 * @returns {Promise<void>}
 */
export function fetchConfig(remoteConfig: RemoteConfig): Promise<void>;

/**
 * Gets all config.
 * @param remoteConfig - RemoteConfig instance
 * @returns {ConfigValues}
 */
export function getAll(remoteConfig: RemoteConfig): ConfigValues;

/**
 * Gets the value for the given key as a boolean.
 * @param remoteConfig - RemoteConfig instance
 * @param key - key for boolean value
 * @returns {boolean}
 */
export function getBoolean(remoteConfig: RemoteConfig, key: string): boolean;

/**
 * Gets the value for the given key as a number.
 * @param remoteConfig - RemoteConfig instance
 * @param key - key for number value
 * @returns {number}
 */
export function getNumber(remoteConfig: RemoteConfig, key: string): number;

/**
 * Gets the value for the given key as a string.
 * @param remoteConfig - RemoteConfig instance
 * @param key - key for string value
 * @returns {string}
 */
export function getString(remoteConfig: RemoteConfig, key: string): string;

/**
 * Gets the value for the given key
 * @param remoteConfig - RemoteConfig instance
 * @param key - key for the given value
 * @returns {ConfigValue}
 */
export function getValue(remoteConfig: RemoteConfig, key: string): ConfigValue;

/**
 * Defines the log level to use.
 * @param remoteConfig - RemoteConfig instance
 * @param logLevel - The log level to set
 * @returns {RemoteConfigLogLevel}
 */
export function setLogLevel(
  remoteConfig: RemoteConfig,
  logLevel: RemoteConfigLogLevel,
): RemoteConfigLogLevel;

/**
 * Checks two different things.
 * 1. Check if IndexedDB exists in the browser environment.
 * 2. Check if the current browser context allows IndexedDB open() calls.
 * @returns {Promise<boolean>}
 */
export function isSupported(): Promise<boolean>;

/**
 * Indicates the default value in milliseconds to abandon a pending fetch
 * request made to the Remote Config server. Defaults to 60000 (One minute).
 * @param remoteConfig - RemoteConfig instance
 * @returns {number}
 */
export function fetchTimeMillis(remoteConfig: RemoteConfig): number;

/**
 * Returns a ConfigSettings object which provides the properties `minimumFetchIntervalMillis` & `fetchTimeMillis` if they have been set
 * using setConfigSettings({ fetchTimeMillis: number, minimumFetchIntervalMillis: number }).
 * @param remoteConfig - RemoteConfig instance
 * @returns {ConfigSettings}
 */
export function settings(remoteConfig: RemoteConfig): ConfigSettings;

/**
 * The status of the latest Remote RemoteConfig fetch action.
 * @param remoteConfig - RemoteConfig instance
 * @returns {LastFetchStatusType}
 */
export function lastFetchStatus(remoteConfig: RemoteConfig): LastFetchStatusType;

/**
 * Deletes all activated, fetched and defaults configs and
 * resets all Firebase Remote Config settings.
 * Android only. iOS does not reset anything.
 * @param remoteConfig - RemoteConfig instance
 * @returns {Promise<void>}
 */
export function reset(remoteConfig: RemoteConfig): Promise<void>;

/**
 * Set the Remote RemoteConfig settings, currently able to set
 * `fetchTimeMillis` & `minimumFetchIntervalMillis`
 * Android only. iOS does not reset anything.
 * @param remoteConfig - RemoteConfig instance
 * @param settings - ConfigSettings instance
 * @returns {Promise<void>}
 */
export function setConfigSettings(
  remoteConfig: RemoteConfig,
  settings: ConfigSettings,
): Promise<void>;

/**
 * Fetches parameter values for your app.
 * @param remoteConfig - RemoteConfig instance
 * @param expirationDurationSeconds - number
 * @returns {Promise<void>}
 */
export function fetch(
  remoteConfig: RemoteConfig,
  expirationDurationSeconds?: number,
): Promise<void>;

/**
 * Fetches parameter values for your app.
 * @param remoteConfig - RemoteConfig instance
 * @param defaults - ConfigDefaults
 * @returns {Promise<void>}
 */
export function setDefaults(remoteConfig: RemoteConfig, defaults: ConfigDefaults): Promise<void>;

/**
 * Fetches parameter values for your app.
 * @param remoteConfig - RemoteConfig instance
 * @param resourceName - string
 * @returns {Promise<null>}
 */
export function setDefaultsFromResource(
  remoteConfig: RemoteConfig,
  resourceName: string,
): Promise<null>;

/**
 * Starts listening for real-time config updates from the Remote Config backend and automatically
 * fetches updates from the Remote Config backend when they are available.
 *
 * @remarks
 * If a connection to the Remote Config backend is not already open, calling this method will
 * open it. Multiple listeners can be added by calling this method again, but subsequent calls
 * re-use the same connection to the backend.
 *
 * The list of updated keys passed to the callback will include all keys not currently active,
 * and the config update process fetches the new config but does not automatically activate
 * it for you. Typically you will activate the config in your callback to use the new values.
 *
 * @param remoteConfig - The {@link RemoteConfig} instance.
 * @param observer - The {@link ConfigUpdateObserver} to be notified of config updates.
 * @returns An {@link Unsubscribe} function to remove the listener.
 */
export function onConfigUpdate(
  remoteConfig: RemoteConfig,
  observer: ConfigUpdateObserver,
): Unsubscribe;

/**
 * Registers a listener to changes in the configuration.
 *
 * @param remoteConfig - RemoteConfig instance
 * @param callback - function called on config change
 * @returns {function} unsubscribe listener
 * @deprecated use official firebase-js-sdk onConfigUpdate now that web supports realtime
 */
export function onConfigUpdated(
  remoteConfig: RemoteConfig,
  callback: CallbackOrObserver<OnConfigUpdatedListenerCallback>,
): () => void;

/**
 * Defines the type for representing custom signals and their values.
 * The values in CustomSignals must be one of the following types: string, number, or null.
 * There are additional limitations on key and value length, for a full description see https://firebase.google.com/docs/remote-config/parameters?template_type=client#custom_signal_conditions
 * Failing to stay within these limitations will result in a silent API failure with only a warning in device logs
 */

export interface CustomSignals {
  [key: string]: string | number | null;
}

/**
 * Sets the custom signals for the app instance.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @param {CustomSignals} customSignals - CustomSignals
 * @returns {Promise<void>}
 */

export declare function setCustomSignals(
  remoteConfig: RemoteConfig,
  customSignals: CustomSignals,
): Promise<void>;
