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
  getApp,
  getDatabase,
  connectDatabaseEmulator,
  enableLogging,
  goOnline,
  goOffline,
  ref,
  set,
  update,
  setWithPriority,
  remove,
  setPriority,
  onDisconnect,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildMoved,
  onChildRemoved,
  runTransaction,
  get,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseDatabase';
import {
  guard,
  getWebError,
  emitEvent,
} from '@react-native-firebase/app/dist/module/internal/web/utils';
import { getQueryInstance } from './query';

function rejectWithCodeAndMessage(code: string, message: string): Promise<never> {
  return Promise.reject(
    getWebError({
      code,
      message,
    } as Error & { code?: string }),
  );
}

interface SnapshotData {
  key: string | null;
  exists: boolean;
  hasChildren: boolean;
  childrenCount: number;
  childKeys: string[];
  priority: string | number | null;
  value: unknown;
}

// Converts a DataSnapshot to an object.
function snapshotToObject(snapshot: {
  key: string | null;
  exists(): boolean;
  hasChildren(): boolean;
  size: number;
  forEach: (callback: (child: { key: string | null }) => void) => void;
  priority: string | number | null;
  val(): unknown;
}): SnapshotData {
  const childKeys: string[] = [];

  if (snapshot.hasChildren()) {
    snapshot.forEach((childSnapshot: { key: string | null }) => {
      childKeys.push(childSnapshot.key || '');
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

function getDatabaseWebError(error: unknown): Error {
  // Possible to override messages/codes here if necessary.
  // @ts-expect-error - Web SDK error type doesn't match our Error type exactly
  return getWebError(error);
}

// Converts a DataSnapshot and previous child name to an object.
function snapshotWithPreviousChildToObject(
  snapshot: {
    key: string | null;
    exists(): boolean;
    hasChildren(): boolean;
    size: number;
    forEach: (callback: (child: { key: string | null }) => void) => void;
    priority: string | number | null;
    val(): unknown;
  },
  previousChildName: string | null | undefined,
): { snapshot: SnapshotData; previousChildName: string | null | undefined } {
  return {
    snapshot: snapshotToObject(snapshot),
    previousChildName,
  };
}

const appInstances: Record<string, unknown> = {};
const databaseInstances: Record<string, unknown> = {};
const onDisconnectRef: Record<string, unknown> = {};
const listeners: Record<string, () => void> = {};
const emulatorForApp: Record<string, { host: string; port: number; connected?: boolean }> = {};

function getCachedAppInstance(appName: string): unknown {
  return (appInstances[appName] ??= getApp(appName) as unknown);
}

// Returns a cached Database instance.
function getCachedDatabaseInstance(appName: string, dbURL: string): unknown {
  let instance = databaseInstances[`${appName}|${dbURL}`];
  if (!instance) {
    // @ts-expect-error - Web SDK types don't match our Database type exactly
    instance = getDatabase(getCachedAppInstance(appName), dbURL);
    // Relying on internals here so need to be careful between SDK versions.
    if (emulatorForApp[appName] && !(instance as { _instanceStarted?: boolean })._instanceStarted) {
      const { host, port } = emulatorForApp[appName]!;
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      connectDatabaseEmulator(instance, host, port);
      emulatorForApp[appName]!.connected = true;
    }
  }
  return instance;
}

// Returns a cached onDisconnect instance.
function getCachedOnDisconnectInstance(ref: { key: string | null }): unknown {
  // @ts-expect-error - Web SDK types don't match our Reference type exactly
  return (onDisconnectRef[ref.key || ''] ??= onDisconnect(ref));
}

export default {
  /**
   * Reconnects to the server.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @returns {Promise<void>}
   */
  goOnline(appName: string, dbURL: string): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      goOnline(db);
    });
  },

  /**
   * Disconnects from the server.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @returns {Promise<void>}
   */
  goOffline(appName: string, dbURL: string): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
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

  /**
   * Sets the logging enabled state.
   * @param _app - The app name, not used.
   * @param _dbURL - The database URL, not used.
   * @param enabled - The logging enabled state.
   */
  setLoggingEnabled(_app: string, _dbURL: string, enabled: boolean): Promise<void> {
    return guard(async () => {
      enableLogging(enabled);
    });
  },

  setPersistenceCacheSizeBytes(): Promise<void> {
    // no-op on other platforms
    return Promise.resolve();
  },

  /**
   * Connects to the Firebase database emulator.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @param host - The emulator host.
   * @param port - The emulator port
   * @returns {Promise<void>}
   */
  useEmulator(appName: string, dbURL: string, host: string, port: number): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      connectDatabaseEmulator(db, host, port);
      emulatorForApp[appName] = { host, port };
    });
  },

  /**
   * Reference
   */

  /**
   * Sets a value at the specified path.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @param path - The path.
   * @param props - The properties
   * @returns {Promise<void>}
   */
  set(appName: string, dbURL: string, path: string, props: { value: unknown }): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      const dbRef = ref(db, path);
      const value = props.value;
      await set(dbRef, value);
    });
  },

  /**
   * Updates the specified path with the provided values.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @param path - The path.
   * @param props - The properties
   * @returns {Promise<void>}
   */
  update(
    appName: string,
    dbURL: string,
    path: string,
    props: { values: { [key: string]: unknown } },
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      const dbRef = ref(db, path);
      const values = props.values;
      await update(dbRef, values);
    });
  },

  /**
   * Sets a value at the specified path with a priority.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @param path - The path.
   * @param props - The properties, including value and priority.
   * @returns {Promise<void>}
   */
  setWithPriority(
    appName: string,
    dbURL: string,
    path: string,
    props: { value: unknown; priority: string | number | null },
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      const dbRef = ref(db, path);
      const value = props.value;
      const priority = props.priority;
      await setWithPriority(dbRef, value, priority);
    });
  },

  /**
   * Removes the node at the specified path.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @param path - The path.
   * @returns {Promise<void>}
   */
  remove(appName: string, dbURL: string, path: string): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      const dbRef = ref(db, path);
      await remove(dbRef);
    });
  },

  /**
   * Sets the priority of the node at the specified path.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @param path - The path.
   * @param props - The properties, including priority.
   * @returns {Promise<void>}
   */
  setPriority(
    appName: string,
    dbURL: string,
    path: string,
    props: { priority: string | number | null },
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      const dbRef = ref(db, path);
      const priority = props.priority;
      await setPriority(dbRef, priority);
    });
  },

  /**
   * Query
   */

  /**
   * Listens for data changes at the specified path once.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @param path - The path.
   * @param modifiers - The modifiers.
   * @param eventType - The event type.
   * @returns {Promise<object>}
   */
  once(
    appName: string,
    dbURL: string,
    path: string,
    modifiers: unknown[],
    eventType: string,
  ): Promise<
    SnapshotData | { snapshot: SnapshotData; previousChildName: string | null | undefined }
  > {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      const dbRef = ref(db, path);
      const queryRef = getQueryInstance(
        dbRef,
        modifiers as Array<{ type: string; name: string; key?: string; value?: unknown }>,
      );

      if (eventType === 'value') {
        const snapshot = await new Promise<{
          key: string | null;
          exists(): boolean;
          hasChildren(): boolean;
          size: number;
          forEach: (callback: (child: { key: string | null }) => void) => void;
          priority: string | number | null;
          val(): unknown;
        }>((resolve, reject) => {
          // @ts-expect-error - Web SDK types don't match our Query type exactly
          onValue(queryRef, resolve as (snapshot: unknown) => void, reject, { onlyOnce: true });
        });

        return snapshotToObject(snapshot);
      } else {
        let fn:
          | ((
              queryRef: unknown,
              callback: (snapshot: unknown, previousChildName: string | null) => void,
              reject: (error: Error) => void,
              options: { onlyOnce: boolean },
            ) => void)
          | null = null;

        if (eventType === 'child_added') {
          // @ts-expect-error - Web SDK types don't match our Query type exactly
          fn = onChildAdded;
        } else if (eventType === 'child_changed') {
          // @ts-expect-error - Web SDK types don't match our Query type exactly
          fn = onChildChanged;
        } else if (eventType === 'child_removed') {
          // @ts-expect-error - Web SDK types don't match our Query type exactly
          fn = onChildRemoved;
        } else if (eventType === 'child_moved') {
          // @ts-expect-error - Web SDK types don't match our Query type exactly
          fn = onChildMoved;
        }

        if (fn) {
          const { snapshot, previousChildName } = await new Promise<{
            snapshot: {
              key: string | null;
              exists(): boolean;
              hasChildren(): boolean;
              size: number;
              forEach: (callback: (child: { key: string | null }) => void) => void;
              priority: string | number | null;
              val(): unknown;
            };
            previousChildName: string | null | undefined;
          }>((resolve, reject) => {
            (
              fn as unknown as (
                queryRef: unknown,
                callback: (snapshot: unknown, previousChildName?: string | null) => void,
                reject: (error: Error) => void,
                options: { onlyOnce: boolean },
              ) => void
            )(
              queryRef,
              (snapshot, previousChildName) => {
                resolve({
                  snapshot: snapshot as {
                    key: string | null;
                    exists(): boolean;
                    hasChildren(): boolean;
                    size: number;
                    forEach: (callback: (child: { key: string | null }) => void) => void;
                    priority: string | number | null;
                    val(): unknown;
                  },
                  previousChildName,
                });
              },
              reject,
              { onlyOnce: true },
            );
          });

          return snapshotWithPreviousChildToObject(snapshot, previousChildName ?? null);
        }
      }

      // @ts-expect-error - Web SDK types don't match our Reference type exactly
      const snapshot = await get(dbRef, modifiers);
      return snapshotToObject(
        snapshot as {
          key: string | null;
          exists(): boolean;
          hasChildren(): boolean;
          size: number;
          forEach: (callback: (child: { key: string | null }) => void) => void;
          priority: string | number | null;
          val(): unknown;
        },
      );
    });
  },

  on(
    appName: string,
    dbURL: string,
    props: {
      key: string;
      modifiers: unknown[];
      path: string;
      eventType: string;
      registration: {
        eventRegistrationKey: string;
      };
    },
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const { key, modifiers, path, eventType, registration } = props;
      const { eventRegistrationKey } = registration;
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      const dbRef = ref(db, path);

      const queryRef = getQueryInstance(
        dbRef,
        modifiers as Array<{ type: string; name: string; key?: string; value?: unknown }>,
      );

      function sendEvent(
        data:
          | SnapshotData
          | { snapshot: SnapshotData; previousChildName: string | null | undefined },
      ): void {
        const event = {
          eventName: 'database_sync_event',
          body: {
            data,
            key,
            registration,
            eventType,
          },
        };

        emitEvent('database_sync_event', event);
      }

      function sendError(error: Error): void {
        const event = {
          eventName: 'database_sync_event',
          body: {
            key,
            registration,
            error: getDatabaseWebError(error),
          },
        };

        emitEvent('database_sync_event', event);
      }

      let listener: (() => void) | null = null;

      // Ignore if the listener already exists.
      if (listeners[eventRegistrationKey]) {
        return;
      }

      if (eventType === 'value') {
        listener = (onValue as any)(
          queryRef,
          (snapshot: {
            key: string | null;
            exists(): boolean;
            hasChildren(): boolean;
            size: number;
            forEach: (callback: (child: { key: string | null }) => void) => void;
            priority: string | number | null;
            val(): unknown;
          }) => sendEvent(snapshotToObject(snapshot)),
          sendError,
        ) as () => void;
      } else {
        let fn:
          | ((
              queryRef: unknown,
              callback: (snapshot: unknown, previousChildName: string | null) => void,
              reject: (error: Error) => void,
            ) => () => void)
          | null = null;

        if (eventType === 'child_added') {
          // @ts-expect-error - Web SDK types don't match our Query type exactly
          fn = onChildAdded;
        } else if (eventType === 'child_changed') {
          // @ts-expect-error - Web SDK types don't match our Query type exactly
          fn = onChildChanged;
        } else if (eventType === 'child_removed') {
          // @ts-expect-error - Web SDK types don't match our Query type exactly
          fn = onChildRemoved;
        } else if (eventType === 'child_moved') {
          // @ts-expect-error - Web SDK types don't match our Query type exactly
          fn = onChildMoved;
        }

        if (fn) {
          listener = (
            fn as unknown as (
              queryRef: unknown,
              callback: (snapshot: unknown, previousChildName?: string | null) => void,
              reject: (error: Error) => void,
            ) => () => void
          )(
            queryRef,
            (snapshot, previousChildName) => {
              sendEvent(
                snapshotWithPreviousChildToObject(
                  snapshot as {
                    key: string | null;
                    exists(): boolean;
                    hasChildren(): boolean;
                    size: number;
                    forEach: (callback: (child: { key: string | null }) => void) => void;
                    priority: string | number | null;
                    val(): unknown;
                  },
                  previousChildName ?? null,
                ),
              );
            },
            sendError,
          ) as () => void;
        }
      }

      listeners[eventRegistrationKey] = listener!;
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

  /**
   * OnDisconnect
   */

  /**
   * Cancels the onDisconnect instance at the specified path.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @param path - The path.
   * @returns {Promise<void>}
   */
  onDisconnectCancel(appName: string, dbURL: string, path: string): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(
        dbRef as unknown as { key: string | null },
      ) as {
        cancel: () => Promise<void>;
      };
      await instance.cancel();

      // Delete the onDisconnect instance from the cache.
      delete onDisconnectRef[(dbRef as unknown as { key: string | null }).key || ''];
    });
  },

  /**
   * Sets a value to be written to the database on disconnect.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @param path - The path.
   * @returns {Promise<void>}
   */
  onDisconnectRemove(appName: string, dbURL: string, path: string): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(
        dbRef as unknown as { key: string | null },
      ) as {
        remove: () => Promise<void>;
      };
      await instance.remove();
    });
  },

  /**
   * Sets a value to be written to the database on disconnect.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @param path - The path.
   * @param props - The properties, including value.
   * @returns {Promise<void>}
   */
  onDisconnectSet(
    appName: string,
    dbURL: string,
    path: string,
    props: { value: unknown },
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(
        dbRef as unknown as { key: string | null },
      ) as {
        set: (value: unknown) => Promise<void>;
      };
      const value = props.value;
      await instance.set(value);
    });
  },

  /**
   * Sets a value to be written to the database on disconnect with a priority.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @param path - The path.
   * @param props - The properties, including value and priority.
   * @returns {Promise<void>}
   */
  onDisconnectSetWithPriority(
    appName: string,
    dbURL: string,
    path: string,
    props: { value: unknown; priority: string | number | null },
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(
        dbRef as unknown as { key: string | null },
      ) as {
        setWithPriority: (value: unknown, priority: string | number | null) => Promise<void>;
      };
      const value = props.value;
      const priority = props.priority;
      await instance.setWithPriority(value, priority);
    });
  },

  /**
   * Updates the specified path with the provided values on disconnect.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @param path - The path.
   * @param props - The properties, including values.
   * @returns {Promise<void>}
   */
  onDisconnectUpdate(
    appName: string,
    dbURL: string,
    path: string,
    props: { values: { [key: string]: unknown } },
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(
        dbRef as unknown as { key: string | null },
      ) as {
        update: (values: { [key: string]: unknown }) => Promise<void>;
      };
      const values = props.values;
      await instance.update(values);
    });
  },

  /**
   * Transaction
   */

  transactionStart(
    appName: string,
    dbURL: string,
    path: string,
    transactionId: number,
    applyLocally: boolean,
    userExecutor: (currentData: unknown) => unknown,
  ): Promise<void> {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      // @ts-expect-error - Web SDK types don't match our Database type exactly
      const dbRef = ref(db, path);

      try {
        const { committed, snapshot } = (await (runTransaction as any)(dbRef, userExecutor, {
          applyLocally,
        })) as { committed: boolean; snapshot: unknown };

        const event = {
          body: {
            committed,
            type: 'complete',
            snapshot: snapshotToObject(
              snapshot as {
                key: string | null;
                exists(): boolean;
                hasChildren(): boolean;
                size: number;
                forEach: (callback: (child: { key: string | null }) => void) => void;
                priority: string | number | null;
                val(): unknown;
              },
            ),
          },
          appName,
          id: transactionId,
          eventName: 'database_transaction_event',
        };

        emitEvent('database_transaction_event', event);
      } catch (e) {
        const event = {
          body: {
            committed: false,
            type: 'error',
            error: getDatabaseWebError(e),
          },
          appName,
          id: transactionId,
          eventName: 'database_transaction_event',
        };

        emitEvent('database_transaction_event', event);
      }
    });
  },

  /**
   * Commits the transaction with the specified updates.
   * @param appName - The app name.
   * @param dbURL - The database URL.
   * @param transactionId - The transaction ID.
   * @param updates - The updates.
   * @returns {Promise<void>}
   */
  async transactionTryCommit(
    _appName: string,
    _dbURL: string,
    _transactionId: number,
    _updates: unknown,
  ): Promise<void> {
    // We don't need to implement this as for 'Other' platforms
    // we pass the users transaction function to the Firebase JS SDK directly.
    throw new Error('Not implemented');
  },
};
