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
import type {
  DataSnapshot,
  Database,
  DatabaseReference,
  EventType,
  EmulatorMockTokenOptions,
  ListenOptions,
  OnDisconnect,
  Query,
  QueryConstraint,
  QueryConstraintType,
  ServerValue,
  ThenableReference,
  TransactionResult,
} from './database';
import type { FirebaseDatabaseTypes } from './namespaced';
import type { DatabaseQueryModifier } from '../DatabaseQueryModifiers';

/** Optional final argument passed by modular API wrappers (MODULAR_DEPRECATION_ARG). */
export type DatabaseModularDeprecationArg = string;

/** App instance with database() method (e.g. from getApp() when used for getDatabase()). */
export interface AppWithDatabaseInternal {
  database(url?: string): Database;
}

/** Public database instance viewed through the modular wrapper methods. */
export interface DatabaseWithMethodsInternal extends Database {
  useEmulator(
    host: string,
    port: number,
    options?: { mockUserToken?: EmulatorMockTokenOptions | string },
    deprecationArg?: DatabaseModularDeprecationArg,
  ): unknown;
  goOffline(deprecationArg?: DatabaseModularDeprecationArg): unknown;
  goOnline(deprecationArg?: DatabaseModularDeprecationArg): unknown;
  ref(path?: string, deprecationArg?: DatabaseModularDeprecationArg): DatabaseReference;
  refFromURL(url: string, deprecationArg?: DatabaseModularDeprecationArg): DatabaseReference;
  setPersistenceEnabled(enabled: boolean, deprecationArg?: DatabaseModularDeprecationArg): unknown;
  setLoggingEnabled(enabled: boolean, deprecationArg?: DatabaseModularDeprecationArg): unknown;
  setPersistenceCacheSizeBytes(
    bytes: number,
    deprecationArg?: DatabaseModularDeprecationArg,
  ): unknown;
  getServerTime(deprecationArg?: DatabaseModularDeprecationArg): Date;
}

/** Native emitter subscription returned by addListener. */
export interface DatabaseEmitterSubscriptionInternal {
  remove(): void;
}

/** Serialized database snapshot payload received from native or web fallback modules. */
export interface DatabaseSnapshotInternal {
  value: unknown;
  key: string | null;
  exists: boolean;
  hasChildren?: boolean;
  childrenCount?: number;
  childKeys: string[];
  priority?: string | number | null;
  childPriorities?: Record<string, string | number | null | undefined>;
}

/** Child-event payload received from native once/on listeners. */
export interface DatabaseChildSnapshotResultInternal {
  snapshot: DatabaseSnapshotInternal;
  previousChildName?: string | null;
}

/** Query listener registration bookkeeping passed to native. */
export interface DatabaseListenRegistrationInternal {
  eventRegistrationKey: string;
  key: string;
  registrationCancellationKey?: string;
}

/** Query subscription payload passed to native. */
export interface DatabaseListenPropsInternal {
  key: string;
  modifiers: DatabaseQueryModifier[];
  path: string;
  eventType: EventType;
  registration: DatabaseListenRegistrationInternal;
}

/** Transaction commit payload sent to native. */
export interface DatabaseTransactionUpdatesInternal {
  value: unknown;
  abort: boolean;
}

/** Transaction bridge event payload received from native. */
export interface DatabaseTransactionEventInternal {
  id: number;
  body:
    | {
        type: 'update';
        value?: unknown;
      }
    | {
        type: 'error';
        error?: unknown;
      }
    | {
        type: 'complete';
        committed?: boolean;
        snapshot?: DatabaseSnapshotInternal;
      }
    | {
        type: string;
        [key: string]: unknown;
      };
}

/** Shared emitter shape used by database transaction listeners. */
export interface DatabaseEventEmitterInternal {
  addListener(
    eventName: string,
    listener: (event: DatabaseTransactionEventInternal) => void,
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
    modifiers: DatabaseQueryModifier[],
    eventType: FirebaseDatabaseTypes.EventType,
  ): Promise<DatabaseSnapshotInternal | DatabaseChildSnapshotResultInternal>;
  on(props: DatabaseListenPropsInternal): void;
  off(queryKey: string, eventRegistrationKey: string): void | Promise<void>;
  keepSynced(
    queryKey: string,
    path: string,
    modifiers: DatabaseQueryModifier[],
    value: boolean,
  ): Promise<void>;
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
    updates: DatabaseTransactionUpdatesInternal,
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

/** Query instance viewed through the chainable query modifier methods. */
export type QueryWithModifiersInternal = Query &
  Record<QueryConstraintType, (...args: Array<unknown>) => Query>;

/** Query instance viewed through the subscription helpers used by modular wrappers. */
export interface QueryWithSubscriptionMethodsInternal extends Query {
  on(
    eventType: EventType,
    callback: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
    cancelCallbackOrContext?:
      | ((error: Error) => unknown)
      | ListenOptions
      | DatabaseModularDeprecationArg,
    context?: ListenOptions | null,
    deprecationArg?: DatabaseModularDeprecationArg,
  ): unknown;
  off(
    eventType?: EventType,
    callback?: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
    context?: null,
    deprecationArg?: DatabaseModularDeprecationArg,
  ): void;
  once(
    eventType: EventType,
    successCallback?: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
    failureCallbackContext?: ((error: Error) => void) | null,
    context?: ListenOptions,
    deprecationArg?: DatabaseModularDeprecationArg,
  ): Promise<DataSnapshot>;
}

/** Query constraint instance that can apply itself to a query. */
export interface QueryConstraintWithApplyInternal extends QueryConstraint {
  _apply(query: Query): Query;
}

/** Database reference viewed through the mutating modular helpers. */
export interface DatabaseReferenceWithMethodsInternal extends DatabaseReference {
  set(
    value: unknown,
    onComplete?: () => void,
    deprecationArg?: DatabaseModularDeprecationArg,
  ): Promise<void>;
  setPriority(
    priority: string | number | null,
    onComplete?: () => void,
    deprecationArg?: DatabaseModularDeprecationArg,
  ): Promise<void>;
  setWithPriority(
    value: unknown,
    priority: string | number | null,
    onComplete?: () => void,
    deprecationArg?: DatabaseModularDeprecationArg,
  ): Promise<void>;
  child(path: string, deprecationArg?: DatabaseModularDeprecationArg): DatabaseReference;
  onDisconnect(deprecationArg?: DatabaseModularDeprecationArg): OnDisconnect;
  keepSynced(value: boolean, deprecationArg?: DatabaseModularDeprecationArg): Promise<void>;
  push(
    value?: unknown,
    onComplete?: undefined,
    deprecationArg?: DatabaseModularDeprecationArg,
  ): ThenableReference;
  remove(deprecationArg?: DatabaseModularDeprecationArg): Promise<void>;
  update(values: object, deprecationArg?: DatabaseModularDeprecationArg): Promise<void>;
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
  readonly app: ReactNativeFirebase.FirebaseApp;
  readonly type: 'database';
  readonly firebaseJson: Record<string, unknown>;
  eventNameForApp(...args: Array<string | number>): string;
  _serverTimeOffset: number;
  _customUrlOrRegion: string | null;
  _transaction: DatabaseTransactionInternal;
}

/** Public database module instance plus internal bridge fields. */
export interface DatabaseInternal extends Database, DatabaseModuleInternal {}

/** Database reference viewed through the transaction modular helper. */
export interface DatabaseReferenceWithTransactionInternal extends DatabaseReference {
  transaction(
    transactionUpdate: (currentData: any) => unknown,
    onComplete?: undefined,
    applyLocally?: boolean,
    deprecationArg?: DatabaseModularDeprecationArg,
  ): Promise<TransactionResult>;
}

/** Runtime ServerValue object shape used by modular wrappers. */
export interface ServerValueStaticInternal extends ServerValue {
  increment(delta: number, deprecationArg?: DatabaseModularDeprecationArg): object;
}
