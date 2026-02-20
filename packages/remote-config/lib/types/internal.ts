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
 * Internal types for the Remote Config implementation.
 * Not part of the public API; use types from modular.ts for public usage.
 */

/** Shape of constants passed from native after config operations (fetch, activate, setDefaults, etc.). */
export interface ConstantsUpdate {
  lastFetchTime?: number;
  lastFetchStatus?: string;
  fetchTimeout: number;
  minimumFetchInterval: number;
  values: Record<string, { value: string; source: string }>;
}

/** Result wrapper from native module methods that return updated constants. */
export interface NativeConstantsResult {
  result: unknown;
  constants: ConstantsUpdate;
}

/** Native event payload for on_config_updated. */
export interface ConfigUpdatedEvent {
  resultType: string;
  updatedKeys: string[];
  code: string;
  message: string;
  nativeErrorMessage: string;
}

import type {
  ConfigUpdateObserver,
  FetchStatus,
  LogLevel,
  RemoteConfig,
  RemoteConfigSettings,
  Unsubscribe,
  Value,
} from './modular';
import type { FirebaseRemoteConfigTypes } from './namespaced';

/** Alias for RemoteConfigSettings. Used by modular functions and namespaced bridge. */
export type ConfigSettings = RemoteConfigSettings;

/** Alias for default config object shape. */
export type ConfigDefaults = { [key: string]: string | number | boolean };

/**
 * setConfigSettings when called from the settings setter (internal second arg).
 * Used by namespaced bridge; uses namespaced ConfigSettings to match FirebaseRemoteConfigTypes.
 */
export type SetConfigSettingsWithInternalArg = (
  settings: FirebaseRemoteConfigTypes.ConfigSettings,
  internal?: boolean,
) => Promise<void>;

/**
 * setDefaults when called from the defaultConfig setter (internal second arg).
 * Used by namespaced bridge; uses namespaced ConfigDefaults to match FirebaseRemoteConfigTypes.
 */
export type SetDefaultsWithInternalArg = (
  defaults: FirebaseRemoteConfigTypes.ConfigDefaults,
  internal?: boolean,
) => Promise<null>;

/** Alias for Value. */
export type ConfigValue = Value;

/** Map of key to Value. */
export type ConfigValues = { [key: string]: Value };

/** Alias for FetchStatus. */
export type LastFetchStatusType = FetchStatus;

/** Alias for LogLevel. */
export type RemoteConfigLogLevel = LogLevel;

/**
 * Listener can be a callback or an object with a next method (Observer shape).
 * Used by onConfigUpdated.
 * @deprecated use onConfigUpdate with ConfigUpdateObserver
 */
export type CallbackOrObserver<T extends (...args: any[]) => any> = T | { next: T };

/**
 * Callback signature for onConfigUpdated listener.
 * @deprecated use onConfigUpdate with ConfigUpdateObserver
 */
export type OnConfigUpdatedListenerCallback = (
  event?: { updatedKeys: string[] },
  error?: { code: string; message: string; nativeErrorMessage: string },
) => void;

/**
 * Module instance methods accept optional deprecation arg (string).
 * Used to cast RemoteConfig when calling methods with MODULAR_DEPRECATION_ARG.
 */
export type RemoteConfigWithDeprecationArg = RemoteConfig & {
  activate(_dep?: unknown): Promise<boolean>;
  ensureInitialized(_dep?: unknown): Promise<void>;
  fetchAndActivate(_dep?: unknown): Promise<boolean>;
  fetchConfig?(_dep?: unknown): Promise<void>;
  getAll(_dep?: unknown): ConfigValues;
  getBoolean(key: string, _dep?: unknown): boolean;
  getNumber(key: string, _dep?: unknown): number;
  getString(key: string, _dep?: unknown): string;
  getValue(key: string, _dep?: unknown): ConfigValue;
  reset(_dep?: unknown): Promise<void>;
  setConfigSettings(settings: ConfigSettings, _dep?: unknown): Promise<void>;
  fetch(expirationDurationSeconds?: number, _dep?: unknown): Promise<void>;
  setDefaults(defaults: ConfigDefaults, _dep?: unknown): Promise<null>;
  setDefaultsFromResource(resourceName: string, _dep?: unknown): Promise<null>;
  onConfigUpdate(observer: ConfigUpdateObserver, _dep?: unknown): Unsubscribe;
  onConfigUpdated(
    callback: CallbackOrObserver<OnConfigUpdatedListenerCallback>,
    _dep?: unknown,
  ): () => void;
};
