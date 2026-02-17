import type { FirebaseApp } from '@react-native-firebase/app';
import type {
  AppCheck,
  AppCheckOptions,
  AppCheckProvider,
  AppCheckTokenResult,
  PartialObserver,
  ReactNativeFirebaseAppCheckProviderConfig,
  Unsubscribe,
} from './appcheck';
import type { ReactNativeFirebaseAppCheckProvider } from '../providers';

type AppCheckListenerResult = AppCheckTokenResult & { readonly appName: string };

export type AppCheckInternal = AppCheck & {
  /** The FirebaseApp this module is associated with */
  app: FirebaseApp;

  /**
   * Create a ReactNativeFirebaseAppCheckProvider option for use in react-native-firebase
   */
  newReactNativeFirebaseAppCheckProvider(): ReactNativeFirebaseAppCheckProvider;

  /**
   * Initialize the AppCheck module. Note that in react-native-firebase AppCheckOptions must always
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
   * On Android if you call this it will install the PlayIntegrity provider in release builds, the Debug provider if debuggable.
   * On both platforms you may use this method to alter the token refresh setting after startup.
   * On iOS if you want to set a specific AppCheckProviderFactory (for instance to FIRAppCheckDebugProviderFactory or
   * FIRAppAttestProvider) you must manually do that in your AppDelegate.m prior to calling [FIRApp configure]
   *
   * @deprecated use initializeAppCheck to gain access to all platform providers and firebase-js-sdk v9 compatibility
   * @param siteKeyOrProvider - This is ignored, Android uses DebugProviderFactory if the app is debuggable (https://firebase.google.com/docs/app-check/android/debug-provider)
   *                            Android uses PlayIntegrityProviderFactory for release builds.
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
   * Requests a Firebase App Check token. This method should be used only if you need to authorize requests
   * to a non-Firebase backend. Returns limited-use tokens that are intended for use with your non-Firebase
   * backend endpoints that are protected with Replay Protection (https://firebase.google.com/docs/app-check/custom-resource-backend#replay-protection).
   * This method does not affect the token generation behavior of the getAppCheckToken() method.
   */
  getLimitedUseToken(): Promise<AppCheckTokenResult>;

  /**
   * Registers a listener to changes in the token state. There can be more
   * than one listener registered at the same time for one or more
   * App Check instances. The listeners call back on the UI thread whenever
   * the current token associated with this App Check instance changes.
   *
   * @returns A function that unsubscribes this listener.
   */
  onTokenChanged(observer: PartialObserver<AppCheckListenerResult>): () => void;

  /**
   * Registers a listener to changes in the token state. There can be more
   * than one listener registered at the same time for one or more
   * App Check instances. The listeners call back on the UI thread whenever
   * the current token associated with this App Check instance changes.
   *
   * Token listeners do not exist in the native SDK for iOS, no token change events will be emitted on that platform.
   * This is not yet implemented on Android, no token change events will be emitted until implemented.
   *
   * NOTE: Although an `onError` callback can be provided, it will
   * never be called, Android sdk code doesn't provide handling for onError function
   *
   * NOTE: Although an `onCompletion` callback can be provided, it will
   * never be called because the token stream is never-ending.
   *
   * @returns A function that unsubscribes this listener.
   */
  onTokenChanged(
    onNext: (tokenResult: AppCheckListenerResult) => void,
    onError?: (error: Error) => void,
    onCompletion?: () => void,
  ): Unsubscribe;

  /**
   * Implementation signature used by modular wrappers.
   */
  onTokenChanged(
    onNextOrObserver:
      | PartialObserver<AppCheckTokenResult>
      | ((tokenResult: AppCheckTokenResult) => void),
    onError?: (error: Error) => void,
    onCompletion?: () => void,
  ): Unsubscribe;
};

/**
 * Type representing providers that have providerOptions.
 * Used for type narrowing in runtime code.
 */
export type ProviderWithOptions =
  | ReactNativeFirebaseAppCheckProvider
  | ReactNativeFirebaseAppCheckProviderConfig;

/**
 * Wrapped native module interface for App Check.
 *
 * Note: React Native Firebase internally wraps native methods and auto-prepends the app name
 * when `hasMultiAppSupport` is enabled. This interface represents the *wrapped* module shape
 * that is exposed as `this.native` within FirebaseModule subclasses.
 */
export interface RNFBAppCheckModule {
  initializeAppCheck(options: AppCheckOptions): Promise<void>;

  setTokenAutoRefreshEnabled(enabled: boolean): void | Promise<void>;

  configureProvider(provider: string, debugToken?: string): Promise<void>;

  getToken(forceRefresh: boolean): Promise<AppCheckTokenResult>;
  getLimitedUseToken(): Promise<AppCheckTokenResult>;

  addAppCheckListener(): void | Promise<void>;
  removeAppCheckListener(): void | Promise<void>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBAppCheckModule: RNFBAppCheckModule;
  }
}
