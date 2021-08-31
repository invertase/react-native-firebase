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
 * Firebase AppDistribution package for React Native.
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
export namespace FirebaseAppDistributionTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  /**
   * The release information returned by the update check when a new version is available.
   */
  export interface AppDistributionRelease {
    /**
     * The short bundle version of this build (example 1.0.0).
     */
    displayVersion: string;

    /**
     * The build number of this build (example: 123).
     */
    buildVersion: string;

    /**
     * The release notes for this build, possibly null if no release notes were provided.
     */
    releaseNotes: string | null;

    /**
     * The URL for the build.
     */
    downloadURL: string;

    /**
     * Whether the download URL for this release is expired.
     */
    isExpired: boolean;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Statics {
    // firebase.appDistribution.* static props go here
  }

  /**
   * The Firebase AppDistribution service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the AppDistribution service for the default app:
   *
   * ```js
   * const defaultAppAppDistribution = firebase.appDistribution();
   * ```
   */
  export class Module extends FirebaseModule {
    /**
     * Returns true if the App Distribution tester is signed in.
     * If not an iOS device, it always rejects, as neither false nor true seem like a sensible default.
     */
    isTesterSignedIn(): Promise<boolean>;

    /**
     * Sign-in the App Distribution tester
     * If not an iOS device, it always rejects, as no defaults seem sensible.
     */
    signInTester(): Promise<void>;

    /**
     * Check to see whether a new distribution is available
     * If not an iOS device, it always rejects, as no default response seems sensible.
     */
    checkForUpdate(): Promise<AppDistributionRelease>;

    /**
     * Sign out App Distribution tester
     * If not an iOS device, it always rejects, as no default response seems sensible.
     */
    signOutTester(): Promise<void>;
  }
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseAppDistributionTypes.Module,
  FirebaseAppDistributionTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  appDistribution: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { appDistribution(): FirebaseAppDistributionTypes.Module };
};

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      appDistribution: FirebaseModuleWithStaticsAndApp<
        FirebaseAppDistributionTypes.Module,
        FirebaseAppDistributionTypes.Statics
      >;
    }
    interface FirebaseApp {
      appDistribution(): FirebaseAppDistributionTypes.Module;
    }
  }
}
