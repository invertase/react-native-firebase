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

import { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Firebase App Check package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `appCheck` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/app-check';
 *
 * // firebase.appCheck().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `appCheck` package:
 *
 * ```js
 * import appCheck from '@react-native-firebase/app-check';
 *
 * // appCheck().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/app-check';
 *
 * // firebase.appCheck().X
 * ```
 *
 * @firebase app-check
 */
export namespace FirebaseAppCheckTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

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
   * Options for App Check initialization.
   */
  export interface AppCheckOptions {
    /**
     * A reCAPTCHA V3 provider, reCAPTCHA Enterprise provider, or custom provider.
     * Note that in react-native-firebase provider should always be ReactNativeAppCheckCustomProvider, a cross-platform
     * implementation of an AppCheck CustomProvider
     */
    provider: CustomProvider | ReCaptchaV3Provider | ReCaptchaEnterpriseProvider;

    /**
     * If true, enables SDK to automatically
     * refresh AppCheck token as needed. If undefined, the value will default
     * to the value of `app.automaticDataCollectionEnabled`. That property
     * defaults to false and can be set in the app config.
     */
    isTokenAutoRefreshEnabled?: boolean;
  }

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
     * The android provider to use, either `safetyNet` or `playIntegrity`. default is `playIntegrity`, `safetyNet` is deprecated.
     */
    provider?: 'debug' | 'safetyNet' | 'playIntegrity';
  }

  export interface ReactNativeFirebaseAppCheckProvider extends AppCheckProvider {
    /**
     * Specify how the app check provider should be configured. The new configuration is
     * in effect when this call returns. You must call `getToken()`
     * after this call to get a token using the new configuration.
     * This custom provider allows for delayed configuration and re-configuration on all platforms
     * so AppCheck has the same experience across all platforms, with the only difference being the native
     * providers you choose to use on each platform.
     */
    configure(
      web?: ReactNativeFirebaseAppCheckProviderWebOptions,
      android?: ReactNativeFirebaseAppCheckProviderAndroidOptions,
      apple?: ReactNativeFirebaseAppCheckProviderAppleOptions,
      isTokenAutoRefreshEnabled?: boolean,
    ): Promise<void>;
  }

  /**
   * Result returned by `getToken()`.
   */
  interface AppCheckTokenResult {
    /**
     * The token string in JWT format.
     */
    readonly token: string;
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

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Statics {
    // firebase.appCheck.* static props go here
  }

  /**
   * The Firebase App Check service is available for the default app or a given app.
   *
   * #### Example 1
   *
   * Get the appCheck instance for the **default app**:
   *
   * ```js
   * const appCheckForDefaultApp = firebase.appCheck();
   * ```
   *
   * #### Example 2
   *
   * Get the appCheck instance for a **secondary app**:
   *˚
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const appCheckForOtherApp = firebase.appCheck(otherApp);
   * ```
   *
   */
  export class Module extends FirebaseModule {
    /**
     * initialize the AppCheck module. Note that in react-native-firebase AppCheckOptions must always
     * be an object with a `provider` member containing `ReactNativeFirebaseAppCheckProvider` that has returned successfully
     * from a call to the `configure` method, with sub-providers for the various platforms configured to meet your project
     * requirements. This must be called prior to interacting with any firebase services protected by AppCheck
     *
     * @param options an AppCheckOptions with a configured ReactNativeFirebaseAppCheckProvider as the provider
     */
    initializeAppCheck(options: AppCheckOptions): Promise<void>;

    /**
     * Activate App Check
     * On iOS App Check is activated with DeviceCheck provider simply by including the module, using the token auto refresh default or
     * the specific value (if configured) in firebase.json, but calling this does no harm.
     * On Android you must call this and it will install the SafetyNet provider in release builds, the Debug provider if debuggable.
     * On both platforms you may use this method to alter the token refresh setting after startup.
     * On iOS if you want to set a specific AppCheckProviderFactory (for instance to FIRAppCheckDebugProviderFactory or
     * FIRAppAttestProvider) you must manually do that in your AppDelegate.m prior to calling [FIRApp configure]
     *
     * @deprecated use initializeAppCheck to gain access to all platform providers and firebase-js-sdk v9 compatibility
     * @param siteKeyOrProvider - This is ignored, Android uses DebugProviderFactory if the app is debuggable (https://firebase.google.com/docs/app-check/android/debug-provider)
     *                            Android uses SafetyNetProviderFactory for release builds.
     *                            iOS uses DeviceCheckProviderFactory by default unless altered in AppDelegate.m manually
     * @param isTokenAutoRefreshEnabled - If true, enables SDK to automatically
     * refresh AppCheck token as needed. If undefined, the value will default
     * to the value of `app.automaticDataCollectionEnabled`. That property
     * defaults to false and can be set in the app config.
     */
    activate(
      siteKeyOrProvider: string | AppCheckProvider,
      isTokenAutoRefreshEnabled?: boolean,
    ): Promise<void>;

    /**
     * Alter the token auto refresh setting. By default it will take the value of automaticDataCollectionEnabled from Info.plist / AndroidManifest.xml
     * @param isTokenAutoRefreshEnabled - If true, the SDK automatically
     * refreshes App Check tokens as needed. This overrides any value set
     * during `activate()` or taken by default from automaticDataCollectionEnabled in plist / android manifest
     */
    setTokenAutoRefreshEnabled(isTokenAutoRefreshEnabled: boolean): void;

    /**
     * Requests Firebase App Check token.
     * This method should only be used if you need to authorize requests to a non-Firebase backend.
     * Requests to Firebase backend are authorized automatically if configured.
     *
     * @param forceRefresh - If true, a new Firebase App Check token is requested and the token cache is ignored.
     * If false, the cached token is used if it exists and has not expired yet.
     * In most cases, false should be used. True should only be used if the server explicitly returns an error, indicating a revoked token.
     */
    getToken(forceRefresh?: boolean): Promise<AppCheckTokenResult>;

    /**
     * Registers a listener to changes in the token state. There can be more
     * than one listener registered at the same time for one or more
     * App Check instances. The listeners call back on the UI thread whenever
     * the current token associated with this App Check instance changes.
     *
     * @returns A function that unsubscribes this listener.
     */
    // TODO there is a great deal of Observer / PartialObserver typing to carry-in
    // onTokenChanged(observer: PartialObserver<AppCheckTokenResult>): () => void;

    /**
     * TODO implement token listener for android.
     *
     * Registers a listener to changes in the token state. There can be more
     * than one listener registered at the same time for one or more
     * App Check instances. The listeners call back on the UI thread whenever
     * the current token associated with this App Check instance changes.
     *
     * Token listeners do not exist in the native SDK for iOS, no token change events will be emitted on that platform.
     * This is not yet implemented on Android, no token change events will be emitted until implemented.
     *
     * @returns A function that unsubscribes this listener.
     */
    // onTokenChanged(
    //   onNext: (tokenResult: AppCheckTokenResult) => void,
    //   onError?: (error: Error) => void,
    //   onCompletion?: () => void,
    // ): () => void;
  }
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseAppCheckTypes.Module,
  FirebaseAppCheckTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  appCheck: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { appCheck(): FirebaseAppCheckTypes.Module };
};

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      appCheck: FirebaseModuleWithStaticsAndApp<
        FirebaseAppCheckTypes.Module,
        FirebaseAppCheckTypes.Statics
      >;
    }
    interface FirebaseApp {
      appCheck(): FirebaseAppCheckTypes.Module;
    }
  }
}
