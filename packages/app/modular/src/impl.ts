import * as web from 'firebase/app';
import { FirebaseApp, FirebaseAppConfig, FirebaseOptions } from './types';

function convertFirebaseApp(app: web.FirebaseApp): FirebaseApp {
  return {
    name: app.name,
    options: app.options,
    automaticDataCollectionEnabled: app.automaticDataCollectionEnabled,
  };
}

export async function deleteApp(name: string) {
  const app = getApp(name);

  if (!app || name === '[DEFAULT]') {
    return;
  }

  return web.deleteApp(app);
}

export function getApp(name = '[DEFAULT]'): FirebaseApp | undefined {
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
