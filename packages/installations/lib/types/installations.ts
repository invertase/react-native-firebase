import type { ReactNativeFirebase } from '@react-native-firebase/app';

// ============ Statics Interface ============

export interface Statics {
  SDK_VERSION: string;
}

// ============ Module Interface ============

/**
 * The Firebase Installations service interface.
 *
 * > This module is available for the default app or a given app.
 *
 * #### Example 1
 *
 * Get the installations instance for the **default app**:
 *
 * ```js
 * const installationsForDefaultApp = firebase.installations();
 * ```
 *
 * #### Example 2
 *
 * Get the installations instance for a **secondary app**:
 *
 * ```js
 * const otherApp = firebase.app('otherApp');
 * const installationsForOtherApp = firebase.installations(otherApp);
 * ```
 */
export interface Installations extends ReactNativeFirebase.FirebaseModule {
  /**
   * The current `FirebaseApp` instance for this Firebase service.
   */
  app: ReactNativeFirebase.FirebaseApp;

  /**
   * Creates a Firebase Installation if there isn't one for the app and
   * returns the Installation ID. The installation ID is a globally unique,
   * stable, URL-safe base64 string identifier that uniquely identifies the app instance.
   * NOTE: If the application already has an existing FirebaseInstanceID then the InstanceID identifier will be used.
   *
   * @return Firebase Installation ID, this is an url-safe base64 string of a 128-bit integer.
   */
  getId(): Promise<string>;

  /**
   * Retrieves (locally or from the server depending on forceRefresh value) a valid installation auth token.
   * An existing token may be invalidated or expire, so it is recommended to fetch the installation auth token
   * before any request to external servers (it will be refreshed automatically for firebase API calls).
   * This method should be used with forceRefresh == YES when e.g. a request with the previously fetched
   * installation auth token failed with "Not Authorized" error.
   *
   * @param forceRefresh Options to get an auth token either by force refreshing or not.
   * @return Firebase Installation Authentication Token
   */
  getToken(forceRefresh?: boolean): Promise<string>;

  /**
   * Deletes the Firebase Installation and all associated data from the Firebase backend.
   * This call may cause Firebase Cloud Messaging, Firebase Remote Config, Firebase Predictions,
   * or Firebase In-App Messaging to not function properly. Fetching a new installations ID should
   * reset all the dependent services to a stable state again. A network connection is required
   * for the method to succeed. If it fails, the existing installation data remains untouched.
   */
  delete(): Promise<void>;

  /**
   * TODO implement id change listener for android.
   *
   * Sets a new callback that will get called when Installation ID changes.
   * Returns an unsubscribe function that will remove the callback when called.
   * Only the Android SDK supports sending ID change events.
   *
   * @android
   */
  // onIdChange(callback: (installationId: string) => void): () => void;
}

// Helper types to reference outer scope types within the namespace
// These are needed because TypeScript can't directly alias types with the same name
type _Statics = Statics;
type _Installations = Installations;

/**
 * Firebase Installations package types for React Native.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseInstallationsTypes {
  // Type aliases referencing top-level types
  export type Statics = _Statics;
  export type Installations = _Installations;
  export type Module = Installations;
}
/* eslint-enable @typescript-eslint/no-namespace */

/* eslint-disable @typescript-eslint/no-namespace */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      installations: FirebaseModuleWithStaticsAndApp<Installations, Statics>;
    }
    interface FirebaseApp {
      installations(): Installations;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
