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

import {
  ReactNativeFirebaseModule,
  ReactNativeFirebaseNamespace,
  ReactNativeFirebaseModuleAndStatics,
} from '@react-native-firebase/app-types';

/**
 * Firebase Crashlytics helps you track, prioritize, and fix stability issues that erode app quality, in realtime.
 * Spend less time triaging and troubleshooting crashes and more time building app features that delight users.
 *
 * @firebase crashlytics
 */
export namespace Crashlytics {
  export interface Statics {}

  export interface Module extends ReactNativeFirebaseModule {
    /**
     * Whether Crashlytics reporting is enabled.
     */
    isCrashlyticsCollectionEnabled: true;

    /**
     * Cause your app to crash for testing purposes.
     */
    crash(): void;

    /**
     * Log a message that will appear in any subsequent Crash or Non-fatal error reports.
     *
     * @param message
     */
    log(message: string): void;

    /**
     * Record a JavaScript Error.
     *
     * The JavaScript stack trace is converted into a mock native iOS or Android exception before submission.
     *
     * @param error Expects an instance of Error; e.g. classes that extend Error will also be supported.
     */
    recordError(error: Error): void;

    /**
     * Specify a user identifier which will be visible in the Firebase Crashlytics console.
     *
     * It is recommended for privacy purposes that this value be a value that's meaningless to a third-party observer; such as an arbitrary string that ties an end-user to a record in your system e.g. a database record id.
     *
     * @param userId An arbitrary string that ties an end-user to a record in your system e.g. a database record id.
     */
    setUserId(userId: string): Promise<null>;

    /**
     * Optionally specify a user name which will be visible in the Firebase Crashlytics console.
     *
     * If you choose to collect contact information it is strongly recommend that you disclose this in your apps privacy policy.
     *
     * @param userName A string representing an end-user's name or app username
     */
    setUserName(userName: string): Promise<null>;

    /**
     * Optionally specify a user email which will be visible in the Firebase Crashlytics console.
     *
     * If you choose to collect contact information it is strongly recommend that you disclose this in your apps privacy policy.
     *
     * @param userEmail
     */
    setUserEmail(userEmail: string): Promise<null>;

    /**
     * Sets a string value to be associated with the given attribute name which will be visible in the Firebase Crashlytics console.
     *
     * @param name
     * @param value
     */
    setAttribute(name: string, value: string): Promise<null>;

    /**
     * Like `setAttribute` but for multiple attributes.
     *
     * @param attributes
     */
    setAttributes(attributes: { [key: string]: string }): Promise<null>;

    /**
     * Enable/disable Crashlytics reporting.
     *
     * Use this for opt-in first user data collection flows combined with `firebase.json` settings to disable auto collection.
     *
     * @param enabled
     */
    setCrashlyticsCollectionEnabled(enabled: boolean): Promise<null>;
  }
}

declare module '@react-native-firebase/crashlytics' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/crashlytics';
   * firebase.crashlytics().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const CrashlyticsDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Crashlytics.Module,
    Crashlytics.Statics
  >;
  /**
   * @example
   * ```js
   * import crashlytics from '@react-native-firebase/crashlytics';
   * crashlytics().X(...);
   * ```
   */
  export default CrashlyticsDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Firebase Crashlytics helps you track, prioritize, and fix stability issues that erode app quality, in realtime.
     * Spend less time triaging and troubleshooting crashes and more time building app features that delight users.
     */
    crashlytics: ReactNativeFirebaseModuleAndStatics<Crashlytics.Module, Crashlytics.Statics>;
  }

  interface FirebaseApp {
    /**
     * Firebase Crashlytics helps you track, prioritize, and fix stability issues that erode app quality, in realtime.
     * Spend less time triaging and troubleshooting crashes and more time building app features that delight users.
     */
    crashlytics(): Crashlytics.Module;
  }
}
