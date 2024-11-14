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
import { isObject } from '@react-native-firebase/app/lib/common';
import {
  FirestoreAggregateQuerySnapshot,
  AggregateField,
  AggregateType,
  fieldPathFromArgument,
} from '../FirestoreAggregate';
import FirestoreQuery from '../FirestoreQuery';

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

export function getAggregateFromServer(query, aggregateSpec) {
  if (!(query instanceof FirestoreQuery)) {
    throw new Error(
      '`getAggregateFromServer(*, aggregateSpec)` `query` must be an instance of `FirestoreQuery`',
    );
  }

  if (!isObject(aggregateSpec)) {
    throw new Error('`getAggregateFromServer(query, *)` `aggregateSpec` must be an object');
  } else {
    const containsOneAggregateField = Object.values(aggregateSpec).find(
      value => value instanceof AggregateField,
    );

    if (!containsOneAggregateField) {
      throw new Error(
        '`getAggregateFromServer(query, *)` `aggregateSpec` must contain at least one `AggregateField`',
      );
    }
  }
  const aggregateQueries = [];
  for (const key in aggregateSpec) {
    if (aggregateSpec.hasOwnProperty(key)) {
      const aggregateField = aggregateSpec[key];
      // we ignore any fields that are not `AggregateField`
      if (aggregateField instanceof AggregateField) {
        switch (aggregateField.aggregateType) {
          case AggregateType.AVG:
          case AggregateType.SUM:
          case AggregateType.COUNT:
            const aggregateQuery = {
              aggregateType: aggregateField.aggregateType,
              field:
                aggregateField._fieldPath === null ? null : aggregateField._fieldPath._toPath(),
              key,
            };
            aggregateQueries.push(aggregateQuery);
            break;
          default:
            throw new Error(
              `'AggregateField' has an an unknown 'AggregateType' : ${aggregateField.aggregateType}`,
            );
        }
      }
    }
  }

  return query._firestore.native
    .aggregateQuery(
      query._collectionPath.relativeName,
      query._modifiers.type,
      query._modifiers.filters,
      query._modifiers.orders,
      query._modifiers.options,
      aggregateQueries,
    )
    .then(data => new FirestoreAggregateQuerySnapshot(query, data, false));
}

/**
 * Create an AggregateField object that can be used to compute the sum of
 * a specified field over a range of documents in the result set of a query.
 * @param field Specifies the field to sum across the result set.
 */
export function sum(field) {
  return new AggregateField(AggregateType.SUM, fieldPathFromArgument(field));
}

/**
 * Create an AggregateField object that can be used to compute the average of
 * a specified field over a range of documents in the result set of a query.
 * @param field Specifies the field to average across the result set.
 */
export function average(field) {
  return new AggregateField(AggregateType.AVG, fieldPathFromArgument(field));
}

/**
 * Create an AggregateField object that can be used to compute the count of
 * documents in the result set of a query.
 */
export function count() {
  return new AggregateField(AggregateType.COUNT, null);
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
