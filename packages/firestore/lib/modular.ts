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

import { getOrCreateModularInstance } from '@react-native-firebase/app/dist/module/internal';
import { isObject } from '@react-native-firebase/app/dist/module/common';
import { Query as QueryClass } from './FirestoreQuery';
import { FirebaseFirestoreModule, config } from './FirestoreModule';
import FirestoreStatics from './FirestoreStatics';
import { LoadBundleTask } from './LoadBundleTask';
import { version } from './version';
import {
  AggregateField,
  aggregateFieldEqual,
  fieldPathFromArgument,
  AggregateQuerySnapshot,
} from './FirestoreAggregate';
import { PersistentCacheIndexManager } from './FirestorePersistentCacheIndexManager';
import type { FirebaseApp } from '@react-native-firebase/app';
import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
  FirestoreSettings,
  EmulatorMockTokenOptions,
  Query,
  SetOptions,
  Transaction,
  UpdateData,
  WithFieldValue,
  PartialWithFieldValue,
  WriteBatch,
  AggregateSpec,
  LogLevel,
  Unsubscribe,
  LoadBundleTaskProgress,
  FirestoreError,
  TransactionOptions,
} from './types/firestore';
import type {
  CollectionReferenceInternal,
  DocumentReferenceInternal,
  FirestoreInternal,
  ParentReferenceInternal,
  PersistentCacheIndexManagerInternal,
  QueryInternal,
  ReferenceInternal,
  FirestoreAggregateQuerySpecInternal,
  FirestoreAggregateQueryResultInternal,
  QueryWithAggregateInternals,
} from './types/internal';
import type { FieldPath } from './FieldPath';

// react-native at least through 0.77 does not correctly support URL.host, which
// is needed by firebase-js-sdk. It appears that in 0.80+ it is supported, so this
// (and the package.json entry for this package) should be removed when the minimum
// supported version of react-native is 0.80 or higher.
import 'react-native-url-polyfill/auto';

export const SDK_VERSION = version;

const PIPELINE_RUNTIME_INSTALLER_SYMBOL = Symbol.for('RNFBFirestorePipelineRuntimeInstaller');

type GlobalWithPipelineInstaller = typeof globalThis & {
  [PIPELINE_RUNTIME_INSTALLER_SYMBOL]?: (firestore?: FirestoreInternal) => void;
};

export const CACHE_SIZE_UNLIMITED = -1;
export function getFirestore(): Firestore;
export function getFirestore(app: FirebaseApp): Firestore;
export function getFirestore(app: FirebaseApp, databaseId: string): Firestore;
export function getFirestore(databaseId: string): Firestore;
export function getFirestore(
  appOrDatabaseId?: FirebaseApp | string,
  databaseId?: string,
): Firestore {
  let firestore: FirestoreInternal;
  if (typeof appOrDatabaseId === 'string') {
    firestore = getOrCreateModularInstance(
      FirebaseFirestoreModule,
      config,
      undefined,
      appOrDatabaseId,
    ) as unknown as FirestoreInternal;
  } else if (appOrDatabaseId) {
    firestore = getOrCreateModularInstance(
      FirebaseFirestoreModule,
      config,
      appOrDatabaseId,
      databaseId,
    ) as unknown as FirestoreInternal;
  } else if (databaseId) {
    firestore = getOrCreateModularInstance(
      FirebaseFirestoreModule,
      config,
      undefined,
      databaseId,
    ) as unknown as FirestoreInternal;
  } else {
    firestore = getOrCreateModularInstance(
      FirebaseFirestoreModule,
      config,
    ) as unknown as FirestoreInternal;
  }

  const runtimeGlobal = globalThis as GlobalWithPipelineInstaller;
  const installPipelineRuntime = runtimeGlobal[PIPELINE_RUNTIME_INSTALLER_SYMBOL];
  if (typeof installPipelineRuntime === 'function') {
    try {
      installPipelineRuntime(firestore);
    } catch {
      // Avoid changing getFirestore behavior if optional pipeline runtime install fails.
    }
  }

  return firestore as Firestore;
}

export function doc(
  parent: Firestore,
  path: string,
  ...pathSegments: string[]
): DocumentReference<DocumentData, DocumentData>;
export function doc<AppModelType, DbModelType extends DocumentData>(
  parent: CollectionReference<AppModelType, DbModelType>,
  path?: string,
  ...pathSegments: string[]
): DocumentReference<AppModelType, DbModelType>;
export function doc<AppModelType, DbModelType extends DocumentData>(
  parent: DocumentReference<AppModelType, DbModelType>,
  path: string,
  ...pathSegments: string[]
): DocumentReference<DocumentData, DocumentData>;
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

  return (parent as unknown as ParentReferenceInternal).doc(resolvedPath) as DocumentReference<
    AppModelType,
    DbModelType
  >;
}

export function collection(
  parent: Firestore,
  path: string,
  ...pathSegments: string[]
): CollectionReference<DocumentData, DocumentData>;
export function collection<AppModelType, DbModelType extends DocumentData>(
  parent: CollectionReference<AppModelType, DbModelType>,
  path: string,
  ...pathSegments: string[]
): CollectionReference<DocumentData, DocumentData>;
export function collection<AppModelType, DbModelType extends DocumentData>(
  parent: DocumentReference<AppModelType, DbModelType>,
  path: string,
  ...pathSegments: string[]
): CollectionReference<DocumentData, DocumentData>;
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

  return (parent as unknown as ParentReferenceInternal).collection(
    resolvedPath,
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
  return (left as unknown as ReferenceInternal<AppModelType, DbModelType>).isEqual(right);
}

export function collectionGroup(
  firestore: Firestore,
  collectionId: string,
): Query<DocumentData, DocumentData> {
  return (firestore as FirestoreInternal).collectionGroup(collectionId) as Query<
    DocumentData,
    DocumentData
  >;
}

let snapshotInSyncListenerId = 0;

export function onSnapshotsInSync(
  firestore: Firestore,
  observer: {
    next?: (value: void) => void;
    error?: (error: FirestoreError) => void;
    complete?: () => void;
  },
): Unsubscribe;
export function onSnapshotsInSync(firestore: Firestore, onSync: () => void): Unsubscribe;
export function onSnapshotsInSync(
  firestore: Firestore,
  callback:
    | (() => void)
    | {
        next?: (value: void) => void;
        error?: (error: FirestoreError) => void;
        complete?: () => void;
      },
): Unsubscribe {
  const listenerId = snapshotInSyncListenerId++;
  const syncFirestore = firestore as FirestoreInternal;
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
  return (reference as unknown as DocumentReferenceInternal<AppModelType, DbModelType>).set(
    data,
    options,
  );
}

export function updateDoc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  data: UpdateData<DbModelType>,
): Promise<void>;
export function updateDoc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  field: string | FieldPath,
  value: unknown,
  ...moreFieldsAndValues: unknown[]
): Promise<void>;
export function updateDoc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  fieldOrUpdateData: string | FieldPath | UpdateData<DbModelType>,
  value?: unknown,
  ...moreFieldsAndValues: unknown[]
): Promise<void> {
  const ref = reference as unknown as DocumentReferenceInternal<AppModelType, DbModelType>;

  if (!fieldOrUpdateData) {
    return ref.update();
  }

  if (!value) {
    return ref.update(fieldOrUpdateData);
  }

  if (!Array.isArray(moreFieldsAndValues)) {
    return ref.update(fieldOrUpdateData, value);
  }

  return ref.update(fieldOrUpdateData, value, ...moreFieldsAndValues);
}

export function addDoc<AppModelType, DbModelType extends DocumentData>(
  reference: CollectionReference<AppModelType, DbModelType>,
  data: WithFieldValue<AppModelType>,
): Promise<DocumentReference<AppModelType, DbModelType>> {
  return (reference as unknown as CollectionReferenceInternal<AppModelType, DbModelType>).add(
    data,
  ) as Promise<DocumentReference<AppModelType, DbModelType>>;
}

export function enableNetwork(firestore: Firestore): Promise<void> {
  return (firestore as FirestoreInternal).enableNetwork();
}

export function disableNetwork(firestore: Firestore): Promise<void> {
  return (firestore as FirestoreInternal).disableNetwork();
}

export function clearPersistence(firestore: Firestore): Promise<void> {
  // this will call deprecation warning as it isn't part of firebase-js-sdk API
  return (firestore as FirestoreInternal).clearPersistence();
}

/**
 * Clears IndexedDB persistence for the given Firestore instance.
 *
 * @remarks Alias for {@link clearPersistence} on React Native Firebase. IndexedDB APIs are
 * **web only** — this helper calls the native persistence clear path on iOS/Android.
 */
export function clearIndexedDbPersistence(firestore: Firestore): Promise<void> {
  return (firestore as FirestoreInternal).clearPersistence();
}

export function terminate(firestore: Firestore): Promise<void> {
  return (firestore as FirestoreInternal).terminate();
}

export function waitForPendingWrites(firestore: Firestore): Promise<void> {
  return (firestore as FirestoreInternal).waitForPendingWrites();
}

/**
 * Creates a Firestore instance with the given settings.
 *
 * @remarks Returns synchronously for firebase-js-sdk parity; settings are applied through the
 * native bridge in the background. Web-only `settings.localCache` values (`memoryLocalCache`,
 * `persistentLocalCache`, IndexedDB factories) are **not supported**; persistence is controlled
 * by the native Firestore SDK.
 */
export function initializeFirestore(
  app: FirebaseApp,
  settings: FirestoreSettings,
  databaseId?: string,
): Firestore {
  const firestore = getOrCreateModularInstance(
    FirebaseFirestoreModule,
    config,
    app,
    databaseId,
  ) as unknown as FirestoreInternal;
  void firestore.settings(settings);
  return firestore as Firestore;
}

export function connectFirestoreEmulator(
  firestore: Firestore,
  host: string,
  port: number,
  options?: { mockUserToken?: EmulatorMockTokenOptions | string },
): void {
  void options;
  return (firestore as FirestoreInternal).useEmulator(host, port);
}

export function setLogLevel(logLevel: LogLevel): void {
  return FirestoreStatics.setLogLevel(logLevel);
}

export function runTransaction<T>(
  firestore: Firestore,
  updateFunction: (transaction: Transaction) => Promise<T>,
  options?: TransactionOptions,
): Promise<T> {
  return (firestore as FirestoreInternal).runTransaction(updateFunction, options) as Promise<T>;
}

export type { TransactionOptions };

export function getCountFromServer<AppModelType, DbModelType extends DocumentData>(
  query: Query<AppModelType, DbModelType>,
): Promise<AggregateQuerySnapshot<{ count: AggregateField<number> }, AppModelType, DbModelType>> {
  return (query as unknown as QueryInternal<AppModelType, DbModelType>).count().get() as Promise<
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
  if (!(query instanceof QueryClass)) {
    throw new Error(
      '`getAggregateFromServer(*, aggregateSpec)` `query` must be an instance of `Query`',
    );
  }

  const queryWithInternals = query as unknown as QueryWithAggregateInternals;

  if (!isObject(aggregateSpec)) {
    throw new Error('`getAggregateFromServer(query, *)` `aggregateSpec` must be an object');
  }

  const containsOneAggregateField = Object.values(aggregateSpec).some(
    value => value instanceof AggregateField,
  );
  if (!containsOneAggregateField) {
    throw new Error(
      '`getAggregateFromServer(query, *)` `aggregateSpec` must contain at least one `AggregateField`',
    );
  }

  const aggregateQueries: FirestoreAggregateQuerySpecInternal[] = [];

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
      (data: FirestoreAggregateQueryResultInternal) =>
        new AggregateQuerySnapshot(
          query as Query<AppModelType, DbModelType>,
          data,
          false,
        ) as AggregateQuerySnapshot<AggregateSpecType, AppModelType, DbModelType>,
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

export { aggregateFieldEqual };

export function loadBundle(
  firestore: Firestore,
  bundleData: ReadableStream<Uint8Array> | ArrayBuffer | string,
): LoadBundleTask {
  const task = new LoadBundleTask();
  (firestore as FirestoreInternal)
    .loadBundle(bundleData)
    .then(progress => task._completeWith(progress as LoadBundleTaskProgress))
    .catch(error => task._failWith(error));
  return task;
}

export function namedQuery(firestore: Firestore, name: string): Promise<Query | null> {
  return Promise.resolve((firestore as FirestoreInternal).namedQuery(name));
}

export function writeBatch(firestore: Firestore): WriteBatch {
  return (firestore as FirestoreInternal).batch();
}

export function getPersistentCacheIndexManager(
  firestore: Firestore,
): PersistentCacheIndexManager | null {
  return (firestore as FirestoreInternal).persistentCacheIndexManager();
}

export function enablePersistentCacheIndexAutoCreation(
  indexManager: PersistentCacheIndexManager,
): Promise<void> {
  return (indexManager as PersistentCacheIndexManagerInternal).enableIndexAutoCreation();
}

export function disablePersistentCacheIndexAutoCreation(
  indexManager: PersistentCacheIndexManager,
): Promise<void> {
  return (indexManager as PersistentCacheIndexManagerInternal).disableIndexAutoCreation();
}

export function deleteAllPersistentCacheIndexes(
  indexManager: PersistentCacheIndexManager,
): Promise<void> {
  return (indexManager as PersistentCacheIndexManagerInternal).deleteAllIndexes();
}

export * from './modular/query';
export * from './modular/snapshot';
export * from './modular/FieldPath';
export * from './modular/FieldValue';
export * from './modular/VectorValue';
export { LoadBundleTask } from './LoadBundleTask';
export { default as Transaction } from './FirestoreTransaction';
export { default as WriteBatch } from './FirestoreWriteBatch';
export { Filter } from './FirestoreFilter';
