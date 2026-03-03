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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Statics {}

/**
 * The Firebase AppDistribution service interface (modular/public API).
 * Only exposes the app reference; use modular functions or the internal type for methods.
 *
 * > This module is available for the default app only.
 *
 * #### Example
 *
 * Get the AppDistribution service for the default app:
 *
 * ```js
 * const defaultAppAppDistribution = getAppDistribution();
 * ```
 */
export interface AppDistribution {
  /** The FirebaseApp this module is associated with */
  app: ReactNativeFirebase.FirebaseApp;
}

declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      appDistribution: FirebaseModuleWithStaticsAndApp<AppDistribution, Statics>;
    }
    interface FirebaseApp {
      appDistribution(): AppDistribution;
    }
  }
}
