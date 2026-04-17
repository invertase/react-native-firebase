import type { AppDistribution, AppDistributionRelease } from './app-distribution';

export type AppDistributionModularDeprecationArg = string;

export interface RNFBAppDistributionModule {
  isTesterSignedIn(): Promise<boolean>;
  signInTester(): Promise<void>;
  checkForUpdate(): Promise<AppDistributionRelease>;
  signOutTester(): Promise<void>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBAppDistributionModule: RNFBAppDistributionModule;
  }
}

export interface AppDistributionInternal extends AppDistribution {
  readonly native: RNFBAppDistributionModule;
}

export type AppDistributionWithDeprecationArg = AppDistributionInternal & {
  isTesterSignedIn(_depArg: AppDistributionModularDeprecationArg): Promise<boolean>;
  signInTester(_depArg: AppDistributionModularDeprecationArg): Promise<void>;
  checkForUpdate(_depArg: AppDistributionModularDeprecationArg): Promise<AppDistributionRelease>;
  signOutTester(_depArg: AppDistributionModularDeprecationArg): Promise<void>;
};
