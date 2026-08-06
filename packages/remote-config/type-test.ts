import { getApp } from '@react-native-firebase/app';
import {
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
  reset,
  setDefaultsFromResource,
  onConfigUpdate,
  setCustomSignals,
  LastFetchStatus,
  ValueSource,
  SDK_VERSION,
  type ConfigUpdateObserver,
  type CustomSignals,
  type FetchStatus,
  type LogLevel,
  type RemoteConfig,
  type RemoteConfigSettings,
  type Unsubscribe,
  type Value,
} from '.';

const remoteConfig = getRemoteConfig();
console.log(remoteConfig.app.name);

const remoteConfigWithApp = getRemoteConfig(getApp());
console.log(remoteConfigWithApp.app.name);

const typedRemoteConfig: RemoteConfig = remoteConfig;
const typedConfigSettings: RemoteConfigSettings = {
  minimumFetchIntervalMillis: 30000,
  fetchTimeoutMillis: 60000,
};
const typedConfigDefaults: Record<string, string | number | boolean> = {
  enabled: true,
  retries: 1,
  title: 'remote',
};
const typedConfigValue: Value = getValue(typedRemoteConfig, 'typed');
const typedConfigValues: Record<string, Value> = getAll(typedRemoteConfig);
const typedCustomSignals: CustomSignals = { signal: 'value', number: 1, reset: null };
const typedLastFetchStatus: FetchStatus = typedRemoteConfig.lastFetchStatus;
const typedLogLevel: LogLevel = 'debug';
const typedUnsubscribe: Unsubscribe = () => {};
const typedObserver: ConfigUpdateObserver = {
  next: configUpdate => {
    console.log(configUpdate.getUpdatedKeys());
  },
  error: error => {
    console.log(error.code);
  },
  complete: () => {
    console.log('typed observer complete');
  },
};

console.log(typedConfigSettings);
console.log(typedConfigDefaults);
console.log(typedConfigValue.asString());
console.log(typedConfigValues);
console.log(typedCustomSignals);
console.log(typedLastFetchStatus);
console.log(typedLogLevel);
typedUnsubscribe();
onConfigUpdate(typedRemoteConfig, typedObserver);

typedRemoteConfig.settings = typedConfigSettings;
typedRemoteConfig.defaultConfig = typedConfigDefaults;

console.log(typedRemoteConfig.fetchTimeMillis);
console.log(typedRemoteConfig.settings.minimumFetchIntervalMillis);
console.log(typedRemoteConfig.defaultConfig.enabled);

activate(remoteConfig).then((activated: boolean) => {
  console.log(activated);
});

ensureInitialized(remoteConfig).then(() => {
  console.log('Modular initialized');
});

fetchAndActivate(remoteConfig).then((activated: boolean) => {
  console.log(activated);
});

fetchConfig(remoteConfig).then(() => {
  console.log('Modular fetch config');
});

console.log(getBoolean(remoteConfig, 'key'));
console.log(getString(remoteConfig, 'key'));
console.log(getNumber(remoteConfig, 'key'));

const modularConfigValue = getValue(remoteConfig, 'key');
console.log(modularConfigValue.getSource());
console.log(modularConfigValue.asBoolean());

setLogLevel(remoteConfig, typedLogLevel);
setLogLevel(remoteConfig, 'error');

isSupported().then((supported: boolean) => {
  console.log(supported);
});

reset(remoteConfig).then(() => {
  console.log('Modular reset');
});

setDefaultsFromResource(remoteConfig, 'modular_resource').then(() => {
  console.log('Modular defaults from resource set');
});

const modularUnsubscribeOnConfigUpdate = onConfigUpdate(remoteConfig, typedObserver);
modularUnsubscribeOnConfigUpdate();

setCustomSignals(remoteConfig, typedCustomSignals).then(() => {
  console.log('Modular custom signals set');
});

console.log(LastFetchStatus.SUCCESS);
console.log(LastFetchStatus.FAILURE);
console.log(LastFetchStatus.THROTTLED);
console.log(LastFetchStatus.NO_FETCH_YET);
console.log(ValueSource.REMOTE);
console.log(ValueSource.DEFAULT);
console.log(ValueSource.STATIC);

const sdkVersion: string = SDK_VERSION;
console.log(sdkVersion);
