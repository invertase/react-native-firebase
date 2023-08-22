import { firebase } from '..';

/**
 * @param {import('@react-native-firebase/app').ReactNativeFirebase.FirebaseApp | undefined} app
 * @returns {import('.').AppDistribution}
 */
export function getAppDistribution(app) {
  if (app) {
    return firebase.appDistribution(app);
  }
  return firebase.appDistribution();
}

/**
 * @param {import('.').AppDistribution} appDistribution
 * @returns {Promise<boolean>}
 */
export function isTesterSignedIn(appDistribution) {
  return appDistribution.isTesterSignedIn();
}

/**
 * @param {import('.').AppDistribution} appDistribution
 * @returns {Promise<void>}
 */
export function signInTester(appDistribution) {
  return appDistribution.signInTester();
}

/**
 * @param {import('.').AppDistribution} appDistribution
 * @returns {Promise<import('..').FirebaseAppDistributionTypes.AppDistributionRelease>}
 */
export function checkForUpdate(appDistribution) {
  return appDistribution.checkForUpdate();
}

/**
 * @param {import('.').AppDistribution} appDistribution
 * @returns {Promise<void>}
 */
export function signOutTester(appDistribution) {
  return appDistribution.signOutTester();
}
