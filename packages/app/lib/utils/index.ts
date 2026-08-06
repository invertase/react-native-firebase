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
import { FirebaseModule, getOrCreateModularInstance } from '../internal';
import type { ModuleConfig } from '../internal';
import type { ReactNativeFirebase, Utils } from '../types/app';
import { UTILS_NATIVE_MODULE } from '../internal/constants';

const namespace = 'utils';
const nativeModuleName = UTILS_NATIVE_MODULE;

const config: ModuleConfig = {
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  turboModule: true,
};

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
    // NewArch-AD-15: dynamic Play Services status — use getPlayServicesStatus() (async) on Android.
    return this.getPlayServicesStatus() as unknown as Utils.PlayServicesAvailability;
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

/**
 * Returns the {@link Utils.Module} instance for the default or given {@link ReactNativeFirebase.FirebaseApp}.
 *
 * @param app - The Firebase app to use. When omitted, the default app is used.
 */
export function getUtils(app?: ReactNativeFirebase.FirebaseApp): Utils.Module {
  return getOrCreateModularInstance(FirebaseUtilsModule, config, app) as unknown as Utils.Module;
}
