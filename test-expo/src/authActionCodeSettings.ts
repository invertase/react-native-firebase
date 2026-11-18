import { getApp } from '@react-native-firebase/app';
import type { ActionCodeSettings } from '@react-native-firebase/auth';

/**
 * `ActionCodeSettings` used by the email controls on the auth screens. Matches the object on the
 * Auth usage docs page ("Email action link settings"), using this example app's bundle ID and
 * package name from `app.json`.
 */
export function getExampleActionCodeSettings(): ActionCodeSettings {
  return {
    url: `https://${getApp().options.projectId}.firebaseapp.com/finishAction`,
    handleCodeInApp: true,
    iOS: {
      bundleId: 'io.invertase.testing',
    },
    android: {
      packageName: 'com.invertase.testing',
      installApp: true,
      minimumVersion: '12',
    },
  };
}
