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

import { firebase } from '..';

/**
 * @typedef {import('@firebase/app').FirebaseApp} FirebaseApp
 * @typedef {import('..').FirebaseRemoteConfigTypes.Module} RemoteConfig
 * @typedef {import('..').FirebaseRemoteConfigTypes.ConfigDefaults} ConfigDefaults
 * @typedef {import('..').FirebaseRemoteConfigTypes.ConfigSettings} ConfigSettings
 * @typedef {import('..').FirebaseRemoteConfigTypes.ConfigValue} ConfigValue
 * @typedef {import('..').FirebaseRemoteConfigTypes.ConfigValues} ConfigValues
 * @typedef {import('..').FirebaseRemoteConfigTypes.LastFetchStatusType} LastFetchStatusType
 * @typedef {import('..').FirebaseRemoteConfigTypes.RemoteConfigLogLevel} RemoteConfigLogLevel
 */

/**
 * Returns a RemoteConfig instance for the given app.
 * @param {FirebaseApp} [app] - FirebaseApp. Optional.
 * @returns {RemoteConfig}
 */
export function getRemoteConfig(app) {
  if (app) {
    return firebase.app(app.name).remoteConfig();
  }

  return firebase.app().remoteConfig();
}

/**
 * Returns a Boolean which resolves to true if the current call
 * activated the fetched configs.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @returns {Promise<boolean>}
 */
export function activate(remoteConfig) {
  return remoteConfig.activate();
}

/**
 * Ensures the last activated config are available to the getters.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @returns {Promise<void>}
 */
export function ensureInitialized(remoteConfig) {
  return remoteConfig.ensureInitialized();
}

/**
 * Performs a fetch and returns a Boolean which resolves to true
 * if the current call activated the fetched configs.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @returns {Promise<boolean>}
 */
export function fetchAndActivate(remoteConfig) {
  return remoteConfig.fetchAndActivate();
}

/**
 * Fetches and caches configuration from the Remote Config service.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @returns {Promise<void>}
 */
export function fetchConfig(remoteConfig) {
  return remoteConfig.fetchConfig();
}

/**
 * Gets all config.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @returns {ConfigValues}
 */
export function getAll(remoteConfig) {
  return remoteConfig.getAll();
}

/**
 * Gets the value for the given key as a boolean.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @param {string} key - key for boolean value
 * @returns {boolean}
 */
export function getBoolean(remoteConfig, key) {
  return remoteConfig.getBoolean(key);
}

/**
 * Gets the value for the given key as a number.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @param {string} key - key for number value
 * @returns {number}
 */
export function getNumber(remoteConfig, key) {
  return remoteConfig.getNumber(key);
}

/**
 * Gets the value for the given key as a string.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @param {string} key - key for string value
 * @returns {string}
 */
export function getString(remoteConfig, key) {
  return remoteConfig.getString(key);
}

/**
 * Gets the value for the given key
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @param {string} key - key for the given value
 * @returns {ConfigValue}
 */
export function getValue(remoteConfig, key) {
  return remoteConfig.getValue(key);
}

/**
 * Defines the log level to use.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @param {RemoteConfigLogLevel} logLevel - The log level to set
 * @returns {RemoteConfigLogLevel}
 */
// eslint-disable-next-line
export function setLogLevel(remoteConfig, logLevel) {
  // always return the "error" log level for now as the setter is ignored on native. Web only.
  return 'error';
}

/**
 * Checks two different things.
 * 1. Check if IndexedDB exists in the browser environment.
 * 2. Check if the current browser context allows IndexedDB open() calls.
 * @returns {Promise<boolean>}
 */
export function isSupported() {
  // always return "true" for now. Web only.
  return Promise.resolve(true);
}

/**
 * Indicates the default value in milliseconds to abandon a pending fetch
 * request made to the Remote Config server. Defaults to 60000 (One minute).
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @returns {number}
 */
export function fetchTimeMillis(remoteConfig) {
  return remoteConfig.fetchTimeMillis;
}

/**
 * Returns a ConfigSettings object which provides the properties `minimumFetchIntervalMillis` & `fetchTimeMillis` if they have been set
 * using setConfigSettings({ fetchTimeMillis: number, minimumFetchIntervalMillis: number }).
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @returns {ConfigSettings}
 */
export function settings(remoteConfig) {
  return remoteConfig.settings;
}

/**
 * The status of the latest Remote RemoteConfig fetch action.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @returns {LastFetchStatusType}
 */
export function lastFetchStatus(remoteConfig) {
  return remoteConfig.lastFetchStatus;
}

/**
 * Deletes all activated, fetched and defaults configs and
 * resets all Firebase Remote Config settings.
 * Android only. iOS does not reset anything.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @returns {Promise<void>}
 */
export function reset(remoteConfig) {
  return remoteConfig.reset();
}

/**
 * Set the Remote RemoteConfig settings, currently able to set
 * `fetchTimeMillis` & `minimumFetchIntervalMillis`
 * Android only. iOS does not reset anything.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @param {ConfigSettings} settings - ConfigSettings instance
 * @returns {Promise<void>}
 */
export function setConfigSettings(remoteConfig, settings) {
  return remoteConfig.setConfigSettings(settings);
}

/**
 * Fetches parameter values for your app.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @param {number} expirationDurationSeconds - number
 * @returns {Promise<void>}
 */
export function fetch(remoteConfig, expirationDurationSeconds) {
  return remoteConfig.fetch(expirationDurationSeconds);
}

/**
 * Fetches parameter values for your app.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @param {ConfigDefaults} defaults - ConfigDefaults
 * @returns {Promise<void>}
 */
export function setDefaults(remoteConfig, defaults) {
  return remoteConfig.setDefaults(defaults);
}

/**
 * Fetches parameter values for your app.
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @param {string} resourceName - string
 * @returns {Promise<null>}
 */
export function setDefaultsFromResource(remoteConfig, resourceName) {
  return remoteConfig.setDefaultsFromResource(resourceName);
}

/**
 * Registers a listener to changes in the configuration.
 *
 * @param {RemoteConfig} remoteConfig - RemoteConfig instance
 * @param {function(ConfigValues): void} callback - function called on config change
 * @returns {function} unsubscribe listener
 */
export function onConfigUpdated(remoteConfig, callback) {
  return remoteConfig.onConfigUpdated(callback);
}
