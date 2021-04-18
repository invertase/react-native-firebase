import * as web from 'firebase/app';
import { FirebaseApp, FirebaseOptions } from './types';

function convertFirebaseApp(app: web.FirebaseApp): FirebaseApp {
  return {
    name: app.name,
    options: app.options,
    automaticDataCollectionEnabled: app.automaticDataCollectionEnabled,
  };
}

export function getApp(name = '[DEFAULT]'): FirebaseApp | undefined {
  // Find via the `getApps` array rather than via `getApp` so no error is thrown.
  const app = web.getApps().find(app => app.name === name);

  if (app) {
    return convertFirebaseApp(app);
  }

  return;
}
