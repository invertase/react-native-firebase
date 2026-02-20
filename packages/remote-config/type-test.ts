import type { CustomSignals, FirebaseRemoteConfigTypes } from '@react-native-firebase/remote-config';
import remoteConfig, {
  firebase,
  getRemoteConfig,
  activate,
  ensureInitialized,
  fetchAndActivate,
  fetchConfig,
  getAll,
  getBoolean,
  getNumber,
  getString,
  getValue,
  setLogLevel,
  isSupported,
  fetchTimeMillis,
  settings,
  lastFetchStatus,
  reset,
  setConfigSettings,
  fetch,
  setDefaults,
  setDefaultsFromResource,
  onConfigUpdate,
  onConfigUpdated,
  setCustomSignals,
  LastFetchStatus,
  ValueSource,
} from '@react-native-firebase/remote-config';

// Root tsconfig resolves app from source; getFirebaseRoot() may not get remote-config augmentation.
type FirebaseRoot = {
  app(name?: string): { name: string; remoteConfig(): ReturnType<typeof getRemoteConfig> };
  remoteConfig: ((app?: { name: string }) => ReturnType<typeof getRemoteConfig>) & {
    SDK_VERSION: string;
    ValueSource: { REMOTE: string; DEFAULT: string; STATIC: string };
    LastFetchStatus: { SUCCESS: string; FAILURE: string; THROTTLED: string; NO_FETCH_YET: string };
  };
  SDK_VERSION?: string;
};
const _firebase = firebase as unknown as FirebaseRoot;

console.log(remoteConfig().app);

// checks module exists at root
console.log(_firebase.remoteConfig().app.name);
console.log(_firebase.remoteConfig().fetchTimeMillis);
console.log(_firebase.remoteConfig().lastFetchStatus);
console.log(_firebase.remoteConfig().settings);
console.log(_firebase.remoteConfig().defaultConfig);

// checks module exists at app level
console.log(_firebase.app().remoteConfig().app.name);

// checks statics exist
console.log(_firebase.remoteConfig.SDK_VERSION);
console.log(_firebase.remoteConfig.ValueSource.REMOTE);
console.log(_firebase.remoteConfig.ValueSource.DEFAULT);
console.log(_firebase.remoteConfig.ValueSource.STATIC);
console.log(_firebase.remoteConfig.LastFetchStatus.SUCCESS);
console.log(_firebase.remoteConfig.LastFetchStatus.FAILURE);
console.log(_firebase.remoteConfig.LastFetchStatus.THROTTLED);
console.log(_firebase.remoteConfig.LastFetchStatus.NO_FETCH_YET);

// checks statics exist on defaultExport
console.log((remoteConfig as unknown as { firebase: FirebaseRoot }).firebase.SDK_VERSION);

// checks root exists
console.log(_firebase.SDK_VERSION);

// checks multi-app support exists
console.log(_firebase.remoteConfig(_firebase.app()).app.name);

// checks default export supports app arg
console.log(remoteConfig(_firebase.app().name).app.name);

// checks Module instance APIs
const remoteConfigInstance = _firebase.remoteConfig();
console.log(remoteConfigInstance.app.name);
console.log(remoteConfigInstance.fetchTimeMillis);
console.log(remoteConfigInstance.lastFetchStatus);
console.log(remoteConfigInstance.settings);
console.log(remoteConfigInstance.defaultConfig);

remoteConfigInstance.setConfigSettings({
  minimumFetchIntervalMillis: 30000,
  fetchTimeoutMillis: 60000,
}).then(() => {
  console.log('Config settings set');
});

remoteConfigInstance.settings = {
  minimumFetchIntervalMillis: 60000,
  fetchTimeoutMillis: 60000,
};

remoteConfigInstance.setDefaults({ key: 'value' }).then(() => {
  console.log('Defaults set');
});

remoteConfigInstance.defaultConfig = { key: 'value' };

remoteConfigInstance.setDefaultsFromResource('config_resource').then(() => {
  console.log('Defaults from resource set');
});

const unsubscribeOnConfigUpdate = remoteConfigInstance.onConfigUpdate({
  next: (configUpdate: FirebaseRemoteConfigTypes.ConfigUpdate) => {
    console.log(configUpdate.getUpdatedKeys());
  },
  error: (error: any) => {
    console.log(error);
  },
  complete: () => {
    console.log('Complete');
  },
});
unsubscribeOnConfigUpdate();

const unsubscribeOnConfigUpdated = remoteConfigInstance.onConfigUpdated(
  (
    event?: { updatedKeys: string[] },
    error?: { code: string; message: string; nativeErrorMessage: string },
  ) => {
    if (event) {
      console.log(event.updatedKeys);
    }
    if (error) {
      console.log(error);
    }
  },
);
unsubscribeOnConfigUpdated();

remoteConfigInstance.activate().then((activated: boolean) => {
  console.log(activated);
});

remoteConfigInstance.ensureInitialized().then(() => {
  console.log('Initialized');
});

remoteConfigInstance.fetch().then(() => {
  console.log('Fetched');
});

remoteConfigInstance.fetch(300).then(() => {
  console.log('Fetched with expiration');
});

remoteConfigInstance.fetchAndActivate().then((activated: boolean) => {
  console.log(activated);
});

const allValues = remoteConfigInstance.getAll();
console.log(allValues);

const configValue = remoteConfigInstance.getValue('key');
console.log(configValue.getSource());
console.log(configValue.asBoolean());
console.log(configValue.asNumber());
console.log(configValue.asString());

console.log(remoteConfigInstance.getBoolean('key'));
console.log(remoteConfigInstance.getString('key'));
console.log(remoteConfigInstance.getNumber('key'));

remoteConfigInstance.reset().then(() => {
  console.log('Reset');
});

// checks modular API functions
const modularRemoteConfig1 = getRemoteConfig();
console.log(modularRemoteConfig1.app.name);

const modularRemoteConfig2 = getRemoteConfig(_firebase.app() as Parameters<typeof getRemoteConfig>[0]);
console.log(modularRemoteConfig2.app.name);

activate(modularRemoteConfig1).then((activated: boolean) => {
  console.log(activated);
});

ensureInitialized(modularRemoteConfig1).then(() => {
  console.log('Modular initialized');
});

fetchAndActivate(modularRemoteConfig1).then((activated: boolean) => {
  console.log(activated);
});

fetchConfig(modularRemoteConfig1).then(() => {
  console.log('Modular fetch config');
});

const modularAllValues = getAll(modularRemoteConfig1);
console.log(modularAllValues);

console.log(getBoolean(modularRemoteConfig1, 'key'));
console.log(getString(modularRemoteConfig1, 'key'));
console.log(getNumber(modularRemoteConfig1, 'key'));

const modularConfigValue = getValue(modularRemoteConfig1, 'key');
console.log(modularConfigValue.getSource());
console.log(modularConfigValue.asBoolean());

setLogLevel(modularRemoteConfig1, 'debug');
console.log(setLogLevel(modularRemoteConfig1, 'error'));

isSupported().then((supported: boolean) => {
  console.log(supported);
});

console.log(fetchTimeMillis(modularRemoteConfig1));
console.log(settings(modularRemoteConfig1));
console.log(lastFetchStatus(modularRemoteConfig1));

reset(modularRemoteConfig1).then(() => {
  console.log('Modular reset');
});

setConfigSettings(modularRemoteConfig1, {
  minimumFetchIntervalMillis: 30000,
  fetchTimeoutMillis: 60000,
}).then(() => {
  console.log('Modular config settings set');
});

fetch(modularRemoteConfig1).then(() => {
  console.log('Modular fetch');
});

fetch(modularRemoteConfig1, 300).then(() => {
  console.log('Modular fetch with expiration');
});

setDefaults(modularRemoteConfig1, { modularKey: 'modularValue' }).then(() => {
  console.log('Modular defaults set');
});

setDefaultsFromResource(modularRemoteConfig1, 'modular_resource').then(() => {
  console.log('Modular defaults from resource set');
});

const modularUnsubscribeOnConfigUpdate = onConfigUpdate(modularRemoteConfig1, {
  next: (configUpdate: FirebaseRemoteConfigTypes.ConfigUpdate) => {
    console.log(configUpdate.getUpdatedKeys());
  },
  error: (error: any) => {
    console.log(error);
  },
  complete: () => {
    console.log('Modular complete');
  },
});
modularUnsubscribeOnConfigUpdate();

const modularUnsubscribeOnConfigUpdated = onConfigUpdated(
  modularRemoteConfig1,
  (
    event?: { updatedKeys: string[] },
    error?: { code: string; message: string; nativeErrorMessage: string },
  ) => {
    if (event) {
      console.log(event.updatedKeys);
    }
    if (error) {
      console.log(error);
    }
  },
);
modularUnsubscribeOnConfigUpdated();

// Explicit use of modular type CustomSignals (from lib/types/modular)
const customSignals: CustomSignals = { signal1: 'value1', signal2: 123, signal3: null };
setCustomSignals(modularRemoteConfig1, customSignals).then(() => {
  console.log('Modular custom signals set');
});

// checks modular statics exports
console.log(LastFetchStatus.SUCCESS);
console.log(ValueSource.REMOTE);
