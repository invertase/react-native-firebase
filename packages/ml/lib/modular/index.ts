import { getApp } from '@react-native-firebase/app';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type { FirebaseMLTypes } from '..';

type FirebaseApp = ReactNativeFirebase.FirebaseApp;
type FirebaseML = FirebaseMLTypes.Module;

/**
 * Returns the existing default {@link FirebaseML} instance that is associated with the
 * default {@link @firebase/app!FirebaseApp}. If no instance exists, initializes a new
 * instance with default settings.
 *
 * @returns The {@link FirebaseML} instance of the provided app.
 */
export function getML(app?: FirebaseApp): FirebaseML {
  if (app) {
    return getApp(app.name).ml();
  }
  return getApp().ml();
}
