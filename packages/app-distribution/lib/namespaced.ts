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

import { isIOS } from '@react-native-firebase/app/dist/module/common';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/dist/module/internal';

import { version } from './version';
import type { Statics, AppDistribution, AppDistributionRelease } from './types/app-distribution';

const statics: Statics = {};

const namespace = 'appDistribution';

const nativeModuleName = 'RNFBAppDistributionModule';

class FirebaseAppDistributionModule extends FirebaseModule {
  isTesterSignedIn(): Promise<boolean> {
    if (isIOS) {
      return this.native.isTesterSignedIn();
    }

    return Promise.reject(new Error('App Distribution is not supported on this platform.'));
  }

  signInTester(): Promise<void> {
    if (isIOS) {
      return this.native.signInTester();
    }

    return Promise.reject(new Error('App Distribution is not supported on this platform.'));
  }

  checkForUpdate(): Promise<AppDistributionRelease> {
    if (isIOS) {
      return this.native.checkForUpdate();
    }

    return Promise.reject(new Error('App Distribution is not supported on this platform.'));
  }

  signOutTester(): Promise<void> {
    if (isIOS) {
      return this.native.signOutTester();
    }

    return Promise.reject(new Error('App Distribution is not supported on this platform.'));
  }
}

// import { SDK_VERSION } from '@react-native-firebase/app-distribution';
export const SDK_VERSION: string = version;

// import appDistribution from '@react-native-firebase/app-distribution';
// appDistribution().X(...);

const appDistributionNamespace = createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseAppDistributionModule,
});

type AppDistributionNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  AppDistribution,
  Statics
> & {
  appDistribution: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<AppDistribution, Statics>;
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

export default appDistributionNamespace as unknown as AppDistributionNamespace;

// import appDistribution, { firebase } from '@react-native-firebase/app-distribution';
// appDistribution().X(...);
// firebase.appDistribution().X(...);
export const firebase =
  getFirebaseRoot() as unknown as ReactNativeFirebase.FirebaseNamespacedExport<
    'appDistribution',
    AppDistribution,
    Statics,
    false
  >;
