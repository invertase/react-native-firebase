import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/lib/common';
/**
 * @typedef {import("..").FirebaseApp} FirebaseApp
 * @typedef {import("..").FirebaseAppDistributionTypes.AppDistributionRelease} AppDistributionRelease
 * @typedef {import("..").FirebaseAppDistributionTypes.Module} FirebaseAppDistribution
 */

/**
 * @param {FirebaseApp | undefined} app
 * @returns {FirebaseAppDistribution}
 */
export function getAppDistribution(app) {
  if (app) {
    return getApp(app.name).appDistribution(app);
  }
  return getApp().appDistribution();
}

/**
 * @param {FirebaseAppDistribution} appDistribution
 * @returns {Promise<boolean>}
 */
export function isTesterSignedIn(appDistribution) {
  return appDistribution.isTesterSignedIn.call(appDistribution, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {FirebaseAppDistribution} appDistribution
 * @returns {Promise<void>}
 */
export function signInTester(appDistribution) {
  return appDistribution.signInTester.call(appDistribution, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {FirebaseAppDistribution} appDistribution
 * @returns {AppDistributionRelease>}
 */
export function checkForUpdate(appDistribution) {
  return appDistribution.checkForUpdate.call(appDistribution, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {FirebaseAppDistribution} appDistribution
 * @returns {Promise<void>}
 */
export function signOutTester(appDistribution) {
  return appDistribution.signOutTester.call(appDistribution, MODULAR_DEPRECATION_ARG);
}
