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

import type { FirebaseApp } from '@firebase/app';
import { getApp } from '@react-native-firebase/app';
import {
  MODULAR_DEPRECATION_ARG,
  withModularFlag,
} from '@react-native-firebase/app/dist/module/common';
import type {
  ConfigUpdateObserver,
  CustomSignals,
  LogLevel,
  RemoteConfig,
  Unsubscribe,
  Value,
} from './types/remote-config';
import type { AppWithRemoteConfigInternal, RemoteConfigInternal } from './types/internal';

function ap(remoteConfig: RemoteConfig): RemoteConfigInternal {
  return remoteConfig as RemoteConfigInternal;
}

export type { CustomSignals } from './types/remote-config';

/**
 * Returns a RemoteConfig instance for the given app.
 * @param app - FirebaseApp. Optional.
 */
export function getRemoteConfig(app?: FirebaseApp): RemoteConfig {
  if (app) {
    return withModularFlag(() =>
      (getApp(app.name) as unknown as AppWithRemoteConfigInternal).remoteConfig(
        MODULAR_DEPRECATION_ARG,
      ),
    );
  }

  return withModularFlag(() =>
    (getApp() as unknown as AppWithRemoteConfigInternal).remoteConfig(MODULAR_DEPRECATION_ARG),
  );
}

/**
 * Returns a Boolean which resolves to true if the current call
 * activated the fetched configs.
 */
export function activate(remoteConfig: RemoteConfig): Promise<boolean> {
  return ap(remoteConfig).activate.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Ensures the last activated config are available to the getters.
 */
export function ensureInitialized(remoteConfig: RemoteConfig): Promise<void> {
  return ap(remoteConfig).ensureInitialized.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Performs a fetch and returns a Boolean which resolves to true
 * if the current call activated the fetched configs.
 */
export function fetchAndActivate(remoteConfig: RemoteConfig): Promise<boolean> {
  return ap(remoteConfig).fetchAndActivate.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Fetches and caches configuration from the Remote Config service.
 */
export function fetchConfig(remoteConfig: RemoteConfig): Promise<void> {
  return ap(remoteConfig).fetch.call(remoteConfig, undefined, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets all config.
 */
export function getAll(remoteConfig: RemoteConfig): Record<string, Value> {
  return ap(remoteConfig).getAll.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets the value for the given key as a boolean.
 */
export function getBoolean(remoteConfig: RemoteConfig, key: string): boolean {
  return ap(remoteConfig).getBoolean.call(remoteConfig, key, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets the value for the given key as a number.
 */
export function getNumber(remoteConfig: RemoteConfig, key: string): number {
  return ap(remoteConfig).getNumber.call(remoteConfig, key, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets the value for the given key as a string.
 */
export function getString(remoteConfig: RemoteConfig, key: string): string {
  return ap(remoteConfig).getString.call(remoteConfig, key, MODULAR_DEPRECATION_ARG);
}

/**
 * Gets the value for the given key.
 */
export function getValue(remoteConfig: RemoteConfig, key: string): Value {
  return ap(remoteConfig).getValue.call(remoteConfig, key, MODULAR_DEPRECATION_ARG);
}

/**
 * Defines the log level to use.
 */
export function setLogLevel(remoteConfig: RemoteConfig, logLevel: LogLevel): void {
  void remoteConfig;
  void logLevel;
  // Intentionally ignored on native. The modular API matches the JS SDK and returns void.
}

/**
 * Checks two different things.
 * 1. Check if IndexedDB exists in the browser environment.
 * 2. Check if the current browser context allows IndexedDB open() calls.
 */
export function isSupported(): Promise<boolean> {
  // always return "true" for now. Web only.
  return Promise.resolve(true);
}

/**
 * Deletes all activated, fetched and defaults configs and
 * resets all Firebase Remote Config settings.
 * Android only. iOS does not reset anything.
 */
export function reset(remoteConfig: RemoteConfig): Promise<void> {
  return ap(remoteConfig).reset.call(remoteConfig, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets defaults based on a native resource.
 */
export function setDefaultsFromResource(
  remoteConfig: RemoteConfig,
  resourceName: string,
): Promise<null> {
  return ap(remoteConfig).setDefaultsFromResource.call(
    remoteConfig,
    resourceName,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Registers a listener to changes in the configuration.
 *
 */
export function onConfigUpdate(
  remoteConfig: RemoteConfig,
  observer: ConfigUpdateObserver,
): Unsubscribe {
  return ap(remoteConfig).onConfigUpdate.call(remoteConfig, observer, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the custom signals for the app instance.
 */
export async function setCustomSignals(
  remoteConfig: RemoteConfig,
  customSignals: CustomSignals,
): Promise<void> {
  for (const [key, value] of Object.entries(customSignals)) {
    if (typeof value !== 'string' && typeof value !== 'number' && value !== null) {
      throw new Error(
        `firebase.remoteConfig().setCustomSignals(): Invalid type for custom signal '${key}': ${typeof value}. Expected 'string', 'number', or 'null'.`,
      );
    }
  }

  return withModularFlag(() =>
    ap(remoteConfig)._promiseWithConstants(
      ap(remoteConfig).native.setCustomSignals(customSignals),
      MODULAR_DEPRECATION_ARG,
    ),
  );
}
