import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/lib/common';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  deleteApp as deleteAppCompat,
  getApp as getAppCompat,
  getApps as getAppsCompat,
  initializeApp as initializeAppCompat,
  setLogLevel as setLogLevelCompat,
  setReactNativeAsyncStorage as setReactNativeAsyncStorageCompat,
} from '../internal';
import { setUserLogHandler } from '../internal/logger';
import sdkVersion from '../version';

/**
 * @typedef {import('..').ReactNativeFirebase.FirebaseApp} FirebaseApp
 * @typedef {import('..').ReactNativeFirebase.FirebaseAppOptions} FirebaseAppOptions
 * @typedef {import('..').ReactNativeFirebase.LogLevelString} LogLevelString
 * @typedef {import('../internal/logger').LogCallback} LogCallback
 * @typedef {import('../internal/logger').LogOptions} LogOptions
 */

/**
 * Renders this app unusable and frees the resources of all associated services.
 * @param {FirebaseApp} app - The app to delete.
 * @returns {Promise<void>}
 */
export function deleteApp(app) {
  return deleteAppCompat.call(null, app.name, app._nativeInitialized, MODULAR_DEPRECATION_ARG);
}

/**
 * Registers a library's name and version for platform logging purposes.
  @param {string} libraryKeyOrName - library name or key.
  @param {string} version - library version.
  @param {string | undefined} variant - library variant. Optional.
 * @returns {Promise<void>}
 */
export function registerVersion(libraryKeyOrName, version, variant) {
  throw new Error('registerVersion is only supported on Web');
}

/**
 * Sets log handler for VertexAI only currently.
 * @param {LogCallback | null} logCallback - The callback function to handle logs.
 * @param {LogOptions} [options] - Optional settings for log handling.
 * @returns {void}
 */
export function onLog(logCallback, options) {
  setUserLogHandler(logCallback, options);
}

/**
 * Gets the list of all initialized apps.
 * @returns {FirebaseApp[]} - An array of all initialized Firebase apps.
 */
export function getApps() {
  return getAppsCompat.call(null, MODULAR_DEPRECATION_ARG);
}

/**
 * Initializes a Firebase app with the provided options and name.
 * @param {FirebaseAppOptions} options - Options to configure the services used in the app.
 * @param {string | FirebaseAppConfig} [configOrName] - The optional name of the app, or config for the app to initialize (a name of '[DEFAULT]' will be used if omitted).
 * @returns {FirebaseApp} - The initialized Firebase app.
 */
export function initializeApp(options, configOrName) {
  return initializeAppCompat.call(null, options, configOrName, MODULAR_DEPRECATION_ARG);
}

/**
 * Retrieves an instance of a Firebase app.
 * @param {string} [name] - The optional name of the app to return ('[DEFAULT]' if omitted).
 * @returns {FirebaseApp} - The requested Firebase app instance.
 */
export function getApp(name) {
  return getAppCompat.call(null, name, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the log level across all Firebase SDKs.
 * @param {LogLevelString} logLevel - The log level to set ('debug', 'verbose', 'info', 'warn', 'error', 'silent').
 * @returns {void}
 */
export function setLogLevel(logLevel) {
  return setLogLevelCompat.call(null, logLevel, MODULAR_DEPRECATION_ARG);
}

/**
 * The `AsyncStorage` implementation to use for persisting data on 'Other' platforms.
 * If not specified, in memory persistence is used.
 *
 * This is required if you want to persist things like Auth sessions, Analytics device IDs, etc.
 */
export function setReactNativeAsyncStorage(asyncStorage) {
  return setReactNativeAsyncStorageCompat.call(null, asyncStorage, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets react-native-firebase specific "meta" data from native Info.plist / AndroidManifest.xml
 * @returns map of key / value pairs containing native meta data
 */
export function metaGetAll() {
  return NativeModules.RNFBAppModule.metaGetAll();
}

/**
 * Gets react-native-firebase specific "firebase.json" data
 * @returns map of key / value pairs containing native firebase.json constants
 */
export function jsonGetAll() {
  return NativeModules.RNFBAppModule.jsonGetAll();
}

/**
 * Clears react-native-firebase specific native preferences
 * @returns Promise<void>
 */
export function preferencesClearAll() {
  return NativeModules.RNFBAppModule.preferencesClearAll();
}

/**
 * Gets react-native-firebase specific native preferences
 * @returns map of key / value pairs containing native preferences data
 */
export function preferencesGetAll() {
  return NativeModules.RNFBAppModule.preferencesGetAll();
}

/**
 * Sets react-native-firebase specific native boolean preference
 * @param key the name of the native preference to set
 * @param value the value of the native preference to set
 * @returns Promise<void>
 */
export function preferencesSetBool(key, value) {
  return NativeModules.RNFBAppModule.preferencesSetBool(key, value);
}

/**
 * Sets react-native-firebase specific native string preference
 * @param key the name of the native preference to set
 * @param value the value of the native preference to set
 * @returns Promise<void>
 */
export function preferencesSetString(key, value) {
  return NativeModules.RNFBAppModule.preferencesSetString(key, value);
}

export const SDK_VERSION = sdkVersion;
