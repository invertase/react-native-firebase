import { MODULAR_DEPRECATION_ARG } from '../common';
import { getReactNativeModule } from '../internal/nativeModule';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  deleteApp as deleteAppCompat,
  FirebaseApp,
  getApp as getAppCompat,
  getApps as getAppsCompat,
  initializeApp as initializeAppCompat,
  setLogLevel as setLogLevelCompat,
  setReactNativeAsyncStorage as setReactNativeAsyncStorageCompat,
} from '../internal';
import { LogCallback, LogOptions, setUserLogHandler } from '../internal/logger';
import sdkVersion from '../version';
import type { ReactNativeFirebase } from '../index.d.ts';

/**
 * Renders this app unusable and frees the resources of all associated services.
 * @param {FirebaseApp} app - The app to delete.
 * @returns {Promise<void>}
 */
export function deleteApp(app: FirebaseApp): Promise<void> {
  // @ts-ignore - ignoring TS warning regarding amount of arguments
  return deleteAppCompat.call(null, app.name, app._nativeInitialized, MODULAR_DEPRECATION_ARG);
}

/**
 * Registers a library's name and version for platform logging purposes.
  @param {string} libraryKeyOrName - library name or key.
  @param {string} version - library version.
  @param {string | undefined} variant - library variant. Optional.
 * @returns {Promise<void>}
 */
export function registerVersion(libraryKeyOrName: string, version: string, variant?: string) {
  throw new Error('registerVersion is only supported on Web');
}

/**
 * Sets log handler for VertexAI only currently.
 * @param {LogCallback | null} logCallback - The callback function to handle logs.
 * @param {LogOptions} [options] - Optional settings for log handling.
 * @returns {void}
 */
export function onLog(logCallback: LogCallback, options?: LogOptions): void {
  setUserLogHandler(logCallback, options);
}

/**
 * Gets the list of all initialized apps.
 * @returns {FirebaseApp[]} - An array of all initialized Firebase apps.
 */
export function getApps(): FirebaseApp[] {
  return getAppsCompat.call(null, MODULAR_DEPRECATION_ARG);
}

/**
 * Initializes a Firebase app with the provided options and name.
 * @param {FirebaseAppOptions} options - Options to configure the services used in the app.
 * @param {string} [name] - The optional name of the app to initialize ('[DEFAULT]' if omitted).
 * @returns {FirebaseApp} - The initialized Firebase app.
 */
export function initializeApp(
  options: ReactNativeFirebase.FirebaseAppOptions,
  name?: string,
): FirebaseApp {
  return initializeAppCompat.call(null, options, name, MODULAR_DEPRECATION_ARG);
}

/**
 * Retrieves an instance of a Firebase app.
 * @param {string} [name] - The optional name of the app to return ('[DEFAULT]' if omitted).
 * @returns {FirebaseApp} - The requested Firebase app instance.
 */
export function getApp(name?: string): FirebaseApp {
  return getAppCompat.call(null, name, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the log level across all Firebase SDKs.
 * @param {LogLevelString} logLevel - The log level to set ('debug', 'verbose', 'info', 'warn', 'error', 'silent').
 * @returns {void}
 */
export function setLogLevel(logLevel: ReactNativeFirebase.LogLevelString): void {
  return setLogLevelCompat.call(null, logLevel, MODULAR_DEPRECATION_ARG);
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
  return setReactNativeAsyncStorageCompat.call(null, asyncStorage, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets react-native-firebase specific "meta" data from native Info.plist / AndroidManifest.xml
 * @returns map of key / value pairs containing native meta data
 */
export function metaGetAll(): Record<string, string> {
  return getReactNativeModule('RNFBAppModule').metaGetAll();
}

/**
 * Gets react-native-firebase specific "firebase.json" data
 * @returns map of key / value pairs containing native firebase.json constants
 */
export function jsonGetAll() {
  return getReactNativeModule('RNFBAppModule').jsonGetAll();
}

/**
 * Clears react-native-firebase specific native preferences
 * @returns Promise<void>
 */
export function preferencesClearAll(): Promise<void> {
  return getReactNativeModule('RNFBAppModule').preferencesClearAll();
}

/**
 * Gets react-native-firebase specific native preferences
 * @returns map of key / value pairs containing native preferences data
 */
export function preferencesGetAll(): Record<string, string> {
  return getReactNativeModule('RNFBAppModule').preferencesGetAll();
}

/**
 * Sets react-native-firebase specific native boolean preference
 * @param key the name of the native preference to set
 * @param value the value of the native preference to set
 * @returns Promise<void>
 */
export function preferencesSetBool(key: string, value: boolean): Promise<void> {
  return getReactNativeModule('RNFBAppModule').preferencesSetBool(key, value);
}

/**
 * Sets react-native-firebase specific native string preference
 * @param key the name of the native preference to set
 * @param value the value of the native preference to set
 * @returns Promise<void>
 */
export function preferencesSetString(key: string, value: string): Promise<void> {
  return getReactNativeModule('RNFBAppModule').preferencesSetString(key, value);
}

export const SDK_VERSION = sdkVersion;

// Re-export the namespaced API from modular until removed in next breaking change
export * from '../index';
