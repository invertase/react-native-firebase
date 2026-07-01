import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface AppDistributionRelease {
  displayVersion: string;
  buildVersion: string;
  releaseNotes: string | null;
  isExpired: boolean;
  downloadURL: string;
}

export interface Spec extends TurboModule {
  isTesterSignedIn(): Promise<boolean>;
  signInTester(): Promise<void>;
  signOutTester(): Promise<void>;
  checkForUpdate(): Promise<AppDistributionRelease>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboAppDistribution');
