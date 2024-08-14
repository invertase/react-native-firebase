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
} from '@react-native-firebase/app/lib/internal/web/firebaseDatabase';
import { guard, getWebError, emitEvent } from '@react-native-firebase/app/lib/internal/web/utils';
import { getQueryInstance } from './query';

// Converts a DataSnapshot to an object.
function snapshotToObject(snapshot) {
  const childKeys = [];

  if (snapshot.hasChildren()) {
    snapshot.forEach(childSnapshot => {
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

function getDatabaseWebError(error) {
  // Possible to override messages/codes here if necessary.
  return getWebError(error);
}

// Converts a DataSnapshot and previous child name to an object.
function snapshotWithPreviousChildToObject(snapshot, previousChildName) {
  return {
    snapshot: snapshotToObject(snapshot),
    previousChildName,
  };
}

const appInstances = {};
const databaseInstances = {};
const onDisconnectRef = {};
const listeners = {};
const emulatorForApp = {};

function getCachedAppInstance(appName) {
  return (appInstances[appName] ??= getApp(appName));
}

// Returns a cached Database instance.
function getCachedDatabaseInstance(appName, dbURL) {
  let instance = databaseInstances[`${appName}|${dbURL}`];
  if (!instance) {
    instance = getDatabase(getCachedAppInstance(appName), dbURL);
    // Relying on internals here so need to be careful between SDK versions.
    if (emulatorForApp[appName] && !instance._instanceStarted) {
      const { host, port } = emulatorForApp[appName];
      connectDatabaseEmulator(instance, host, port);
      emulatorForApp[appName].connected = true;
    }
  }
  return instance;
}

// Returns a cached onDisconnect instance.
function getCachedOnDisconnectInstance(ref) {
  return (onDisconnectRef[ref.key] ??= onDisconnect(ref));
}

export default {
  /**
   * Reconnects to the server.
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @returns {Promise<void>}
   */
  goOnline(appName, dbURL) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      goOnline(db);
    });
  },

  /**
   * Disconnects from the server.
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @returns {Promise<void>}
   */
  goOffline(appName, dbURL) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      goOffline(db);
    });
  },

  setPersistenceEnabled() {
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
   * @param {string} appName - The app name, not used.
   * @param {string} dbURL - The database URL, not used.
   * @param {boolean} enabled - The logging enabled state.
   */
  setLoggingEnabled(app, dbURL, enabled) {
    return guard(async () => {
      enableLogging(enabled);
    });
  },

  setPersistenceCacheSizeBytes() {
    // no-op on other platforms
    return Promise.resolve();
  },

  /**
   * Connects to the Firebase database emulator.
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @param {string} host - The emulator host.
   * @param {number} port - The emulator
   * @returns {Promise<void>}
   */
  useEmulator(appName, dbURL, host, port) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      connectDatabaseEmulator(db, host, port);
      emulatorForApp[appName] = { host, port };
    });
  },

  /**
   * Reference
   */

  /**
   * Sets a value at the specified path.
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @param {string} path - The path.
   * @param {object} props - The properties
   * @returns {Promise<void>}
   */
  set(appName, dbURL, path, props) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const value = props.value;
      await set(dbRef, value);
    });
  },

  /**
   * Updates the specified path with the provided values.
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @param {string} path - The path.
   * @param {object} props - The properties
   * @returns {Promise<void>}
   */
  update(appName, dbURL, path, props) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const values = props.values;
      await update(dbRef, values);
    });
  },

  /**
   * Sets a value at the specified path with a priority.
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @param {string} path - The path.
   * @param {object} props - The properties, including value and priority.
   * @returns {Promise<void>}
   */
  setWithPriority(appName, dbURL, path, props) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const value = props.value;
      const priority = props.priority;
      await setWithPriority(dbRef, value, priority);
    });
  },

  /**
   * Removes the nodd at the specified path.
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @param {string} path - The path.
   * @returns {Promise<void>}
   */
  remove(appName, dbURL, path) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      await remove(dbRef);
    });
  },

  /**
   * Sets the priority of the node at the specified path.
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @param {string} path - The path.
   * @param {object} props - The properties, including priority.
   * @returns {Promise<void>}
   */
  setPriority(appName, dbURL, path, props) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
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
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @param {string} path - The path.
   * @param {object} modifiers - The modifiers.
   * @param {string} eventType - The event type.
   * @returns {Promise<object>}
   */
  once(appName, dbURL, path, modifiers, eventType) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const queryRef = getQueryInstance(dbRef, modifiers);

      if (eventType === 'value') {
        const snapshot = await new Promise((resolve, reject) => {
          onValue(queryRef, resolve, reject, { onlyOnce: true });
        });

        return snapshotToObject(snapshot);
      } else {
        let fn = null;

        if (eventType === 'child_added') {
          fn = onChildAdded;
        } else if (eventType === 'child_changed') {
          fn = onChildChanged;
        } else if (eventType === 'child_removed') {
          fn = onChildRemoved;
        } else if (eventType === 'child_moved') {
          fn = onChildMoved;
        }

        if (fn) {
          const { snapshot, previousChildName } = await new Promise((resolve, reject) => {
            fn(
              queryRef,
              (snapshot, previousChildName) => {
                resolve({ snapshot, previousChildName });
              },
              reject,
              { onlyOnce: true },
            );
          });

          return snapshotWithPreviousChildToObject(snapshot, previousChildName);
        }
      }

      const snapshot = await get(dbRef, modifiers);
      return snapshot;
    });
  },

  on(appName, dbURL, props) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const { key, modifiers, path, eventType, registration } = props;
      const { eventRegistrationKey } = registration;
      const dbRef = ref(db, path);

      const queryRef = getQueryInstance(dbRef, modifiers);

      function sendEvent(data) {
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

      function sendError(error) {
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

      let listener = null;

      // Ignore if the listener already exists.
      if (listeners[eventRegistrationKey]) {
        return;
      }

      if (eventType === 'value') {
        listener = onValue(queryRef, snapshot => sendEvent(snapshotToObject(snapshot)), sendError);
      } else {
        let fn = null;

        if (eventType === 'child_added') {
          fn = onChildAdded;
        } else if (eventType === 'child_changed') {
          fn = onChildChanged;
        } else if (eventType === 'child_removed') {
          fn = onChildRemoved;
        } else if (eventType === 'child_moved') {
          fn = onChildMoved;
        }

        if (fn) {
          listener = fn(
            queryRef,
            (snapshot, previousChildName) => {
              sendEvent(snapshotWithPreviousChildToObject(snapshot, previousChildName));
            },
            sendError,
          );
        }
      }

      listeners[eventRegistrationKey] = listener;
    });
  },

  off(queryKey, eventRegistrationKey) {
    const listener = listeners[eventRegistrationKey];
    if (listener) {
      listener();
      delete listeners[eventRegistrationKey];
    }
  },

  keepSynced() {
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported on this environment.',
    );
  },

  /**
   * OnDisconnect
   */

  /**
   * Cancels the onDisconnect instance at the specified path.
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @param {string} path - The path.
   * @returns {Promise<void>}
   */
  onDisconnectCancel(appName, dbURL, path) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(dbRef);
      await instance.cancel();

      // Delete the onDisconnect instance from the cache.
      delete onDisconnectRef[dbRef.key];
    });
  },

  /**
   * Sets a value to be written to the database on disconnect.
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @param {string} path - The path.
   * @returns {Promise<void>}
   */
  onDisconnectRemove(appName, dbURL, path) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(dbRef);
      await instance.remove();
    });
  },

  /**
   * Sets a value to be written to the database on disconnect.
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @param {string} path - The path.
   * @param {object} props - The properties, including value.
   * @returns {Promise<void>}
   */
  onDisconnectSet(appName, dbURL, path, props) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(dbRef);
      const value = props.value;
      await instance.set(value);
    });
  },

  /**
   * Sets a value to be written to the database on disconnect with a priority.
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @param {string} path - The path.
   * @param {object} props - The properties, including value and priority.
   * @returns {Promise<void>}
   */
  onDisconnectSetWithPriority(appName, dbURL, path, props) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(dbRef);
      const value = props.value;
      const priority = props.priority;
      await instance.setWithPriority(value, priority);
    });
  },

  /**
   * Updates the specified path with the provided values on disconnect.
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @param {string} path - The path.
   * @param {object} props - The properties, including values.
   * @returns {Promise<void>}
   */
  onDisconnectUpdate(appName, dbURL, path, props) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);
      const instance = getCachedOnDisconnectInstance(dbRef);
      const values = props.values;
      await instance.update(values);
    });
  },

  /**
   * Transaction
   */

  transactionStart(appName, dbURL, path, transactionId, applyLocally, userExecutor) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);

      try {
        const { committed, snapshot } = await runTransaction(dbRef, userExecutor, {
          applyLocally,
        });

        const event = {
          body: {
            committed,
            type: 'complete',
            snapshot: snapshotToObject(snapshot),
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
   * @param {string} appName - The app name.
   * @param {string} dbURL - The database URL.
   * @param {string} transactionId - The transaction ID.
   * @param {object} updates - The updates.
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transactionTryCommit(appName, dbURL, transactionId, updates) {
    // We don't need to implement this as for 'Other' platforms
    // we pass the users transaction function to the Firebase JS SDK directly.
    throw new Error('Not implemented');
  },
};
