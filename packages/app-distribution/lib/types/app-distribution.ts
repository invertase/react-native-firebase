import type { ReactNativeFirebase } from '@react-native-firebase/app';

export interface AppDistributionRelease {
  displayVersion: string;
  buildVersion: string;
  releaseNotes: string | null;
  downloadURL: string;
  isExpired: boolean;
}

export interface AppDistribution extends ReactNativeFirebase.FirebaseModule {
  app: ReactNativeFirebase.FirebaseApp;
  isTesterSignedIn(): Promise<boolean>;
  signInTester(): Promise<void>;
  checkForUpdate(): Promise<AppDistributionRelease>;
  signOutTester(): Promise<void>;
}
