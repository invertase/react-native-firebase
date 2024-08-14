/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  deleteApp as deleteAppCompat,
  getApp as getAppCompat,
  getApps as getAppsCompat,
  initializeApp as initializeAppCompat,
  setLogLevel as setLogLevelCompat,
} from '../internal';

/**
 * @typedef {import('..').ReactNativeFirebase.FirebaseApp} FirebaseApp
 * @typedef {import('..').ReactNativeFirebase.FirebaseAppOptions} FirebaseAppOptions
 * @typedef {import('..').ReactNativeFirebase.LogLevelString} LogLevelString
 */

/**
 * Renders this app unusable and frees the resources of all associated services.
 * @param {FirebaseApp} app - The app to delete.
 * @returns {Promise<void>}
 */
export function deleteApp(app) {
  return deleteAppCompat(app.name, app._nativeInitialized);
}

/**
 * Registers a library's name and version for platform logging purposes.
  @param {string} libraryKeyOrName - library name or key.
  @param {string} version - library version.
  @param {string | null} variant - library variant.
 * @returns {Promise<void>}
 */
export function registerVersion(libraryKeyOrName, version, variant) {
  throw new Error('registerVersion is only supported on Web');
}

/**
 * Sets log handler for all Firebase SDKs.
 * @param {Function} logCallback - The callback function to handle logs.
 * @param {Object} [options] - Optional settings for log handling.
 * @returns {Promise<void>}
 */
export function onLog(logCallback, options) {
  throw new Error('onLog is only supported on Web');
}

/**
 * Gets the list of all initialized apps.
 * @returns {FirebaseApp[]} - An array of all initialized Firebase apps.
 */
export function getApps() {
  return getAppsCompat();
}

/**
 * Initializes a Firebase app with the provided options and name.
 * @param {FirebaseAppOptions} options - Options to configure the services used in the app.
 * @param {string} [name] - The optional name of the app to initialize ('[DEFAULT]' if omitted).
 * @returns {FirebaseApp} - The initialized Firebase app.
 */
export function initializeApp(options, name) {
  return initializeAppCompat(options, name);
}

/**
 * Retrieves an instance of a Firebase app.
 * @param {string} [name] - The optional name of the app to return ('[DEFAULT]' if omitted).
 * @returns {FirebaseApp} - The requested Firebase app instance.
 */
export function getApp(name) {
  return getAppCompat(name);
}

/**
 * Sets the log level across all Firebase SDKs.
 * @param {LogLevelString} logLevel - The log level to set ('debug', 'verbose', 'info', 'warn', 'error', 'silent').
 * @returns {void}
 */
export function setLogLevel(logLevel) {
  return setLogLevelCompat(logLevel);
}
