/**
 * Public types snapshot from the Firebase JS SDK (@firebase/remote-config).
 *
 * Source: firebase-js-sdk package @firebase/remote-config
 * Modality: modular (tree-shakeable) API only
 *
 * This file is the reference snapshot used to detect API drift between the
 * firebase-js-sdk and the @react-native-firebase/remote-config modular API.
 *
 * When a new version of the firebase-js-sdk ships with type changes, update
 * this file with the new public types from @firebase/remote-config/dist/index.d.ts.
 */

import { FirebaseApp } from '@firebase/app';
import { FirebaseError } from '@firebase/app';

/**
 * Makes the last fetched config available to the getters.
 * @public
 */
export declare function activate(remoteConfig: RemoteConfig): Promise<boolean>;

/**
 * Contains information about which keys have been updated.
 * @public
 */
export declare interface ConfigUpdate {
  /**
   * Parameter keys whose values have been updated from the currently activated values.
   * Includes keys that are added, deleted, or whose value, value source, or metadata has changed.
   */
  getUpdatedKeys(): Set<string>;
}

/**
 * Observer interface for receiving real-time Remote Config update notifications.
 * @public
 */
export declare interface ConfigUpdateObserver {
  next: (configUpdate: ConfigUpdate) => void;
  error: (error: FirebaseError) => void;
  complete: () => void;
}

/**
 * Defines the type for representing custom signals and their values.
 * @public
 */
export declare interface CustomSignals {
  [key: string]: string | number | null;
}

/**
 * Ensures the last activated config are available to the getters.
 * @public
 */
export declare function ensureInitialized(
  remoteConfig: RemoteConfig,
): Promise<void>;

/**
 * Performs fetch and activate operations, as a convenience.
 * @public
 */
export declare function fetchAndActivate(
  remoteConfig: RemoteConfig,
): Promise<boolean>;

/**
 * Fetches and caches configuration from the Remote Config service.
 * @public
 */
export declare function fetchConfig(remoteConfig: RemoteConfig): Promise<void>;

/**
 * Defines a successful response (200 or 304).
 * @public
 */
export declare interface FetchResponse {
  status: number;
  eTag?: string;
  config?: FirebaseRemoteConfigObject;
  templateVersion?: number;
  experiments?: FirebaseExperimentDescription[];
}

/**
 * Summarizes the outcome of the last attempt to fetch config.
 * @public
 */
export declare type FetchStatus =
  | 'no-fetch-yet'
  | 'success'
  | 'failure'
  | 'throttle';

/**
 * Indicates the type of fetch request.
 * @public
 */
export declare type FetchType = 'BASE' | 'REALTIME';

/**
 * Defines experiment and variant attached to a config parameter.
 * @public
 */
export declare interface FirebaseExperimentDescription {
  experimentId: string;
  variantId: string;
  experimentStartTime: string;
  triggerTimeoutMillis: string;
  timeToLiveMillis: string;
  affectedParameterKeys?: string[];
}

/**
 * Defines a self-descriptive reference for config key-value pairs.
 * @public
 */
export declare interface FirebaseRemoteConfigObject {
  [key: string]: string;
}

/**
 * Gets all config.
 * @public
 */
export declare function getAll(
  remoteConfig: RemoteConfig,
): Record<string, Value>;

/**
 * Gets the value for the given key as a boolean.
 * @public
 */
export declare function getBoolean(
  remoteConfig: RemoteConfig,
  key: string,
): boolean;

/**
 * Gets the value for the given key as a number.
 * @public
 */
export declare function getNumber(
  remoteConfig: RemoteConfig,
  key: string,
): number;

/**
 * Returns a RemoteConfig instance for the given app.
 * @public
 */
export declare function getRemoteConfig(
  app?: FirebaseApp,
  options?: RemoteConfigOptions,
): RemoteConfig;

/**
 * Gets the value for the given key as a string.
 * @public
 */
export declare function getString(
  remoteConfig: RemoteConfig,
  key: string,
): string;

/**
 * Gets the Value for the given key.
 * @public
 */
export declare function getValue(remoteConfig: RemoteConfig, key: string): Value;

/**
 * Returns true if a RemoteConfig instance can be initialized in this environment.
 * @public
 */
export declare function isSupported(): Promise<boolean>;

/**
 * Defines levels of Remote Config logging.
 * @public
 */
export declare type LogLevel = 'debug' | 'error' | 'silent';

/**
 * Starts listening for real-time config updates from the Remote Config backend.
 * @public
 */
export declare function onConfigUpdate(
  remoteConfig: RemoteConfig,
  observer: ConfigUpdateObserver,
): Unsubscribe;

/**
 * The Firebase Remote Config service interface.
 * @public
 */
export declare interface RemoteConfig {
  app: FirebaseApp;
  settings: RemoteConfigSettings;
  defaultConfig: {
    [key: string]: string | number | boolean;
  };
  fetchTimeMillis: number;
  lastFetchStatus: FetchStatus;
}

/**
 * Options for Remote Config initialization.
 * @public
 */
export declare interface RemoteConfigOptions {
  templateId?: string;
  initialFetchResponse?: FetchResponse;
}

/**
 * Defines configuration options for the Remote Config SDK.
 * @public
 */
export declare interface RemoteConfigSettings {
  minimumFetchIntervalMillis: number;
  fetchTimeoutMillis: number;
}

/**
 * Sets the custom signals for the app instance.
 * @public
 */
export declare function setCustomSignals(
  remoteConfig: RemoteConfig,
  customSignals: CustomSignals,
): Promise<void>;

/**
 * Defines the log level to use.
 * @public
 */
export declare function setLogLevel(
  remoteConfig: RemoteConfig,
  logLevel: LogLevel,
): void;

/**
 * A function that unsubscribes from a real-time event stream.
 * @public
 */
export declare type Unsubscribe = () => void;

/**
 * Wraps a value with metadata and type-safe getters.
 * @public
 */
export declare interface Value {
  asBoolean(): boolean;
  asNumber(): number;
  asString(): string;
  getSource(): ValueSource;
}

/**
 * Indicates the source of a value.
 * @public
 */
export declare type ValueSource = 'static' | 'default' | 'remote';
