import { defaultAppName, Mutable } from './internal';
import { FirebaseApp, FirebaseAppConfig, FirebaseOptions } from './types';
import { defaultAppNotInitialized, duplicateApp, noApp } from './errors';
import FirebaseAppImpl from './implementations/firebaseApp';
import { getNativeModule } from './internal/native/module.native';

interface AppModule {
  readonly NATIVE_FIREBASE_APPS: NativeFirebaseApp[];
  readonly FIREBASE_RAW_JSON: string;
  deleteApp(name: string): Promise<void>;
  initializeApp(options: FirebaseOptions, config: FirebaseAppConfig): Promise<void>;
  setAutomaticDataCollectionEnabled(name: string, enabled: boolean): Promise<void>;
}

type NativeFirebaseApp = {
  /**
   * `automaticResourceManagement` is not a readable value on the native SDKs. It is only settable when creating secondary apps.
   */
  appConfig: Required<Omit<FirebaseAppConfig, 'automaticResourceManagement'>>;
  options: FirebaseOptions;
};

const delegate = () =>
  getNativeModule<AppModule>({
    namespace: 'app',
    nativeModule: 'RNFBAppModule',
  });

/**
 * A `Map` containing all `FirebaseApp` instance, stored by their name.
 */
const apps = new Map<string, FirebaseApp>();

/**
 * Private boolean value representing whether native apps have been initialized.
 */
let _initializedNativeApps = false;

/**
 * Native provides all initially created `FirebaseApp` instances during build time,
 * meaning they've been made available via native mechanisms (e.g. `google-services.json`).
 *
 * This function maps the returned native objects into a `FirebaseApp`, so they're readily
 * available for the user to consume.
 *
 * This function is idempotent and will only trigger this functionality once.
 *
 * @returns void
 */
function initializeNativeApps(): void {
  if (_initializedNativeApps) {
    return;
  }

  const nativeApps = delegate().module.NATIVE_FIREBASE_APPS;

  for (const app of nativeApps) {
    const { appConfig, options } = app;
    apps.set(
      appConfig.name,
      new FirebaseAppImpl(appConfig.name, options, {
        automaticDataCollectionEnabled: appConfig.automaticDataCollectionEnabled,
      }),
    );
  }

  _initializedNativeApps = true;
}

export const SDK_VERSION = 'TODO';

export async function deleteApp(name: string) {
  const app = getApp(name);

  if (!app) {
    return;
  }

  await delegate().module.deleteApp(name);
  apps.delete(name);
}

export function getApp(name = defaultAppName): FirebaseApp | undefined {
  initializeNativeApps();

  if (!apps.has(name)) {
    if (name === defaultAppName) {
      throw defaultAppNotInitialized();
    }

    throw noApp(name);
  }

  return apps.get(name);
}

export function getApps(): FirebaseApp[] {
  initializeNativeApps();
  return Array.from(apps.values());
}

export async function initializeApp(
  options: FirebaseOptions,
  config?: FirebaseAppConfig,
): Promise<FirebaseApp> {
  initializeNativeApps();
  const name = config?.name ?? defaultAppName;

  if (apps.has(name)) {
    throw duplicateApp(name);
  }

  const app = new FirebaseAppImpl(name, options, {
    automaticDataCollectionEnabled: config?.automaticDataCollectionEnabled,
    automaticResourceManagement: config?.automaticResourceManagement,
  });

  await delegate().module.initializeApp(app.options, {
    name: app.name,
    automaticDataCollectionEnabled: app.automaticDataCollectionEnabled,
    automaticResourceManagement: app.automaticResourceManagement,
  });

  apps.set(name, app);
  return app;
}

export async function setAutomaticDataCollectionEnabled(
  name: string,
  enabled: boolean,
): Promise<void> {
  const app = getApp(name);

  if (app) {
    const mutable = app as Mutable<FirebaseApp>;
    mutable.automaticDataCollectionEnabled = enabled;
    await delegate().module.setAutomaticDataCollectionEnabled(name, enabled);

    // Update the internal app instance with the new property.
    apps.set(app.name, mutable);
  }
}
