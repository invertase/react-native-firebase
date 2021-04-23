import FirebaseAppImpl from '../implementations/firebaseApp';
import { isObject, isOptionalBoolean, isOptionalString, isString } from '.';
import { FirebaseApp, FirebaseAppConfig, FirebaseOptions } from '../types';

/**
 * Checks whether a provided value is a FirebaseAppImpl.
 * @param app
 * @returns
 */
export function isFirebaseApp(app: unknown): app is FirebaseApp {
  return app instanceof FirebaseAppImpl;
}

/**
 * Checks whether a provided value is a valid FirebaseOptions type.
 *
 * @param options
 * @returns
 */
export function isFirebaseOptions(options: unknown): options is FirebaseOptions {
  if (!isObject(options)) {
    return false;
  }

  return (
    isString(options.apiKey) &&
    isString(options.appId) &&
    isString(options.databaseURL) &&
    isString(options.messagingSenderId) &&
    isString(options.projectId) &&
    isOptionalString(options.authDomain) &&
    isOptionalString(options.storageBucket) &&
    isOptionalString(options.measurementId) &&
    isOptionalString(options.androidClientId) &&
    isOptionalString(options.clientId) &&
    isOptionalString(options.deepLinkURLScheme)
  );
}

/**
 * Checks whether a provided value is a valid FirebaseOptions type.
 *
 * @param config
 * @returns
 */
export function isFirebaseAppConfig(config: unknown): config is FirebaseAppConfig {
  if (!isObject(config)) {
    return false;
  }

  return (
    isOptionalString(config.name) &&
    isOptionalBoolean(config.automaticDataCollectionEnabled) &&
    isOptionalBoolean(config.automaticResourceManagement)
  );
}
