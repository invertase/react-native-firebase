import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type { Module } from './types/app-distribution';

export type FirebaseAppDistribution = Module;

/**
 * Get an App Distribution instance for the specified app or current app.
 */
export function getAppDistribution(app?: ReactNativeFirebase.FirebaseApp): FirebaseAppDistribution {
  if (app) {
    return getApp(app.name).appDistribution() as unknown as FirebaseAppDistribution;
  }
  return getApp().appDistribution() as unknown as FirebaseAppDistribution;
}

/**
 * Returns true if the App Distribution tester is signed in.
 * If not an iOS device, it always rejects, as neither false nor true seem like a sensible default.
 */
export function isTesterSignedIn(appDistribution: FirebaseAppDistribution): Promise<boolean> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return appDistribution.isTesterSignedIn.call(appDistribution, MODULAR_DEPRECATION_ARG);
}

/**
 * Sign-in the App Distribution tester
 * If not an iOS device, it always rejects, as no defaults seem sensible.
 */
export function signInTester(appDistribution: FirebaseAppDistribution): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return appDistribution.signInTester.call(appDistribution, MODULAR_DEPRECATION_ARG);
}

/**
 * Check to see whether a new distribution is available
 * If not an iOS device, it always rejects, as no default response seems sensible.
 */
export function checkForUpdate(
  appDistribution: FirebaseAppDistribution,
): Promise<import('./types/app-distribution').AppDistributionRelease> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return appDistribution.checkForUpdate.call(appDistribution, MODULAR_DEPRECATION_ARG);
}

/**
 * Sign out App Distribution tester
 * If not an iOS device, it always rejects, as no default response seems sensible.
 */
export function signOutTester(appDistribution: FirebaseAppDistribution): Promise<void> {
  // @ts-ignore - MODULAR_DEPRECATION_ARG is filtered out internally
  return appDistribution.signOutTester.call(appDistribution, MODULAR_DEPRECATION_ARG);
}
