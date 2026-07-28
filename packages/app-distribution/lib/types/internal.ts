import type { AppDistribution, AppDistributionRelease } from './app-distribution';

export interface RNFBAppDistributionModule {
  isTesterSignedIn(): Promise<boolean>;
  signInTester(): Promise<void>;
  checkForUpdate(): Promise<AppDistributionRelease>;
  signOutTester(): Promise<void>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    NativeRNFBTurboAppDistribution: RNFBAppDistributionModule;
  }
}

export interface AppDistributionInternal extends AppDistribution {
  isTesterSignedIn(): Promise<boolean>;
  signInTester(): Promise<void>;
  checkForUpdate(): Promise<AppDistributionRelease>;
  signOutTester(): Promise<void>;
  readonly native: RNFBAppDistributionModule;
}
