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
import { isIOS } from '@react-native-firebase/app/dist/module/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/dist/module/internal';
import { version } from './version';

const statics = {};

const namespace = 'appDistribution';

const nativeModuleName = 'RNFBAppDistributionModule';

function rejectUnsupportedPlatform<T>(): Promise<T> {
  return Promise.reject(new Error('App Distribution is not supported on this platform.'));
}

class FirebaseAppDistributionModule extends FirebaseModule {
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

  checkForUpdate(): Promise<FirebaseAppDistributionTypes.AppDistributionRelease> {
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

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace FirebaseAppDistributionTypes {
  export interface AppDistributionRelease {
    displayVersion: string;
    buildVersion: string;
    releaseNotes: string | null;
    downloadURL: string;
    isExpired: boolean;
  }

  export interface Statics {
    // firebase.appDistribution.* static props go here
  }

  export type Module = FirebaseAppDistributionModule;
}

export * from './modular';

export const SDK_VERSION = version;

const appDistributionNamespace = createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseAppDistributionModule,
}) as unknown as ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseAppDistributionTypes.Module,
  FirebaseAppDistributionTypes.Statics
>;

export default appDistributionNamespace;

export const firebase = getFirebaseRoot() as unknown as ReactNativeFirebase.Module & {
  appDistribution: typeof appDistributionNamespace;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { appDistribution(): FirebaseAppDistributionTypes.Module };
};

declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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
