import {
  setLogLevel,
  connectFirestoreEmulator,
  initializeFirestore,
  getApp,
  getFirestore,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  getCount,
  deleteDoc,
  setDoc,
  updateDoc,
  writeBatch,
  terminate,
} from '@react-native-firebase/app/lib/internal/web/firebaseFirestore';
import { objectToWriteable, readableToObject, parseDocumentBatches } from './convert';
import { buildQuery } from './query';

// A general purpose guard function to catch errors and return a structured error object.
async function guard(fn) {
  try {
    return await fn();
  } catch (e) {
    return rejectPromiseWithCodeAndMessage(e);
  }
}

/**
 * Returns a structured error object.
 * @param {string} code - The error code.
 * @param {string} message - The error message.
 */
function rejectPromiseWithCodeAndMessage(code, message) {
  return rejectPromise({ code: `firestore/${code}`, message });
}

/**
 * Returns a structured error object.
 * @param {error} error The error object.
 * @returns {never}
 */
function rejectPromise(error) {
  const { code, message, details } = error;
  const nativeError = {
    code,
    message,
    userInfo: {
      code: code ? code.replace('firestore/', '') : 'unknown',
      message,
      details,
    },
  };
  return Promise.reject(nativeError);
}

function documentSnapshotToObject(snapshot) {
  const exists = snapshot.exists();

  const out = {
    metadata: [false, false], // lite SDK doesn't return metadata
    path: snapshot.ref.path,
    exists,
  };

  if (exists) {
    out.data = objectToWriteable(snapshot.data() || {});
  }

  return out;
}

function querySnapshotToObject(snapshot) {
  return {
    source: 'get',
    excludesMetadataChanges: true, // lite SDK doesn't return metadata changes
    changes: [],
    metadata: [false, false], // lite SDK doesn't return metadata
    documents: snapshot.docs.map(documentSnapshotToObject),
  };
}

const instances = {};
const transactionHandler = {};
const transactionBuffer = {};

// Returns a cached Firestore instance.
function getCachedFirestoreInstance(appName) {
  return (instances[appName] ??= getFirestore(getApp(appName)));
}

export default {
  /**
   * Sets the log level for Firestore.
   * @param {string} logLevel - The log level.
   */
  setLogLevel(logLevel) {
    if (logLevel === 'debug' || logLevel === 'error') {
      setLogLevel(logLevel);
    } else {
      setLogLevel('silent');
    }
  },

  loadBundle() {
    return rejectPromiseWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  clearPersistence() {
    return rejectPromiseWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  /**
   * Waits for all pending writes to be acknowledged by the backend.
   * Noop in the lite SDK.
   * @returns {Promise<null>} An empty promise.
   */
  async waitForPendingWrites() {
    return null;
  },

  disableNetwork() {
    return rejectPromiseWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  enableNetwork() {
    return rejectPromiseWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  /**
   * Use the Firestore emulator.
   * @param {string} appName - The app name.
   * @param {string} host - The emulator host.
   * @param {number} port - The emulator port.
   * @returns {Promise<null>} An empty promise.
   */
  useEmulator(appName, host, port) {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName);
      connectFirestoreEmulator(firestore, host, port);
    });
  },

  /**
   * Initializes a Firestore instance with settings.
   * @param {string} appName - The app name.
   * @param {object} settings - The Firestore settings.
   * @returns {Promise<null>} An empty promise.
   */
  settings(appName, settings) {
    return guard(() => {
      const instance = initializeFirestore(getApp(appName), settings);
      instances[appName] = instance;
    });
  },

  /**
   * Terminates a Firestore instance.
   * @param {string} appName - The app name.
   * @returns {Promise<null>} An empty promise.
   */
  terminate(appName) {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName);
      await terminate(firestore);
      return null;
    });
  },

  // Collection
  namedQueryOnSnapshot() {
    return rejectPromiseWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  collectionOnSnapshot() {
    return rejectPromiseWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  collectionOffSnapshot() {
    return rejectPromiseWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  namedQueryGet() {
    return rejectPromiseWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  /**
   * Get a collection count from Firestore.
   * @param {string} appName - The app name.
   * @param {string} path - The collection path.
   * @param {string} type - The collection type (e.g. collectionGroup).
   * @param {object[]} filters - The collection filters.
   * @param {object[]} orders - The collection orders.
   * @param {object} options - The collection options.
   * @returns {Promise<object>} The collection count object.
   */
  collectionCount(appName, path, type, filters, orders, options) {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName);
      const queryRef =
        type === 'collectionGroup'
          ? collectionGroup(firestore, collectionRef)
          : collection(firestore, path);
      const query = buildQuery(queryRef, filters, orders, options);
      const snapshot = await getCount(query);

      return {
        count: snapshot.data().count,
      };
    });
  },

  /**
   * Get a collection from Firestore.
   * @param {string} appName - The app name.
   * @param {string} path - The collection path.
   * @param {string} type - The collection type (e.g. collectionGroup).
   * @param {object[]} filters - The collection filters.
   * @param {object[]} orders - The collection orders.
   * @param {object} options - The collection options.
   * @param {object} getOptions - The get options.
   * @returns {Promise<object>} The collection object.
   */
  collectionGet(appName, path, type, filters, orders, options, getOptions) {
    if (getOptions && getOptions.source === 'cache') {
      return rejectPromiseWithCodeAndMessage(
        'unsupported',
        'The source cache is not supported in the lite SDK.',
      );
    }

    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName);
      const queryRef =
        type === 'collectionGroup'
          ? collectionGroup(firestore, collectionRef)
          : collection(firestore, path);
      const query = buildQuery(queryRef, filters, orders, options);
      const snapshot = await getDocs(query);
      return querySnapshotToObject(snapshot);
    });
  },

  // Document
  documentOnSnapshot() {
    return rejectPromiseWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },
  documentOffSnapshot() {
    return rejectPromiseWithCodeAndMessage('unsupported', 'Not supported in the lite SDK.');
  },

  /**
   * Get a document from Firestore.
   * @param {string} appName - The app name.
   * @param {string} path - The document path.
   * @param {object} getOptions - The get options.
   * @returns {Promise<object>} The document object.
   */
  documentGet(appName, path, getOptions) {
    return guard(async () => {
      if (getOptions && getOptions.source === 'cache') {
        return rejectPromiseWithCodeAndMessage(
          'unsupported',
          'The source cache is not supported in the lite SDK.',
        );
      }

      const firestore = getCachedFirestoreInstance(appName);
      const ref = doc(firestore, path);
      const snapshot = await getDoc(ref);
      return documentSnapshotToObject(snapshot);
    });
  },

  /**
   * Delete a document from Firestore.
   * @param {string} appName - The app name.
   * @param {string} path - The document path.
   * @returns {Promise<null>} An empty promise.
   */
  documentDelete(appName, path) {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName);
      const ref = doc(firestore, path);
      await deleteDoc(ref);
      return null;
    });
  },

  /**
   * Set a document in Firestore.
   * @param {string} appName - The app name.
   * @param {string} path - The document path.
   * @param {object} data - The document data.
   * @param {object} options - The set options.
   * @returns {Promise<null>} An empty promise.
   */
  documentSet(appName, path, data, options) {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName);
      const ref = doc(firestore, path);
      const setOptions = {};
      if ('merge' in options) {
        setOptions.merge = options.merge;
      } else if ('mergeFields' in options) {
        setOptions.mergeFields = options.mergeFields;
      }
      await setDoc(ref, readableToObject(data), setOptions);
    });
  },

  /**
   * Update a document in Firestore.
   * @param {string} appName - The app name.
   * @param {string} path - The document path.
   * @param {object} data - The document data.
   * @returns {Promise<null>} An empty promise.
   */
  documentUpdate(appName, path, data) {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName);
      const ref = doc(firestore, path);
      await updateDoc(ref, readableToObject(data));
    });
  },

  /**
   * Batch write documents in Firestore.
   * @param {string} appName - The app name.
   * @param {object[]} writes - The document writes in write batches format.
   */
  documentBatch(appName, writes) {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName);
      const batch = writeBatch(firestore);
      const writesArray = parseDocumentBatches(firestore, writes);

      for (const parsed of writesArray) {
        const { type, path, data } = parsed;
        const ref = doc(firestore, path);
        const data = readableToObject(data);

        switch (type) {
          case 'DELETE':
            batch.delete(ref);
            break;
          case 'UPDATE':
            batch.update(ref, data);
            break;
          case 'SET':
            const options = parsed.options;
            const setOptions = {};
            if ('merge' in options) {
              setOptions.merge = options.merge;
            } else if ('mergeFields' in options) {
              setOptions.mergeFields = options.mergeFields;
            }
            batch.set(ref, data, setOptions);
            break;
        }
      }

      await batch.commit();
    });
  },

  /**
   * Get a document from a Firestore transaction.
   * @param {string} appName - The app name.
   * @param {string} transactionId - The transaction id.
   * @param {string} path - The document path.
   * @returns {Promise<object>} The document object.
   */
  transactionGetDocument(appName, transactionId, path) {
    if (!transactionHandler[transactionId]) {
      return rejectPromiseWithCodeAndMessage(
        'internal-error',
        'An internal error occurred whilst attempting to find a native transaction by id.',
      );
    }

    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName);
      const docRef = doc(firestore, path);
      const tsx = transactionHandler[transactionId];
      const snapshot = await tsx.get(docRef);
      return documentSnapshotToObject(snapshot);
    });
  },

  /**
   * Dispose a transaction instance.
   * @param {string} appName - The app name.
   * @param {string} transactionId - The transaction id.
   */
  transactionDispose(appName, transactionId) {
    // There's no abort method in the lite SDK, so we just remove the transaction handler.
    delete transactionHandler[transactionId];
  },

  /**
   * Applies a buffer of commands to a Firestore transaction.
   * @param {string} appName - The app name.
   * @param {string} transactionId - The transaction id.
   * @param {object[]} commandBuffer - The readable array of buffer commands.
   */
  transactionApplyBuffer(appName, transactionId, commandBuffer) {
    if (transactionHandler[transactionId]) {
      transactionBuffer[transactionId] = commandBuffer;
    }
  },

  /**
   * Begins a Firestore transaction.
   * @param {string} appName - The app name.
   * @param {string} transactionId - The transaction id.
   * @returns {Promise<null>} An empty promise.
   */
  transactionBegin(appName, transactionId) {
    return guard(async () => {
      const firestore = getCachedFirestoreInstance(appName);

      try {
        // TODO(ehesp): Max attempts?
        await runTransaction(firestore, tsx => {
          transactionHandler[transactionId] = tsx;

          // const event = { type: 'update' };
          // TODO(ehesp): Send transaction event (rnfb_firestore_transaction_event)
          // SendEvent('rnfb_firestore_transaction_event', event, appName, transactionId);

          // Get the stored buffer array for the transaction.
          const buffer = transactionBuffer[transactionId];

          if (!buffer) {
            return null;
          }

          for (const serialized of buffer) {
            const { path, type, data } = serialized;
            const docRef = doc(firestore, path);

            switch (type) {
              case 'DELETE':
                tsx.delete(docRef);
                break;
              case 'UPDATE':
                tsx.update(docRef, readableToObject(firestore, data));
                break;
              case 'SET':
                const options = serialized.options;
                const setOptions = {};
                if ('merge' in options) {
                  setOptions.merge = options.merge;
                } else if ('mergeFields' in options) {
                  setOptions.mergeFields = options.mergeFields;
                }
                tsx.set(docRef, readableToObject(firestore, data), setOptions);
                break;
            }
          }

          // const event = { type: 'complete' };
          // TODO(ehesp): Send transaction event (rnfb_firestore_transaction_event)
          // SendEvent('rnfb_firestore_transaction_event', event, appName, transactionId);
        });
      } catch (e) {
        // TODO(ehesp): Handle error
        // const event = { type: 'error' };
        // TODO(ehesp): Send transaction event (rnfb_firestore_transaction_event)
        // SendEvent('rnfb_firestore_transaction_event', event, appName, transactionId);
      }
    });
  },
};
