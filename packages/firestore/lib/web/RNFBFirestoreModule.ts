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

import {
  setLogLevel,
  connectFirestoreEmulator,
  initializeFirestore,
  runTransaction,
  getApp,
  getFirestore,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  getCount,
  getAggregate,
  count,
  average,
  sum,
  deleteDoc,
  setDoc,
  updateDoc,
  writeBatch,
  terminate,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestore';
import {
  guard,
  getWebError,
  emitEvent,
} from '@react-native-firebase/app/dist/module/internal/web/utils';
import { objectToWriteable, readableToObject, parseDocumentBatches } from './convert';
import { buildQuery } from './query';

function rejectWithCodeAndMessage(code: string, message: string): Promise<never> {
  return Promise.reject(getWebError({ code, message } as Error & { code: string }));
}

type DocumentSnapshotLike = {
  exists(): boolean;
  ref: { path: string };
  data(): Record<string, unknown> | undefined;
};

function documentSnapshotToObject(snapshot: DocumentSnapshotLike): {
  path: string;
  exists: boolean;
  data?: unknown;
  metadata: [boolean, boolean];
} {
  const exists = snapshot.exists();
  const out: {
    path: string;
    exists: boolean;
    data?: unknown;
    metadata: [boolean, boolean];
  } = {
    metadata: [false, false],
    path: snapshot.ref.path,
    exists,
  };
  if (exists) {
    out.data = objectToWriteable(snapshot.data() ?? {});
  }
  return out;
}

function querySnapshotToObject(snapshot: { docs: DocumentSnapshotLike[] }): {
  source: string;
  excludesMetadataChanges: boolean;
  changes: unknown[];
  metadata: [boolean, boolean];
  documents: Array<ReturnType<typeof documentSnapshotToObject>>;
} {
  return {
    source: 'get',
    excludesMetadataChanges: true,
    changes: [],
    metadata: [false, false],
    documents: snapshot.docs.map(documentSnapshotToObject),
  };
}

const emulatorForApp: Record<string, { host: string; port: number }> = {};
const firestoreInstances: Record<string, any> = {};
const appInstances: Record<string, any> = {};
const transactionHandler: Record<number, any> = {};
const transactionBuffer: Record<number, any[]> = {};

function getCachedAppInstance(appName: string): any {
  return (appInstances[appName] ??= getApp(appName));
}

function createFirestoreKey(appName: string, databaseId: string): string {
  return `${appName}:${databaseId}`;
}

function getCachedFirestoreInstance(appName: string, databaseId: string): any {
  const firestoreKey = createFirestoreKey(appName, databaseId);
  let instance = firestoreInstances[firestoreKey];
  if (!instance) {
    instance = getFirestore(getCachedAppInstance(appName), databaseId);
    if (emulatorForApp[firestoreKey]) {
      connectFirestoreEmulator(
        instance,
        emulatorForApp[firestoreKey].host,
        emulatorForApp[firestoreKey].port,
      );
    }
    firestoreInstances[firestoreKey] = instance;
  }
  return instance;
}

export default {
  async setLogLevel(logLevel: string): Promise<void> {
    if (logLevel === 'debug' || logLevel === 'error') {
      setLogLevel(logLevel);
    } else {
      setLogLevel('silent');
    }
  },

  loadBundle(): Promise<never> {
    return rejectWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  clearPersistence(): Promise<never> {
    return rejectWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  async waitForPendingWrites(): Promise<null> {
    return null;
  },

  disableNetwork(): Promise<never> {
    return rejectWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  enableNetwork(): Promise<never> {
    return rejectWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  addSnapshotsInSync(): Promise<never> {
    return rejectWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  removeSnapshotsInSync(): Promise<never> {
    return rejectWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  useEmulator(appName: string, databaseId: string, host: string, port: number): Promise<null> {
    return guard(async (): Promise<null> => {
      const firestore = getCachedFirestoreInstance(appName, databaseId);
      connectFirestoreEmulator(firestore, host, port);
      const firestoreKey = createFirestoreKey(appName, databaseId);
      emulatorForApp[firestoreKey] = { host, port };
      return null;
    });
  },

  settings(appName: string, databaseId: string, settings: object): Promise<null> {
    return guard(async (): Promise<null> => {
      const instance = initializeFirestore(
        getCachedAppInstance(appName),
        settings as any,
        databaseId,
      );
      firestoreInstances[appName] = instance;
      return null;
    });
  },

  terminate(appName: string, databaseId: string): Promise<null> {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName, databaseId);
      await terminate(firestore);
      return null;
    });
  },

  namedQueryOnSnapshot(): Promise<never> {
    return rejectWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  collectionOnSnapshot(): Promise<never> {
    return rejectWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  collectionOffSnapshot(): Promise<never> {
    return rejectWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  namedQueryGet(): Promise<never> {
    return rejectWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  collectionCount(
    appName: string,
    databaseId: string,
    path: string,
    type: string,
    filters: any[],
    orders: any[],
    options: any,
  ): Promise<{ count: number }> {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName, databaseId);
      const queryRef =
        type === 'collectionGroup' ? collectionGroup(firestore, path) : collection(firestore, path);
      const query = buildQuery(queryRef, filters, orders, options);
      const snapshot = await getCount(query);
      return { count: snapshot.data().count };
    });
  },

  aggregateQuery(
    appName: string,
    databaseId: string,
    path: string,
    type: string,
    filters: any[],
    orders: any[],
    options: any,
    aggregateQueries: Array<{ aggregateType: string; field?: any; key: string }>,
  ): Promise<Record<string, unknown>> {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName, databaseId);
      const queryRef =
        type === 'collectionGroup' ? collectionGroup(firestore, path) : collection(firestore, path);
      const query = buildQuery(queryRef, filters, orders, options);
      const aggregateSpec: Record<string, unknown> = {};

      for (let i = 0; i < aggregateQueries.length; i++) {
        const aggregateQuery = aggregateQueries[i]!;
        const { aggregateType, field, key } = aggregateQuery;
        switch (aggregateType) {
          case 'count':
            aggregateSpec[key] = count();
            break;
          case 'average':
            aggregateSpec[key] = average(field);
            break;
          case 'sum':
            aggregateSpec[key] = sum(field);
            break;
        }
      }
      const result = await getAggregate(query, aggregateSpec as any);
      const data = result.data();
      const response: Record<string, unknown> = {};
      for (let i = 0; i < aggregateQueries.length; i++) {
        const aggregateQuery = aggregateQueries[i]!;
        response[aggregateQuery.key] = data[aggregateQuery.key];
      }
      return response;
    });
  },

  collectionGet(
    appName: string,
    databaseId: string,
    path: string,
    type: string,
    filters: any[],
    orders: any[],
    options: any,
    getOptions?: { source?: string },
  ): Promise<ReturnType<typeof querySnapshotToObject>> {
    if (getOptions?.source === 'cache') {
      return rejectWithCodeAndMessage(
        'unsupported',
        'The source cache is not supported in the lite SDK.',
      );
    }
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName, databaseId);
      const queryRef =
        type === 'collectionGroup' ? collectionGroup(firestore, path) : collection(firestore, path);
      const query = buildQuery(queryRef, filters, orders, options);
      const snapshot = await getDocs(query);
      return querySnapshotToObject(snapshot as { docs: DocumentSnapshotLike[] });
    });
  },

  documentOnSnapshot(): Promise<never> {
    return rejectWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  documentOffSnapshot(): Promise<never> {
    return rejectWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  persistenceCacheIndexManager(): Promise<never> {
    return rejectWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  documentGet(
    appName: string,
    databaseId: string,
    path: string,
    getOptions?: { source?: string },
  ): Promise<ReturnType<typeof documentSnapshotToObject>> {
    return guard(async () => {
      if (getOptions?.source === 'cache') {
        return rejectWithCodeAndMessage(
          'unsupported',
          'The source cache is not supported in the lite SDK.',
        );
      }
      const firestore = getCachedFirestoreInstance(appName, databaseId);
      const ref = doc(firestore, path);
      const snapshot = await getDoc(ref);
      return documentSnapshotToObject(snapshot);
    });
  },

  documentDelete(appName: string, databaseId: string, path: string): Promise<null> {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName, databaseId);
      const ref = doc(firestore, path);
      await deleteDoc(ref);
      return null;
    });
  },

  documentSet(
    appName: string,
    databaseId: string,
    path: string,
    data: Record<string, unknown>,
    options: Record<string, unknown>,
  ): Promise<void> {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName, databaseId);
      const ref = doc(firestore, path);
      const setOptions: Record<string, unknown> = {};
      if (options && 'merge' in options) {
        setOptions.merge = options.merge;
      } else if (options && 'mergeFields' in options) {
        setOptions.mergeFields = options.mergeFields;
      }
      await setDoc(ref, readableToObject(firestore, data), setOptions);
    });
  },

  documentUpdate(
    appName: string,
    databaseId: string,
    path: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName, databaseId);
      const ref = doc(firestore, path);
      await updateDoc(ref, readableToObject(firestore, data));
    });
  },

  documentBatch(
    appName: string,
    databaseId: string,
    writes: Array<Record<string, unknown>>,
  ): Promise<void> {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName, databaseId);
      const batch = writeBatch(firestore);
      const writesArray = parseDocumentBatches(firestore, writes);

      for (const parsed of writesArray) {
        const { type, path } = parsed;
        const ref = doc(firestore, path);

        switch (type) {
          case 'DELETE':
            batch.delete(ref);
            break;
          case 'UPDATE':
            batch.update(ref, parsed.data!);
            break;
          case 'SET': {
            const options = parsed.options ?? {};
            const setOptions: Record<string, unknown> = {};
            if ('merge' in options) {
              setOptions.merge = options.merge;
            } else if ('mergeFields' in options) {
              setOptions.mergeFields = options.mergeFields;
            }
            batch.set(ref, parsed.data!, setOptions);
            break;
          }
        }
      }
      await batch.commit();
    });
  },

  transactionGetDocument(
    appName: string,
    databaseId: string,
    transactionId: number,
    path: string,
  ): Promise<ReturnType<typeof documentSnapshotToObject>> {
    if (!transactionHandler[transactionId]) {
      return rejectWithCodeAndMessage(
        'internal-error',
        'An internal error occurred whilst attempting to find a native transaction by id.',
      );
    }
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName, databaseId);
      const docRef = doc(firestore, path);
      const tsx = transactionHandler[transactionId];
      const snapshot = await tsx.get(docRef);
      return documentSnapshotToObject(snapshot);
    });
  },

  transactionDispose(_appName: string, _databaseId: string, transactionId: number): void {
    delete transactionHandler[transactionId];
  },

  transactionApplyBuffer(
    _appName: string,
    _databaseId: string,
    transactionId: number,
    commandBuffer: any[],
  ): void {
    if (transactionHandler[transactionId]) {
      transactionBuffer[transactionId] = commandBuffer;
    }
  },

  transactionBegin(appName: string, databaseId: string, transactionId: number): Promise<void> {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName, databaseId);

      try {
        await runTransaction(firestore, async (tsx: any) => {
          transactionHandler[transactionId] = tsx;

          emitEvent('firestore_transaction_event', {
            eventName: 'firestore_transaction_event',
            body: { type: 'update' },
            appName,
            databaseId,
            listenerId: transactionId,
          });

          const getBuffer = (): any[] | undefined => transactionBuffer[transactionId];

          const buffer = await new Promise<any[]>(resolve => {
            const interval = setInterval(() => {
              const b = getBuffer();
              if (b) {
                clearInterval(interval);
                resolve(b);
              }
            }, 100);
          });

          for (const serialized of buffer) {
            const { path: docPath, type, data } = serialized;
            const docRef = doc(firestore, docPath);

            switch (type) {
              case 'DELETE':
                tsx.delete(docRef);
                break;
              case 'UPDATE':
                tsx.update(docRef, readableToObject(firestore, data));
                break;
              case 'SET': {
                const options = serialized.options ?? {};
                const setOptions: Record<string, unknown> = {};
                if ('merge' in options) {
                  setOptions.merge = options.merge;
                } else if ('mergeFields' in options) {
                  setOptions.mergeFields = options.mergeFields;
                }
                tsx.set(docRef, readableToObject(firestore, data), setOptions);
                break;
              }
            }
          }
        });

        emitEvent('firestore_transaction_event', {
          eventName: 'firestore_transaction_event',
          body: { type: 'complete' },
          appName,
          databaseId,
          listenerId: transactionId,
        });
      } catch (e) {
        emitEvent('firestore_transaction_event', {
          eventName: 'firestore_transaction_event',
          body: { type: 'error', error: getWebError(e as Error) },
          appName,
          databaseId,
          listenerId: transactionId,
        });
      }
    });
  },
};
