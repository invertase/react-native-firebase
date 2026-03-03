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

import type { AppDistribution, AppDistributionRelease } from './app-distribution';

/**
 * Wrapped native module interface for App Distribution.
 */
export interface RNFBAppDistributionModule {
  isTesterSignedIn(): Promise<boolean>;
  signInTester(): Promise<void>;
  checkForUpdate(): Promise<AppDistributionRelease>;
  signOutTester(): Promise<void>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBAppDistributionModule: RNFBAppDistributionModule;
  }
}

/**
 * Internal AppDistribution type with access to instance methods.
 * Used by namespaced implementation and modular wrappers; not part of the public modular API.
 */
export type AppDistributionInternal = AppDistribution & {
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
};
