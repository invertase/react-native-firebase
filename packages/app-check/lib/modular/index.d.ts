import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseAppCheckTypes } from '..';

import FirebaseApp = ReactNativeFirebase.FirebaseApp;
import AppCheck = FirebaseAppCheckTypes.Module;
import AppCheckOptions = FirebaseAppCheckTypes.AppCheckOptions;
import AppCheckTokenResult = FirebaseAppCheckTypes.AppCheckTokenResult;
import PartialObserver = FirebaseAppCheckTypes.PartialObserver;
import Unsubscribe = FirebaseAppCheckTypes.Unsubscribe;
import AppCheckProvider = FirebaseAppCheckTypes.AppCheckProvider;
import CustomProviderOptions = FirebaseAppCheckTypes.CustomProviderOptions;

/**
 * Activate App Check for the given app. Can be called only once per app.
 * @param app - FirebaseApp. Optional.
 * @param options - AppCheckOptions
 * @returns {Promise<AppCheck>}
 */
export function initializeAppCheck(app?: FirebaseApp, options?: AppCheckOptions): Promise<AppCheck>;

/**
 * Get the current App Check token. Attaches to the most recent in-flight request if one is present.
 * Returns null if no token is present and no token requests are in-flight.
 * @param appCheckInstance - AppCheck
 * @param forceRefresh - If true, will always try to fetch a fresh token. If false, will use a cached token if found in storage.
 * @returns {Promise<AppCheckTokenResult>}
 */
export function getToken(
  appCheckInstance: AppCheck,
  forceRefresh?: boolean,
): Promise<AppCheckTokenResult>;

/**
 * Get a limited-use (consumable) App Check token.
 * For use with server calls to firebase functions or custom backends using the firebase admin SDK
 * @param appCheckInstance - AppCheck
 * @returns {Promise<AppCheckTokenResult>}
 */
export function getLimitedUseToken(appCheckInstance: AppCheck): Promise<AppCheckTokenResult>;

/**
 * Registers a listener to changes in the token state. There can be more
 * than one listener registered at the same time for one or more
 * App Check instances. The listeners call back on the UI thread whenever
 * the current token associated with this App Check instance changes.
 *
 * @returns A function that unsubscribes this listener.
 */
export function onTokenChanged(
  appCheckInstance: AppCheck,
  listener: PartialObserver<AppCheckTokenResult>,
): Unsubscribe;

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
export function onTokenChanged(
  appCheckInstance: AppCheck,
  onNext: (tokenResult: AppCheckListenerResult) => void,
  onError?: (error: Error) => void,
  onCompletion?: () => void,
): () => void;

/**
 * Set whether App Check will automatically refresh tokens as needed.
 * @param appCheckInstance - AppCheck
 * @param isAutoRefreshEnabled - boolean
 */
export function setTokenAutoRefreshEnabled(
  appCheckInstance: AppCheck,
  isAutoRefreshEnabled: boolean,
): void;

/**
 * Custom provider class.
 * @public
 */
export class CustomProvider implements AppCheckProvider {
  constructor(customProviderOptions: CustomProviderOptions);
}

/**
 * React-Native-Firebase AppCheckProvider that allows hot-swapping native AppCheck implementations
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

export class ReactNativeFirebaseAppCheckProvider extends AppCheckProvider {
  /**
   * Specify how the app check provider should be configured. The new configuration is
   * in effect when this call returns. You must call `getToken()`
   * after this call to get a token using the new configuration.
   * This custom provider allows for delayed configuration and re-configuration on all platforms
   * so AppCheck has the same experience across all platforms, with the only difference being the native
   * providers you choose to use on each platform.
   */
  configure(options: {
    web?: ReactNativeFirebaseAppCheckProviderWebOptions;
    android?: ReactNativeFirebaseAppCheckProviderAndroidOptions;
    apple?: ReactNativeFirebaseAppCheckProviderAppleOptions;
    isTokenAutoRefreshEnabled?: boolean;
  }): void;
}
