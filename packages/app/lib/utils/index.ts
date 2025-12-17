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

import { isIOS } from '../common';
import { createModuleNamespace, FirebaseModule } from '../internal';
import UtilsStatics from './UtilsStatics';
import { Utils } from '../types/app';

const namespace = 'utils';
const statics = UtilsStatics;
const nativeModuleName = 'RNFBUtilsModule';

class FirebaseUtilsModule extends FirebaseModule<'RNFBUtilsModule'> {
  get isRunningInTestLab(): boolean {
    if (isIOS) {
      return false;
    }
    return this.native.isRunningInTestLab;
  }

  get playServicesAvailability(): Utils.PlayServicesAvailability {
    if (isIOS) {
      return {
        isAvailable: true,
        status: 0,
        hasResolution: false,
        isUserResolvableError: false,
        error: undefined,
      };
    }
    return this.native.androidPlayServices;
  }

  getPlayServicesStatus(): Promise<Utils.PlayServicesAvailability> {
    if (isIOS) {
      return Promise.resolve({
        isAvailable: true,
        status: 0,
        hasResolution: false,
        isUserResolvableError: false,
        error: undefined,
      });
    }
    return this.native.androidGetPlayServicesStatus();
  }

  promptForPlayServices(): Promise<void> {
    if (isIOS) {
      return Promise.resolve();
    }
    return this.native.androidPromptForPlayServices();
  }

  makePlayServicesAvailable(): Promise<void> {
    if (isIOS) {
      return Promise.resolve();
    }
    return this.native.androidMakePlayServicesAvailable();
  }

  resolutionForPlayServices(): Promise<void> {
    if (isIOS) {
      return Promise.resolve();
    }
    return this.native.androidResolutionForPlayServices();
  }
}

// import { utils } from '@react-native-firebase/app';
// utils().X(...);
export default createModuleNamespace({
  statics,
  version: UtilsStatics.SDK_VERSION,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseUtilsModule,
}) as unknown as Utils.Statics & (() => Utils.Module);
