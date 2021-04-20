import * as web from 'firebase/app';
import FirebaseAppImpl from './implementations/firebaseApp';
import { isObject } from './common';

/**
 * Checks whether a provided value is a FirebaseAppImpl.
 * @param app
 * @returns
 */
export function isFirebaseApp(app: any): app is FirebaseApp {
  return app instanceof FirebaseAppImpl;
}

/**
 * Checks whether a provided value is a valid FirebaseOptions type.
 *
 * @param options
 * @returns
 */
export function isFirebaseOptions(options: any): options is FirebaseOptions {
  return isObject(options);
}

/**
 * Checks whether a provided value is a valid FirebaseOptions type.
 *
 * @param config
 * @returns
 */
export function isFirebaseAppConfig(config: any): config is FirebaseAppConfig {
  return isObject(config);
}

export interface FirebaseApp extends web.FirebaseApp {
  readonly options: FirebaseOptions;
  automaticDataCollectionEnabled: boolean;
  automaticResourceManagement: boolean;
}

export interface FirebaseOptions extends web.FirebaseOptions {
  readonly androidClientId?: string;
  readonly clientId?: string;
  readonly deepLinkURLScheme?: string;
}

export interface FirebaseAppConfig extends web.FirebaseAppConfig {
  readonly automaticResourceManagement?: boolean;
}
