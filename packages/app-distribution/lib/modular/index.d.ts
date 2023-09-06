import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseAppDistributionTypes } from '..';

export type FirebaseAppDistribution = FirebaseAppDistributionTypes.Module;

/**
 * Get an App Distribution instance for the specified app or current app.
 */
export declare function getAppDistribution(
  app?: ReactNativeFirebase.FirebaseApp,
): FirebaseAppDistribution;

/**
 * Returns true if the App Distribution tester is signed in.
 * If not an iOS device, it always rejects, as neither false nor true seem like a sensible default.
 */
export declare function isTesterSignedIn(
  appDistribution: FirebaseAppDistribution,
): Promise<boolean>;

/**
 * Sign-in the App Distribution tester
 * If not an iOS device, it always rejects, as no defaults seem sensible.
 */
export declare function signInTester(appDistribution: FirebaseAppDistribution): Promise<void>;

/**
 * Check to see whether a new distribution is available
 * If not an iOS device, it always rejects, as no default response seems sensible.
 */
export declare function checkForUpdate(
  appDistribution: FirebaseAppDistribution,
): Promise<FirebaseAppDistributionTypes.AppDistributionRelease>;

/**
 * Sign out App Distribution tester
 * If not an iOS device, it always rejects, as no default response seems sensible.
 */
export declare function signOutTester(appDistribution: FirebaseAppDistribution): Promise<void>;
