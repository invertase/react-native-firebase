import { FirebaseCrashlyticsTypes } from '..';

type FirebaseCrashlytics = FirebaseCrashlyticsTypes.Module;

/**
 * Returns Crashlytics instance.
 * #### Example
 * ```js
 * const crashlytics = getCrashlytics();
 * ```
 */
export declare function getCrashlytics(): FirebaseCrashlytics;

/**
 * Whether Crashlytics reporting is enabled.
 *
 * #### Example
 *
 * ```js
 * const crashlytics = getCrashlytics();
 * const isEnabled = isCrashlyticsCollectionEnabled(crashlytics);
 * ```
 */
export declare function isCrashlyticsCollectionEnabled(crashlytics: FirebaseCrashlytics): boolean;
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
 */
export declare function checkForUnsentReports(crashlytics: FirebaseCrashlytics): Promise<boolean>;
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
 */
export declare function deleteUnsentReports(crashlytics: FirebaseCrashlytics): Promise<void>;
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
 */
export declare function didCrashOnPreviousExecution(
  crashlytics: FirebaseCrashlytics,
): Promise<boolean>;

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
 */
export declare function crash(crashlytics: FirebaseCrashlytics): void;

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
 */
export declare function log(crashlytics: FirebaseCrashlytics, message: string): void;

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
 */
export declare function recordError(
  crashlytics: FirebaseCrashlytics,
  error: Error,
  jsErrorName?: string,
): void;
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
 */
export declare function sendUnsentReports(crashlytics: FirebaseCrashlytics): void;

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
 */
export declare function setUserId(crashlytics: FirebaseCrashlytics, userId: string): Promise<null>;

/**
 * Sets a string value to be associated with the given attribute name which will be visible in the Firebase Crashlytics console.
 *
 * #### Example
 *
 * ```js
 * const crashlytics = getCrashlytics();
 * await setAttribute(crashlytics, 'role', 'admin');
 * ```
 */
export declare function setAttribute(
  crashlytics: FirebaseCrashlytics,
  name: string,
  value: string,
): Promise<null>;

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
 */
export declare function setAttributes(
  crashlytics: FirebaseCrashlytics,
  attributes: { [key: string]: string },
): Promise<null>;

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
 */
export declare function setCrashlyticsCollectionEnabled(
  crashlytics: FirebaseCrashlytics,
  enabled: boolean,
): Promise<null>;
