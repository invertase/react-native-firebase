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
import type { FirebaseFirestoreTypes } from '../index';
import type { FieldPath } from '../modular/FieldPath';
import type { FieldValue } from '../modular/FieldValue';

// Canonical app/module aliases used by modular declarations.
export type FirebaseApp = ReactNativeFirebase.FirebaseApp;
export type Firestore = FirebaseFirestoreTypes.Module;
export type FirestoreSettings = FirebaseFirestoreTypes.Settings;

// Core namespaced aliases referenced by modular wrappers.
export type PersistentCacheIndexManager = FirebaseFirestoreTypes.PersistentCacheIndexManager;
export type AggregateQuerySnapshot = FirebaseFirestoreTypes.AggregateQuerySnapshot;
export type SetOptions = FirebaseFirestoreTypes.SetOptions;
export type SnapshotListenOptions = FirebaseFirestoreTypes.SnapshotListenOptions;
export type WhereFilterOp = FirebaseFirestoreTypes.WhereFilterOp;
export type QueryCompositeFilterConstraint = FirebaseFirestoreTypes.QueryCompositeFilterConstraint;

// Re-exported helpers mirrored from modular declarations.
export type Primitive = string | number | boolean | undefined | null;

export interface DocumentData {
  [key: string]: any;
}

export type PartialWithFieldValue<T> =
  | Partial<T>
  | (T extends Primitive
      ? T
      : T extends object
        ? { [K in keyof T]?: PartialWithFieldValue<T[K]> | FieldValue }
        : never);

export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type AddPrefixToKeys<Prefix extends string, T extends Record<string, unknown>> = {
  [K in keyof T & string as `${Prefix}.${K}`]+?: T[K];
};

export type ChildUpdateFields<K extends string, V> =
  V extends Record<string, unknown> ? AddPrefixToKeys<K, UpdateData<V>> : never;

export type NestedUpdateFields<T extends Record<string, unknown>> = UnionToIntersection<
  {
    [K in keyof T & string]: ChildUpdateFields<K, T[K]>;
  }[keyof T & string]
>;

export type UpdateData<T> = T extends Primitive
  ? T
  : T extends object
    ? {
        [K in keyof T]?: UpdateData<T[K]> | FieldValue;
      } & NestedUpdateFields<T>
    : Partial<T>;

export type WithFieldValue<T> =
  | T
  | (T extends Primitive
      ? T
      : T extends object
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

export interface Query<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  firestore: Firestore;
  converter: FirestoreDataConverter<AppModelType, DbModelType> | null;
  withConverter(converter: null): Query<DocumentData, DocumentData>;
  withConverter<NewAppModelType, NewDbModelType extends DocumentData = DocumentData>(
    converter: FirestoreDataConverter<NewAppModelType, NewDbModelType>,
  ): Query<NewAppModelType, NewDbModelType>;
}

export interface CollectionReference<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends Query<AppModelType, DbModelType> {
  id: string;
  parent: DocumentReference<DocumentData, DocumentData> | null;
  path: string;
  withConverter(converter: null): CollectionReference<DocumentData, DocumentData>;
  withConverter<NewAppModelType, NewDbModelType extends DocumentData = DocumentData>(
    converter: FirestoreDataConverter<NewAppModelType, NewDbModelType>,
  ): CollectionReference<NewAppModelType, NewDbModelType>;
}

export interface DocumentReference<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
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

export class WriteBatch {
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

export class LiteTransaction {}

export class Transaction extends LiteTransaction {
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

export type TransactionOptions = unknown;
export type SnapshotOptions = unknown;
export interface QueryDocumentSnapshot<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  data(options?: SnapshotOptions): AppModelType;
}
export interface DocumentSnapshot<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {}

// Utility aliases for later migration steps.
export type ModularTypes = typeof import('../modular/index');
export type ModularQueryTypes = typeof import('../modular/query');
export type ModularSnapshotTypes = typeof import('../modular/snapshot');
