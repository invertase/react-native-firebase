import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type { Crashlytics } from './types/crashlytics';

/**
 * Returns Crashlytics instance.
 * #### Example
 * ```js
 * const crashlytics = getCrashlytics();
 * ```
 */
export function getCrashlytics(): Crashlytics {
  return getApp().crashlytics();
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
 * @param crashlytics A crashlytics instance.
 * @returns Promise that resolves to a boolean indicating if there are unsent reports.
 */
export function checkForUnsentReports(crashlytics: Crashlytics): Promise<boolean> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is not defined in the global scope
  return crashlytics.checkForUnsentReports.call(crashlytics, MODULAR_DEPRECATION_ARG);
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
 * @param crashlytics A crashlytics instance.
 */
export function deleteUnsentReports(crashlytics: Crashlytics): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is not defined in the global scope
  return crashlytics.deleteUnsentReports.call(crashlytics, MODULAR_DEPRECATION_ARG);
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
 * @param crashlytics A crashlytics instance.
 * @returns Promise that resolves to a boolean indicating if the app crashed previously.
 */
export function didCrashOnPreviousExecution(crashlytics: Crashlytics): Promise<boolean> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is not defined in the global scope
  return crashlytics.didCrashOnPreviousExecution.call(crashlytics, MODULAR_DEPRECATION_ARG);
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
 * @param crashlytics A crashlytics instance.
 */
export function crash(crashlytics: Crashlytics): void {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is not defined in the global scope
  return crashlytics.crash.call(crashlytics, MODULAR_DEPRECATION_ARG);
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
 * @param crashlytics A crashlytics instance.
 * @param message The message to log.
 */
export function log(crashlytics: Crashlytics, message: string): void {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is not defined in the global scope
  return crashlytics.log.call(crashlytics, message, MODULAR_DEPRECATION_ARG);
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
 * @param crashlytics A crashlytics instance.
 * @param error Expects an instance of Error; e.g. classes that extend Error will also be supported.
 * @param jsErrorName Optional string containing Javascript error name
 */
export function recordError(crashlytics: Crashlytics, error: Error, jsErrorName?: string): void {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is not defined in the global scope
  return crashlytics.recordError.call(crashlytics, error, jsErrorName, MODULAR_DEPRECATION_ARG);
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
 * @param crashlytics A crashlytics instance.
 */
export function sendUnsentReports(crashlytics: Crashlytics): void {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is not defined in the global scope
  return crashlytics.sendUnsentReports.call(crashlytics, MODULAR_DEPRECATION_ARG);
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
 * @param crashlytics A crashlytics instance.
 * @param userId An arbitrary string that ties an end-user to a record in your system e.g. a database record id.
 */
export function setUserId(crashlytics: Crashlytics, userId: string): Promise<null> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is not defined in the global scope
  return crashlytics.setUserId.call(crashlytics, userId, MODULAR_DEPRECATION_ARG);
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
 * @param crashlytics A crashlytics instance.
 * @param name The name of the attribute to set.
 * @param value A string value for the given attribute.
 */
export function setAttribute(crashlytics: Crashlytics, name: string, value: string): Promise<null> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is not defined in the global scope
  return crashlytics.setAttribute.call(crashlytics, name, value, MODULAR_DEPRECATION_ARG);
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
 * @param crashlytics A crashlytics instance.
 * @param attributes An object of key/value attribute name and values.
 */
export function setAttributes(
  crashlytics: Crashlytics,
  attributes: { [key: string]: string },
): Promise<null> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is not defined in the global scope
  return crashlytics.setAttributes.call(crashlytics, attributes, MODULAR_DEPRECATION_ARG);
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
 * @param crashlytics A crashlytics instance.
 * @param enabled A boolean value representing whether to enable Crashlytics error collection.
 */
export function setCrashlyticsCollectionEnabled(
  crashlytics: Crashlytics,
  enabled: boolean,
): Promise<null> {
  return crashlytics.setCrashlyticsCollectionEnabled.call(
    crashlytics,
    enabled,
    // @ts-ignore - MODULAR_DEPRECATION_ARG is not defined in the global scope
    MODULAR_DEPRECATION_ARG,
  );
}
