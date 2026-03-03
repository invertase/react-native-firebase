import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type { AppDistribution, AppDistributionRelease } from './types/app-distribution';
import type { AppDistributionInternal, WithModularDeprecationArg } from './types/internal';

export type { Statics } from './types/app-distribution';

export type FirebaseAppDistribution = AppDistribution;

/**
 * Get an App Distribution instance for the specified app or current app.
 */
export function getAppDistribution(app?: ReactNativeFirebase.FirebaseApp): FirebaseAppDistribution {
  if (app) {
    return getApp(app.name).appDistribution() as FirebaseAppDistribution;
  }
  return getApp().appDistribution() as FirebaseAppDistribution;
}

/**
 * Returns true if the App Distribution tester is signed in.
 * If not an iOS device, it always rejects, as neither false nor true seem like a sensible default.
 */
export function isTesterSignedIn(appDistribution: FirebaseAppDistribution): Promise<boolean> {
  return (
    (appDistribution as AppDistributionInternal).isTesterSignedIn as WithModularDeprecationArg<
      AppDistributionInternal['isTesterSignedIn']
    >
  ).call(appDistribution, MODULAR_DEPRECATION_ARG);
}

/**
 * Sign-in the App Distribution tester
 * If not an iOS device, it always rejects, as no defaults seem sensible.
 */
export function signInTester(appDistribution: FirebaseAppDistribution): Promise<void> {
  return (
    (appDistribution as AppDistributionInternal).signInTester as WithModularDeprecationArg<
      AppDistributionInternal['signInTester']
    >
  ).call(appDistribution, MODULAR_DEPRECATION_ARG);
}

/**
 * Check to see whether a new distribution is available
 * If not an iOS device, it always rejects, as no default response seems sensible.
 */
export function checkForUpdate(
  appDistribution: FirebaseAppDistribution,
): Promise<AppDistributionRelease> {
  return (
    (appDistribution as AppDistributionInternal).checkForUpdate as WithModularDeprecationArg<
      AppDistributionInternal['checkForUpdate']
    >
  ).call(appDistribution, MODULAR_DEPRECATION_ARG);
}

/**
 * Sign out App Distribution tester
 * If not an iOS device, it always rejects, as no default response seems sensible.
 */
export function signOutTester(appDistribution: FirebaseAppDistribution): Promise<void> {
  return (
    (appDistribution as AppDistributionInternal).signOutTester as WithModularDeprecationArg<
      AppDistributionInternal['signOutTester']
    >
  ).call(appDistribution, MODULAR_DEPRECATION_ARG);
}
