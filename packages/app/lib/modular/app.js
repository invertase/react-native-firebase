/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  deleteApp as deleteAppCompat,
  getApp,
  getApps,
  initializeApp,
  setLogLevel,
} from '../internal';

/**
 * Renders this app unusable and frees the resources of all associated services.
 * @param app - FirebaseApp - The app to delete.
 * @returns
 */
export function deleteApp(app) {
  return deleteAppCompat(app.name, app._nativeInitialized);
}

/**
 * Registers a library's name and version for platform logging purposes.
 */
export function registerVersion() {
  throw new Error('registerVersion is only supported on Web');
}

/**
 * Sets log handler for all Firebase SDKs.
 */
export function onLog(logCallback, options) {
  throw new Error('onLog is only supported on Web');
}

export { getApps, initializeApp, getApp, setLogLevel };
