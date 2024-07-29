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
import { FirebaseApp } from '@firebase/app-types';
import { FirebaseRemoteConfigTypes } from '..';

import RemoteConfig = FirebaseRemoteConfigTypes.Module;
import ConfigValues = FirebaseRemoteConfigTypes.ConfigValues;
import ConfigValue = FirebaseRemoteConfigTypes.ConfigValue;
import ConfigDefaults = FirebaseRemoteConfigTypes.ConfigDefaults;
import ConfigSettings = FirebaseRemoteConfigTypes.ConfigSettings;
import LastFetchStatusType = FirebaseRemoteConfigTypes.LastFetchStatusType;
import RemoteConfigLogLevel = FirebaseRemoteConfigTypes.RemoteConfigLogLevel;

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
 * Registers a listener to changes in the configuration.
 *
 * @param remoteConfig - RemoteConfig instance
 * @param callback - function called on config change
 * @returns {function} unsubscribe listener
 */
export function onConfigUpdated(
  remoteConfig: RemoteConfig,
  callback: (config: ConfigValues) => void,
): () => void;
