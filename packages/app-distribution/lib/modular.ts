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

import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/lib/common';
import type { FirebaseApp } from '@react-native-firebase/app';
import type { FirebaseAppDistributionTypes } from './types.d';

export type FirebaseAppDistribution = FirebaseAppDistributionTypes.Module;
export type AppDistributionRelease = FirebaseAppDistributionTypes.AppDistributionRelease;

/**
 * Get an App Distribution instance for the specified app or current app.
 * @param app - The FirebaseApp to use. Optional.
 * @returns FirebaseAppDistribution instance for the given app.
 */
export function getAppDistribution(app?: FirebaseApp): FirebaseAppDistribution {
  if (app) {
    return (getApp(app.name) as any).appDistribution();
  }
  return (getApp() as any).appDistribution();
}

/**
 * Returns true if the App Distribution tester is signed in.
 * If not an iOS device, it always rejects, as neither false nor true seem like a sensible default.
 * @param appDistribution - FirebaseAppDistribution instance.
 * @returns Promise<boolean> - Whether the tester is signed in.
 */
export function isTesterSignedIn(appDistribution: FirebaseAppDistribution): Promise<boolean> {
  return appDistribution.isTesterSignedIn.call(appDistribution, MODULAR_DEPRECATION_ARG);
}

/**
 * Sign-in the App Distribution tester.
 * If not an iOS device, it always rejects, as no defaults seem sensible.
 * @param appDistribution - FirebaseAppDistribution instance.
 * @returns Promise<void>
 */
export function signInTester(appDistribution: FirebaseAppDistribution): Promise<void> {
  return appDistribution.signInTester.call(appDistribution, MODULAR_DEPRECATION_ARG);
}

/**
 * Check to see whether a new distribution is available.
 * If not an iOS device, it always rejects, as no default response seems sensible.
 * @param appDistribution - FirebaseAppDistribution instance.
 * @returns Promise<AppDistributionRelease> - Information about the available release.
 */
export function checkForUpdate(
  appDistribution: FirebaseAppDistribution,
): Promise<AppDistributionRelease> {
  return appDistribution.checkForUpdate.call(appDistribution, MODULAR_DEPRECATION_ARG);
}

/**
 * Sign out App Distribution tester.
 * If not an iOS device, it always rejects, as no default response seems sensible.
 * @param appDistribution - FirebaseAppDistribution instance.
 * @returns Promise<void>
 */
export function signOutTester(appDistribution: FirebaseAppDistribution): Promise<void> {
  return appDistribution.signOutTester.call(appDistribution, MODULAR_DEPRECATION_ARG);
}
