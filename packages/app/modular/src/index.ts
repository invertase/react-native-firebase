import * as impl from './impl';
import { FirebaseApp, FirebaseAppConfig, FirebaseOptions } from './types';

import { isString, isUndefined } from './common';

export * from './types';

export const SDK_VERSION = 'TODO';

/**
 * Renders this app unusable and frees the resources of all associated services.
 *
 * @param app
 * @returns
 */
export function deleteApp(app: FirebaseApp): Promise<void> {
  // TODO validate Firebase app
  return impl.deleteApp(app.name);
}

/**
 * Retrieves a FirebaseApp instance.
 *
 * When called with no arguments, the default app is returned. When an app name is provided, the app corresponding to that name is returned.
 *
 * @param name Optional name of the app to return. If no name is provided, the default is "[DEFAULT]".
 * @returns FirebaseApp
 */
export function getApp(name?: string): FirebaseApp {
  const app = impl.getApp(name);

  if (!app) {
    throw new Error('Could not find app!!!');
  }

  return app;
}

/**
 * A (read-only) array of all initialized apps.
 *
 * @returns
 */
export function getApps(): ReadonlyArray<FirebaseApp> {
  return impl.getApps();
}

export function initializeApp(options: FirebaseOptions, name?: string): FirebaseApp;

export function initializeApp(options: FirebaseOptions, conifg?: FirebaseAppConfig): FirebaseApp;

export function initializeApp(
  options: FirebaseOptions,
  nameOrConfig?: string | FirebaseAppConfig,
): FirebaseApp {
  if (isUndefined(options) || !isFirebaseOptions(options)) {
    throw new Error('Options cannot be undefined');
  }

  if (isString(nameOrConfig)) {
    return impl.initializeApp(options, {
      name: nameOrConfig,
    });
  }

  return impl.initializeApp(options, nameOrConfig);
}

/**
 * Sets log handler for all Firebase SDKs.
 */
export function onLog() {}

// https://firebase.google.com/docs/reference/js/v9/app.md#registerversion
// registerVersion?

export function setLogLevel() {}
