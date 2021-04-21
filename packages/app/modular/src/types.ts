import * as web from 'firebase/app';
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
