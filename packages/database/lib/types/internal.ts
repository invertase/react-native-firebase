/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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

import type { ReactNativeFirebase } from '@react-native-firebase/app';
import type { Database, ServerValue } from './database';
import type { FirebaseDatabaseTypes } from './namespaced';

/** Optional final argument passed by modular API wrappers (MODULAR_DEPRECATION_ARG). */
export type DatabaseModularDeprecationArg = string;

/** App instance with database() method (e.g. from getApp() when used for getDatabase()). */
export interface AppWithDatabaseInternal {
  database(url?: string): Database;
}

/** Native emitter subscription returned by addListener. */
export interface DatabaseEmitterSubscriptionInternal {
  remove(): void;
}

/** Shared emitter shape used by database transaction listeners. */
export interface DatabaseEventEmitterInternal {
  addListener(
    eventName: string,
    listener: (event: { id: number; body: { type: string; [key: string]: unknown } }) => void,
  ): DatabaseEmitterSubscriptionInternal;
}

/** Wrapped native module interface for database. */
export interface RNFBDatabaseModule {
  goOnline(): Promise<void>;
  goOffline(): Promise<void>;
  setPersistenceEnabled(enabled: boolean): Promise<void>;
  setLoggingEnabled(enabled: boolean): Promise<void>;
  setPersistenceCacheSizeBytes(bytes: number): Promise<void>;
  useEmulator(host: string, port: number): void | Promise<void>;
  set(path: string, props: { value: unknown }): Promise<void>;
  update(path: string, props: { values: Record<string, unknown> }): Promise<void>;
  setWithPriority(
    path: string,
    props: { value: unknown; priority: string | number | null },
  ): Promise<void>;
  remove(path: string): Promise<void>;
  setPriority(path: string, props: { priority: string | number | null }): Promise<void>;
  once(
    path: string,
    modifiers: unknown,
    eventType: FirebaseDatabaseTypes.EventType,
  ): Promise<unknown>;
  on(props: unknown): void;
  off(queryKey: string, eventRegistrationKey: string): void | Promise<void>;
  keepSynced(queryKey: string, path: string, modifiers: unknown, value: boolean): Promise<void>;
  onDisconnectCancel(path: string): Promise<void>;
  onDisconnectRemove(path: string): Promise<void>;
  onDisconnectSet(path: string, props: { value: unknown }): Promise<void>;
  onDisconnectSetWithPriority(
    path: string,
    props: { value: unknown; priority: string | number | null },
  ): Promise<void>;
  onDisconnectUpdate(path: string, props: { values: Record<string, unknown> }): Promise<void>;
  transactionStart(
    path: string,
    id: number,
    applyLocally: boolean,
    userExecutor?: (currentData: unknown) => unknown,
  ): void | Promise<void>;
  transactionTryCommit(
    id: number,
    updates: { value: unknown; abort: boolean },
  ): void | Promise<void>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBDatabaseModule: RNFBDatabaseModule;
  }
}

/** Legacy DatabaseReference shape needed by namespaced/runtime helpers before full TS port. */
export interface DatabaseReferenceInternal {
  readonly path: string;
  on(
    eventType: FirebaseDatabaseTypes.EventType,
    callback: (data: FirebaseDatabaseTypes.DataSnapshot, previousChildKey?: string | null) => void,
    cancelCallbackOrContext?:
      | ((a: Error) => void)
      | Record<string, any>
      | DatabaseModularDeprecationArg
      | null,
    context?: Record<string, any> | null,
  ): (a: FirebaseDatabaseTypes.DataSnapshot | null, b?: string | null) => void;
}

/** Minimal transaction handler contract used by DatabaseReference and namespaced module. */
export interface DatabaseTransactionInternal {
  add(
    reference: DatabaseReferenceInternal,
    transactionUpdater: (currentData: unknown) => unknown,
    onComplete: (error: Error | null, committed: boolean, snapshot: unknown | null) => void,
    applyLocally?: boolean,
  ): void;
}

/** Namespaced database instance with typed native and transaction bridge. */
export interface DatabaseModuleInternal {
  readonly native: RNFBDatabaseModule;
  readonly emitter: DatabaseEventEmitterInternal;
  app: ReactNativeFirebase.FirebaseApp;
  readonly firebaseJson: Record<string, unknown>;
  eventNameForApp(...args: Array<string | number>): string;
  _serverTimeOffset: number;
  _customUrlOrRegion: string | null;
  _transaction: DatabaseTransactionInternal;
}

/** Public database module instance plus internal bridge fields. */
export interface DatabaseInternal extends Database, DatabaseModuleInternal {}

/** Runtime ServerValue object shape used by modular wrappers. */
export interface ServerValueStaticInternal extends ServerValue {
  increment(delta: number, deprecationArg?: DatabaseModularDeprecationArg): object;
}
