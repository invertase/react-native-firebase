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

// ============ Provider Types ============

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

/**
 * Function to get an App Check token through a custom provider service.
 */
export interface CustomProviderOptions {
  getToken: () => Promise<AppCheckToken>;
}

// ============ Options & Result Types ============

/**
 * Custom provider class.
 * @public
 */
export declare class CustomProvider implements AppCheckProvider {
  constructor(customProviderOptions: CustomProviderOptions);
  getToken(): Promise<AppCheckToken>;
}

/**
 * Options for App Check initialization.
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
 * The token returned from an `AppCheckProvider`.
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
 * Result returned by `getToken()`.
 */
export interface AppCheckTokenResult {
  /**
   * The token string in JWT format.
   */
  readonly token: string;
}

/**
 * The result return from `onTokenChanged`
 */
export type AppCheckListenerResult = AppCheckToken & { readonly appName: string };

// ============ Observer Types ============

export type NextFn<T> = (value: T) => void;
export type ErrorFn = (error: Error) => void;
export type CompleteFn = () => void;

export interface Observer<T> {
  next: NextFn<T>;
  error: ErrorFn;
  complete: CompleteFn;
}

export type PartialObserver<T> = Partial<Observer<T>>;

/**
 * A function that unsubscribes from token changes.
 */
export type Unsubscribe = () => void;

// ============ ReactNativeFirebaseAppCheckProvider Types ============

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

/**
 * Type representing providers that have providerOptions.
 * Used for type narrowing in runtime code.
 */
export type ProviderWithOptions =
  | ReactNativeFirebaseAppCheckProvider
  | ReactNativeFirebaseAppCheckProviderConfig;

// ============ Module Interface ============

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

// ============ Statics Interface ============

/**
 * Static properties available on firebase.appCheck
 */
export interface AppCheckStatics {
  CustomProvider: new (customProviderOptions: CustomProviderOptions) => CustomProvider;
  SDK_VERSION: string;
}

/**
 * FirebaseApp type with appCheck() method.
 * @deprecated Import FirebaseApp from '@react-native-firebase/app' instead.
 * The appCheck() method is added via module augmentation.
 */
export type FirebaseApp = ReactNativeFirebase.FirebaseApp;

// ============ Module Augmentation ============

/* eslint-disable @typescript-eslint/no-namespace */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    interface Module {
      appCheck: FirebaseModuleWithStaticsAndApp<AppCheck, AppCheckStatics>;
    }
    interface FirebaseApp {
      appCheck(): AppCheck;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// ============ Backwards Compatibility Namespace ============

// Helper types to reference outer scope types within the namespace
// These are needed because TypeScript can't directly alias types with the same name
type _AppCheckProvider = AppCheckProvider;
type _CustomProviderOptions = CustomProviderOptions;
type _AppCheckOptions = AppCheckOptions;
type _AppCheckToken = AppCheckToken;
type _AppCheckTokenResult = AppCheckTokenResult;
type _AppCheckListenerResult = AppCheckListenerResult;
type _AppCheck = AppCheck;
type _AppCheckStatics = AppCheckStatics;

/**
 * @deprecated Use the exported types directly instead.
 * FirebaseAppCheckTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseAppCheckTypes {
  // Short name aliases referencing top-level types
  export type Provider = AppCheckProvider;
  export type ProviderOptions = CustomProviderOptions;
  export type Options = AppCheckOptions;
  export type Token = AppCheckToken;
  export type TokenResult = AppCheckTokenResult;
  export type ListenerResult = AppCheckListenerResult;
  export type Statics = AppCheckStatics;
  export type Module = AppCheck;

  // AppCheck* aliases that reference the exported types above via helper types
  // These provide backwards compatibility for code using FirebaseAppCheckTypes.AppCheckProvider
  export type AppCheckProvider = _AppCheckProvider;
  export type CustomProviderOptions = _CustomProviderOptions;
  export type AppCheckOptions = _AppCheckOptions;
  export type AppCheckToken = _AppCheckToken;
  export type AppCheckTokenResult = _AppCheckTokenResult;
  export type AppCheckListenerResult = _AppCheckListenerResult;
  export type AppCheck = _AppCheck;
  export type AppCheckStatics = _AppCheckStatics;
}
/* eslint-enable @typescript-eslint/no-namespace */
