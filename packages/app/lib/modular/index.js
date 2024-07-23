/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  deleteApp as deleteAppCompat,
  getApp as getAppCompat,
  getApps as getAppsCompat,
  initializeApp as initializeAppCompat,
  setLogLevel as setLogLevelCompat,
} from '../internal';

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

export { getApps, initializeApp, getApp, setLogLevel };
