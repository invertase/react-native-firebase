import {
  connectDatabaseEmulator,
  enableLogging,
  get,
  getApp,
  getDatabase,
  goOffline,
  goOnline,
  onChildAdded,
  onChildChanged,
  onChildMoved,
  onChildRemoved,
  onDisconnect,
  onValue,
  ref,
  remove,
  runTransaction,
  set,
  setPriority,
  setWithPriority,
  update,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseDatabase';
import {
  emitEvent,
  getWebError,
  guard,
} from '@react-native-firebase/app/dist/module/internal/web/utils';
import { getQueryInstance } from './query';
import type { DatabaseQueryModifier } from '../DatabaseQueryModifiers';

type WebApp = ReturnType<typeof getApp>;
type WebDatabase = ReturnType<typeof getDatabase>;
type WebDatabaseReference = ReturnType<typeof ref>;
type WebDataSnapshot = Awaited<ReturnType<typeof get>>;
type WebOnDisconnect = ReturnType<typeof onDisconnect>;
type WebUnsubscribe = ReturnType<typeof onValue>;

type DatabaseOperationPropsInternal =
  | { value: unknown }
  | { values: Record<string, unknown> }
  | { value: unknown; priority: string | number | null }
  | { priority: string | number | null };

type DatabaseListenRegistrationInternal = {
  eventRegistrationKey: string;
  key: string;
  registrationCancellationKey?: string;
};

type DatabaseListenPropsInternal = {
  key: string;
  modifiers: DatabaseQueryModifier[];
  path: string;
  eventType: string;
  registration: DatabaseListenRegistrationInternal;
};

type SnapshotWithPreviousChildInternal = {
  snapshot: WebDataSnapshot;
  previousChildName: string | null;
};

function rejectWithCodeAndMessage(code: string, message: string): Promise<never> {
  const error = new Error(message) as Error & { code?: string };
  error.code = code;
  return Promise.reject(getWebError(error));
}

function snapshotToObject(snapshot: WebDataSnapshot): {
  key: string | null;
  exists: boolean;
  hasChildren: boolean;
  childrenCount: number;
  childKeys: Array<string | null>;
  priority: string | number | null;
  value: unknown;
} {
  const childKeys: Array<string | null> = [];

  if (snapshot.hasChildren()) {
    snapshot.forEach((childSnapshot: WebDataSnapshot) => {
      childKeys.push(childSnapshot.key);
    });
  }

  return {
    key: snapshot.key,
    exists: snapshot.exists(),
    hasChildren: snapshot.hasChildren(),
    childrenCount: snapshot.size,
    childKeys,
    priority: snapshot.priority,
    value: snapshot.val(),
  };
}

function getDatabaseWebError(error: unknown): unknown {
  return getWebError(error as Error & { code?: string });
}

function snapshotWithPreviousChildToObject(
  snapshot: WebDataSnapshot,
  previousChildName: string | null,
): {
  snapshot: ReturnType<typeof snapshotToObject>;
  previousChildName: string | null;
} {
  return {
    snapshot: snapshotToObject(snapshot),
    previousChildName,
  };
}

const appInstances: Record<string, WebApp> = {};
const databaseInstances: Record<string, WebDatabase> = {};
const onDisconnectRef: Record<string, WebOnDisconnect> = {};
const listeners: Record<string, WebUnsubscribe> = {};
const emulatorForApp: Record<string, { host: string; port: number; connected?: boolean }> = {};

function getCachedAppInstance(appName: string): WebApp {
  return (appInstances[appName] ??= getApp(appName));
}

function getCachedDatabaseInstance(appName: string, dbURL: string): WebDatabase {
  let instance = databaseInstances[`${appName}|${dbURL}`];
  if (!instance) {
    instance = getDatabase(getCachedAppInstance(appName), dbURL);
    if (
      emulatorForApp[appName] &&
      !('_instanceStarted' in (instance as object)) &&
      emulatorForApp[appName]
    ) {
      const { host, port } = emulatorForApp[appName];
      connectDatabaseEmulator(instance, host, port);
      emulatorForApp[appName].connected = true;
    }
  }
  return instance;
}

function getCachedOnDisconnectInstance(refValue: WebDatabaseReference): WebOnDisconnect {
  const cacheKey = String(refValue.key);
  return (onDisconnectRef[cacheKey] ??= onDisconnect(refValue));
}

const databaseFallbackModule: Record<string, unknown> = {
  goOnline(appName: string, dbURL: string): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      goOnline(db);
    });
  },

  goOffline(appName: string, dbURL: string): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      goOffline(db);
    });
  },

  setPersistenceEnabled(): Promise<void> {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(
        'The Firebase Database `setPersistenceEnabled` method is not available in the this environment.',
      );
    }
    return Promise.resolve();
  },

  setLoggingEnabled(_app: string, _dbURL: string, enabled: boolean): Promise<void> {
    return guard(async () => {
      enableLogging(enabled);
    });
  },

  setPersistenceCacheSizeBytes(): Promise<void> {
    return Promise.resolve();
  },

  useEmulator(appName: string, dbURL: string, host: string, port: number): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      connectDatabaseEmulator(db, host, port);
      emulatorForApp[appName] = { host, port };
    });
  },

  set(
    appName: string,
    dbURL: string,
    path: string,
    props: DatabaseOperationPropsInternal,
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      await set(dbRef, (props as { value: unknown }).value);
    });
  },

  update(
    appName: string,
    dbURL: string,
    path: string,
    props: DatabaseOperationPropsInternal,
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      await update(dbRef, (props as { values: Record<string, unknown> }).values);
    });
  },

  setWithPriority(
    appName: string,
    dbURL: string,
    path: string,
    props: DatabaseOperationPropsInternal,
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const { value, priority } = props as { value: unknown; priority: string | number | null };
      await setWithPriority(dbRef, value, priority);
    });
  },

  remove(appName: string, dbURL: string, path: string): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      await remove(dbRef);
    });
  },

  setPriority(
    appName: string,
    dbURL: string,
    path: string,
    props: DatabaseOperationPropsInternal,
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      await setPriority(dbRef, (props as { priority: string | number | null }).priority);
    });
  },

  once(
    appName: string,
    dbURL: string,
    path: string,
    modifiers: DatabaseQueryModifier[],
    eventType: string,
  ): Promise<unknown> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const queryRef = getQueryInstance(dbRef, modifiers);

      if (eventType === 'value') {
        const snapshot = await new Promise<WebDataSnapshot>((resolve, reject) => {
          onValue(queryRef, resolve, reject, { onlyOnce: true });
        });

        return snapshotToObject(snapshot);
      }

      if (eventType === 'child_added') {
        const { snapshot, previousChildName } =
          await new Promise<SnapshotWithPreviousChildInternal>((resolve, reject) => {
            onChildAdded(
              queryRef,
              (childSnapshot, childPreviousChildName) => {
                resolve({
                  snapshot: childSnapshot,
                  previousChildName: childPreviousChildName,
                });
              },
              reject,
              { onlyOnce: true },
            );
          });

        return snapshotWithPreviousChildToObject(snapshot, previousChildName ?? null);
      }

      if (eventType === 'child_changed') {
        const { snapshot, previousChildName } =
          await new Promise<SnapshotWithPreviousChildInternal>((resolve, reject) => {
            onChildChanged(
              queryRef,
              (childSnapshot, childPreviousChildName) => {
                resolve({
                  snapshot: childSnapshot,
                  previousChildName: childPreviousChildName,
                });
              },
              reject,
              { onlyOnce: true },
            );
          });

        return snapshotWithPreviousChildToObject(snapshot, previousChildName ?? null);
      }

      if (eventType === 'child_removed') {
        const snapshot = await new Promise<WebDataSnapshot>((resolve, reject) => {
          onChildRemoved(queryRef, resolve, reject, { onlyOnce: true });
        });

        return snapshotWithPreviousChildToObject(snapshot, null);
      }

      if (eventType === 'child_moved') {
        const { snapshot, previousChildName } =
          await new Promise<SnapshotWithPreviousChildInternal>((resolve, reject) => {
            onChildMoved(
              queryRef,
              (childSnapshot, childPreviousChildName) => {
                resolve({
                  snapshot: childSnapshot,
                  previousChildName: childPreviousChildName,
                });
              },
              reject,
              { onlyOnce: true },
            );
          });

        return snapshotWithPreviousChildToObject(snapshot, previousChildName ?? null);
      }

      const snapshot = await get(dbRef);
      return snapshot;
    });
  },

  on(appName: string, dbURL: string, props: DatabaseListenPropsInternal): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const { key, modifiers, path, eventType, registration } = props;
      const { eventRegistrationKey } = registration;
      const dbRef = ref(db, path);
      const queryRef = getQueryInstance(dbRef, modifiers);

      function sendEvent(data: unknown): void {
        emitEvent('database_sync_event', {
          eventName: 'database_sync_event',
          body: {
            data,
            key,
            registration,
            eventType,
          },
        });
      }

      function sendError(error: unknown): void {
        emitEvent('database_sync_event', {
          eventName: 'database_sync_event',
          body: {
            key,
            registration,
            error: getDatabaseWebError(error),
          },
        });
      }

      let listener: WebUnsubscribe | null = null;

      if (listeners[eventRegistrationKey]) {
        return;
      }

      if (eventType === 'value') {
        listener = onValue(queryRef, snapshot => sendEvent(snapshotToObject(snapshot)), sendError);
      } else if (eventType === 'child_added') {
        listener = onChildAdded(
          queryRef,
          (snapshot, previousChildName) => {
            sendEvent(snapshotWithPreviousChildToObject(snapshot, previousChildName ?? null));
          },
          sendError,
        );
      } else if (eventType === 'child_changed') {
        listener = onChildChanged(
          queryRef,
          (snapshot, previousChildName) => {
            sendEvent(snapshotWithPreviousChildToObject(snapshot, previousChildName ?? null));
          },
          sendError,
        );
      } else if (eventType === 'child_removed') {
        listener = onChildRemoved(
          queryRef,
          snapshot => sendEvent(snapshotToObject(snapshot)),
          sendError,
        );
      } else if (eventType === 'child_moved') {
        listener = onChildMoved(
          queryRef,
          (snapshot, previousChildName) => {
            sendEvent(snapshotWithPreviousChildToObject(snapshot, previousChildName ?? null));
          },
          sendError,
        );
      }

      if (listener) {
        listeners[eventRegistrationKey] = listener;
      }
    });
  },

  off(_queryKey: string, eventRegistrationKey: string): void {
    const listener = listeners[eventRegistrationKey];
    if (listener) {
      listener();
      delete listeners[eventRegistrationKey];
    }
  },

  keepSynced(): Promise<never> {
    return rejectWithCodeAndMessage(
      'unsupported',
      'This operation is not supported on this environment.',
    );
  },

  onDisconnectCancel(appName: string, dbURL: string, path: string): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(dbRef);
      await instance.cancel();
      delete onDisconnectRef[String(dbRef.key)];
    });
  },

  onDisconnectRemove(appName: string, dbURL: string, path: string): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(dbRef);
      await instance.remove();
    });
  },

  onDisconnectSet(
    appName: string,
    dbURL: string,
    path: string,
    props: DatabaseOperationPropsInternal,
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(dbRef);
      await instance.set((props as { value: unknown }).value);
    });
  },

  onDisconnectSetWithPriority(
    appName: string,
    dbURL: string,
    path: string,
    props: DatabaseOperationPropsInternal,
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(dbRef);
      const { value, priority } = props as { value: unknown; priority: string | number | null };
      await instance.setWithPriority(value, priority);
    });
  },

  onDisconnectUpdate(
    appName: string,
    dbURL: string,
    path: string,
    props: DatabaseOperationPropsInternal,
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(dbRef);
      await instance.update((props as { values: Record<string, unknown> }).values);
    });
  },

  transactionStart(
    appName: string,
    dbURL: string,
    path: string,
    transactionId: number,
    applyLocally: boolean,
    userExecutor?: (currentData: unknown) => unknown,
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);

      try {
        const { committed, snapshot } = await runTransaction(
          dbRef,
          userExecutor ?? (data => data),
          {
            applyLocally,
          },
        );

        emitEvent('database_transaction_event', {
          body: {
            committed,
            type: 'complete',
            snapshot: snapshotToObject(snapshot),
          },
          appName,
          id: transactionId,
          eventName: 'database_transaction_event',
        });
      } catch (e) {
        emitEvent('database_transaction_event', {
          body: {
            committed: false,
            type: 'error',
            error: getDatabaseWebError(e),
          },
          appName,
          id: transactionId,
          eventName: 'database_transaction_event',
        });
      }
    });
  },

  async transactionTryCommit(
    _appName: string,
    _dbURL: string,
    _transactionId: string,
    _updates: { value: unknown; abort: boolean },
  ): Promise<never> {
    throw new Error('Not implemented');
  },
};

export default databaseFallbackModule;
