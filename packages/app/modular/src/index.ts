import * as impl from './impl';
import { FirebaseApp, FirebaseAppConfig, FirebaseOptions } from './types';

export * from './types';

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

export function initalizeApp(options: FirebaseOptions, name?: string): FirebaseApp;

export function initalizeApp(options: FirebaseOptions, conifg?: FirebaseAppConfig): FirebaseApp;

export function initalizeApp(
  options: FirebaseOptions,
  nameOrConfig?: string | FirebaseAppConfig,
): FirebaseApp {
  // if (isUndefined(options) || !isFirebaseOptions(options)) {
  //   throw new Error('Options cannot be undefined');
  // }

  return {} as FirebaseApp;
}
