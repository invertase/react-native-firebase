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

import type { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Database module instance (public/modular API). Only `app` is exposed on the type.
 */
export interface Database {
  /** The FirebaseApp this module is associated with */
  app: ReactNativeFirebase.FirebaseApp;
}

/**
 * Server value placeholders (timestamp, increment).
 */
export interface ServerValue {
  TIMESTAMP: object;
  increment(delta: number): object;
}

/**
 * Realtime Database statics (ServerValue, SDK_VERSION).
 */
export interface Statics {
  ServerValue: ServerValue;
  SDK_VERSION: string;
}

export type EventType =
  | 'value'
  | 'child_added'
  | 'child_changed'
  | 'child_moved'
  | 'child_removed';

/**
 * Result of a transaction.
 */
export interface TransactionResult {
  committed: boolean;
  snapshot: DataSnapshot;
}

/**
 * DataSnapshot from a Database location (read-only view of data).
 */
export interface DataSnapshot {
  key: string | null;
  ref: Reference;
  child(path: string): DataSnapshot;
  exists(): boolean;
  exportVal(): unknown;
  forEach(action: (child: DataSnapshot) => true | undefined): boolean;
  getPriority(): string | number | null;
  hasChild(path: string): boolean;
  hasChildren(): boolean;
  numChildren(): number;
  toJSON(): object | null;
  val(): unknown;
}

/**
 * Query sorts and filters data at a Database location.
 */
export interface Query {
  ref: Reference;
  endAt(value: number | string | boolean | null, key?: string): Query;
  equalTo(value: number | string | boolean | null, key?: string): Query;
  isEqual(other: Query): boolean;
  limitToFirst(limit: number): Query;
  limitToLast(limit: number): Query;
  off(
    eventType?: EventType,
    callback?: (a: DataSnapshot, b?: string | null) => void,
    context?: Record<string, unknown>,
  ): void;
  on(
    eventType: EventType,
    callback: (data: DataSnapshot, previousChildKey?: string | null) => void,
    cancelCallbackOrContext?: ((a: Error) => void) | Record<string, unknown> | null,
    context?: Record<string, unknown> | null,
  ): (a: DataSnapshot | null, b?: string | null) => void;
  once(
    eventType: EventType,
    successCallback?: (a: DataSnapshot, b?: string | null) => unknown,
    failureCallbackContext?: ((a: Error) => void) | Record<string, unknown> | null,
  ): Promise<DataSnapshot>;
  orderByChild(path: string): Query;
  orderByKey(): Query;
  orderByPriority(): Query;
  orderByValue(): Query;
  startAt(value: number | string | boolean | null, key?: string): Query;
  toJSON(): object;
  toString(): string;
  keepSynced(bool: boolean): Promise<void>;
}

/**
 * Reference to a specific location in the Database.
 */
export interface Reference extends Query {
  parent: Reference | null;
  root: Reference;
  key: string | null;
  child(path: string): Reference;
  set(value: unknown, onComplete?: (error: Error | null) => void): Promise<void>;
  update(
    values: { [key: string]: unknown },
    onComplete?: (error: Error | null) => void,
  ): Promise<void>;
  setPriority(
    priority: string | number | null,
    onComplete?: (error: Error | null) => void,
  ): Promise<void>;
  setWithPriority(
    newVal: unknown,
    newPriority: string | number | null,
    onComplete?: (error: Error | null) => void,
  ): Promise<void>;
  remove(onComplete?: (error: Error | null) => void): Promise<void>;
  transaction(
    transactionUpdate: (currentData: unknown) => unknown | undefined,
    onComplete?: (error: Error | null, committed: boolean, finalResult: DataSnapshot) => void,
    applyLocally?: boolean,
  ): Promise<TransactionResult>;
  push(value?: unknown, onComplete?: () => void): ThenableReference;
  onDisconnect(): OnDisconnect;
}

export type ThenableReference = Reference;

/**
 * OnDisconnect: write or clear data when the client disconnects.
 */
export interface OnDisconnect {
  cancel(onComplete?: (error: Error | null) => void): Promise<void>;
  remove(onComplete?: (error: Error | null) => void): Promise<void>;
  set(value: unknown, onComplete?: (error: Error | null) => void): Promise<void>;
  setWithPriority(
    value: unknown,
    priority: string | number | null,
    onComplete?: (error: Error | null) => void,
  ): Promise<void>;
  update(
    values: { [key: string]: unknown },
    onComplete?: (error: Error | null) => void,
  ): Promise<void>;
}
