/**
 * @typedef {import('..').FirebaseFirestoreTypes} FirebaseFirestoreTypes
 * @typedef {import('..').FirebaseFirestoreTypes.CollectionReference} CollectionReference
 * @typedef {import('..').FirebaseFirestoreTypes.DocumentData} DocumentData
 * @typedef {import('..').FirebaseFirestoreTypes.DocumentReference} DocumentReference
 * @typedef {import('..').FirebaseFirestoreTypes.FieldPath} FieldPath
 * @typedef {import('..').FirebaseFirestoreTypes.Module} Firestore
 * @typedef {import('..').FirebaseFirestoreTypes.Query} Query
 * @typedef {import('..').FirebaseFirestoreTypes.SetOptions} SetOptions
 * @typedef {import('..').FirebaseFirestoreTypes.Settings} FirestoreSettings
 * @typedef {import('..').FirebaseFirestoreTypes.PersistentCacheIndexManager} PersistentCacheIndexManager
 * @typedef {import('@firebase/app').FirebaseApp} FirebaseApp
 */

import { firebase } from '../index';

/**
 * @param {FirebaseApp?} app
 * @param {String?} databaseId
 * @returns {Firestore}
 */
export function getFirestore(app, databaseId) {
  if (app) {
    if (databaseId) {
      return firebase.app(app.name).firestore(databaseId);
    } else {
      return firebase.app(app.name).firestore();
    }
  }
  if (databaseId) {
    return firebase.app().firestore(databaseId);
  }

  return firebase.app().firestore();
}

/**
 * @param {Firestore | CollectionReference | DocumentReference<unknown>} parent
 * @param {string?} path
 * @param {string?} pathSegments
 * @returns {DocumentReference}
 */
export function doc(parent, path, ...pathSegments) {
  if (pathSegments && pathSegments.length) {
    path = path + '/' + pathSegments.map(e => e.replace(/^\/|\/$/g, '')).join('/');
  }

  return parent.doc(path);
}

/**
 * @param {Firestore | DocumentReference<unknown> | CollectionReference<unknown>} parent
 * @param {string} path
 * @param {string?} pathSegments
 * @returns {CollectionReference<DocumentData>}
 */
export function collection(parent, path, ...pathSegments) {
  if (pathSegments && pathSegments.length) {
    path = path + '/' + pathSegments.map(e => e.replace(/^\/|\/$/g, '')).join('/');
  }

  return parent.collection(path);
}

/**
 * @param {Firestore} firestore
 * @param {string} collectionId
 * @returns {Query<DocumentData>}
 */
export function collectionGroup(firestore, collectionId) {
  return firestore.collectionGroup(collectionId);
}

/**
 * @param {DocumentReference} reference
 * @param {import('.').PartialWithFieldValue} data
 * @param {SetOptions?} options
 * @returns {Promise<void>}
 */
export function setDoc(reference, data, options) {
  return reference.set(data, options);
}

/**
 * @param {DocumentReference} reference
 * @param {string | FieldPath | import('.').UpdateData} fieldOrUpdateData
 * @param {unknown?} value
 * @param {unknown} moreFieldsAndValues
 * @returns {Promise<void>}
 */
export function updateDoc(reference, fieldOrUpdateData, value, ...moreFieldsAndValues) {
  if (!fieldOrUpdateData) {
    // @ts-ignore
    return reference.update();
  }

  if (!value) {
    return reference.update(fieldOrUpdateData);
  }

  if (!moreFieldsAndValues || !Array.isArray(moreFieldsAndValues)) {
    return reference.update(fieldOrUpdateData, value);
  }

  return reference.update(fieldOrUpdateData, value, ...moreFieldsAndValues);
}

/**
 * @param {CollectionReference} reference
 * @param {WithFieldValue} data
 * @returns {Promise<DocumentReference>}
 */
export function addDoc(reference, data) {
  return reference.add(data);
}

/**
 * @param {Firestore} firestore
 * @returns {Promise<void>}
 */
export function enableNetwork(firestore) {
  return firestore.enableNetwork();
}

/**
 * @param {Firestore} firestore
 * @returns {Promise<void>}
 */
export function disableNetwork(firestore) {
  return firestore.disableNetwork();
}

/**
 * @param {Firestore} firestore
 * @returns {Promise<void>}
 */
export function clearPersistence(firestore) {
  return firestore.clearPersistence();
}

/**
 * @param {Firestore} firestore
 * @returns {Promise<void>}
 */
export function terminate(firestore) {
  return firestore.terminate();
}

/**
 * @param {Firestore} firestore
 * @returns {Promise<void>}
 */
export function waitForPendingWrites(firestore) {
  return firestore.waitForPendingWrites();
}

/**
 * @param {FirebaseApp} app
 * @param {FirestoreSettings} settings
 * @param {string?} databaseId
 * @returns {Promise<Firestore>}
 */
export async function initializeFirestore(app, settings /* databaseId */) {
  // TODO(exaby73): implement 2nd database once it's supported
  const firestore = firebase.firestore(app);
  await firestore.settings(settings);
  return firestore;
}

/**
 * @param {import('./').LogLevel} logLevel
 * @returns {void}
 */
export function setLogLevel(logLevel) {
  return firebase.firestore.setLogLevel(logLevel);
}

/**
 * @param {Firestore} firestore
 * @param {(transaction: FirebaseFirestoreTypes.Transaction) => Promise} updateFunction
 * @returns {Promise}
 */
export function runTransaction(firestore, updateFunction) {
  return firestore.runTransaction(updateFunction);
}

/**
 * @param {Query} query
 * @returns {Promise<FirebaseFirestoreTypes.AggregateQuerySnapshot>}
 */
export function getCountFromServer(query) {
  return query.count().get();
}

/**
 * @param {Firestore} firestore
 * @param {ReadableStream<Uint8Array> | ArrayBuffer | string} bundleData
 * @returns {import('.').LoadBundleTask}
 */
export function loadBundle(firestore, bundleData) {
  return firestore.loadBundle(bundleData);
}

/**
 * @param {Firestore} firestore
 * @param {string} name
 * @returns {Query<DocumentData>}
 */
export function namedQuery(firestore, name) {
  return firestore.namedQuery(name);
}

/**
 * @param {Firestore} firestore
 * @returns {FirebaseFirestoreTypes.WriteBatch}
 */
export function writeBatch(firestore) {
  return firestore.batch();
}

/**
 * Gets the `PersistentCacheIndexManager` instance used by this Cloud Firestore instance.
 * This is not the same as Cloud Firestore Indexes.
 * Persistent cache indexes are optional indexes that only exist within the SDK to assist in local query execution.
 * Returns `null` if local persistent storage is not in use.
 * @param {Firestore} firestore
 * @returns {PersistentCacheIndexManager | null}
 */
export function getPersistentCacheIndexManager(firestore) {
  return firestore.persistentCacheIndexManager();
}

/**
 * Enables the SDK to create persistent cache indexes automatically for local query
 * execution when the SDK believes cache indexes can help improves performance.
 * This feature is disabled by default.
 * @param {PersistentCacheIndexManager} indexManager
 * @returns {Promise<void}
 */
export function enablePersistentCacheIndexAutoCreation(indexManager) {
  return indexManager.enableIndexAutoCreation();
}

/**
 * Stops creating persistent cache indexes automatically for local query execution.
 * The indexes which have been created by calling `enableIndexAutoCreation()` still take effect.
 * @param {PersistentCacheIndexManager} indexManager
 * @returns {Promise<void}
 */
export function disablePersistentCacheIndexAutoCreation(indexManager) {
  return indexManager.disableIndexAutoCreation();
}

/**
 * Removes all persistent cache indexes. Note this function also deletes indexes
 * generated by `setIndexConfiguration()`, which is deprecated.
 * @param {PersistentCacheIndexManager} indexManager
 * @returns {Promise<void}
 */
export function deleteAllPersistentCacheIndexes(indexManager) {
  return indexManager.deleteAllIndexes();
}

export * from './query';
export * from './snapshot';
export * from './Bytes';
export * from './FieldPath';
export * from './FieldValue';
export * from './GeoPoint';
export * from './Timestamp';
export { Filter } from '../FirestoreFilter';
