import { defaultAppName, Mutable } from './common';
import { FirebaseApp, FirebaseAppConfig, FirebaseOptions } from './types';
import { bridge } from './internal/bridge';
import { apps, initializeNativeApps } from './internal/registry';
import { defaultAppNotInitialized, noApp } from './errors';
import FirebaseAppImpl from './implementations/firebaseApp';

export const SDK_VERSION = 'TODO';

export async function deleteApp(name: string) {
  const app = getApp(name);

  if (!app) {
    return;
  }

  await bridge.module.deleteApp(name);
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
  const name = config?.name ?? defaultAppName;

  if (apps.has(name)) {
    throw new Error('Already initialized!');
  }

  const app = new FirebaseAppImpl(name, options, {
    automaticDataCollectionEnabled: config?.automaticDataCollectionEnabled,
    automaticResourceManagement: config?.automaticResourceManagement,
  });

  await bridge.module.initializeApp(app.options, {
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
    await bridge.module.setAutomaticDataCollectionEnabled(name, enabled);

    // Update the internal app instance with the new property.
    apps.set(app.name, mutable);
  }
}
