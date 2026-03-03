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

import type { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Firebase App Distribution package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `app-distribution` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/app-distribution';
 *
 * // firebase.appDistribution().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `app-distribution` package:
 *
 * ```js
 * import appDistribution from '@react-native-firebase/app-distribution';
 *
 * // appDistribution().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/app-distribution';
 *
 * // firebase.appDistribution().X
 * ```
 *
 * @firebase app-distribution
 */

/**
 * @deprecated Use the exported types directly instead.
 * FirebaseAppDistributionTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseAppDistributionTypes {
  type FirebaseModule = ReactNativeFirebase.FirebaseModule;

  /**
   * The release information returned by the update check when a new version is available.
   *
   * @deprecated Use the exported types directly instead. FirebaseAppDistributionTypes namespace is kept for backwards compatibility.
   */
  export interface AppDistributionRelease {
    displayVersion: string;
    buildVersion: string;
    releaseNotes: string | null;
    downloadURL: string;
    isExpired: boolean;
  }

  /**
   * Cloud Storage statics.
   *
   * @deprecated Use the exported types directly instead. FirebaseAppDistributionTypes namespace is kept for backwards compatibility.
   */
  export interface Statics {
    SDK_VERSION: string;
  }

  /**
   * The Firebase AppDistribution service is available for the default app only.
   *
   * @deprecated Use the modular API (getAppDistribution, isTesterSignedIn, etc.) and types from '@react-native-firebase/app-distribution' instead.
   * FirebaseAppDistributionTypes namespace is kept for backwards compatibility.
   *
   * #### Example
   *
   * Get the App Distribution service for the **default app**:
   *
   * ```js
   * const defaultAppAppDistribution = firebase.appDistribution();
   * ```
   */
  export interface Module extends FirebaseModule {
    /**
     * The current `FirebaseApp` instance for this Firebase service.
     *
     * @deprecated Use the modular API instead.
     */
    app: ReactNativeFirebase.FirebaseApp;

    /**
     * Returns true if the App Distribution tester is signed in.
     * If not an iOS device, it always rejects, as neither false nor true seem like a sensible default.
     *
     * @deprecated Use the modular `isTesterSignedIn(appDistribution)` instead.
     */
    isTesterSignedIn(): Promise<boolean>;

    /**
     * Sign-in the App Distribution tester.
     * If not an iOS device, it always rejects, as no defaults seem sensible.
     *
     * @deprecated Use the modular `signInTester(appDistribution)` instead.
     */
    signInTester(): Promise<void>;

    /**
     * Check to see whether a new distribution is available.
     * If not an iOS device, it always rejects, as no default response seems sensible.
     *
     * @deprecated Use the modular `checkForUpdate(appDistribution)` instead.
     */
    checkForUpdate(): Promise<AppDistributionRelease>;

    /**
     * Sign out App Distribution tester.
     * If not an iOS device, it always rejects, as no default response seems sensible.
     *
     * @deprecated Use the modular `signOutTester(appDistribution)` instead.
     */
    signOutTester(): Promise<void>;
  }
}
