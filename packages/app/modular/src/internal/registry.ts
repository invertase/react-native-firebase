import FirebaseAppImpl from '../implementations/firebaseApp';
import { FirebaseApp } from '../types';
import { bridge } from './bridge';

export const apps = new Map<string, FirebaseApp>();

let _initializedNativeApps = false;

export function initializeNativeApps(): void {
  if (_initializedNativeApps) {
    return;
  }

  const nativeApps = bridge.module.NATIVE_FIREBASE_APPS;

  for (const app of nativeApps) {
    const { appConfig, options } = app;
    apps.set(
      appConfig.name,
      new FirebaseAppImpl(appConfig.name, options, {
        automaticDataCollectionEnabled: appConfig.automaticDataCollectionEnabled,
      }),
    );
  }

  _initializedNativeApps = true;
}
