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
import { getQueryInstance } from './query';

// A general purpose guard function to catch errors and return a structured error object.
async function guard(fn) {
  try {
    return await fn();
  } catch (e) {
    return rejectPromise(e);
  }
}

// Converts a thrown error to a structured error object.
function getNativeError(error) {
  return {
    // JS doesn't expose the `database/` part of the error code.
    code: `database/${error.code}`,
    message: error.message,
  };
}

/**
 * Returns a structured error object.
 * @param {error} error The error object.
 * @returns {never}
 */
function rejectPromise(error) {
  const { code, message } = error;
  const nativeError = {
    code,
    message,
  };
  return Promise.reject(nativeError);
}

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

// Converts a DataSnapshot and previous child name to an object.
function snapshotWithPreviousChildToObject(snapshot, previousChildName) {
  return {
    snapshot: snapshotToObject(snapshot),
    previousChildName,
  };
}

const instances = {};
const onDisconnectRef = {};
const listeners = {};
const transactions = {};

// Returns a cached Firestore instance.
function getCachedDatabaseInstance(appName, dbURL) {
  // TODO(ehesp): Does this need to cache based on dbURL too?
  return (instances[appName] ??= getDatabase(getApp(appName), dbURL));
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
    return guard(() => {
      const db = getCachedDatabaseInstance(app.name, dbURL);
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
    return guard(() => {
      const db = getCachedDatabaseInstance(app.name, dbURL);
      goOffline(db);
    });
  },

  setPersistenceEnabled() {
    // TODO(ehesp): Should this throw?
    // no-op on other platforms
    return Promise.resolve();
  },

  /**
   * Sets the logging enabled state.
   * @param {string} appName - The app name, not used.
   * @param {string} dbURL - The database URL, not used.
   * @param {boolean} enabled - The logging enabled state.
   */
  setLoggingEnabled(app, dbURL, enabled) {
    return guard(() => {
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
    return guard(() => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      connectDatabaseEmulator(db, host, port);
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
        const fn = null;

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
      const dbRef = ref(db, path);

      const { key, modifiers, path, eventType, registration } = props;
      const { eventRegistrationKey } = registration;

      const queryRef = getQueryInstance(dbRef, modifiers);

      function sendEvent(data) {
        const event = {
          data,
          key,
          eventType,
          registration,
        };

        console.warn('SEND EVENT', event);
      }

      function sendError(error) {
        const event = {
          key,
          registration,
          error: getNativeError(error),
        };

        console.warn('SEND ERROR EVENT', event);
      }

      let listener = null;

      // Ignore if the listener already exists.
      if (listeners[eventRegistrationKey]) {
        return;
      }

      if (eventType === 'value') {
        listener = onValue(queryRef, snapshot => sendEvent(snapshotToObject(snapshot)), sendError);
      } else {
        const fn = null;

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

  transactionStart(appName, dbURL, path, transactionId, applyLocally) {
    return guard(async () => {
      const db = getCachedDatabaseInstance(appName, dbURL);
      const dbRef = ref(db, path);

      let resolver;

      // Create a promise that resolves when the transaction is complete.
      const promise = new Promise(resolve => {
        resolver = resolve;
      });

      // Store the resolver in the transactions cache.
      transactions[transactionId] = resolver;

      try {
        const { committed, snapshot } = await runTransaction(
          dbRef,
          async currentData => {
            const event = {
              currentData,
              appName,
              transactionId,
            };

            console.warn('Transaction send event', event);

            // Wait for the promise to resolve from the `transactionTryCommit` method.
            const updates = await promise;

            // Update the current data with the updates.
            currentData = updates;

            // Return the updated data.
            return currentData;
          },
          {
            applyLocally,
          },
        );

        const event = {
          type: 'complete',
          timeout: false,
          interrupted: false,
          committed,
          snapshot: snapshotToObject(snapshot),
        };

        console.warn('Transaction send event', event);
      } catch (e) {
        const event = {
          type: 'error',
          timeout: false,
          interrupted: false,
          committed: false,
          error: getNativeError(e),
        };

        console.warn('Transaction send error event', event);
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
  async transactionTryCommit(appName, dbURL, transactionId, updates) {
    const resolver = transactions[transactionId];

    if (resolver) {
      resolver(updates);
      delete transactions[transactionId];
    }
  },
};
