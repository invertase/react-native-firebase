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

export interface FirebaseAppDistributionModule {
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

export type FirebaseAppDistribution = FirebaseAppDistributionModule;
export type FirebaseApp = ReactNativeFirebase.FirebaseApp & {
  appDistribution(): FirebaseAppDistribution;
};
