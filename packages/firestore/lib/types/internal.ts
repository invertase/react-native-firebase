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
  Firestore,
  FirestoreSettings,
  PersistentCacheIndexManager,
  Query,
  SetOptions,
  Transaction,
  WriteBatch,
  WithFieldValue,
} from './firestore';
import type { QueryConstraint } from '../modular/query';
import type { QuerySnapshot } from '../modular/snapshot';
import FirestoreBlob from 'lib/FirestoreBlob';

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

export interface DocumentReferenceInternal<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>
  extends ReferenceInternal<AppModelType, DbModelType>, ParentReferenceInternal {
  set(
    data: WithFieldValue<AppModelType>,
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
  add(data: WithFieldValue<AppModelType>, ...deprecationArg: unknown[]): Promise<DocumentReference>;
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
  ): Promise<unknown>;
  namedQuery(name: string, ...deprecationArg: unknown[]): Promise<Query | null>;
  batch(...deprecationArg: unknown[]): WriteBatch;
  persistentCacheIndexManager(...deprecationArg: unknown[]): PersistentCacheIndexManager | null;
}

export interface PersistentCacheIndexManagerInternal extends PersistentCacheIndexManager {
  enableIndexAutoCreation(...deprecationArg: unknown[]): Promise<void>;
  disableIndexAutoCreation(...deprecationArg: unknown[]): Promise<void>;
  deleteAllIndexes(...deprecationArg: unknown[]): Promise<void>;
}

export type FirestoreBlobInternal = FirestoreBlob & { _binaryString: string };
