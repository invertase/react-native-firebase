import { firebase } from '..';

/**
 * @typedef {import('@firebase/app').FirebaseApp} FirebaseApp
 * @typedef {import('..').FirebaseMLTypes.Module} FirebaseML
 */

/**
 * @param {FirebaseApp | undefined} app
 * @returns {FirebaseML}
 */
export function getML(app) {
  if (app) {
    return firebase.ml(app);
  }
  return firebase.ml();
}
