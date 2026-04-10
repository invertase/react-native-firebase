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
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type { FirebaseAppDistributionTypes } from './namespaced';
import type { AppDistributionWithDeprecationArg } from './types/internal';

export type FirebaseAppDistribution = FirebaseAppDistributionTypes.Module;

function ap(appDistribution: FirebaseAppDistribution): AppDistributionWithDeprecationArg {
  return appDistribution as AppDistributionWithDeprecationArg;
}

export function getAppDistribution(app?: ReactNativeFirebase.FirebaseApp): FirebaseAppDistribution {
  if (app) {
    return getApp(app.name).appDistribution();
  }

  return getApp().appDistribution();
}

export function isTesterSignedIn(appDistribution: FirebaseAppDistribution): Promise<boolean> {
  return ap(appDistribution).isTesterSignedIn.call(appDistribution, MODULAR_DEPRECATION_ARG);
}

export function signInTester(appDistribution: FirebaseAppDistribution): Promise<void> {
  return ap(appDistribution).signInTester.call(appDistribution, MODULAR_DEPRECATION_ARG);
}

export function checkForUpdate(
  appDistribution: FirebaseAppDistribution,
): Promise<FirebaseAppDistributionTypes.AppDistributionRelease> {
  return ap(appDistribution).checkForUpdate.call(appDistribution, MODULAR_DEPRECATION_ARG);
}

export function signOutTester(appDistribution: FirebaseAppDistribution): Promise<void> {
  return ap(appDistribution).signOutTester.call(appDistribution, MODULAR_DEPRECATION_ARG);
}
