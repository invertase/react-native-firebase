import * as web from 'firebase/app';
import { FirebaseApp, FirebaseAppConfig, FirebaseOptions } from './types';
import { FirebaseAppImpl } from './implementations/firebaseApp';
import { defaultAppName } from 'common';

function convertFirebaseApp(app: web.FirebaseApp): FirebaseApp {
  return new FirebaseAppImpl(app.name, app.options, app.automaticDataCollectionEnabled);
}

export async function deleteApp(name: string) {
  const app = getApp(name);

  if (!app) {
    return;
  }

  return web.deleteApp(app);
}

export function getApp(name = defaultAppName): FirebaseApp | undefined {
  // Find via the `getApps` array rather than via `getApp` so no error is thrown.
  const app = web.getApps().find(app => app.name === name);

  if (app) {
    return convertFirebaseApp(app);
  }

  return;
}

export function getApps(): FirebaseApp[] {
  return web.getApps().map(convertFirebaseApp);
}

export function initializeApp(options: FirebaseOptions, config?: FirebaseAppConfig): FirebaseApp {
  const app = web.initializeApp(options, config);
  return convertFirebaseApp(app);
}
