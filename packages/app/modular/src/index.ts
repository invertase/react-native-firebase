import * as impl from './impl';
import { FirebaseApp, FirebaseAppConfig, FirebaseOptions } from './types';
import { ArgumentError, defaultAppName, isBoolean, isString, isUndefined, Mutable } from './common';
import { defaultAppNotInitialized, invalidApp, noApp, noDefaultAppDelete } from './errors';
import { isFirebaseApp, isFirebaseAppConfig, isFirebaseOptions } from './validation';

export * from './types';

/**
 * The current SDK version.
 */
export const SDK_VERSION = impl.SDK_VERSION;

/**
 * Renders this app unusable and frees the resources of all associated services.
 *
 * @param app
 * @returns
 */
export async function deleteApp(app: FirebaseApp): Promise<void> {
  if (!isFirebaseApp(app)) {
    throw invalidApp();
  }

  if (app.name === defaultAppName) {
    throw noDefaultAppDelete();
  }

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
    if (!name || name === defaultAppName) {
      throw defaultAppNotInitialized();
    }

    throw noApp(name);
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

/**
 * Creates and initializes a FirebaseApp instance.
 *
 * @param options Options to configure the app's services.
 * @param name Optional name of the app to initialize. If no name is provided, the default is "[DEFAULT]".
 */
export function initializeApp(options: FirebaseOptions, name?: string): Promise<FirebaseApp>;

/**
 * Creates and initializes a FirebaseApp instance.
 *
 * @param options Options to configure the app's services.
 * @param config FirebaseApp Configuration.
 */
export function initializeApp(
  options: FirebaseOptions,
  config?: FirebaseAppConfig,
): Promise<FirebaseApp>;

/**
 * @param options
 * @param nameOrConfig
 * @returns
 */
export async function initializeApp(
  options: FirebaseOptions,
  nameOrConfig?: string | FirebaseAppConfig,
): Promise<FirebaseApp> {
  if (!isFirebaseOptions(options)) {
    throw new ArgumentError('options', 'Expected a FirebaseOptions object');
  }

  if (isUndefined(nameOrConfig)) {
    return impl.initializeApp(options);
  }

  if (isString(nameOrConfig)) {
    return impl.initializeApp(options, {
      name: nameOrConfig,
    });
  }

  if (!isFirebaseAppConfig(nameOrConfig)) {
    throw new ArgumentError('config', 'Expected a FirebaseAppConfig object');
  }

  return impl.initializeApp(options, nameOrConfig);
}

export async function setAutomaticDataCollectionEnabled(
  app: FirebaseApp,
  enabled: boolean,
): Promise<void> {
  if (!isFirebaseApp(app)) {
    throw invalidApp();
  }

  if (!isBoolean(enabled)) {
    throw new ArgumentError('enabled', 'Expected a boolean value');
  }

  // Calling `getApp` validates there is actually an app which hasn't since been deleted.
  await impl.setAutomaticDataCollectionEnabled(getApp(app.name).name, enabled);

  // Update the current app instance.
  const mutable = app as Mutable<FirebaseApp>;
  mutable.automaticDataCollectionEnabled = enabled;
}
