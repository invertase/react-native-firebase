import {
  getApp,
  getFirestore,
  doc,
  getDoc,
  deleteDoc,
} from '@react-native-firebase/app/lib/internal/web/firebaseFirestore';
import { objectToWriteable } from './convert';

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

export default {
  setLogLevel() {},
  loadBundle() {},
  clearPersistence() {},
  waitForPendingWrites() {},
  disableNetwork() {},
  enableNetwork() {},
  useEmulator() {},
  settings() {},
  terminate() {},
  // Collection
  namedQueryOnSnapshot() {},
  collectionOnSnapshot() {},
  collectionOffSnapshot() {},
  namedQueryGet() {},
  collectionCount() {},
  collectionGet() {},
  // Document
  documentOnSnapshot() {},
  documentOffSnapshot() {},

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
          'unimplemented',
          'The source cache is not supported in the lite SDK.',
        );
      }

      const app = getApp(appName);
      const firestore = getFirestore(app);
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
      const app = getApp(appName);
      const firestore = getFirestore(app);
      const ref = doc(firestore, path);
      await deleteDoc(ref);
      return null;
    });
  },
  documentSet() {},
  documentUpdate() {},
  documentBatch() {},
  // Transaction
  transactionGetDocument() {},
  transactionDispose() {},
  transactionApplyBuffer() {},
  transactionBegin() {},
};
