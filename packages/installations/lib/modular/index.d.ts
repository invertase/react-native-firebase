import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseInstallationsTypes } from '../index';

/**
 * Returns an instance of Installations associated with the given FirebaseApp instance.
 */
export function getInstallations(
  app?: ReactNativeFirebase.FirebaseApp,
): FirebaseInstallationsTypes.Module;

/**
 * Deletes the Firebase Installation and all associated data.
 */
export function deleteInstallations(
  installations?: FirebaseInstallationsTypes.Module,
): Promise<void>;
