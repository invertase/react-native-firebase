import type { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * The release information returned by the update check when a new version is available.
 */
export interface AppDistributionRelease {
  /**
   * The short bundle version of this build (example 1.0.0).
   */
  displayVersion: string;

  /**
   * The build number of this build (example: 123).
   */
  buildVersion: string;

  /**
   * The release notes for this build, possibly null if no release notes were provided.
   */
  releaseNotes: string | null;

  /**
   * The URL for the build.
   */
  downloadURL: string;

  /**
   * Whether the download URL for this release is expired.
   */
  isExpired: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Statics {
  // firebase.appDistribution.* static props go here
}

/**
 * The Firebase AppDistribution service interface.
 *
 * > This module is available for the default app only.
 *
 * #### Example
 *
 * Get the AppDistribution service for the default app:
 *
 * ```js
 * const defaultAppAppDistribution = firebase.appDistribution();
 * ```
 */
export interface Module extends ReactNativeFirebase.FirebaseModule {
  /**
   * Returns true if the App Distribution tester is signed in.
   * If not an iOS device, it always rejects, as neither false nor true seem like a sensible default.
   */
  isTesterSignedIn(): Promise<boolean>;

  /**
   * Sign-in the App Distribution tester
   * If not an iOS device, it always rejects, as no defaults seem sensible.
   */
  signInTester(): Promise<void>;

  /**
   * Check to see whether a new distribution is available
   * If not an iOS device, it always rejects, as no default response seems sensible.
   */
  checkForUpdate(): Promise<AppDistributionRelease>;

  /**
   * Sign out App Distribution tester
   * If not an iOS device, it always rejects, as no default response seems sensible.
   */
  signOutTester(): Promise<void>;
}

/**
 * Firebase AppDistribution package types for React Native.
 */
export namespace FirebaseAppDistributionTypes {
  export type { AppDistributionRelease };
  export type { Statics };
  export type { Module };
}

/* eslint-disable @typescript-eslint/no-namespace */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      appDistribution: FirebaseModuleWithStaticsAndApp<Module, Statics>;
    }
    interface FirebaseApp {
      appDistribution(): Module;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

