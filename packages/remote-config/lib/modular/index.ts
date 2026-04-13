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

import { getApp, type ReactNativeFirebase } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';

export interface CustomSignals {
  [key: string]: string | number | null;
}

type RemoteConfigEnabledApp = ReactNativeFirebase.FirebaseApp & {
  remoteConfig(): any;
};

/**
 * Returns a RemoteConfig instance for the given app.
 * @param app - FirebaseApp. Optional.
 */
export function getRemoteConfig(app?: ReactNativeFirebase.FirebaseApp): any {
  if (app) {
    return (getApp(app.name) as RemoteConfigEnabledApp).remoteConfig();
  }

  return (getApp() as RemoteConfigEnabledApp).remoteConfig();
}

/**
 * Returns a Boolean which resolves to true if the current call
 * activated the fetched configs.
 */
export function activate(remoteConfig: any): Promise<boolean> {
  return remoteConfig.activate.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Ensures the last activated config are available to the getters.
 */
export function ensureInitialized(remoteConfig: any): Promise<void> {
  return remoteConfig.ensureInitialized.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Performs a fetch and returns a Boolean which resolves to true
 * if the current call activated the fetched configs.
 */
export function fetchAndActivate(remoteConfig: any): Promise<boolean> {
  return remoteConfig.fetchAndActivate.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Fetches and caches configuration from the Remote Config service.
 */
export function fetchConfig(remoteConfig: any): Promise<void> {
  return remoteConfig.fetchConfig.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets all config.
 */
export function getAll(remoteConfig: any): any {
  return remoteConfig.getAll.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets the value for the given key as a boolean.
 */
export function getBoolean(remoteConfig: any, key: string): boolean {
  return remoteConfig.getBoolean.call(remoteConfig, key, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets the value for the given key as a number.
 */
export function getNumber(remoteConfig: any, key: string): number {
  return remoteConfig.getNumber.call(remoteConfig, key, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets the value for the given key as a string.
 */
export function getString(remoteConfig: any, key: string): string {
  return remoteConfig.getString.call(remoteConfig, key, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets the value for the given key.
 */
export function getValue(remoteConfig: any, key: string): any {
  return remoteConfig.getValue.call(remoteConfig, key, MODULAR_DEPRECATION_ARG);
}

/**
 * Defines the log level to use.
 */
export function setLogLevel(remoteConfig: any, logLevel: string): 'error' {
  void remoteConfig;
  void logLevel;
  // always return the "error" log level for now as the setter is ignored on native. Web only.
  return 'error';
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
 * Indicates the default value in milliseconds to abandon a pending fetch
 * request made to the Remote Config server. Defaults to 60000 (One minute).
 */
export function fetchTimeMillis(remoteConfig: any): number {
  return remoteConfig.fetchTimeMillis.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a ConfigSettings object which provides the properties
 * `minimumFetchIntervalMillis` & `fetchTimeMillis` if they have been set.
 */
export function settings(remoteConfig: any): any {
  return remoteConfig.settings.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * The status of the latest Remote Config fetch action.
 */
export function lastFetchStatus(remoteConfig: any): any {
  return remoteConfig.lastFetchStatus.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Deletes all activated, fetched and defaults configs and
 * resets all Firebase Remote Config settings.
 * Android only. iOS does not reset anything.
 */
export function reset(remoteConfig: any): Promise<void> {
  return remoteConfig.reset.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Set the Remote Config settings, currently able to set
 * `fetchTimeMillis` & `minimumFetchIntervalMillis`.
 */
export function setConfigSettings(remoteConfig: any, settingsValue: any): Promise<void> {
  return remoteConfig.setConfigSettings.call(remoteConfig, settingsValue, MODULAR_DEPRECATION_ARG);
}

/**
 * Fetches parameter values for your app.
 */
export function fetch(remoteConfig: any, expirationDurationSeconds?: number): Promise<void> {
  return remoteConfig.fetch.call(remoteConfig, expirationDurationSeconds, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets defaults for your app.
 */
export function setDefaults(remoteConfig: any, defaults: any): Promise<void> {
  return remoteConfig.setDefaults.call(remoteConfig, defaults, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets defaults based on a native resource.
 */
export function setDefaultsFromResource(remoteConfig: any, resourceName: string): Promise<null> {
  return remoteConfig.setDefaultsFromResource.call(
    remoteConfig,
    resourceName,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Registers a listener to changes in the configuration.
 *
 * @deprecated use official firebase-js-sdk onConfigUpdate now that web supports realtime
 */
export function onConfigUpdate(remoteConfig: any, observer: any): () => void {
  return remoteConfig.onConfigUpdate.call(remoteConfig, observer, MODULAR_DEPRECATION_ARG);
}

/**
 * Registers a listener to changes in the configuration.
 *
 * @deprecated use official firebase-js-sdk onConfigUpdate now that web supports realtime
 */
export function onConfigUpdated(remoteConfig: any, callback: any): () => void {
  return remoteConfig.onConfigUpdated.call(remoteConfig, callback, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the custom signals for the app instance.
 */
export async function setCustomSignals(
  remoteConfig: any,
  customSignals: CustomSignals,
): Promise<void> {
  for (const [key, value] of Object.entries(customSignals)) {
    if (typeof value !== 'string' && typeof value !== 'number' && value !== null) {
      throw new Error(
        `firebase.remoteConfig().setCustomSignals(): Invalid type for custom signal '${key}': ${typeof value}. Expected 'string', 'number', or 'null'.`,
      );
    }
  }

  return remoteConfig._promiseWithConstants.call(
    remoteConfig,
    remoteConfig.native.setCustomSignals(customSignals),
    MODULAR_DEPRECATION_ARG,
  );
}

// @ts-expect-error Temporary JS support file during TS migration scaffolding.
export { LastFetchStatus, ValueSource } from '../statics';
