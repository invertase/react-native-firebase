/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * Modular Remote Config types aligned with the Firebase Web SDK (@firebase/remote-config).
 * Type definitions match the official Firebase JS SDK for compatibility.
 */

import type { FirebaseApp, ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * The Firebase Remote Config service interface.
 *
 * @public
 */
export interface RemoteConfig {
  /**
   * The {@link FirebaseApp} this `RemoteConfig` instance is associated with.
   */
  app: FirebaseApp;
  /**
   * Defines configuration for the Remote Config SDK.
   */
  settings: RemoteConfigSettings;

  /**
   * Object containing default values for configs.
   */
  defaultConfig: { [key: string]: string | number | boolean };

  /**
   * The Unix timestamp in milliseconds of the last <i>successful</i> fetch, or negative one if
   * the {@link RemoteConfig} instance either hasn't fetched or initialization
   * is incomplete.
   */
  fetchTimeMillis: number;

  /**
   * The status of the last fetch <i>attempt</i>.
   */
  lastFetchStatus: FetchStatus;

  // Instance methods (React Native Firebase implementation surface)
  activate(): Promise<boolean>;
  ensureInitialized(): Promise<void>;
  fetchAndActivate(): Promise<boolean>;
  fetch(expirationDurationSeconds?: number): Promise<void>;
  fetchConfig?(): Promise<void>;
  getAll(): { [key: string]: Value };
  getBoolean(key: string): boolean;
  getNumber(key: string): number;
  getString(key: string): string;
  getValue(key: string): Value;
  reset(): Promise<void>;
  setConfigSettings(settings: RemoteConfigSettings): Promise<void>;
  setDefaults(defaults: { [key: string]: string | number | boolean }): Promise<null>;
  setDefaultsFromResource(resourceName: string): Promise<null>;
  onConfigUpdate(observer: ConfigUpdateObserver): Unsubscribe;
  onConfigUpdated(
    callback:
      | ((
          event?: { updatedKeys: string[] },
          error?: { code: string; message: string; nativeErrorMessage: string },
        ) => void)
      | {
          next: (
            event?: { updatedKeys: string[] },
            error?: { code: string; message: string; nativeErrorMessage: string },
          ) => void;
        },
  ): () => void;
}

/**
 * Defines a self-descriptive reference for config key-value pairs.
 *
 *  @public
 */
export interface FirebaseRemoteConfigObject {
  [key: string]: string;
}

/**
 * Defines experiment and variant attached to a config parameter.
 *
 * @public
 */
export interface FirebaseExperimentDescription {
  // A string of max length 22 characters and of format: _exp_<experiment_id>
  experimentId: string;

  // The variant of the experiment assigned to the app instance.
  variantId: string;

  // When the experiment was started.
  experimentStartTime: string;

  // How long the experiment can remain in STANDBY state. Valid range from 1 ms
  // to 6 months.
  triggerTimeoutMillis: string;

  // How long the experiment can remain in ON state. Valid range from 1 ms to 6
  // months.
  timeToLiveMillis: string;

  // Which all parameters are affected by this experiment.
  affectedParameterKeys?: string[];
}

/**
 * Defines a successful response (200 or 304).
 *
 * <p>Modeled after the native `Response` interface, but simplified for Remote Config's
 * use case.
 *
 * @public
 */
export interface FetchResponse {
  /**
   * The HTTP status, which is useful for differentiating success responses with data from
   * those without.
   *
   * <p>The Remote Config client is modeled after the native `Fetch` interface, so
   * HTTP status is first-class.
   *
   * <p>Disambiguation: the fetch response returns a legacy "state" value that is redundant with the
   * HTTP status code. The former is normalized into the latter.
   */
  status: number;

  /**
   * Defines the ETag response header value.
   *
   * <p>Only defined for 200 and 304 responses.
   */
  eTag?: string;

  /**
   * Defines the map of parameters returned as "entries" in the fetch response body.
   *
   * <p>Only defined for 200 responses.
   */
  config?: FirebaseRemoteConfigObject;

  /**
   * The version number of the config template fetched from the server.
   */
  templateVersion?: number;

  /**
   * Metadata for A/B testing and Remote Config Rollout experiments.
   *
   * @remarks Only defined for 200 responses.
   */
  experiments?: FirebaseExperimentDescription[];
}

/**
 * Options for Remote Config initialization.
 *
 * @public
 */
export interface RemoteConfigOptions {
  /**
   * The ID of the template to use. If not provided, defaults to "firebase".
   */
  templateId?: string;

  /**
   * Hydrates the state with an initial fetch response.
   */
  initialFetchResponse?: FetchResponse;
}

/**
 * Indicates the source of a value.
 *
 * <ul>
 *   <li>"static" indicates the value was defined by a static constant.</li>
 *   <li>"default" indicates the value was defined by default config.</li>
 *   <li>"remote" indicates the value was defined by fetched config.</li>
 * </ul>
 *
 * @public
 */
export type ValueSource = 'static' | 'default' | 'remote';

/**
 * Wraps a value with metadata and type-safe getters.
 *
 * @public
 */
export interface Value {
  /**
   * Gets the value as a boolean.
   *
   * The following values (case-insensitive) are interpreted as true:
   * "1", "true", "t", "yes", "y", "on". Other values are interpreted as false.
   */
  asBoolean(): boolean;

  /**
   * Gets the value as a number. Comparable to calling <code>Number(value) || 0</code>.
   */
  asNumber(): number;

  /**
   * Gets the value as a string.
   */
  asString(): string;

  /**
   * Gets the {@link ValueSource} for the given key.
   */
  getSource(): ValueSource;
}

/**
 * Defines configuration options for the Remote Config SDK.
 *
 * @public
 */
export interface RemoteConfigSettings {
  /**
   * Defines the maximum age in milliseconds of an entry in the config cache before
   * it is considered stale. Defaults to 43200000 (Twelve hours).
   */
  minimumFetchIntervalMillis: number;

  /**
   * Defines the maximum amount of milliseconds to wait for a response when fetching
   * configuration from the Remote Config server. Defaults to 60000 (One minute).
   */
  fetchTimeoutMillis: number;
}

/**
 * Summarizes the outcome of the last attempt to fetch config from the Firebase Remote Config server.
 *
 * <ul>
 *   <li>"no-fetch-yet" indicates the {@link RemoteConfig} instance has not yet attempted
 *       to fetch config, or that SDK initialization is incomplete.</li>
 *   <li>"success" indicates the last attempt succeeded.</li>
 *   <li>"failure" indicates the last attempt failed.</li>
 *   <li>"throttle" indicates the last attempt was rate-limited.</li>
 * </ul>
 *
 * @public
 */
export type FetchStatus = 'no-fetch-yet' | 'success' | 'failure' | 'throttle';

/**
 * Defines levels of Remote Config logging.
 *
 * @public
 */
export type LogLevel = 'debug' | 'error' | 'silent';

/**
 * Defines the type for representing custom signals and their values.
 *
 * <p>The values in CustomSignals must be one of the following types:
 *
 * <ul>
 *   <li><code>string</code>
 *   <li><code>number</code>
 *   <li><code>null</code>
 * </ul>
 *
 * @public
 */
export interface CustomSignals {
  [key: string]: string | number | null;
}

/**
 * Contains information about which keys have been updated.
 *
 * @public
 */
export interface ConfigUpdate {
  /**
   * Parameter keys whose values have been updated from the currently activated values.
   * Includes keys that are added, deleted, or whose value, value source, or metadata has changed.
   */
  getUpdatedKeys(): Set<string>;
}

/**
 * Observer interface for receiving real-time Remote Config update notifications.
 *
 * NOTE: Although an `complete` callback can be provided, it will
 * never be called because the ConfigUpdate stream is never-ending.
 *
 * @public
 */
export interface ConfigUpdateObserver {
  /**
   * Called when a new ConfigUpdate is available.
   */
  next: (configUpdate: ConfigUpdate) => void;

  /**
   * Called if an error occurs during the stream.
   */
  error: (error: ReactNativeFirebase.NativeFirebaseError) => void;

  /**
   * Called when the stream is gracefully terminated.
   */
  complete: () => void;
}

/**
 * A function that unsubscribes from a real-time event stream.
 *
 * @public
 */
export type Unsubscribe = () => void;

/**
 * Indicates the type of fetch request.
 *
 * <ul>
 *   <li>"BASE" indicates a standard fetch request.</li>
 *   <li>"REALTIME" indicates a fetch request triggered by a real-time update.</li>
 * </ul>
 *
 * @public
 */
export type FetchType = 'BASE' | 'REALTIME';
