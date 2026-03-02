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

import { getApp, setLogLevel as appSetLogLevel } from '@react-native-firebase/app';
import { isObject, MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import {
  AggregateField,
  fieldPathFromArgument,
  AggregateQuerySnapshot,
} from './FirestoreAggregate';
import { Filter } from './FirestoreFilter';
import QueryImpl from './FirestoreQuery';
import { LoadBundleTask } from './LoadBundleTask';
import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
  FirestoreSettings,
  FirebaseApp,
  EmulatorMockTokenOptions,
  Query,
  SetOptions,
  Transaction,
  UpdateData,
  WithFieldValue,
  PartialWithFieldValue,
  WriteBatch,
  AggregateType,
  AggregateSpec,
  LoadBundleTaskProgress,
  LogLevel,
} from './types/firestore';
import type {
  CollectionReferenceInternal,
  DocumentReferenceInternal,
  FirestoreInternal,
  ParentReferenceInternal,
  PersistentCacheIndexManagerInternal,
  QueryInternal,
  QueryWithAggregateInternals,
  ReferenceInternal,
} from './types/internal';
import { PersistentCacheIndexManager } from './FirestorePersistentCacheIndexManager';
import type { FieldPath } from './modular/FieldPath';
import type { Unsubscribe } from './modular/snapshot';

export { AggregateField, AggregateQuerySnapshot } from './FirestoreAggregate';

export const CACHE_SIZE_UNLIMITED = -1;

type FirestoreWithSyncEvents = FirestoreInternal & {
  native: {
    addSnapshotsInSync(listenerId: number): void;
    removeSnapshotsInSync(listenerId: number): void;
  };
  emitter: {
    addListener(eventName: string, callback: () => void): { remove(): void };
  };
  eventNameForApp(eventName: string): string;
};

export function getFirestore(): Firestore;
export function getFirestore(app: FirebaseApp): Firestore;
export function getFirestore(app: FirebaseApp, databaseId: string): Firestore;
export function getFirestore(
  appOrDatabaseId?: FirebaseApp | string,
  databaseId?: string,
): Firestore {
  const app = (name?: string) =>
    getApp(name) as unknown as { firestore(databaseId?: string): Firestore };

  if (typeof appOrDatabaseId === 'string') {
    return app().firestore(appOrDatabaseId);
  }

  if (appOrDatabaseId) {
    if (databaseId) {
      return app(appOrDatabaseId.name).firestore(databaseId);
    }
    return app(appOrDatabaseId.name).firestore();
  }

  if (databaseId) {
    return app().firestore(databaseId);
  }

  return app().firestore();
}

export function doc<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  parent:
    | Firestore
    | CollectionReference<AppModelType, DbModelType>
    | DocumentReference<AppModelType, DbModelType>,
  path?: string,
  ...pathSegments: string[]
): DocumentReference<AppModelType, DbModelType> {
  let resolvedPath = path;
  if (pathSegments.length) {
    resolvedPath =
      (resolvedPath ?? '') +
      '/' +
      pathSegments.map(segment => segment.replace(/^\/|\/$/g, '')).join('/');
  }

  return (parent as unknown as ParentReferenceInternal).doc.call(
    parent,
    resolvedPath,
    MODULAR_DEPRECATION_ARG,
  ) as DocumentReference<AppModelType, DbModelType>;
}

export function collection<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  parent:
    | Firestore
    | DocumentReference<AppModelType, DbModelType>
    | CollectionReference<AppModelType, DbModelType>,
  path: string,
  ...pathSegments: string[]
): CollectionReference<DocumentData, DocumentData> {
  let resolvedPath = path;
  if (pathSegments.length) {
    resolvedPath = `${resolvedPath}/${pathSegments.map(segment => segment.replace(/^\/|\/$/g, '')).join('/')}`;
  }

  return (parent as unknown as ParentReferenceInternal).collection.call(
    parent,
    resolvedPath,
    MODULAR_DEPRECATION_ARG,
  ) as CollectionReference<DocumentData, DocumentData>;
}

export function refEqual<AppModelType, DbModelType extends DocumentData>(
  left:
    | DocumentReference<AppModelType, DbModelType>
    | CollectionReference<AppModelType, DbModelType>,
  right:
    | DocumentReference<AppModelType, DbModelType>
    | CollectionReference<AppModelType, DbModelType>,
): boolean {
  return (left as unknown as ReferenceInternal<AppModelType, DbModelType>).isEqual.call(
    left,
    right,
    MODULAR_DEPRECATION_ARG,
  );
}

export function collectionGroup(
  firestore: Firestore,
  collectionId: string,
): Query<DocumentData, DocumentData> {
  return (firestore as FirestoreInternal).collectionGroup.call(
    firestore,
    collectionId,
    MODULAR_DEPRECATION_ARG,
  ) as Query<DocumentData, DocumentData>;
}

let snapshotInSyncListenerId = 0;

export function onSnapshotsInSync(
  firestore: Firestore,
  observer: { next?: () => void; error?: (error: Error) => void; complete?: () => void },
): Unsubscribe;
export function onSnapshotsInSync(firestore: Firestore, onSync: () => void): Unsubscribe;
export function onSnapshotsInSync(
  firestore: Firestore,
  callback:
    | (() => void)
    | { next?: () => void; error?: (error: Error) => void; complete?: () => void },
): Unsubscribe {
  const listenerId = snapshotInSyncListenerId++;
  const syncFirestore = firestore as FirestoreWithSyncEvents;
  syncFirestore.native.addSnapshotsInSync(listenerId);
  const subscription = syncFirestore.emitter.addListener(
    syncFirestore.eventNameForApp(`firestore_snapshots_in_sync_event:${listenerId}`),
    () => {
      if (typeof callback === 'function') {
        callback();
      } else {
        callback.next?.();
      }
    },
  );

  return () => {
    subscription.remove();
    syncFirestore.native.removeSnapshotsInSync(listenerId);
  };
}

export function setDoc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  data: WithFieldValue<AppModelType>,
): Promise<void>;
export function setDoc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  data: PartialWithFieldValue<AppModelType>,
  options: SetOptions,
): Promise<void>;
export function setDoc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  data: WithFieldValue<AppModelType> | PartialWithFieldValue<AppModelType>,
  options?: SetOptions,
): Promise<void> {
  return (reference as unknown as DocumentReferenceInternal<AppModelType, DbModelType>).set.call(
    reference,
    data,
    options,
    MODULAR_DEPRECATION_ARG,
  );
}

export function updateDoc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  fieldOrUpdateData: string | FieldPath | UpdateData<DbModelType>,
  value?: unknown,
  ...moreFieldsAndValues: unknown[]
): Promise<void> {
  const ref = reference as unknown as DocumentReferenceInternal<AppModelType, DbModelType>;

  if (!fieldOrUpdateData) {
    return ref.update.call(reference, MODULAR_DEPRECATION_ARG);
  }

  if (!value) {
    return ref.update.call(reference, fieldOrUpdateData, MODULAR_DEPRECATION_ARG);
  }

  if (!Array.isArray(moreFieldsAndValues)) {
    return ref.update.call(reference, fieldOrUpdateData, value, MODULAR_DEPRECATION_ARG);
  }

  return ref.update.call(
    reference,
    fieldOrUpdateData,
    value,
    ...moreFieldsAndValues,
    MODULAR_DEPRECATION_ARG,
  );
}

export function addDoc<AppModelType, DbModelType extends DocumentData>(
  reference: CollectionReference<AppModelType, DbModelType>,
  data: WithFieldValue<AppModelType>,
): Promise<DocumentReference<AppModelType, DbModelType>> {
  return (reference as unknown as CollectionReferenceInternal<AppModelType, DbModelType>).add.call(
    reference,
    data,
    MODULAR_DEPRECATION_ARG,
  ) as Promise<DocumentReference<AppModelType, DbModelType>>;
}

export function enableNetwork(firestore: Firestore): Promise<void> {
  return (firestore as FirestoreInternal).enableNetwork.call(firestore, MODULAR_DEPRECATION_ARG);
}

export function disableNetwork(firestore: Firestore): Promise<void> {
  return (firestore as FirestoreInternal).disableNetwork.call(firestore, MODULAR_DEPRECATION_ARG);
}

export function clearPersistence(firestore: Firestore): Promise<void> {
  // this will call deprecation warning as it isn't part of firebase-js-sdk API
  return (firestore as FirestoreInternal).clearPersistence();
}

export function clearIndexedDbPersistence(firestore: Firestore): Promise<void> {
  return (firestore as FirestoreInternal).clearPersistence.call(firestore, MODULAR_DEPRECATION_ARG);
}

export function terminate(firestore: Firestore): Promise<void> {
  return (firestore as FirestoreInternal).terminate.call(firestore, MODULAR_DEPRECATION_ARG);
}

export function waitForPendingWrites(firestore: Firestore): Promise<void> {
  return (firestore as FirestoreInternal).waitForPendingWrites.call(
    firestore,
    MODULAR_DEPRECATION_ARG,
  );
}

export async function initializeFirestore(
  app: FirebaseApp,
  settings: FirestoreSettings,
  databaseId?: string,
): Promise<Firestore> {
  const firebase = getApp(app.name) as unknown as { firestore(databaseId?: string): Firestore };
  const firestore = firebase.firestore(databaseId) as unknown as FirestoreInternal;
  await firestore.settings.call(firestore, settings, MODULAR_DEPRECATION_ARG);
  return firestore;
}

export function connectFirestoreEmulator(
  firestore: Firestore,
  host: string,
  port: number,
  options?: { mockUserToken?: EmulatorMockTokenOptions | string },
): void {
  return (firestore as FirestoreInternal).useEmulator.call(
    firestore,
    host,
    port,
    options,
    MODULAR_DEPRECATION_ARG,
  );
}

export function setLogLevel(logLevel: LogLevel): void {
  return appSetLogLevel(logLevel);
}

export function runTransaction<T>(
  firestore: Firestore,
  updateFunction: (transaction: Transaction) => Promise<T>,
): Promise<T> {
  return (firestore as FirestoreInternal).runTransaction.call(
    firestore,
    updateFunction,
    MODULAR_DEPRECATION_ARG,
  ) as Promise<T>;
}

export function getCountFromServer<AppModelType, DbModelType extends DocumentData>(
  query: Query<AppModelType, DbModelType>,
): Promise<AggregateQuerySnapshot<{ count: AggregateField<number> }, AppModelType, DbModelType>> {
  return (query as unknown as QueryInternal<AppModelType, DbModelType>).count
    .call(query, MODULAR_DEPRECATION_ARG)
    .get() as Promise<
    AggregateQuerySnapshot<{ count: AggregateField<number> }, AppModelType, DbModelType>
  >;
}

export function getAggregateFromServer<
  AggregateSpecType extends AggregateSpec,
  AppModelType,
  DbModelType extends DocumentData,
>(
  query: Query<AppModelType, DbModelType>,
  aggregateSpec: AggregateSpecType,
): Promise<AggregateQuerySnapshot<AggregateSpecType, AppModelType, DbModelType>> {
  if (!(query instanceof QueryImpl)) {
    throw new Error(
      '`getAggregateFromServer(*, aggregateSpec)` `query` must be an instance of `FirestoreQuery`',
    );
  }

  if (!isObject(aggregateSpec)) {
    throw new Error('`getAggregateFromServer(query, *)` `aggregateSpec` must be an object');
  }

  const containsOneAggregateField = Object.values(aggregateSpec).find(
    value => value instanceof AggregateField,
  );
  if (!containsOneAggregateField) {
    throw new Error(
      '`getAggregateFromServer(query, *)` `aggregateSpec` must contain at least one `AggregateField`',
    );
  }

  const aggregateQueries: Array<{
    aggregateType: AggregateType;
    field: string | null;
    key: string;
  }> = [];

  for (const key in aggregateSpec) {
    if (!Object.prototype.hasOwnProperty.call(aggregateSpec, key)) {
      continue;
    }
    const aggregateField = aggregateSpec[key];
    if (!(aggregateField instanceof AggregateField)) {
      continue;
    }
    switch (aggregateField.aggregateType) {
      case 'avg':
      case 'sum':
      case 'count':
        aggregateQueries.push({
          aggregateType: aggregateField.aggregateType,
          field:
            aggregateField._internalFieldPath === undefined
              ? null
              : aggregateField._internalFieldPath._toPath(),
          key,
        });
        break;
      default:
        throw new Error(
          `'AggregateField' has an an unknown 'AggregateType' : ${aggregateField.aggregateType}`,
        );
    }
  }

  const queryWithInternals = query as QueryWithAggregateInternals;
  return queryWithInternals._firestore.native
    .aggregateQuery(
      queryWithInternals._collectionPath.relativeName,
      queryWithInternals._modifiers.type,
      queryWithInternals._modifiers.filters,
      queryWithInternals._modifiers.orders,
      queryWithInternals._modifiers.options,
      aggregateQueries,
    )
    .then(
      (data: { count?: number; [key: string]: unknown }) =>
        new AggregateQuerySnapshot(query, data, false) as AggregateQuerySnapshot<
          AggregateSpecType,
          AppModelType,
          DbModelType
        >,
    );
}

export function sum(field: string | FieldPath): AggregateField<number> {
  return new AggregateField('sum', fieldPathFromArgument(field));
}

export function average(field: string | FieldPath): AggregateField<number | null> {
  return new AggregateField('avg', fieldPathFromArgument(field));
}

export function count(): AggregateField<number> {
  return new AggregateField('count');
}

export function loadBundle(
  firestore: Firestore,
  bundleData: ReadableStream<Uint8Array> | ArrayBuffer | string,
): LoadBundleTask {
  const task = new LoadBundleTask();
  (firestore as FirestoreInternal).loadBundle
    .call(firestore, bundleData, MODULAR_DEPRECATION_ARG)
    .then(progress => task._completeWith(progress as LoadBundleTaskProgress))
    .catch(error => task._failWith(error));
  return task;
}

export function namedQuery(firestore: Firestore, name: string): Promise<Query | null> {
  return (firestore as FirestoreInternal).namedQuery.call(firestore, name, MODULAR_DEPRECATION_ARG);
}

export function writeBatch(firestore: Firestore): WriteBatch {
  return (firestore as FirestoreInternal).batch.call(firestore, MODULAR_DEPRECATION_ARG);
}

export function getPersistentCacheIndexManager(
  firestore: Firestore,
): PersistentCacheIndexManager | null {
  return (firestore as FirestoreInternal).persistentCacheIndexManager.call(
    firestore,
    MODULAR_DEPRECATION_ARG,
  );
}

export function enablePersistentCacheIndexAutoCreation(
  indexManager: PersistentCacheIndexManager,
): Promise<void> {
  return (indexManager as PersistentCacheIndexManagerInternal).enableIndexAutoCreation.call(
    indexManager,
    MODULAR_DEPRECATION_ARG,
  );
}

export function disablePersistentCacheIndexAutoCreation(
  indexManager: PersistentCacheIndexManager,
): Promise<void> {
  return (indexManager as PersistentCacheIndexManagerInternal).disableIndexAutoCreation.call(
    indexManager,
    MODULAR_DEPRECATION_ARG,
  );
}

export function deleteAllPersistentCacheIndexes(
  indexManager: PersistentCacheIndexManager,
): Promise<void> {
  return (indexManager as PersistentCacheIndexManagerInternal).deleteAllIndexes.call(
    indexManager,
    MODULAR_DEPRECATION_ARG,
  );
}

export * from './modular/query';
export * from './modular/snapshot';
export * from './modular/Bytes';
export * from './modular/FieldPath';
export * from './modular/FieldValue';
export * from './modular/GeoPoint';
export * from './modular/Timestamp';
export * from './modular/VectorValue';
export { LoadBundleTask } from './LoadBundleTask';
export type { LoadBundleTaskProgress, TaskState } from './LoadBundleTask';
export { Filter };
export { default as WriteBatch } from './FirestoreWriteBatch';
export type { LogLevel } from './types/firestore';
