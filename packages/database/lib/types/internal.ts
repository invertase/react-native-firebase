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

import type { Database, Reference } from './database';

/**
 * Wrapped native module interface for the main Database module.
 * React Native Firebase merges multiple native modules (RNFBDatabaseModule, etc.) into one;
 * this interface describes the main module methods used by the JS class.
 */
export interface RNFBDatabaseModule {
  goOnline(): Promise<void>;
  goOffline(): Promise<void>;
  setPersistenceEnabled(enabled: boolean): Promise<void>;
  setLoggingEnabled(enabled: boolean): Promise<void>;
  setPersistenceCacheSizeBytes(bytes: number): Promise<void>;
  useEmulator(host: string, port: number): void;
}

/**
 * Internal Database type with native module and methods used by modular .call() pattern.
 */
export interface DatabaseInternal extends Database {
  native: RNFBDatabaseModule;
  getServerTime(): Date;
  ref(path?: string): Reference;
  refFromURL(url: string): Reference;
  goOnline(): Promise<void>;
  goOffline(): Promise<void>;
  setPersistenceEnabled(enabled: boolean): void;
  setLoggingEnabled(enabled: boolean): void;
  setPersistenceCacheSizeBytes(bytes: number): void;
  useEmulator(host: string, port: number): void;
}

/**
 * Type helper for methods called with MODULAR_DEPRECATION_ARG via .call().
 */
export type WithModularDeprecationArg<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: infer A
) => infer R
  ? (...args: [...A, unknown?]) => R
  : never;
