import * as web from 'firebase/app';
import FirebaseAppImpl from './implementations/firebaseApp';
import { isObject, isOptionalBoolean, isOptionalString, isString } from './common';

/**
 * Checks whether a provided value is a FirebaseAppImpl.
 * @param app
 * @returns
 */
export function isFirebaseApp(app: any): app is FirebaseApp {
  return app instanceof FirebaseAppImpl;
}

/**
 * Checks whether a provided value is a valid FirebaseOptions type.
 *
 * @param options
 * @returns
 */
export function isFirebaseOptions(options: any): options is FirebaseOptions {
  if (!isObject(options)) {
    return false;
  }

  return (
    isString(options.apiKey) &&
    isString(options.appId) &&
    isString(options.databaseURL) &&
    isString(options.messagingSenderId) &&
    isString(options.projectId) &&
    isOptionalString(options.authDomain) &&
    isOptionalString(options.storageBucket) &&
    isOptionalString(options.measurementId) &&
    isOptionalString(options.androidClientId) &&
    isOptionalString(options.clientId) &&
    isOptionalString(options.deepLinkURLScheme)
  );
}

/**
 * Checks whether a provided value is a valid FirebaseOptions type.
 *
 * @param config
 * @returns
 */
export function isFirebaseAppConfig(config: any): config is FirebaseAppConfig {
  if (!isObject(config)) {
    return false;
  }

  return (
    isOptionalString(config.name) &&
    isOptionalBoolean(config.automaticDataCollectionEnabled) &&
    isOptionalBoolean(config.automaticResourceManagement)
  );
}

export interface FirebaseApp extends web.FirebaseApp {
  readonly options: FirebaseOptions;
  /**
   * The config flag for GDPR opt-in/opt-out.
   *
   * Use `setAutomaticDataCollectionEnabled` to update the setting.
   */
  readonly automaticDataCollectionEnabled: boolean;
  /**
   * If true it indicates that Firebase should close database connections automatically when the app is in the background.
   *
   * This is an Android-only property which is settable on created secondary apps only.
   *
   * Disabled by default.
   */
  readonly automaticResourceManagement: boolean;
}

export interface FirebaseOptions extends web.FirebaseOptions {
  readonly apiKey: string;
  readonly appId: string;
  readonly databaseURL: string;
  readonly messagingSenderId: string;
  readonly projectId: string;
  /**
   * The Android client ID used in Google AppInvite when an iOS app has its Android version, for example "12345.apps.googleusercontent.com".
   *
   * iOS only.
   */
  readonly androidClientId?: string;
  /**
   * The OAuth2 client ID for iOS application used to authenticate Google users, for example "12345.apps.googleusercontent.com", used for signing in with Google.
   *
   * iOS only.
   */
  readonly clientId?: string;
  /**
   * The URL scheme used to set up Durable Deep Link service.
   *
   * iOS only.
   */
  readonly deepLinkURLScheme?: string;
}

export interface FirebaseAppConfig extends web.FirebaseAppConfig {
  /**
   * If set to true it indicates that Firebase should close database connections automatically when the app is in the background.
   *
   * This is an Android-only property which is settable on created secondary apps only.
   *
   * Disabled by default.
   */
  readonly automaticResourceManagement?: boolean;
}
