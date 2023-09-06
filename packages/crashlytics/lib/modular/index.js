import { firebase } from '..';

/**
 * @typedef {import("..").FirebaseApp} FirebaseApp
 * @typedef {import("..").FirebaseCrashlyticsTypes.Module} FirebaseCrashlytics
 */

/**
 * @param {FirebaseApp} app
 * @returns {FirebaseCrashlytics}
 */
export function getCrashlytics() {
  return firebase.crashlytics();
}

/**
 * @param {FirebaseCrashlytics} crashlytics
 * @returns {boolean}
 */
export function isCrashlyticsCollectionEnabled(crashlytics) {
  return crashlytics.isCrashlyticsCollectionEnabled;
}

/**
 * @param {FirebaseCrashlytics} crashlytics
 * @returns {Promise<boolean>}
 */
export function checkForUnsentReports(crashlytics) {
  return crashlytics.checkForUnsentReports();
}

/**
 * @param {FirebaseCrashlytics} crashlytics
 * @returns {Promise<void>}
 */
export function deleteUnsentReports(crashlytics) {
  return crashlytics.deleteUnsentReports();
}

/**
 * @param {FirebaseCrashlytics} crashlytics
 * @returns {Promise<boolean>}
 */
export function didCrashOnPreviousExecution(crashlytics) {
  return crashlytics.didCrashOnPreviousExecution();
}

/**
 * @param {FirebaseCrashlytics} crashlytics
 * @returns {void}
 */
export function crash(crashlytics) {
  return crashlytics.crash();
}

/**
 * @param {FirebaseCrashlytics} crashlytics
 * @param {string} message
 * @returns {void}
 */
export function log(crashlytics, message) {
  return crashlytics.log(message);
}

/**
 * @param {FirebaseCrashlytics} crashlytics
 * @param {Error} error
 * @param {string | undefined} jsErrorName
 * @returns {void}
 */
export function recordError(crashlytics, error, jsErrorName) {
  return crashlytics.recordError(error, jsErrorName);
}

/**
 * @param {FirebaseCrashlytics} crashlytics
 * @returns {void}
 */
export function sendUnsentReports(crashlytics) {
  return crashlytics.sendUnsentReports();
}

/**
 * @param {FirebaseCrashlytics} crashlytics
 * @param {string} userId
 * @returns {Promise<null>}
 */
export function setUserId(crashlytics, userId) {
  return crashlytics.setUserId(userId);
}

/**
 * @param {FirebaseCrashlytics} crashlytics
 * @param {string} name
 * @param {string} value
 * @returns {Promise<null>}
 */
export function setAttribute(crashlytics, name, value) {
  return crashlytics.setAttribute(name, value);
}

/**
 * @param {FirebaseCrashlytics} crashlytics
 * @param {{ [key: string]: string }} attributes
 * @returns {Promise<null>}
 */
export function setAttributes(crashlytics, attributes) {
  return crashlytics.setAttributes(attributes);
}

/**
 * @param {FirebaseCrashlytics} crashlytics
 * @param {boolean} enabled
 * @returns {Promise<null>}
 */
export function setCrashlyticsCollectionEnabled(crashlytics, enabled) {
  return crashlytics.setCrashlyticsCollectionEnabled(enabled);
}
