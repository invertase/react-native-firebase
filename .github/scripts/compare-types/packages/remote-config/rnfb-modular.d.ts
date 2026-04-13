declare namespace ReactNativeFirebase {
  interface FirebaseApp {}
  interface FirebaseModule {}
  interface NativeFirebaseError extends Error {}
}

export type RemoteConfigLogLevel = 'debug' | 'error' | 'silent';

export interface LastFetchStatus {
  SUCCESS: 'success';
  FAILURE: 'failure';
  THROTTLED: 'throttled';
  NO_FETCH_YET: 'no_fetch_yet';
}

export interface ValueSource {
  REMOTE: 'remote';
  DEFAULT: 'default';
  STATIC: 'static';
}

export interface ConfigValue {
  getSource(): 'remote' | 'default' | 'static';
  asBoolean(): true | false;
  asNumber(): number;
  asString(): string;
}

export interface ConfigValues {
  [key: string]: ConfigValue;
}

export interface ConfigSettings {
  minimumFetchIntervalMillis?: number;
  fetchTimeMillis?: number;
}

export interface ConfigDefaults {
  [key: string]: number | string | boolean;
}

export type LastFetchStatusType = 'success' | 'failure' | 'no_fetch_yet' | 'throttled';

export interface ConfigUpdate {
  getUpdatedKeys(): Set<string>;
}

export interface ConfigUpdateObserver {
  next: (configUpdate: ConfigUpdate) => void;
  error: (error: ReactNativeFirebase.NativeFirebaseError) => void;
  complete: () => void;
}

export type Unsubscribe = () => void;

export interface CustomSignals {
  [key: string]: string | number | null;
}

export interface RemoteConfig extends ReactNativeFirebase.FirebaseModule {
  app: ReactNativeFirebase.FirebaseApp;
  fetchTimeMillis: number;
  lastFetchStatus: LastFetchStatusType;
  settings: ConfigSettings;
  defaultConfig: ConfigDefaults;
  setConfigSettings(configSettings: ConfigSettings): Promise<void>;
  setDefaults(defaults: ConfigDefaults): Promise<null>;
  setDefaultsFromResource(resourceName: string): Promise<null>;
  activate(): Promise<boolean>;
  ensureInitialized(): Promise<void>;
  fetch(expirationDurationSeconds?: number): Promise<void>;
  fetchAndActivate(): Promise<boolean>;
  getAll(): ConfigValues;
  getValue(key: string): ConfigValue;
  getBoolean(key: string): boolean;
  getString(key: string): string;
  getNumber(key: string): number;
  reset(): Promise<void>;
}

export declare const LastFetchStatus: {
  readonly SUCCESS: 'success';
  readonly FAILURE: 'failure';
  readonly THROTTLED: 'throttled';
  readonly NO_FETCH_YET: 'no_fetch_yet';
};

export declare const ValueSource: {
  readonly REMOTE: 'remote';
  readonly DEFAULT: 'default';
  readonly STATIC: 'static';
};

export declare function getRemoteConfig(app?: ReactNativeFirebase.FirebaseApp): RemoteConfig;
export declare function activate(remoteConfig: RemoteConfig): Promise<boolean>;
export declare function ensureInitialized(remoteConfig: RemoteConfig): Promise<void>;
export declare function fetchAndActivate(remoteConfig: RemoteConfig): Promise<boolean>;
export declare function fetchConfig(remoteConfig: RemoteConfig): Promise<void>;
export declare function getAll(remoteConfig: RemoteConfig): ConfigValues;
export declare function getBoolean(remoteConfig: RemoteConfig, key: string): boolean;
export declare function getNumber(remoteConfig: RemoteConfig, key: string): number;
export declare function getString(remoteConfig: RemoteConfig, key: string): string;
export declare function getValue(remoteConfig: RemoteConfig, key: string): ConfigValue;
export declare function setLogLevel(
  remoteConfig: RemoteConfig,
  logLevel: RemoteConfigLogLevel,
): RemoteConfigLogLevel;
export declare function isSupported(): Promise<boolean>;
export declare function fetchTimeMillis(remoteConfig: RemoteConfig): number;
export declare function settings(remoteConfig: RemoteConfig): ConfigSettings;
export declare function lastFetchStatus(remoteConfig: RemoteConfig): LastFetchStatusType;
export declare function reset(remoteConfig: RemoteConfig): Promise<void>;
export declare function setConfigSettings(
  remoteConfig: RemoteConfig,
  settings: ConfigSettings,
): Promise<void>;
export declare function fetch(
  remoteConfig: RemoteConfig,
  expirationDurationSeconds?: number,
): Promise<void>;
export declare function setDefaults(
  remoteConfig: RemoteConfig,
  defaults: ConfigDefaults,
): Promise<void>;
export declare function setDefaultsFromResource(
  remoteConfig: RemoteConfig,
  resourceName: string,
): Promise<null>;
export declare function onConfigUpdate(
  remoteConfig: RemoteConfig,
  observer: ConfigUpdateObserver,
): Unsubscribe;
export declare function onConfigUpdated(remoteConfig: RemoteConfig, callback: any): () => void;
export declare function setCustomSignals(
  remoteConfig: RemoteConfig,
  customSignals: CustomSignals,
): Promise<void>;
