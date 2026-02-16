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
import type { CustomProvider } from '../providers';

export type { Unsubscribe, PartialObserver } from '@react-native-firebase/app';
/**
 * The Firebase App Check service interface.
 *
 * @public
 */
export interface AppCheck {
  /**
   *  this `AppCheck` instance is associated with this FirebaseApp.
   */
  app: FirebaseApp;
}

/**
 * The token returned from an `AppCheckProvider`.
 * @public
 */
export interface AppCheckToken {
  /**
   * The token string in JWT format.
   */
  readonly token: string;
  /**
   * The local timestamp after which the token will expire.
   */
  readonly expireTimeMillis: number;
}

/**
 * Options for App Check initialization.
 * @public
 */
export interface AppCheckOptions {
  /**
   * The App Check provider to use. This can be either the built-in reCAPTCHA provider
   * or a custom provider. For convenience, you can also pass an object with providerOptions
   * directly, which will be accepted by the runtime.
   */
  provider:
    | CustomProvider
    | ReactNativeFirebaseAppCheckProvider
    | ReactNativeFirebaseAppCheckProviderConfig;

  /**
   * If true, enables SDK to automatically
   * refresh AppCheck token as needed. If undefined, the value will default
   * to the value of `app.automaticDataCollectionEnabled`. That property
   * defaults to false and can be set in the app config.
   */
  isTokenAutoRefreshEnabled?: boolean;
}

/**
 * Function to get an App Check token through a custom provider service. This is for
 * "other" platform only, this is not supported on iOS and android.
 * @public
 */
export interface CustomProviderOptions {
  /**
   * Function to get an App Check token through a custom provider
   * service.
   */
  getToken: () => Promise<AppCheckToken>;
}

/**
 * Result returned by `getToken()`.
 * @public
 */
export interface AppCheckTokenResult {
  /**
   * The token string in JWT format.
   */
  readonly token: string;
}

/**
 * An App Check provider. This can be either the built-in reCAPTCHA provider
 * or a custom provider. For more on custom providers, see
 * https://firebase.google.com/docs/app-check/web-custom-provider
 */
export interface AppCheckProvider {
  /**
   * Returns an AppCheck token.
   */
  getToken(): Promise<AppCheckToken>;
}

export interface ReactNativeFirebaseAppCheckProviderOptions {
  /**
   * debug token to use, if any. Defaults to undefined, pre-configure tokens in firebase web console if needed
   */
  debugToken?: string;
}

export interface ReactNativeFirebaseAppCheckProviderWebOptions extends ReactNativeFirebaseAppCheckProviderOptions {
  /**
   * The web provider to use, either `reCaptchaV3` or `reCaptchaEnterprise`, defaults to `reCaptchaV3`
   */
  provider?: 'debug' | 'reCaptchaV3' | 'reCaptchaEnterprise';

  /**
   * siteKey for use in web queries, defaults to `none`
   */
  siteKey?: string;
}

export interface ReactNativeFirebaseAppCheckProviderAppleOptions extends ReactNativeFirebaseAppCheckProviderOptions {
  /**
   * The apple provider to use, either `deviceCheck` or `appAttest`, or `appAttestWithDeviceCheckFallback`,
   * defaults to `DeviceCheck`. `appAttest` requires iOS 14+ or will fail, `appAttestWithDeviceCheckFallback`
   * will use `appAttest` for iOS14+ and fallback to `deviceCheck` on devices with ios13 and lower
   */
  provider?: 'debug' | 'deviceCheck' | 'appAttest' | 'appAttestWithDeviceCheckFallback';
}

export interface ReactNativeFirebaseAppCheckProviderAndroidOptions extends ReactNativeFirebaseAppCheckProviderOptions {
  /**
   * The android provider to use, either `debug` or `playIntegrity`. default is `playIntegrity`.
   */
  provider?: 'debug' | 'playIntegrity';
}

/**
 * Platform-specific provider options configuration.
 */
export type ReactNativeFirebaseAppCheckProviderOptionsMap = {
  web?: ReactNativeFirebaseAppCheckProviderWebOptions;
  android?: ReactNativeFirebaseAppCheckProviderAndroidOptions;
  apple?: ReactNativeFirebaseAppCheckProviderAppleOptions;
  isTokenAutoRefreshEnabled?: boolean;
};

/**
 * Configuration object for ReactNativeFirebaseAppCheckProvider
 * that can be passed directly with providerOptions (for convenience in initialization).
 * The runtime accepts objects with providerOptions even if they don't have
 * getToken() and configure() methods.
 */
export interface ReactNativeFirebaseAppCheckProviderConfig {
  providerOptions: ReactNativeFirebaseAppCheckProviderOptionsMap;
}

export interface ReactNativeFirebaseAppCheckProvider extends AppCheckProvider {
  /**
   * Provider options for platform-specific configuration.
   * This is set when configure() is called.
   */
  providerOptions?: ReactNativeFirebaseAppCheckProviderOptionsMap;

  /**
   * Specify how the app check provider should be configured. The new configuration is
   * in effect when this call returns. You must call `getToken()`
   * after this call to get a token using the new configuration.
   * This custom provider allows for delayed configuration and re-configuration on all platforms
   * so AppCheck has the same experience across all platforms, with the only difference being the native
   * providers you choose to use on each platform.
   */
  configure(options: ReactNativeFirebaseAppCheckProviderOptionsMap): void;
}
