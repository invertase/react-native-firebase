import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type { Installations } from './types/installations';
import type { InstallationsInternal, WithModularDeprecationArg } from './types/internal';

export type { Statics } from './types/installations';

/**
 * Returns an instance of Installations associated with the given FirebaseApp instance.
 */
export function getInstallations(app?: ReactNativeFirebase.FirebaseApp): Installations {
  if (app) {
    return getApp(app.name).installations() as Installations;
  }
  return getApp().installations() as Installations;
}

/**
 * Deletes the Firebase Installation and all associated data.
 */
export function deleteInstallations(installations: Installations): Promise<void> {
  return (
    (installations as InstallationsInternal).delete as WithModularDeprecationArg<
      InstallationsInternal['delete']
    >
  ).call(installations, MODULAR_DEPRECATION_ARG);
}

/**
 * Creates a Firebase Installation if there isn't one for the app and returns the Installation ID.
 */
export function getId(installations: Installations): Promise<string> {
  return (
    (installations as InstallationsInternal).getId as WithModularDeprecationArg<
      InstallationsInternal['getId']
    >
  ).call(installations, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a Firebase Installations auth token, identifying the current Firebase Installation.
 */
export function getToken(installations: Installations, forceRefresh?: boolean): Promise<string> {
  return (
    (installations as InstallationsInternal).getToken as WithModularDeprecationArg<
      InstallationsInternal['getToken']
    >
  ).call(installations, forceRefresh, MODULAR_DEPRECATION_ARG);
}

/**
 * Throw an error since react-native-firebase does not support this method.
 *
 * Sets a new callback that will get called when Installation ID changes. Returns an unsubscribe function that will remove the callback when called.
 */
export function onIdChange(
  _installations: Installations,
  _callback: (installationId: string) => void,
): () => void {
  throw new Error('onIdChange() is unsupported by the React Native Firebase SDK.');
}
