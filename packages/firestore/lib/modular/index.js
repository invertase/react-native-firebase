/**
 * @typedef {import('@firebase/app').FirebaseApp} FirebaseApp
 * @typedef {import('../index').FirebaseFirestoreTypes.Module} Firestore
 * @typedef {import('../index').FirebaseFirestoreTypes.CollectionReference} CollectionReference
 * @typedef {import('../index').FirebaseFirestoreTypes.DocumentReference} DocumentReference
 * @typedef {import('../index').FirebaseFirestoreTypes.DocumentData} DocumentData
 * @typedef {import('../index').FirebaseFirestoreTypes.Query} Query
 */

import { firebase } from '../index';

/**
 * @param {FirebaseApp?} app
 * @returns {Firestore}
 */
export function getFirestore(app) {
  if (app) {
    return firebase.firestore(app);
  }

  return firebase.firestore();
}

/**
 * @param {Firestore | CollectionReference | DocumentReference<unknown>} parent
 * @param {string?} path
 * @param {string[]?} pathSegments
 * @returns {DocumentReference}
 */
export function doc<T>(parent, path, ...pathSegments) {
  if (path) {
    return parent.doc();
  }

  if (pathSegments) {
    path = path + '/' + pathSegments.join('/');
  }

  return parent.doc(path);
}

/**
 * @param {Firestore | DocumentReference<unknown> | CollectionReference<unknown>} parent
 * @param {string} path
 * @param {string[]} pathSegments
 * @returns {CollectionReference<DocumentData>}
 */
export function collection(parent, path, ...pathSegments) {
  if (pathSegments) {
    path = path + '/' + pathSegments.join('/');
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

export * from './query';
