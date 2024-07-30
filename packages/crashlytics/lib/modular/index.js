import { firebase } from '..';

/**
 * @typedef {import('@firebase/app').FirebaseApp} FirebaseApp
 * @typedef {import('..').FirebaseCrashlyticsTypes.Module} FirebaseCrashlytics
 */

/**
 * Returns Crashlytics instance.
 * #### Example
 * ```js
 * const crashlytics = getCrashlytics();
 * ```
 * @param {FirebaseApp} app
 * @returns {FirebaseCrashlytics}
 */
export function getCrashlytics() {
  return firebase.crashlytics();
}

/**
 * Whether Crashlytics reporting is enabled.
 *
 * #### Example
 *
 * ```js
 * const crashlytics = getCrashlytics();
 * const isEnabled = isCrashlyticsCollectionEnabled(crashlytics);
 * ```
 * @param {FirebaseCrashlytics} crashlytics
 * @returns {boolean}
 */
export function isCrashlyticsCollectionEnabled(crashlytics) {
  return crashlytics.isCrashlyticsCollectionEnabled;
}

/**
 * Determines whether there are any unsent crash reports cached on the device. The callback only executes
 * if automatic data collection is disabled.
 *
 * #### Example
 *
 * ```js
 * async checkReports() {
 * // returns boolean value
 *  const crashlytics = getCrashlytics();
 *  const unsentReports = await checkForUnsentReports(crashlytics);
 * }
 *
 * checkReports();
 * ```
 * @param {FirebaseCrashlytics} crashlytics
 * @returns {Promise<boolean>}
 */
export function checkForUnsentReports(crashlytics) {
  return crashlytics.checkForUnsentReports();
}

/**
 * Deletes any unsent reports on the device. This method only applies if automatic data collection is
 * disabled.
 *
 * #### Example
 *
 * ```js
 * const crashlytics = getCrashlytics();
 * deleteUnsentReports(crashlytics);
 * ```
 * @param {FirebaseCrashlytics} crashlytics
 * @returns {Promise<void>}
 */
export function deleteUnsentReports(crashlytics) {
  return crashlytics.deleteUnsentReports();
}

/**
 * Returns a boolean value indicating whether the app crashed during the previous execution.
 *
 * #### Example
 *
 * ```js
 * async didCrashPreviously() {
 * // returns boolean value
 * const crashlytics = getCrashlytics();
 * const didCrash = await didCrashOnPreviousExecution(crashlytics);
 * }
 *
 * didCrashPreviously();
 * ```
 * @param {FirebaseCrashlytics} crashlytics
 * @returns {Promise<boolean>}
 */
export function didCrashOnPreviousExecution(crashlytics) {
  return crashlytics.didCrashOnPreviousExecution();
}

/**
 * Cause your app to crash for testing purposes. This is a native crash and will not contain a javascript stack trace.
 * Note that crashes are intercepted by debuggers on iOS so no report will be seen under those conditions. Additionally
 * if it is a debug build you will need to ensure your firebase.json is configured to enable crashlytics even in debug mode.
 *
 * #### Example
 *
 * ```js
 * const crashlytics = getCrashlytics();
 * crash(crashlytics);
 * ```
 * @param {FirebaseCrashlytics} crashlytics
 * @returns {void}
 */
export function crash(crashlytics) {
  return crashlytics.crash();
}

/**
 * Log a message that will appear in any subsequent Crash or Non-fatal error reports.
 *
 * #### Example
 *
 * ```js
 * const crashlytics = getCrashlytics();
 * log(crashlytics, 'Testing a crash');
 * crash(crashlytics);
 * ```
 * @param {FirebaseCrashlytics} crashlytics
 * @param {string} message
 * @returns {void}
 */
export function log(crashlytics, message) {
  return crashlytics.log(message);
}

/**
 * Record a JavaScript Error.
 *
 * The JavaScript stack trace is converted into a mock native iOS or Android exception before submission.
 * The line numbers in the stack trace (if available) will be relative to the javascript bundle built by your packager,
 * after whatever transpilation or minimization steps happen. You will need to maintain sourcemaps to decode them if desired.
 *
 * #### Example
 *
 * ```js
 * const crashlytics = getCrashlytics();
 * recordError(
 *  crashlytics,
 *  new Error('An error was caught')
 * );
 * ```
 * @param {FirebaseCrashlytics} crashlytics
 * @param {Error} error
 * @param {string | undefined} jsErrorName
 * @returns {void}
 */
export function recordError(crashlytics, error, jsErrorName) {
  return crashlytics.recordError(error, jsErrorName);
}

/**
 * Enqueues any unsent reports on the device to upload to Crashlytics. This method only applies if
 * automatic data collection is disabled.
 *
 * #### Example
 *
 * ```js
 * const crashlytics = getCrashlytics();
 * sendUnsentReports(crashlytics);
 * ```
 * @param {FirebaseCrashlytics} crashlytics
 * @returns {void}
 */
export function sendUnsentReports(crashlytics) {
  return crashlytics.sendUnsentReports();
}

/**
 * Specify a user identifier which will be visible in the Firebase Crashlytics console.
 *
 * It is recommended for privacy purposes that this value be a value that's meaningless to a third-party
 * observer; such as an arbitrary string that ties an end-user to a record in your system e.g. a database record id.
 *
 * #### Example
 *
 * ```js
 * const auth = getAuth();
 * const crashlytics = getCrashlytics();
 * // Custom user id
 * await setUserId(crashlytics, '123456789');
 * // Firebase auth uid
 * await setUserId(
 *  crashlytics,
 *  auth.currentUser.uid
 * );
 * ```
 * @param {FirebaseCrashlytics} crashlytics
 * @param {string} userId
 * @returns {Promise<null>}
 */
export function setUserId(crashlytics, userId) {
  return crashlytics.setUserId(userId);
}

/**
 * Sets a string value to be associated with the given attribute name which will be visible in the Firebase Crashlytics console.
 *
 * #### Example
 *
 * ```js
 * const crashlytics = getCrashlytics();
 * await setAttribute(crashlytics, 'role', 'admin');
 * ```
 * @param {FirebaseCrashlytics} crashlytics
 * @param {string} name
 * @param {string} value
 * @returns {Promise<null>}
 */
export function setAttribute(crashlytics, name, value) {
  return crashlytics.setAttribute(name, value);
}

/**
 * Like `setAttribute` but for multiple attributes.
 *
 * #### Example
 *
 * ```js
 * const crashlytics = getCrashlytics();
 * await setAttributes(crashlytics, {
 *   role: 'admin',
 *   followers: '13',
 * });
 * ```
 * @param {FirebaseCrashlytics} crashlytics
 * @param {{ [key: string]: string }} attributes
 * @returns {Promise<null>}
 */
export function setAttributes(crashlytics, attributes) {
  return crashlytics.setAttributes(attributes);
}

/**
 * Enable/disable Crashlytics reporting.
 *
 * Use this for opt-in first user data collection flows combined with `firebase.json` settings to disable auto collection.
 *
 * #### Example
 *
 * ```js
 * const crashlytics = getCrashlytics();
 * // Disable crash reporting
 * await setCrashlyticsCollectionEnabled(crashlytics, false);
 * ```
 * @param {FirebaseCrashlytics} crashlytics
 * @param {boolean} enabled
 * @returns {Promise<null>}
 */
export function setCrashlyticsCollectionEnabled(crashlytics, enabled) {
  return crashlytics.setCrashlyticsCollectionEnabled(enabled);
}
