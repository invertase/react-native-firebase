import { defaultAppName } from './common';
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

  const app = new FirebaseAppImpl(name, options, !!config?.automaticDataCollectionEnabled);
  await bridge.module.initializeApp(options, { name });

  apps.set(name, app);
  return app;
}
