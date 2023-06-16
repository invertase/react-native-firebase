/**
 * @typedef {import('@firebase/app').FirebaseApp} FirebaseApp
 * @typedef {import('../index').FirebaseFirestoreTypes.Module} Firestore
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
