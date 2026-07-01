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

import type { FirebaseApp } from '@react-native-firebase/app';
import { isIOS } from '@react-native-firebase/app/dist/module/common';
import {
  FirebaseModule,
  getOrCreateModularInstance,
} from '@react-native-firebase/app/dist/module/internal';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import { Platform } from 'react-native';
import './types/internal';
import type { AppDistribution, AppDistributionRelease } from './types/app-distribution';
import type { AppDistributionInternal } from './types/internal';
import { version } from './version';

const nativeModuleName = 'NativeRNFBTurboAppDistribution';

function rejectUnsupportedPlatform<T>(): Promise<T> {
  return Promise.reject(
    new Error(`App Distribution is not supported on the ${Platform.OS} platform.`),
  );
}

class FirebaseAppDistributionModule extends FirebaseModule<typeof nativeModuleName> {
  isTesterSignedIn(): Promise<boolean> {
    if (isIOS) {
      return this.native.isTesterSignedIn();
    }

    return rejectUnsupportedPlatform();
  }

  signInTester(): Promise<void> {
    if (isIOS) {
      return this.native.signInTester();
    }

    return rejectUnsupportedPlatform();
  }

  checkForUpdate(): Promise<AppDistributionRelease> {
    if (isIOS) {
      return this.native.checkForUpdate();
    }

    return rejectUnsupportedPlatform();
  }

  signOutTester(): Promise<void> {
    if (isIOS) {
      return this.native.signOutTester();
    }

    return rejectUnsupportedPlatform();
  }
}

const config: ModuleConfig = {
  namespace: 'appDistribution',
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  turboModule: true,
};

export const SDK_VERSION = version;

/**
 * Returns the {@link AppDistribution} instance for the default or given {@link FirebaseApp}.
 */
export function getAppDistribution(app?: FirebaseApp): AppDistribution {
  return getOrCreateModularInstance(
    FirebaseAppDistributionModule,
    config,
    app,
  ) as unknown as AppDistribution;
}

export function isTesterSignedIn(appDistribution: AppDistribution): Promise<boolean> {
  return (appDistribution as AppDistributionInternal).isTesterSignedIn();
}

export function signInTester(appDistribution: AppDistribution): Promise<void> {
  return (appDistribution as AppDistributionInternal).signInTester();
}

export function checkForUpdate(appDistribution: AppDistribution): Promise<AppDistributionRelease> {
  return (appDistribution as AppDistributionInternal).checkForUpdate();
}

export function signOutTester(appDistribution: AppDistribution): Promise<void> {
  return (appDistribution as AppDistributionInternal).signOutTester();
}

export type { AppDistribution, AppDistributionRelease } from './types/app-distribution';
