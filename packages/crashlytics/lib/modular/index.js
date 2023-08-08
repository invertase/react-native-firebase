import { firebase } from '..';

/**
 * @param {import('@react-native-firebase/app').ReactNativeFirebase.Module} app
 * @returns {import('.').FirebaseCrashlytics}
 */
export function getCrashlytics(app) {
  if (app) {
    return app.crashlytics();
  }
  return firebase.crashlytics();
}

/**
 * @param {import('.').FirebaseCrashlytics} crashlytics
 * @returns {boolean}
 */
export function isCrashlyticsCollectionEnabled(crashlytics) {
  return crashlytics.isCrashlyticsCollectionEnabled;
}

/**
 * @param {import('.').FirebaseCrashlytics} crashlytics
 * @returns {Promise<boolean>}
 */
export function checkForUnsentReports(crashlytics) {
  return crashlytics.checkForUnsentReports();
}

/**
 * @param {import('.').FirebaseCrashlytics} crashlytics
 * @returns {Promise<void>}
 */
export function deleteUnsentReports(crashlytics) {
  return crashlytics.deleteUnsentReports();
}

/**
 * @param {import('.').FirebaseCrashlytics} crashlytics
 * @returns {Promise<boolean>}
 */
export function didCrashOnPreviousExecution(crashlytics) {
  return crashlytics.didCrashOnPreviousExecution();
}

/**
 * @param {import('.').FirebaseCrashlytics} crashlytics
 * @returns {void}
 */
export function crash(crashlytics) {
  return crashlytics.crash();
}

/**
 * @param {import('.').FirebaseCrashlytics} crashlytics
 * @param {string} message
 * @returns {void}
 */
export function log(crashlytics, message) {
  return crashlytics.log(message);
}

/**
 * @param {import('.').FirebaseCrashlytics} crashlytics
 * @param {Error} error
 * @param {string | undefined} jsErrorName
 * @returns {void}
 */
export function recordError(crashlytics, error, jsErrorName) {
  return crashlytics.recordError(error, jsErrorName);
}

/**
 * @param {import('.').FirebaseCrashlytics} crashlytics
 * @returns {void}
 */
export function sendUnsentReports(crashlytics) {
  return crashlytics.sendUnsentReports();
}

/**
 * @param {import('.').FirebaseCrashlytics} crashlytics
 * @param {string} userId
 * @returns {Promise<null>}
 */
export function setUserId(crashlytics, userId) {
  return crashlytics.setUserId(userId);
}

/**
 * @param {import('.').FirebaseCrashlytics} crashlytics
 * @param {string} name
 * @param {string} value
 * @returns {Promise<null>}
 */
export function setAttribute(crashlytics, name, value) {
  return crashlytics.setAttribute(name, value);
}

/**
 * @param {import('.').FirebaseCrashlytics} crashlytics
 * @param {{ [key: string]: string }} attributes
 * @returns {Promise<null>}
 */
export function setAttributes(crashlytics, attributes) {
  return crashlytics.setAttributes(attributes);
}

/**
 * @param {import('.').FirebaseCrashlytics} crashlytics
 * @param {boolean} enabled
 * @returns {Promise<null>}
 */
export function setCrashlyticsCollectionEnabled(crashlytics, enabled) {
  return crashlytics.setCrashlyticsCollectionEnabled(enabled);
}
