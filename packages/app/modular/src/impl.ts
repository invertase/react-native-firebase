import * as delegate from 'firebase/app';
import { FirebaseApp, FirebaseAppConfig, FirebaseOptions } from './types';
import FirebaseAppImpl from './implementations/firebaseApp';
import { defaultAppName, guard } from './internal';
import { duplicateApp } from './errors';

/**
 * Converts a `web.FirebaseApp` into `FirebaseApp`.
 *
 * @param app
 * @returns
 */
function convertFirebaseApp(app: delegate.FirebaseApp): FirebaseApp {
  return new FirebaseAppImpl(app.name, convertFirebaseOptions(app.options), {
    automaticDataCollectionEnabled: app.automaticDataCollectionEnabled,
    automaticResourceManagement: false, // Not applicable to web.
  });
}

/**
 * Converts a `web.FirebaseOptions` into `FirebaseOptions`.
 *
 * @param app
 * @returns
 */
function convertFirebaseOptions(options: delegate.FirebaseOptions): FirebaseOptions {
  return {
    ...options,
    apiKey: options.apiKey || '',
    appId: options.appId || '',
    databaseURL: options.databaseURL || '',
    messagingSenderId: options.messagingSenderId || '',
    projectId: options.projectId || '',
    storageBucket: options.storageBucket || '',
  };
}

/**
 * Finds a `web.FirebaseApp` by name.
 *
 * Using `web.getApp()` throws an error if not found, so this is a safe check.
 *
 * @param name
 * @returns
 */
function getFirebaseApp(name = defaultAppName): delegate.FirebaseApp | undefined {
  return delegate.getApps().find(app => app.name === name);
}

export { SDK_VERSION } from 'firebase/app';

export async function deleteApp(name: string) {
  const app = getFirebaseApp(name);

  if (!app) {
    return;
  }

  return guard(delegate.deleteApp(app));
}

export function getApp(name?: string): FirebaseApp | undefined {
  // Find via the `getApps` array rather than via `getApp` so no error is thrown.
  const app = getFirebaseApp(name);
  return app ? convertFirebaseApp(app) : undefined;
}

export function getApps(): FirebaseApp[] {
  return delegate.getApps().map(convertFirebaseApp);
}

export function initializeApp(options: FirebaseOptions, config?: FirebaseAppConfig): FirebaseApp {
  const exists = getApp(config?.name ?? defaultAppName);

  if (exists) {
    throw duplicateApp(exists.name);
  }

  const app = delegate.initializeApp(options, config);
  return convertFirebaseApp(app);
}

export async function setAutomaticDataCollectionEnabled(
  name: string,
  enabled: boolean,
): Promise<void> {
  const app = getFirebaseApp(name);

  if (app) {
    app.automaticDataCollectionEnabled = enabled;
  }
}
