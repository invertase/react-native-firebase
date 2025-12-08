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

export interface ReactNativeFirebaseAppCheckProviderOptions {
  /**
   * debug token to use, if any. Defaults to undefined, pre-configure tokens in firebase web console if needed
   */
  debugToken?: string;
}

export interface ReactNativeFirebaseAppCheckProviderWebOptions
  extends ReactNativeFirebaseAppCheckProviderOptions {
  /**
   * The web provider to use, either `reCaptchaV3` or `reCaptchaEnterprise`, defaults to `reCaptchaV3`
   */
  provider?: 'debug' | 'reCaptchaV3' | 'reCaptchaEnterprise';

  /**
   * siteKey for use in web queries, defaults to `none`
   */
  siteKey?: string;
}

export interface ReactNativeFirebaseAppCheckProviderAppleOptions
  extends ReactNativeFirebaseAppCheckProviderOptions {
  /**
   * The apple provider to use, either `deviceCheck` or `appAttest`, or `appAttestWithDeviceCheckFallback`,
   * defaults to `DeviceCheck`. `appAttest` requires iOS 14+ or will fail, `appAttestWithDeviceCheckFallback`
   * will use `appAttest` for iOS14+ and fallback to `deviceCheck` on devices with ios13 and lower
   */
  provider?: 'debug' | 'deviceCheck' | 'appAttest' | 'appAttestWithDeviceCheckFallback';
}

export interface ReactNativeFirebaseAppCheckProviderAndroidOptions
  extends ReactNativeFirebaseAppCheckProviderOptions {
  /**
   * The android provider to use, either `debug` or `playIntegrity`. default is `playIntegrity`.
   */
  provider?: 'debug' | 'playIntegrity';
}

export interface ReactNativeFirebaseAppCheckProviderConfigOptions {
  web?: ReactNativeFirebaseAppCheckProviderWebOptions;
  android?: ReactNativeFirebaseAppCheckProviderAndroidOptions;
  apple?: ReactNativeFirebaseAppCheckProviderAppleOptions;
  isTokenAutoRefreshEnabled?: boolean;
}

export default class ReactNativeFirebaseAppCheckProvider {
  providerOptions?: ReactNativeFirebaseAppCheckProviderConfigOptions;

  constructor() {}

  configure(options: ReactNativeFirebaseAppCheckProviderConfigOptions): void {
    this.providerOptions = options;
  }

  // Required by AppCheckProvider interface, but implementation is delegated to native modules
  async getToken(): Promise<any> {
    throw new Error(
      'getToken should not be called directly on ReactNativeFirebaseAppCheckProvider',
    );
  }
}
