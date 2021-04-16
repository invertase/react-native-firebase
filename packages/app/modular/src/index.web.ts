import firebase from 'firebase/app';
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
  try {
    return convertJsApp(firebase.app(name));
  } catch {
    // Throw generic error handler if not exists
  }
}

export function initalizeApp(options: FirebaseOptions, name?: string): FirebaseApp;

export function initalizeApp(options: FirebaseOptions, conifg?: FirebaseAppConfig): FirebaseApp;

export function initalizeApp(
  options: FirebaseOptions,
  nameOrConfig?: string | FirebaseAppConfig,
): FirebaseApp {
  console.log(options);
  console.log(nameOrConfig);
  return {} as FirebaseApp;
}
