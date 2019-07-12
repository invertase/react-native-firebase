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
  ReactNativeFirebaseModuleAndStatics,
  ReactNativeFirebaseNamespace,
} from '@react-native-firebase/app-types';

/**
 * Firebase Analytics package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `analytics` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/analytics';
 *
 * // firebase.analytics().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `analytics` package:
 *
 * ```js
 * import analytics from '@react-native-firebase/analytics';
 *
 * // analytics().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/analytics';
 *
 * // firebase.analytics().X
 * ```
 *
 * @firebase analytics
 */
export namespace Analytics {
  export interface Statics {}

  /**
   * The Firebase Analytics service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Analytics service for the default app:
   *
   * ```js
   * const defaultAppAnalytics = firebase.analytics();
   * ```
   */
  export class Module extends ReactNativeFirebaseModule {
    /**
     * Log a custom event with optional params.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().logEvent('product_view', {
     *   id: '1234',
     * });
     * ```
     *
     * > 100 characters is the maximum length for param key names.
     *
     * @param name Event name must not conflict with any Reserved Events.
     * @param params Parameters to be sent and displayed with the event.
     */
    logEvent(name: string, params: { [key: string]: string }): Promise<void>;

    /**
     * If true, allows the device to collect analytical data and send it to
     * Firebase. Useful for GDPR.
     *
     * #### Example
     *
     * ```js
     * // Disable collection
     * await firebase.analytics().setAnalyticsCollectionEnabled(false);
     * ```
     *
     * @param enabled A boolean value representing whether Analytics collection is enabled or disabled. Analytics collection is enabled by default.
     */
    setAnalyticsCollectionEnabled(enabled: boolean): Promise<void>;

    /**
     * Sets the current screen name.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().setCurrentScreen('ProductScreen', 'ProductScreen');
     * ```
     *
     * > Whilst screenClassOverride is optional, it is recommended it is
     * always sent as your current class name. For example on Android it will always
     * show as 'MainActivity' if you do not specify it.
     *
     * @param screenName A screen name, e.g. Product.
     * @param screenClassOverride On Android, React Native runs in a single activity called
     * 'MainActivity'. Setting this parameter overrides the default name shown on logs.
     */
    setCurrentScreen(screenName: string, screenClassOverride?: string): Promise<void>;

    /**
     * Sets the minimum engagement time required before starting a session.
     *
     * #### Example
     *
     * ```js
     * // 20 seconds
     * await firebase.analytics().setMinimumSessionDuration(20000);
     * ```
     *
     * @param milliseconds The default value is 10000 (10 seconds).
     */
    setMinimumSessionDuration(milliseconds: number): Promise<void>;

    /**
     * Sets the duration of inactivity that terminates the current session.
     *
     * #### Example
     *
     * ```js
     * // 20 minutes
     * await firebase.analytics().setMinimumSessionDuration(900000);
     * ```
     *
     * @param milliseconds The default value is 1800000 (30 minutes).
     */
    setSessionTimeoutDuration(milliseconds: number): Promise<void>;

    /**
     * Gives a user a unique identification.
     *
     * #### Example
     *
     * ```js
     * // Set User
     * await firebase.analytics().setUserId('123456789');
     * // Remove User
     * await firebase.analytics().setUserId(null);
     * ```
     *
     * @param id Set to null to remove a previously assigned id from analytics
     * events
     */
    setUserId(id: string | null): Promise<void>;

    /**
     * Sets a key/value pair of data on the current user.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().setUserProperty('account_type', 'gold');
     * ```
     *
     * @param name A user property identifier.
     * @param value Set to null to remove a previously assigned id from analytics events.
     */
    setUserProperty(name: string, value: string | null): Promise<void>;

    /**
     * Sets multiple key/value pair of data on the current user.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().setUserProperties({
     *   account_type: 'gold',
     *   account_name: 'Gold Badge',
     * });
     * ```
     *
     * @react-native-firebase
     * @param properties Set a property value to null to remove it.
     */
    setUserProperties(properties: { [key: string]: string | null }): Promise<void>;

    /**
     * Clears all analytics data for this instance from the device and resets the app instance ID.
     *
     * #### Example
     *
     * ```js
     * await firebase.analytics().resetAnalyticsData();
     * ```
     */
    resetAnalyticsData(): Promise<void>;
  }
}

declare module '@react-native-firebase/analytics' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
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

  export default AnalyticsDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    analytics: ReactNativeFirebaseModuleAndStatics<Analytics.Module, Analytics.Statics>;
  }

  interface FirebaseJSON {
    /**
     * Disable or enable auto collection of analytics data.
     *
     * This is useful for opt-in-first data flows, for example when dealing with GDPR compliance.
     * This can be overridden in JavaScript.
     *
     * #### Example
     *
     * ```json
     * // <project-root>/firebase.json
     * {
     *   "react-native": {
     *     "analytics_auto_collection_enabled": false
     *   }
     * }
     * ```
     *
     * ```js
     * // Re-enable analytics data collection, e.g. once user has granted permission:
     * await firebase.analytics().setAnalyticsCollectionEnabled(true);
     * ```
     */
    analytics_auto_collection_enabled: boolean;
  }

  interface FirebaseApp {
    analytics(): Analytics.Module;
  }
}
