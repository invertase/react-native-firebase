import type { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * @deprecated Use the exported types directly instead.
 * FirebaseAppDistributionTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseAppDistributionTypes {
  /**
   * @deprecated Use the exported `AppDistributionRelease` type instead.
   */
  export interface AppDistributionRelease {
    /** @deprecated Use the exported `AppDistributionRelease` type instead. */
    displayVersion: string;
    /** @deprecated Use the exported `AppDistributionRelease` type instead. */
    buildVersion: string;
    /** @deprecated Use the exported `AppDistributionRelease` type instead. */
    releaseNotes: string | null;
    /** @deprecated Use the exported `AppDistributionRelease` type instead. */
    downloadURL: string;
    /** @deprecated Use the exported `AppDistributionRelease` type instead. */
    isExpired: boolean;
  }

  /**
   * @deprecated Use the default export statics instead.
   */
  export interface Statics {
    /** @deprecated Use the default export statics instead. */
    SDK_VERSION: string;
  }

  /**
   * @deprecated Use the exported `AppDistribution` type instead.
   */
  export interface Module extends ReactNativeFirebase.FirebaseModule {
    /** @deprecated Use the exported `AppDistribution` type instead. */
    app: ReactNativeFirebase.FirebaseApp;
    /** @deprecated Use the exported `AppDistribution` type instead. */
    isTesterSignedIn(): Promise<boolean>;
    /** @deprecated Use the exported `AppDistribution` type instead. */
    signInTester(): Promise<void>;
    /** @deprecated Use the exported `AppDistribution` type instead. */
    checkForUpdate(): Promise<AppDistributionRelease>;
    /** @deprecated Use the exported `AppDistribution` type instead. */
    signOutTester(): Promise<void>;
  }
}

declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    interface Module {
      appDistribution: FirebaseModuleWithStaticsAndApp<
        FirebaseAppDistributionTypes.Module,
        FirebaseAppDistributionTypes.Statics
      >;
    }

    interface FirebaseApp {
      appDistribution(): FirebaseAppDistributionTypes.Module;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
