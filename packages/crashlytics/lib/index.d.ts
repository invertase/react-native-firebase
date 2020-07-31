/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Firebase Crashlytics package for React Native.
 *
 * #### Example: Access the firebase export from the `crashlytics` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/crashlytics';
 *
 * // firebase.crashlytics().X
 * ```
 *
 * #### Example: Using the default export from the `crashlytics` package:
 *
 * ```js
 * import crashlytics from '@react-native-firebase/crashlytics';
 *
 * // crashlytics().X
 * ```
 *
 * #### Example: Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/crashlytics';
 *
 * // firebase.crashlytics().X
 * ```
 *
 * @firebase crashlytics
 */
export namespace FirebaseCrashlyticsTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Statics {}

  /**
   * The Firebase Crashlytics service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Crashlytics service for the default app:
   *
   * ```js
   * const defaultAppCrashlytics = firebase.crashlytics();
   * ```
   */
  export class Module extends FirebaseModule {
    /**
     * Whether Crashlytics reporting is enabled.
     *
     * #### Example
     *
     * ```js
     * const isEnabled = firebase.crashlytics().isCrashlyticsCollectionEnabled;
     * ```
     *
     */
    isCrashlyticsCollectionEnabled: true;

    /**
     * Cause your app to crash for testing purposes. This is a native crash and will not contain a javascript stack trace.
     *
     * #### Example
     *
     * ```js
     * firebase.crashlytics().crash();
     * ```
     *
     */
    crash(): void;

    /**
     * Log a message that will appear in any subsequent Crash or Non-fatal error reports.
     *
     * #### Example
     *
     * ```js
     * firebase.crashlytics().log('Testing a crash');
     * firebase.crashlytics().crash();
     * ```
     *
     * @param message
     */
    log(message: string): void;

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
     * firebase.crashlytics().recordError(
     *  new Error('An error was caught')
     * );
     * ```
     *
     * @param error Expects an instance of Error; e.g. classes that extend Error will also be supported.
     */
    recordError(error: Error): void;

    /**
     * Specify a user identifier which will be visible in the Firebase Crashlytics console.
     *
     * It is recommended for privacy purposes that this value be a value that's meaningless to a third-party
     * observer; such as an arbitrary string that ties an end-user to a record in your system e.g. a database record id.
     *
     * #### Example
     *
     * ```js
     * // Custom user id
     * await firebase.crashlytics().setUserId('123456789');
     * // Firebase auth uid
     * await firebase.crashlytics().setUserId(
     *  firebase.auth().currentUser.uid
     * );
     * ```
     *
     * @param userId An arbitrary string that ties an end-user to a record in your system e.g. a database record id.
     */
    setUserId(userId: string): Promise<null>;

    /**
     * Sets a string value to be associated with the given attribute name which will be visible in the Firebase Crashlytics console.
     *
     * #### Example
     *
     * ```js
     * await firebase.crashlytics().setAttribute('role', 'admin');
     * ```
     *
     * @param name The name of the attribute to set.
     * @param value A string value for the given attribute.
     */
    setAttribute(name: string, value: string): Promise<null>;

    /**
     * Like `setAttribute` but for multiple attributes.
     *
     * #### Example
     *
     * ```js
     * await firebase.crashlytics().setAttributes({
     *   role: 'admin',
     *   followers: '13',
     * });
     * ```
     *
     * @param attributes An object of key/value attribute name and values.
     */
    setAttributes(attributes: { [key: string]: string }): Promise<null>;

    /**
     * Enable/disable Crashlytics reporting.
     *
     * Use this for opt-in first user data collection flows combined with `firebase.json` settings to disable auto collection.
     *
     * #### Example
     *
     * ```js
     * // Disable crash reporting
     * await firebase.crashlytics().setCrashlyticsCollectionEnabled(false);
     * ```
     *
     * @param enabled A boolean value representing whether to enable Crashlytics error collection.
     */
    setCrashlyticsCollectionEnabled(enabled: boolean): Promise<null>;
  }
}

declare module '@react-native-firebase/crashlytics' {
  // tslint:disable-next-line:no-duplicate-imports required otherwise doesn't work
  import { ReactNativeFirebase } from '@react-native-firebase/app';
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const defaultExport: FirebaseModuleWithStatics<
    FirebaseCrashlyticsTypes.Module,
    FirebaseCrashlyticsTypes.Statics
  >;
  export default defaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStatics = ReactNativeFirebase.FirebaseModuleWithStatics;
    interface Module {
      crashlytics: FirebaseModuleWithStatics<
        FirebaseCrashlyticsTypes.Module,
        FirebaseCrashlyticsTypes.Statics
      >;
    }
    interface FirebaseApp {
      crashlytics(): FirebaseCrashlyticsTypes.Module;
    }
  }
}

namespace ReactNativeFirebase {
  interface FirebaseJsonConfig {
    crashlytics_ndk_enabled: boolean;
    crashlytics_debug_enabled: boolean;
    crashlytics_auto_collection_enabled: boolean;
  }
}
