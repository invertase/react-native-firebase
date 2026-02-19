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

import type { FirebaseRemoteConfigTypes } from './namespaced';

/**
 * Type aliases for the modular Remote Config API.
 * Re-exported from FirebaseRemoteConfigTypes for use by the modular functions.
 */
export type RemoteConfig = FirebaseRemoteConfigTypes.Module;
export type ConfigSettings = FirebaseRemoteConfigTypes.ConfigSettings;
export type ConfigDefaults = FirebaseRemoteConfigTypes.ConfigDefaults;
export type ConfigValue = FirebaseRemoteConfigTypes.ConfigValue;
export type ConfigValues = FirebaseRemoteConfigTypes.ConfigValues;
export type LastFetchStatusType = FirebaseRemoteConfigTypes.LastFetchStatusType;
export type RemoteConfigLogLevel = FirebaseRemoteConfigTypes.RemoteConfigLogLevel;
export type ConfigUpdateObserver = FirebaseRemoteConfigTypes.ConfigUpdateObserver;
export type Unsubscribe = FirebaseRemoteConfigTypes.Unsubscribe;
export type OnConfigUpdatedListenerCallback =
  FirebaseRemoteConfigTypes.OnConfigUpdatedListenerCallback;

/**
 * Listener can be a callback or an object with a next method (Observer shape).
 * Used by onConfigUpdated.
 */
export type CallbackOrObserver<T extends (...args: any[]) => any> = T | { next: T };

/**
 * Custom signals for the app instance (modular setCustomSignals).
 */
export interface CustomSignals {
  [key: string]: string | number | null;
}

/**
 * Internal: Module instance methods accept optional deprecation arg (string).
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
