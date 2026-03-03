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

import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  FirestoreSettings,
  LoadBundleTask,
  LoadBundleTaskProgress,
  LogLevel,
  Primitive,
  Query,
  QuerySnapshot,
  SetOptions,
  SnapshotOptions,
  Transaction,
  Unsubscribe,
  WriteBatch,
  WithFieldValue,
  AggregateType,
  PartialWithFieldValue,
} from './firestore';
import type { PersistentCacheIndexManager } from '../FirestorePersistentCacheIndexManager';
import type { QueryConstraint } from '../modular/query';
import type { _Filter } from '../FirestoreFilter';
import Blob from 'lib/FirestoreBlob';

/** Query type passed to native ('collection' or 'collectionGroup'). */
export type FirestoreQueryTypeInternal = 'collection' | 'collectionGroup';

/** Single filter spec passed to native (fieldPath serialized as string[] from QueryModifiers). */
export interface FirestoreFilterSpecInternal {
  fieldPath?: string[] | unknown;
  operator: string;
  value?: unknown;
  /** Nested queries for composite filters (AND/OR). */
  queries?: FirestoreFilterSpecInternal[];
}

/** Order spec passed to native (fieldPath serialized as string[] from QueryModifiers). */
export interface FirestoreOrderSpecInternal {
  fieldPath: string[] | unknown;
  direction: string;
}

/** Query options passed to native (limit, limitToLast, startAt, etc.). */
export interface FirestoreQueryOptionsInternal {
  limit?: number;
  limitToLast?: number;
  startAt?: unknown[];
  startAfter?: unknown[];
  endAt?: unknown[];
  endBefore?: unknown[];
}

/** Cursor field values (startAt, startAfter, endAt, endBefore) – serialized array passed to native. */
export type FirestoreCursorFieldsInternal = unknown[];

/** Options for snapshot listeners (includeMetadataChanges). */
export interface FirestoreSnapshotListenOptionsInternal {
  includeMetadataChanges?: boolean;
}

/** Settings state on the Firestore module instance (ignoreUndefinedProperties, persistence). */
export interface FirestoreSettingsStateInternal {
  ignoreUndefinedProperties: boolean;
  persistence: boolean;
}

/** Subscription returned by emitter.addListener. */
export interface FirestoreEmitterSubscriptionInternal {
  remove(): void;
}

/** Native error shape in sync event body. */
export interface FirestoreSyncEventErrorInternal {
  code?: string;
  message?: string;
}

/** Serialized document snapshot from native (event.body.snapshot). */
export interface FirestoreDocumentSnapshotDataInternal {
  path: string;
  exists: boolean;
  data?: Record<string, unknown>;
  metadata: [boolean, boolean];
}

/** Sync event body (document or collection) from native. */
export interface FirestoreSyncEventBodyInternal {
  error?: FirestoreSyncEventErrorInternal;
  snapshot?: FirestoreDocumentSnapshotDataInternal;
  documents?: FirestoreDocumentSnapshotDataInternal[];
}

/** Emitter interface used by FirestoreInternal (matches FirebaseModule.emitter usage). */
export interface FirestoreEmitterInternal {
  addListener(
    eventName: string,
    callback: (event: { body: FirestoreSyncEventBodyInternal }) => void,
  ): FirestoreEmitterSubscriptionInternal;
}

/**
 * Wrapped native module interface for Firestore.
 *
 * Note: React Native Firebase internally wraps native methods and auto-prepends app name and
 * database ID when `hasMultiAppSupport` and `hasCustomUrlOrRegionSupport` are enabled.
 * Firestore uses multiple native modules (RNFBFirestoreModule, RNFBFirestoreCollectionModule,
 * RNFBFirestoreDocumentModule, RNFBFirestoreTransactionModule) which are merged into a single
 * wrapped object. This interface represents that merged *wrapped* module shape exposed as
 * `this.native` within FirebaseFirestoreModule.
 */
export interface RNFBFirestoreModule {
  setLogLevel(level: LogLevel): Promise<void>;
  // --- Main Firestore module (RNFBFirestoreModule) ---
  loadBundle(bundle: string): Promise<LoadBundleTaskProgress>;
  clearPersistence(): Promise<void>;
  waitForPendingWrites(): Promise<void>;
  terminate(): Promise<void>;
  useEmulator(host: string, port: number): void;
  disableNetwork(): Promise<void>;
  enableNetwork(): Promise<void>;
  settings(settings: object): Promise<void>;

  addSnapshotsInSync(listenerId: number): void;
  removeSnapshotsInSync(listenerId: number): void;

  /**
   * Persistent cache index manager.
   * - 0: enableIndexAutoCreation
   * - 1: disableIndexAutoCreation
   * - 2: deleteAllIndexes
   */
  persistenceCacheIndexManager(mode: number): Promise<void>;

  // --- Collection module (RNFBFirestoreCollectionModule) ---
  collectionOffSnapshot(listenerId: number): void;
  namedQueryOnSnapshot(
    queryName: string,
    type: FirestoreQueryTypeInternal | string,
    filters: FirestoreFilterSpecInternal[],
    orders: FirestoreOrderSpecInternal[],
    options: FirestoreQueryOptionsInternal,
    listenerId: number,
    snapshotListenOptions: FirestoreSnapshotListenOptionsInternal,
  ): void;
  collectionOnSnapshot(
    path: string,
    type: FirestoreQueryTypeInternal | string,
    filters: FirestoreFilterSpecInternal[],
    orders: FirestoreOrderSpecInternal[],
    options: FirestoreQueryOptionsInternal,
    listenerId: number,
    snapshotListenOptions: FirestoreSnapshotListenOptionsInternal,
  ): void;
  namedQueryGet(
    queryName: string,
    type: FirestoreQueryTypeInternal | string,
    filters: FirestoreFilterSpecInternal[],
    orders: FirestoreOrderSpecInternal[],
    options: FirestoreQueryOptionsInternal,
    getOptions?: { source?: string },
  ): Promise<unknown>;
  collectionGet(
    path: string,
    type: FirestoreQueryTypeInternal | string,
    filters: FirestoreFilterSpecInternal[],
    orders: FirestoreOrderSpecInternal[],
    options: FirestoreQueryOptionsInternal,
    getOptions?: { source?: string },
  ): Promise<unknown>;
  collectionCount(
    path: string,
    type: FirestoreQueryTypeInternal | string,
    filters: FirestoreFilterSpecInternal[],
    orders: FirestoreOrderSpecInternal[],
    options: FirestoreQueryOptionsInternal,
  ): Promise<{ count?: number }>;
  aggregateQuery(
    path: string,
    type: FirestoreQueryTypeInternal | string,
    filters: FirestoreFilterSpecInternal[],
    orders: FirestoreOrderSpecInternal[],
    options: FirestoreQueryOptionsInternal,
    aggregateQueries: Array<{
      aggregateType: AggregateType;
      field: string | null;
      key: string;
    }>,
  ): Promise<Record<string, unknown>>;

  // --- Document module (RNFBFirestoreDocumentModule) ---
  documentDelete(path: string): Promise<void>;
  documentOffSnapshot(listenerId: number): void;
  documentOnSnapshot(
    path: string,
    listenerId: number,
    snapshotListenOptions: FirestoreSnapshotListenOptionsInternal,
  ): void;
  documentGet(path: string, getOptions?: { source?: string }): Promise<unknown>;
  documentSet(
    path: string,
    data: Record<string, unknown>,
    options: Record<string, unknown>,
  ): Promise<void>;
  documentUpdate(path: string, data: Record<string, unknown>): Promise<void>;
  documentBatch(writes: Array<Record<string, unknown>>): Promise<void>;

  // --- Transaction module (RNFBFirestoreTransactionModule) ---
  transactionBegin(transactionId: number): Promise<void>;
  transactionDispose(transactionId: number): void;
  transactionApplyBuffer(transactionId: number, commandBuffer: unknown[]): void;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    RNFBFirestoreModule: RNFBFirestoreModule;
  }
}

// Helper type for wrappers that forward MODULAR_DEPRECATION_ARG via .call(...).
export type WithModularDeprecationArg<F> = F extends (...args: infer P) => infer R
  ? (...args: [...P, unknown]) => R
  : never;

export interface ParentReferenceInternal<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  doc(
    path?: string,
    ...pathSegmentsOrDeprecationArg: unknown[]
  ): DocumentReference<AppModelType, DbModelType>;
  collection(
    path: string,
    ...pathSegmentsOrDeprecationArg: unknown[]
  ): CollectionReference<AppModelType, DbModelType>;
}

export interface ReferenceInternal<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  isEqual(
    other:
      | DocumentReference<AppModelType, DbModelType>
      | CollectionReference<AppModelType, DbModelType>,
    ...deprecationArg: unknown[]
  ): boolean;
}

/** Used when calling query instance methods by name (e.g. in QueryConstraint._apply). */
export type QueryWithMethodInternal<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> = Record<string, (...args: unknown[]) => Query<AppModelType, DbModelType>>;

/** Used when calling .where() on a query with a composite filter. */
export interface QueryWithWhereInternal<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  where(...args: unknown[]): Query<AppModelType, DbModelType>;
}

/** Constraint instance that may have _apply(query) to apply itself to a query. */
export interface QueryConstraintWithApplyInternal<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  _apply?(query: Query<AppModelType, DbModelType>): Query<AppModelType, DbModelType>;
}

/** Filter constraint (field or composite) that exposes _filter. */
export interface QueryFilterConstraintWithFilterInternal {
  _filter: _Filter;
}

/** DocumentReference viewed as having get() returning DocumentSnapshot. */
export interface DocumentReferenceGetInternal<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  get(...args: unknown[]): Promise<DocumentSnapshot<AppModelType, DbModelType>>;
}

/** DocumentReference viewed as having delete(). */
export interface DocumentReferenceDeleteInternal {
  delete(...args: unknown[]): Promise<void>;
}

/** Reference or query viewed as having isEqual(). */
export interface ReferenceIsEqualInternal {
  isEqual(...args: unknown[]): boolean;
}

/** DocumentReference or Query viewed as having onSnapshot(). */
export interface ReferenceWithOnSnapshotInternal {
  onSnapshot(...listenerArgs: unknown[]): Unsubscribe;
}

/** Converter object with optional toFirestore (for guards before calling). */
export interface ConverterWithOptionalToFirestoreInternal {
  toFirestore?(data: unknown, options?: unknown): unknown;
}

/** Converter object with required toFirestore (after guard). */
export interface ConverterWithToFirestoreInternal {
  toFirestore: (data: unknown, options?: unknown) => unknown;
}

/** Partial snapshot listener observer (next / error only). */
export interface PartialSnapshotObserverInternal {
  next?: (snapshot: unknown) => void;
  error?: (e: Error) => void;
}

/** Converter object with optional toFirestore/fromFirestore (for validation). */
export interface ConverterWithOptionalMethodsInternal {
  toFirestore?: unknown;
  fromFirestore?: unknown;
}

/** Converter with required fromFirestore (for DocumentSnapshot.data() when converter is present). */
export interface ConverterWithFromFirestoreInternal {
  fromFirestore(snapshot: DocumentSnapshot, options?: SnapshotOptions): unknown;
}

/** Value at a field path in a document (primitive, nested object, or array). */
export type DocumentFieldValueInternal = Primitive | Record<string, unknown> | unknown[];

export interface DocumentReferenceInternal<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>
  extends ReferenceInternal<AppModelType, DbModelType>, ParentReferenceInternal {
  set(
    data: WithFieldValue<AppModelType> | PartialWithFieldValue<AppModelType>,
    options?: SetOptions,
    ...deprecationArg: unknown[]
  ): Promise<void>;
  update(
    fieldOrUpdateData?: unknown,
    value?: unknown,
    ...moreFieldsAndValuesAndDeprecationArg: unknown[]
  ): Promise<void>;
  delete(...deprecationArg: unknown[]): Promise<void>;
  get(...deprecationArg: unknown[]): Promise<unknown>;
}

export interface CollectionReferenceInternal<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>
  extends ReferenceInternal<AppModelType, DbModelType>, ParentReferenceInternal {
  add(
    data: WithFieldValue<AppModelType>,
    ...deprecationArg: unknown[]
  ): Promise<DocumentReference<AppModelType, DbModelType>>;
}

export interface QueryInternal<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends ReferenceInternal<AppModelType, DbModelType> {
  get(...deprecationArg: unknown[]): Promise<QuerySnapshot<AppModelType, DbModelType>>;
  count(...deprecationArg: unknown[]): { get(): Promise<unknown> };
  where(...queryConstraintOrDeprecationArg: unknown[]): Query<AppModelType, DbModelType>;
  withConstraints(...queryConstraints: QueryConstraint[]): Query<AppModelType, DbModelType>;
}

export interface FirestoreInternal extends ParentReferenceInternal, Firestore {
  /** Wrapped native module (merged Firestore native modules). */
  readonly native: RNFBFirestoreModule;
  /** Shared event emitter for sync events (document, collection, snapshots-in-sync). */
  readonly emitter: FirestoreEmitterInternal;
  /** Builds app- and database-scoped event name. */
  eventNameForApp(...args: Array<string | number>): string;
  /** Module settings (e.g. ignoreUndefinedProperties for serialization). */
  readonly _settings: FirestoreSettingsStateInternal;
  collectionGroup(collectionId: string, ...deprecationArg: unknown[]): Query;
  enableNetwork(...deprecationArg: unknown[]): Promise<void>;
  disableNetwork(...deprecationArg: unknown[]): Promise<void>;
  clearPersistence(...deprecationArg: unknown[]): Promise<void>;
  waitForPendingWrites(...deprecationArg: unknown[]): Promise<void>;
  terminate(...deprecationArg: unknown[]): Promise<void>;
  settings(settings: FirestoreSettings, ...deprecationArg: unknown[]): Promise<void>;
  useEmulator(host: string, port: number, options?: unknown, ...deprecationArg: unknown[]): void;
  runTransaction(
    updateFunction: (transaction: Transaction) => Promise<unknown>,
    ...deprecationArg: unknown[]
  ): Promise<unknown>;
  loadBundle(
    bundleData: ReadableStream<Uint8Array> | ArrayBuffer | string,
    ...deprecationArg: unknown[]
  ): LoadBundleTask;
  namedQuery(name: string, ...deprecationArg: unknown[]): Query | null;
  batch(...deprecationArg: unknown[]): WriteBatch;
  persistentCacheIndexManager(...deprecationArg: unknown[]): PersistentCacheIndexManager | null;
}

export interface PersistentCacheIndexManagerInternal extends PersistentCacheIndexManager {
  enableIndexAutoCreation(...deprecationArg: unknown[]): Promise<void>;
  disableIndexAutoCreation(...deprecationArg: unknown[]): Promise<void>;
  deleteAllIndexes(...deprecationArg: unknown[]): Promise<void>;
}

export type FirestoreBlobInternal = Blob & { _binaryString: string };

export type QueryWithAggregateInternals = Query & {
  _firestore: FirestoreInternal;
  _collectionPath: { relativeName: string };
  _modifiers: {
    type: FirestoreQueryTypeInternal;
    filters: FirestoreFilterSpecInternal[];
    orders: FirestoreOrderSpecInternal[];
    options: FirestoreQueryOptionsInternal;
  };
};
