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
 * Analytics integrates across Firebase features and provides
 * you with unlimited reporting for up to 500 distinct events
 * that you can define using the Firebase SDK. Analytics reports
 * help you understand clearly how your users behave, which enables
 * you to make informed decisions regarding app marketing and
 * performance optimizations.
 *
 * @firebase analytics
 */
export namespace Analytics {
  export interface Statics {}

  export interface Module extends ReactNativeFirebaseModule {
    /**
     * Log a custom event with optional params.
     * @note 100 characters is the maximum length for param key names.
     *
     * @param name
     * @param params
     */
    logEvent(name: string, params: { [key: string]: string }): Promise<Testy>;

    /**
     * If true, allows the device to collect analytical data and send it to Firebase.
     * Useful for GDPR.
     *
     * @param enabled
     */
    setAnalyticsCollectionEnabled(enabled: boolean): Promise<void>;

    /**
     * Sets the current screen name.
     *
     * @note Whilst screenClassOverride is optional, it is recommended it is
     * always sent as your current class name. For example on Android it will always
     * show as 'MainActivity' if you do not specify it.
     *
     * @param screenName
     * @param screenClassOverride
     */
    setCurrentScreen(screenName: string, screenClassOverride?: string): Promise<void>;

    /**
     * Sets the minimum engagement time required before starting a session.
     *
     * @param milliseconds The default value is 10000 (10 seconds).
     */
    setMinimumSessionDuration(milliseconds: number): Promise<void>;

    /**
     * Sets the duration of inactivity that terminates the current session.
     *
     * @param milliseconds The default value is 1800000 (30 minutes).
     */
    setSessionTimeoutDuration(milliseconds: number): Promise<void>;

    /**
     * Gives a user a unique identification.
     *
     *
     * @param id Set to null to remove a previously assigned id from analytics events
     */
    setUserId(id: string | null): Promise<void>;

    /**
     * Sets a key/value pair of data on the current user.
     *
     * @param name
     * @param value Set to null to remove a previously assigned id from analytics events.
     */
    setUserProperty(name: string, value: string | null): Promise<void>;

    /**
     * Sets multiple key/value pair of data on the current user.
     *
     * @param properties Set a property value to null to remove it.
     */
    setUserProperties(properties: { [key: string]: string | null }): Promise<void>;

    /**
     * Clears all analytics data for this instance from the device and resets the app instance ID.
     */
    resetAnalyticsData(): Promise<void>;
  }
}

declare module '@react-native-firebase/analytics' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/analytics';
   * firebase.analytics().logEvent(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const AnalyticsDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Analytics.Module,
    Analytics.Statics
  >;
  /**
   * @example
   * ```js
   * import analytics from '@react-native-firebase/analytics';
   * analytics().logEvent(...);
   * ```
   */
  export default AnalyticsDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Analytics integrates across Firebase features and provides
     * you with unlimited reporting for up to 500 distinct events
     * that you can define using the Firebase SDK. Analytics reports
     * help you understand clearly how your users behave, which enables
     * you to make informed decisions regarding app marketing and
     * performance optimizations.
     */
    analytics: ReactNativeFirebaseModuleAndStatics<
      Analytics.Module,
      Analytics.Statics
    >;
  }

  interface FirebaseApp {
    /**
     * Analytics integrates across Firebase features and provides
     * you with unlimited reporting for up to 500 distinct events
     * that you can define using the Firebase SDK. Analytics reports
     * help you understand clearly how your users behave, which enables
     * you to make informed decisions regarding app marketing and
     * performance optimizations.
     */
    analytics(): Analytics.Module;
  }
}
