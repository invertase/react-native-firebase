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
import type { FieldPath } from '../modular/FieldPath';
import type { FieldValue } from '../modular/FieldValue';
import type { AggregateField } from '../FirestoreAggregate';
import type { sum, average, count } from '../modular';

// Canonical app/module aliases used by modular declarations.
export type FirebaseApp = ReactNativeFirebase.FirebaseApp;
export declare class Firestore {
  /**
   * Whether it's a Firestore or Firestore Lite instance.
   */
  type: 'firestore';
  /**
   * The FirebaseApp associated with this Firestore instance.
   */
  get app(): FirebaseApp;
  /**
   * Returns a JSON-serializable representation of this Firestore instance.
   */
  toJSON(): object;
}

export type LogLevel = 'debug' | 'error' | 'silent';
// web/other platform only
export interface ExperimentalLongPollingOptions {
  timeoutSeconds?: number;
}

// web/other platform only
export interface PersistenceSettings {
  forceOwnership?: boolean;
}

// web/other platform only
export type MemoryLocalCache = {
  kind: 'memory';
  _onlineComponentProvider: unknown;
  _offlineComponentProvider: unknown;
};

// web/other platform only
export type PersistentLocalCache = {
  kind: 'persistent';
  _onlineComponentProvider: unknown;
  _offlineComponentProvider: unknown;
};

// web/other platform only
export type FirestoreLocalCache = MemoryLocalCache | PersistentLocalCache;

export interface FirestoreSettings {
  host?: string;
  ssl?: boolean;
  ignoreUndefinedProperties?: boolean;
  cacheSizeBytes?: number;
  // web/other platform only
  localCache?: FirestoreLocalCache;
  // web/other platform only
  experimentalForceLongPolling?: boolean;
  // web/other platform only
  experimentalAutoDetectLongPolling?: boolean;
  // web/other platform only
  experimentalLongPollingOptions?: ExperimentalLongPollingOptions;
  // React Native native SDK-specific settings.
  persistence?: boolean;
  serverTimestampBehavior?: 'estimate' | 'previous' | 'none';
}

export type AggregateType = 'count' | 'avg' | 'sum';
export type AggregateFieldType =
  | ReturnType<typeof sum>
  | ReturnType<typeof average>
  | ReturnType<typeof count>;
export interface AggregateSpec {
  [field: string]: AggregateFieldType;
}
export type AggregateSpecData<T extends AggregateSpec> = {
  [P in keyof T]: T[P] extends AggregateField<infer U> ? U : never;
};

/**
 * Provider identifier for Firebase Auth (from @firebase/util).
 * Must match the union used by EmulatorMockTokenOptions / FirebaseIdToken.
 */
export type FirebaseSignInProvider =
  | 'custom'
  | 'email'
  | 'password'
  | 'phone'
  | 'anonymous'
  | 'google.com'
  | 'facebook.com'
  | 'github.com'
  | 'twitter.com'
  | 'microsoft.com'
  | 'apple.com';

/**
 * Shape of a decoded Firebase ID token (JWT) used for emulator mock auth.
 * @see https://firebase.google.com/docs/reference/js/auth#firebaseidtoken
 */
export interface FirebaseIdToken {
  iss: string;
  aud: string;
  sub: string;
  iat: number;
  exp: number;
  user_id: string;
  auth_time: number;
  provider_id?: 'anonymous';
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  name?: string;
  picture?: string;
  firebase: {
    sign_in_provider: FirebaseSignInProvider;
    identities?: { [provider in FirebaseSignInProvider]?: string[] };
  };
  [claim: string]: unknown;
  uid?: never;
}

/**
 * Options for mock auth token when using the Firestore emulator.
 * Must include either `user_id` or `sub`; may include other partial ID token claims.
 */
export type EmulatorMockTokenOptions = ({ user_id: string } | { sub: string }) &
  Partial<FirebaseIdToken>;

export type TaskState = 'Error' | 'Running' | 'Success';

export interface LoadBundleTaskProgress {
  documentsLoaded: number;
  totalDocuments: number;
  bytesLoaded: number;
  totalBytes: number;
  taskState: TaskState;
}

export declare class LoadBundleTask implements PromiseLike<LoadBundleTaskProgress> {
  onProgress(
    next?: (progress: LoadBundleTaskProgress) => unknown,
    error?: (err: Error) => unknown,
    complete?: () => void,
  ): void;
  catch<R>(onRejected: (a: Error) => R | PromiseLike<R>): Promise<R | LoadBundleTaskProgress>;
  then<T, R>(
    onFulfilled?: (a: LoadBundleTaskProgress) => T | PromiseLike<T>,
    onRejected?: (a: Error) => R | PromiseLike<R>,
  ): Promise<T | R>;
}

export type SetOptions =
  | {
      readonly merge?: boolean;
    }
  | {
      readonly mergeFields?: Array<string | FieldPath>;
    };

export type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '!='
  | '>='
  | '>'
  | 'array-contains'
  | 'in'
  | 'array-contains-any'
  | 'not-in';

export type OrderByDirection = 'desc' | 'asc';

export type QueryConstraintType =
  | 'where'
  | 'orderBy'
  | 'limit'
  | 'limitToLast'
  | 'startAt'
  | 'startAfter'
  | 'endAt'
  | 'endBefore';

export interface SnapshotListenOptions {
  readonly includeMetadataChanges?: boolean;
  readonly source?: 'default' | 'cache';
}

/**
 * Options that configure how data is retrieved from a `DocumentSnapshot` (for
 * example the desired behavior for server timestamps that have not yet been set
 * to their final value).
 */
export declare interface SnapshotOptions {
  /**
   * If set, controls the return value for server timestamps that have not yet
   * been set to their final value.
   *
   * By specifying 'estimate', pending server timestamps return an estimate
   * based on the local clock. This estimate will differ from the final value
   * and cause these values to change once the server result becomes available.
   *
   * By specifying 'previous', pending timestamps will be ignored and return
   * their previous value instead.
   *
   * If omitted or set to 'none', `null` will be returned by default until the
   * server value becomes available.
   */
  readonly serverTimestamps?: 'estimate' | 'previous' | 'none';
}

export declare class SnapshotMetadata {
  readonly fromCache: boolean;
  readonly hasPendingWrites: boolean;
  isEqual(other: SnapshotMetadata): boolean;
}

export type DocumentChangeType = 'added' | 'removed' | 'modified';

export type FirestoreError = Error;

export interface Unsubscribe {
  (): void;
}

export interface DocumentChange<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  readonly type: DocumentChangeType;
  readonly doc: QueryDocumentSnapshot<AppModelType, DbModelType>;
  readonly oldIndex: number;
  readonly newIndex: number;
}

// Re-exported helpers mirrored from modular declarations.
export type Primitive = string | number | boolean | undefined | null;

export interface DocumentData {
  [key: string]: any;
}

export type PartialWithFieldValue<T> =
  | Partial<T>
  | (T extends Primitive
      ? T
      : T extends {}
        ? { [K in keyof T]?: PartialWithFieldValue<T[K]> | FieldValue }
        : never);

/**
 * Given a union type `U = T1 | T2 | ...`, returns an intersected type
 * `(T1 & T2 & ...)`.
 *
 * Uses distributive conditional types and inference from conditional types.
 * This works because multiple candidates for the same type variable in
 * contra-variant positions causes an intersection type to be inferred.
 * https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-inference-in-conditional-types
 * https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
 */
export declare type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type AddPrefixToKeys<Prefix extends string, T extends Record<string, unknown>> = {
  // `string extends K` detects index signatures (e.g. `{[key: string]: bool}`).
  // A field path like `foo.[string]` matches `foo.bar` or any sub-path, so we
  // must widen to `any` to allow arbitrary sub-path property types.
  [K in keyof T & string as `${Prefix}.${K}`]+?: string extends K ? any : T[K];
};

export type ChildUpdateFields<K extends string, V> =
  V extends Record<string, unknown> ? AddPrefixToKeys<K, UpdateData<V>> : never;

export type NestedUpdateFields<T extends {}> = UnionToIntersection<
  {
    [K in keyof T & string]: ChildUpdateFields<K, T[K]>;
  }[keyof T & string]
>;

export type UpdateData<T> = T extends Primitive
  ? T
  : T extends {}
    ? {
        [K in keyof T]?: UpdateData<T[K]> | FieldValue;
      } & NestedUpdateFields<T>
    : Partial<T>;

export type WithFieldValue<T> =
  | T
  | (T extends Primitive
      ? T
      : T extends {}
        ? { [K in keyof T]: WithFieldValue<T[K]> | FieldValue }
        : never);

export interface FirestoreDataConverter<
  AppModelType,
  DbModelType extends DocumentData = DocumentData,
> {
  toFirestore(modelObject: WithFieldValue<AppModelType>): WithFieldValue<DbModelType>;
  toFirestore(
    modelObject: PartialWithFieldValue<AppModelType>,
    options: SetOptions,
  ): PartialWithFieldValue<DbModelType>;
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>,
    options?: SnapshotOptions,
  ): AppModelType;
}

export declare class Query<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  readonly converter: FirestoreDataConverter<AppModelType, DbModelType> | null;
  readonly type: 'query' | 'collection';
  readonly firestore: Firestore;
  withConverter(converter: null): Query<DocumentData, DocumentData>;
  withConverter<NewAppModelType, NewDbModelType extends DocumentData = DocumentData>(
    converter: FirestoreDataConverter<NewAppModelType, NewDbModelType>,
  ): Query<NewAppModelType, NewDbModelType>;
}

export declare class CollectionReference<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends Query<AppModelType, DbModelType> {
  readonly type: 'collection';
  id: string;
  parent: DocumentReference<DocumentData, DocumentData> | null;
  path: string;
  withConverter(converter: null): CollectionReference<DocumentData, DocumentData>;
  withConverter<NewAppModelType, NewDbModelType extends DocumentData = DocumentData>(
    converter: FirestoreDataConverter<NewAppModelType, NewDbModelType>,
  ): CollectionReference<NewAppModelType, NewDbModelType>;
}

export declare class DocumentReference<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  readonly type: 'document';
  firestore: Firestore;
  converter: FirestoreDataConverter<AppModelType, DbModelType> | null;
  id: string;
  parent: CollectionReference<AppModelType, DbModelType>;
  path: string;
  withConverter(converter: null): DocumentReference<DocumentData, DocumentData>;
  withConverter<NewAppModelType, NewDbModelType extends DocumentData = DocumentData>(
    converter: FirestoreDataConverter<NewAppModelType, NewDbModelType>,
  ): DocumentReference<NewAppModelType, NewDbModelType>;
}

export declare class WriteBatch {
  set<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    data: WithFieldValue<AppModelType>,
  ): WriteBatch;
  set<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    data: PartialWithFieldValue<AppModelType>,
    options: SetOptions,
  ): WriteBatch;
  update<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    data: UpdateData<DbModelType>,
  ): WriteBatch;
  update<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    field: string | FieldPath,
    value: unknown,
    ...moreFieldsAndValues: unknown[]
  ): WriteBatch;
  update<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    fieldOrUpdateData: string | FieldPath | UpdateData<DbModelType>,
    value?: unknown,
    ...moreFieldsAndValues: unknown[]
  ): WriteBatch;
  delete<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
  ): WriteBatch;
  commit(): Promise<void>;
}

export declare class LiteTransaction {}

export declare class Transaction extends LiteTransaction {
  get<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
  ): Promise<DocumentSnapshot<AppModelType, DbModelType>>;
  set<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    data: WithFieldValue<AppModelType>,
  ): this;
  set<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    data: PartialWithFieldValue<AppModelType>,
    options: SetOptions,
  ): this;
  update<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    data: UpdateData<DbModelType>,
  ): this;
  update<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    field: string | FieldPath,
    value: unknown,
    ...moreFieldsAndValues: unknown[]
  ): this;
  update<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    fieldOrUpdateData: string | FieldPath | UpdateData<DbModelType>,
    value?: unknown,
    ...moreFieldsAndValues: unknown[]
  ): this;
  delete<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
  ): this;
}

export declare class DocumentSnapshot<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  readonly metadata: SnapshotMetadata;
  exists(): this is QueryDocumentSnapshot<AppModelType, DbModelType>;
  data(options?: SnapshotOptions): AppModelType | undefined;
  get(fieldPath: string | FieldPath, options?: SnapshotOptions): any;
  get id(): string;
  get ref(): DocumentReference<AppModelType, DbModelType>;
}

export declare class QueryDocumentSnapshot<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends DocumentSnapshot<AppModelType, DbModelType> {
  data(options?: SnapshotOptions): AppModelType;
}

export declare class QuerySnapshot<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  readonly metadata: SnapshotMetadata;
  readonly query: Query<AppModelType, DbModelType>;
  get docs(): Array<QueryDocumentSnapshot<AppModelType, DbModelType>>;
  get size(): number;
  get empty(): boolean;
  forEach(
    callback: (result: QueryDocumentSnapshot<AppModelType, DbModelType>) => void,
    thisArg?: unknown,
  ): void;
  docChanges(options?: SnapshotListenOptions): Array<DocumentChange<AppModelType, DbModelType>>;
}
