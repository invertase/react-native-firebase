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

import type { ReactNativeFirebase, LogCallback, LogOptions, Utils } from './types/app';
import { getUtils as getUtilsImpl } from './utils';
import UtilsStatics from './utils/UtilsStatics';
import {
  deleteApp as deleteAppCompat,
  getApp as getAppCompat,
  getApps as getAppsCompat,
  initializeApp as initializeAppCompat,
  setLogLevel as setLogLevelCompat,
  setReactNativeAsyncStorage as setReactNativeAsyncStorageCompat,
} from './internal/registry/app';
import { setUserLogHandler } from './internal/logger';
import { version as sdkVersion } from './version';
import { getAppModule } from './internal/registry/nativeModule';
/**
 * Renders this app unusable and frees the resources of all associated services.
 * @param app - The app to delete.
 * @returns Promise<void>
 */
export function deleteApp(app: ReactNativeFirebase.FirebaseApp): Promise<void> {
  return deleteAppCompat(app.name, (app as any)._nativeInitialized);
}

/**
 * Registers a library's name and version for platform logging purposes.
 * @param _libraryKeyOrName - library name or key.
 * @param _version - library version.
 * @param _variant - library variant. Optional.
 * @returns Promise<void>
 */
export function registerVersion(
  _libraryKeyOrName: string,
  _version: string,
  _variant?: string,
): Promise<void> {
  throw new Error('registerVersion is only supported on Web');
}

/**
 * Sets log handler for VertexAI only currently.
 * @param logCallback - The callback function to handle logs.
 * @param options - Optional settings for log handling.
 * @returns void
 */
export function onLog(logCallback: LogCallback | null, options?: LogOptions): void {
  setUserLogHandler(logCallback, options);
}

/**
 * Gets the list of all initialized apps.
 * @returns An array of all initialized Firebase apps.
 */
export function getApps(): ReactNativeFirebase.FirebaseApp[] {
  return getAppsCompat();
}

/**
 * Initializes a Firebase app with the provided options and name.
 * @param options - Options to configure the services used in the app.
 * @param configOrName - The optional name of the app, or config for the app to initialize (a name of '[DEFAULT]' will be used if omitted).
 * @returns The initialized Firebase app.
 */
export function initializeApp(
  options: ReactNativeFirebase.FirebaseAppOptions,
  configOrName?: string | ReactNativeFirebase.FirebaseAppConfig,
): Promise<ReactNativeFirebase.FirebaseApp> {
  return initializeAppCompat(options, configOrName);
}

/**
 * Retrieves an instance of a Firebase app.
 * @param name - The optional name of the app to return ('[DEFAULT]' if omitted).
 * @returns The requested Firebase app instance.
 */
export function getApp(name?: string): ReactNativeFirebase.FirebaseApp {
  return getAppCompat(name);
}

/**
 * Sets the log level across all Firebase SDKs.
 * @param logLevel - The log level to set ('debug', 'verbose', 'info', 'warn', 'error', 'silent').
 * @returns void
 */
export function setLogLevel(logLevel: ReactNativeFirebase.LogLevelString): void {
  return setLogLevelCompat(logLevel);
}

/**
 * The `AsyncStorage` implementation to use for persisting data on 'Other' platforms.
 * If not specified, in memory persistence is used.
 *
 * This is required if you want to persist things like Auth sessions, Analytics device IDs, etc.
 */
export function setReactNativeAsyncStorage(
  asyncStorage: ReactNativeFirebase.ReactNativeAsyncStorage,
): void {
  return setReactNativeAsyncStorageCompat(asyncStorage);
}

/**
 * Gets react-native-firebase specific "meta" data from native Info.plist / AndroidManifest.xml
 * @returns map of key / value pairs containing native meta data
 */
export function metaGetAll(): Promise<{ [key: string]: string | boolean }> {
  return getAppModule().metaGetAll();
}

/**
 * Gets react-native-firebase specific "firebase.json" data
 * @returns map of key / value pairs containing native firebase.json constants
 */
export function jsonGetAll(): Promise<{ [key: string]: string | boolean }> {
  return getAppModule().jsonGetAll();
}

/**
 * Clears react-native-firebase specific native preferences
 * @returns Promise<void>
 */
export function preferencesClearAll(): Promise<void> {
  return getAppModule().preferencesClearAll();
}

/**
 * Gets react-native-firebase specific native preferences
 * @returns map of key / value pairs containing native preferences data
 */
export function preferencesGetAll(): Promise<{ [key: string]: string | boolean }> {
  return getAppModule().preferencesGetAll();
}

/**
 * Sets react-native-firebase specific native boolean preference
 * @param key the name of the native preference to set
 * @param value the value of the native preference to set
 * @returns Promise<void>
 */
export function preferencesSetBool(key: string, value: boolean): Promise<void> {
  return getAppModule().preferencesSetBool(key, value);
}

/**
 * Sets react-native-firebase specific native string preference
 * @param key the name of the native preference to set
 * @param value the value of the native preference to set
 * @returns Promise<void>
 */
export function preferencesSetString(key: string, value: string): Promise<void> {
  return getAppModule().preferencesSetString(key, value);
}

export const SDK_VERSION = sdkVersion;

/**
 * Returns the {@link Utils.Module} instance for the default or given {@link ReactNativeFirebase.FirebaseApp}.
 *
 * @param app - The Firebase app to use. When omitted, the default app is used.
 */
export function getUtils(app?: ReactNativeFirebase.FirebaseApp): Utils.Module {
  return getUtilsImpl(app);
}

/**
 * Native device file paths for use with file-based APIs such as Storage `putFile` or `writeToFile`.
 */
export const FilePath: Utils.FilePath = new Proxy({} as Utils.FilePath, {
  get(_target, prop: string | symbol) {
    if (typeof prop === 'string') {
      return UtilsStatics.FilePath[prop as keyof Utils.FilePath];
    }
    return undefined;
  },
});
