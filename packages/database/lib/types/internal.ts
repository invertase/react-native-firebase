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
  set(path: string, data: { value: unknown }): Promise<void>;
  update(path: string, data: { values: { [key: string]: unknown } }): Promise<void>;
  setWithPriority(path: string, data: { value: unknown; priority: string | number | null }): Promise<void>;
  remove(path: string): Promise<void>;
  setPriority(path: string, data: { priority: string | number | null }): Promise<void>;
  onDisconnectCancel(path: string): Promise<void>;
  onDisconnectRemove(path: string): Promise<void>;
  onDisconnectSet(path: string, data: { value: unknown }): Promise<void>;
  onDisconnectSetWithPriority(path: string, data: { value: unknown; priority: string | number | null }): Promise<void>;
  onDisconnectUpdate(path: string, data: { values: { [key: string]: unknown } }): Promise<void>;
  on(props: {
    eventType: string;
    path: string;
    key: string;
    appName: string;
    dbURL: string;
    modifiers: unknown[];
    hasCancellationCallback: boolean;
    registration: { eventRegistrationKey: string; key?: string; registrationCancellationKey?: string };
  }): Promise<void>;
  once(path: string, modifiers: unknown[], eventType: string): Promise<{
    snapshot?: unknown;
    previousChildName?: string | null;
    value?: unknown;
    key?: string | null;
    exists?: boolean;
    childKeys?: string[];
    priority?: string | number | null;
  }>;
  keepSynced(queryKey: string, path: string, modifiers: unknown[], enabled: boolean): Promise<void>;
  transactionStart(path: string, id: number, applyLocally: boolean, transactionUpdater?: (currentData: unknown) => unknown): void;
  transactionTryCommit(id: number, updates: { [key: string]: unknown }): void;
}

/**
 * Internal Database type with native module and methods used by modular .call() pattern.
 */
export interface DatabaseInternal extends Database {
  native: RNFBDatabaseModule;
  _serverTimeOffset: number;
  _customUrlOrRegion: string;
  _transaction: import('../DatabaseTransaction').default;
  emitter: import('@react-native-firebase/app/dist/module/internal/SharedEventEmitter').default;
  getServerTime(): Date;
  ref(path?: string): Reference;
  refFromURL(url: string): Reference;
  goOnline(): Promise<void>;
  goOffline(): Promise<void>;
  setPersistenceEnabled(enabled: boolean): void;
  setLoggingEnabled(enabled: boolean): void;
  setPersistenceCacheSizeBytes(bytes: number): void;
  useEmulator(host: string, port: number): void;
  eventNameForApp(...args: Array<string | number>): string;
}

/**
 * Type helper for methods called with MODULAR_DEPRECATION_ARG via .call().
 */
export type WithModularDeprecationArg<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: infer A
) => infer R
  ? (...args: [...A, unknown?]) => R
  : never;
