import '../polyfills';
import {
  activate,
  ensureInitialized,
  fetchAndActivate,
  fetchConfig,
  getAll,
  getApp,
  getRemoteConfig,
  makeIDBAvailable,
  onConfigUpdate,
  setCustomSignals,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseRemoteConfig';
import {
  emitEvent,
  getWebError,
  guard,
} from '@react-native-firebase/app/dist/module/internal/web/utils';
import type { CustomSignals, RemoteConfig } from '../types/remote-config';
import type {
  NativeRemoteConfigConstants,
  NativeRemoteConfigResult,
  RNFBConfigModule,
} from '../types/internal';

interface WebRemoteConfigSettings {
  minimumFetchIntervalMillis: number;
  fetchTimeoutMillis: number;
}

type WebRemoteConfigSettingsOverrides = Partial<WebRemoteConfigSettings>;
type WebRemoteConfig = ReturnType<typeof getRemoteConfig>;
type RemoteConfigWithWebSettings = WebRemoteConfig &
  RemoteConfig & {
    settings: WebRemoteConfig['settings'] & WebRemoteConfigSettings;
  };

type ConfigSettingsForInstance = Partial<Record<string, WebRemoteConfigSettings>>;
type DefaultConfigForInstance = Partial<Record<string, Record<string, string | number | boolean>>>;
type ConfigUpdateListeners = Partial<Record<string, ReturnType<typeof onConfigUpdate>>>;

type WithAppName<F> = F extends (...args: infer P) => infer R
  ? (appName: string, ...args: P) => R
  : never;

interface RNFBConfigModuleWeb {
  activate: WithAppName<RNFBConfigModule['activate']>;
  setConfigSettings: WithAppName<RNFBConfigModule['setConfigSettings']>;
  fetch: WithAppName<RNFBConfigModule['fetch']>;
  fetchAndActivate: WithAppName<RNFBConfigModule['fetchAndActivate']>;
  ensureInitialized: WithAppName<RNFBConfigModule['ensureInitialized']>;
  setDefaults: WithAppName<RNFBConfigModule['setDefaults']>;
  setCustomSignals: WithAppName<RNFBConfigModule['setCustomSignals']>;
  onConfigUpdated: WithAppName<RNFBConfigModule['onConfigUpdated']>;
  removeConfigUpdateRegistration: WithAppName<RNFBConfigModule['removeConfigUpdateRegistration']>;
}

const DEFAULT_CONFIG_SETTINGS: WebRemoteConfigSettings = {
  minimumFetchIntervalMillis: 43200000,
  fetchTimeoutMillis: 60000,
};

const configSettingsForInstance: ConfigSettingsForInstance = {};
const defaultConfigForInstance: DefaultConfigForInstance = {};
const onConfigUpdateListeners: ConfigUpdateListeners = {};

function makeGlobalsAvailable(): void {
  (navigator as Navigator & { onLine: boolean }).onLine = true;
  makeIDBAvailable();
}

function getRemoteConfigInstanceForApp(
  appName: string,
  overrides: WebRemoteConfigSettingsOverrides = {},
): RemoteConfigWithWebSettings {
  makeGlobalsAvailable();

  const configSettings: WebRemoteConfigSettings = {
    ...(configSettingsForInstance[appName] ?? DEFAULT_CONFIG_SETTINGS),
    ...overrides,
  };
  const defaultConfig = defaultConfigForInstance[appName] ?? {};

  const app = getApp(appName);
  const instance = getRemoteConfig(app) as unknown as RemoteConfigWithWebSettings;

  Object.assign(instance.settings, configSettings);
  instance.defaultConfig = defaultConfig;

  return instance;
}

function toLastFetchStatus(
  status: string,
): NonNullable<NativeRemoteConfigConstants['lastFetchStatus']> {
  switch (status) {
    case 'success':
    case 'failure':
    case 'no_fetch_yet':
    case 'throttled':
      return status;
    case 'no-fetch-yet':
      return 'no_fetch_yet';
    case 'throttle':
      return 'throttled';
    default:
      return 'no_fetch_yet';
  }
}

function resultAndConstants<T>(
  instance: RemoteConfigWithWebSettings,
  result: T,
): NativeRemoteConfigResult<T> {
  const valuesRaw = getAll(instance);
  const values: NonNullable<NativeRemoteConfigConstants['values']> = {};

  for (const key in valuesRaw) {
    const raw = valuesRaw[key];

    if (raw) {
      values[key] = {
        source: raw.getSource(),
        value: raw.asString(),
      };
    }
  }

  return {
    result,
    constants: {
      values,
      lastFetchTime: instance.fetchTimeMillis === -1 ? 0 : instance.fetchTimeMillis,
      lastFetchStatus: toLastFetchStatus(instance.lastFetchStatus),
      minimumFetchInterval: instance.settings.minimumFetchIntervalMillis
        ? instance.settings.minimumFetchIntervalMillis / 1000
        : 43200,
      fetchTimeout: instance.settings.fetchTimeoutMillis
        ? instance.settings.fetchTimeoutMillis / 1000
        : 60,
    },
  };
}

const remoteConfigWebModule: RNFBConfigModuleWeb = {
  activate(appName) {
    return guard(async () => {
      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      return resultAndConstants(remoteConfig, await activate(remoteConfig));
    });
  },

  setConfigSettings(appName, settings) {
    return guard(async () => {
      const webSettings: WebRemoteConfigSettings = {
        minimumFetchIntervalMillis: settings.minimumFetchInterval * 1000,
        fetchTimeoutMillis: settings.fetchTimeout * 1000,
      };

      configSettingsForInstance[appName] = webSettings;

      const remoteConfig = getRemoteConfigInstanceForApp(appName, webSettings);
      return resultAndConstants(remoteConfig, undefined);
    });
  },

  fetch(appName, expirationDurationSeconds) {
    return guard(async () => {
      const overrides: WebRemoteConfigSettingsOverrides = {};

      if (expirationDurationSeconds !== -1) {
        overrides.minimumFetchIntervalMillis = expirationDurationSeconds * 1000;
      }

      const remoteConfig = getRemoteConfigInstanceForApp(appName, overrides);
      await fetchConfig(remoteConfig);

      return resultAndConstants(remoteConfig, undefined);
    });
  },

  fetchAndActivate(appName) {
    return guard(async () => {
      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      return resultAndConstants(remoteConfig, await fetchAndActivate(remoteConfig));
    });
  },

  ensureInitialized(appName) {
    return guard(async () => {
      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      await ensureInitialized(remoteConfig);

      return resultAndConstants(remoteConfig, undefined);
    });
  },

  setDefaults(appName, defaults) {
    return guard(async () => {
      defaultConfigForInstance[appName] = defaults;

      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      return resultAndConstants(remoteConfig, null);
    });
  },

  setCustomSignals(appName, customSignals: CustomSignals) {
    return guard(async () => {
      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      await setCustomSignals(remoteConfig, customSignals);

      return resultAndConstants(remoteConfig, undefined);
    });
  },

  onConfigUpdated(appName) {
    if (onConfigUpdateListeners[appName]) {
      return;
    }

    const remoteConfig = getRemoteConfigInstanceForApp(appName);
    const nativeObserver: Parameters<typeof onConfigUpdate>[1] = {
      next(configUpdate) {
        emitEvent('on_config_updated', {
          appName,
          resultType: 'success',
          updatedKeys: Array.from(configUpdate.getUpdatedKeys()),
        });
      },
      error(firebaseError) {
        emitEvent('on_config_updated', {
          appName,
          event: getWebError(firebaseError),
        });
      },
      complete() {},
    };

    onConfigUpdateListeners[appName] = onConfigUpdate(remoteConfig, nativeObserver);
  },

  removeConfigUpdateRegistration(appName) {
    const unsubscribe = onConfigUpdateListeners[appName];

    if (!unsubscribe) {
      return;
    }

    unsubscribe();
    delete onConfigUpdateListeners[appName];
  },
};

export default remoteConfigWebModule;
