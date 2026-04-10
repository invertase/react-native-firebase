import type { FirebaseAppDistributionTypes } from '../namespaced';

export type AppDistributionModularDeprecationArg = string;

export type AppDistributionWithDeprecationArg = FirebaseAppDistributionTypes.Module & {
  isTesterSignedIn(_depArg: AppDistributionModularDeprecationArg): Promise<boolean>;
  signInTester(_depArg: AppDistributionModularDeprecationArg): Promise<void>;
  checkForUpdate(
    _depArg: AppDistributionModularDeprecationArg,
  ): Promise<FirebaseAppDistributionTypes.AppDistributionRelease>;
  signOutTester(_depArg: AppDistributionModularDeprecationArg): Promise<void>;
};
