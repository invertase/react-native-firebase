import {
  getApp,
  getRemoteConfig,
  activate,
  ensureInitialized,
  fetchAndActivate,
  fetchConfig,
  getAll,
  makeIDBAvailable,
} from '@react-native-firebase/app/lib/internal/web/firebaseRemoteConfig';
import { guard } from '@react-native-firebase/app/lib/internal/web/utils';

let configSettingsForInstance = {
  // [APP_NAME]: RemoteConfigSettings
};
let defaultConfigForInstance = {
  // [APP_NAME]: { [key: string]: string | number | boolean }
};

function makeGlobalsAvailable() {
  navigator.onLine = true;
  makeIDBAvailable();
}

function getRemoteConfigInstanceForApp(appName, overrides /*: RemoteConfigSettings */) {
  makeGlobalsAvailable();
  const configSettings = configSettingsForInstance[appName] ?? {
    minimumFetchIntervalMillis: 43200000,
    fetchTimeoutMillis: 60000,
  };
  const defaultConfig = defaultConfigForInstance[appName] ?? {};
  Object.assign(configSettings, overrides);
  const app = getApp(appName);
  const instance = getRemoteConfig(app);
  for (const key in configSettings) {
    instance.settings[key] = configSettings[key];
  }
  instance.defaultConfig = defaultConfig;
  return instance;
}

async function resultAndConstants(instance, result) {
  const response = { result };
  const valuesRaw = getAll(instance);
  const values = {};
  for (const key in valuesRaw) {
    const raw = valuesRaw[key];
    values[key] = {
      source: raw.getSource(),
      value: raw.asString(),
    };
  }
  response.constants = {
    values,
    lastFetchTime: instance.fetchTimeMillis === -1 ? 0 : instance.fetchTimeMillis,
    lastFetchStatus: instance.lastFetchStatus.replace(/-/g, '_'),
    minimumFetchInterval: instance.settings.minimumFetchIntervalMillis
      ? instance.settings.minimumFetchIntervalMillis / 1000
      : 43200,
    fetchTimeout: instance.settings.fetchTimeoutMillis
      ? instance.settings.fetchTimeoutMillis / 1000
      : 60,
  };
  return response;
}

export default {
  activate(appName) {
    return guard(async () => {
      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      return resultAndConstants(remoteConfig, await activate(remoteConfig));
    });
  },
  setConfigSettings(appName, settings) {
    return guard(async () => {
      configSettingsForInstance[appName] = {
        minimumFetchIntervalMillis: settings.minimumFetchInterval * 1000,
        fetchTimeoutMillis: settings.fetchTimeout * 1000,
      };
      const remoteConfig = getRemoteConfigInstanceForApp(appName, settings);
      return resultAndConstants(remoteConfig, null);
    });
  },
  fetch(appName, expirationDurationSeconds) {
    return guard(async () => {
      let overrides = {};
      if (expirationDurationSeconds != -1) {
        overrides.minimumFetchIntervalMillis = expirationDurationSeconds * 1000;
      }
      const remoteConfig = getRemoteConfigInstanceForApp(appName, overrides);
      await fetchConfig(remoteConfig);
      return resultAndConstants(remoteConfig, null);
    });
  },
  fetchAndActivate(appName) {
    return guard(async () => {
      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      const activated = await fetchAndActivate(remoteConfig);
      return resultAndConstants(remoteConfig, activated);
    });
  },
  ensureInitialized(appName) {
    return guard(async () => {
      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      await ensureInitialized(remoteConfig);
      return resultAndConstants(remoteConfig, null);
    });
  },
  setDefaults(appName, defaults) {
    return guard(async () => {
      defaultConfigForInstance[appName] = defaults;
      const remoteConfig = getRemoteConfigInstanceForApp(appName);
      return resultAndConstants(remoteConfig, null);
    });
  },
};
