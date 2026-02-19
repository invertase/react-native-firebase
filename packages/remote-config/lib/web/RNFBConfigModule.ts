import '../polyfills';

import {
  getApp,
  getRemoteConfig,
  activate,
  ensureInitialized,
  fetchAndActivate,
  fetchConfig,
  getAll,
  makeIDBAvailable,
  onConfigUpdate,
  setCustomSignals,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseRemoteConfig';

import {
  guard,
  getWebError,
  emitEvent,
} from '@react-native-firebase/app/dist/module/internal/web/utils';

import type { FirebaseRemoteConfigTypes } from '../types/namespaced';

type RemoteConfigInstance = FirebaseRemoteConfigTypes.Module & {
  settings: Record<string, number>;
  defaultConfig: FirebaseRemoteConfigTypes.ConfigDefaults;
  fetchTimeMillis: number;
  lastFetchStatus: string;
};

const configSettingsForInstance: Record<
  string,
  { minimumFetchIntervalMillis: number; fetchTimeoutMillis: number }
> = {};

const defaultConfigForInstance: Record<string, FirebaseRemoteConfigTypes.ConfigDefaults> = {};

function makeGlobalsAvailable(): void {
  (navigator as { onLine?: boolean }).onLine = true;
  makeIDBAvailable();
}

const onConfigUpdateListeners: Record<string, () => void> = {};

function getRemoteConfigInstanceForApp(
  appName: string,
  overrides?: Record<string, number>,
): RemoteConfigInstance {
  makeGlobalsAvailable();
  const configSettings = configSettingsForInstance[appName] ?? {
    minimumFetchIntervalMillis: 43200000,
    fetchTimeoutMillis: 60000,
  };

  const defaultConfig = defaultConfigForInstance[appName] ?? {};

  if (overrides) {
    Object.assign(configSettings, overrides);
  }

  const app = getApp(appName);
  const instance = getRemoteConfig(app) as unknown as RemoteConfigInstance;

  for (const key in configSettings) {
    (instance.settings as Record<string, number>)[key] =
      configSettings[key as keyof typeof configSettings];
  }

  instance.defaultConfig = defaultConfig;
  return instance;
}

async function resultAndConstants(
  instance: RemoteConfigInstance,
  result: unknown,
): Promise<{ result: unknown; constants: Record<string, unknown> }> {
  const response: { result: unknown; constants: Record<string, unknown> } = {
    result,
    constants: {},
  };

  const valuesRaw = getAll(instance as any);
  const values: Record<string, { source: string; value: string }> = {};

  for (const key in valuesRaw) {
    const raw = valuesRaw[key];

    if (raw) {
      values[key] = {
        source: raw.getSource(),
        value: raw.asString(),
      };
    }
  }

  const settings = instance.settings as {
    minimumFetchIntervalMillis?: number;
    fetchTimeoutMillis?: number;
  };

  response.constants = {
    values,
    lastFetchTime: instance.fetchTimeMillis === -1 ? 0 : instance.fetchTimeMillis,
    lastFetchStatus: (instance.lastFetchStatus as string).replace(/-/g, '_'),
    minimumFetchInterval: settings.minimumFetchIntervalMillis
      ? settings.minimumFetchIntervalMillis / 1000
      : 43200,
    fetchTimeout: settings.fetchTimeoutMillis ? settings.fetchTimeoutMillis / 1000 : 60,
  };

  return response;
}

export default {
  activate(appName: string) {
    return guard(async () => {
      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      return resultAndConstants(remoteConfig, await activate(remoteConfig as any));
    });
  },

  setConfigSettings(
    appName: string,
    settings: { minimumFetchInterval: number; fetchTimeout: number },
  ) {
    return guard(async () => {
      configSettingsForInstance[appName] = {
        minimumFetchIntervalMillis: settings.minimumFetchInterval * 1000,
        fetchTimeoutMillis: settings.fetchTimeout * 1000,
      };
      const remoteConfig = getRemoteConfigInstanceForApp(appName, settings);
      return resultAndConstants(remoteConfig, null);
    });
  },

  fetch(appName: string, expirationDurationSeconds: number) {
    return guard(async () => {
      let overrides: Record<string, number> = {};
      if (expirationDurationSeconds !== -1) {
        overrides = { minimumFetchIntervalMillis: expirationDurationSeconds * 1000 };
      }
      const remoteConfig = getRemoteConfigInstanceForApp(appName, overrides);
      await fetchConfig(remoteConfig as any);
      return resultAndConstants(remoteConfig, null);
    });
  },

  fetchAndActivate(appName: string) {
    return guard(async () => {
      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      const activated = await fetchAndActivate(remoteConfig as any);
      return resultAndConstants(remoteConfig, activated);
    });
  },

  ensureInitialized(appName: string) {
    return guard(async () => {
      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      await ensureInitialized(remoteConfig as any);
      return resultAndConstants(remoteConfig, null);
    });
  },

  setDefaults(appName: string, defaults: FirebaseRemoteConfigTypes.ConfigDefaults) {
    return guard(async () => {
      defaultConfigForInstance[appName] = defaults;
      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      return resultAndConstants(remoteConfig, null);
    });
  },

  setCustomSignals(appName: string, customSignals: Record<string, string | number | null>) {
    return guard(async () => {
      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      await setCustomSignals(remoteConfig as any, customSignals);
      return resultAndConstants(remoteConfig, null);
    });
  },

  onConfigUpdated(appName: string): void {
    if (onConfigUpdateListeners[appName]) {
      return;
    }

    const remoteConfig = getRemoteConfigInstanceForApp(appName);

    const nativeObserver = {
      next: (configUpdate: { getUpdatedKeys: () => Set<string> }) => {
        emitEvent('on_config_updated', {
          appName,
          resultType: 'success',
          updatedKeys: Array.from(configUpdate.getUpdatedKeys()),
        });
      },
      error: (firebaseError: unknown) => {
        emitEvent('on_config_updated', {
          appName,
          event: getWebError(firebaseError as Error & { code?: string }),
        });
      },
      complete: () => {},
    };

    onConfigUpdateListeners[appName] = onConfigUpdate(remoteConfig as any, nativeObserver);
  },

  removeConfigUpdateRegistration(appName: string): void {
    if (!onConfigUpdateListeners[appName]) {
      return;
    }
    onConfigUpdateListeners[appName]();
    delete onConfigUpdateListeners[appName];
  },
};
