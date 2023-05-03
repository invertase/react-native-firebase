import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseInstallationsTypes } from '../index';

export function getInstallations(
  app?: ReactNativeFirebase.FirebaseApp,
): FirebaseInstallationsTypes.Module;

export function deleteInstallations(
  installations?: FirebaseInstallationsTypes.Module,
): Promise<void>;
