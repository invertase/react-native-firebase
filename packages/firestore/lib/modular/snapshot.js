/**
 * @typedef {import('../..').FirebaseFirestoreTypes.Query} Query
 * @typedef {import('../..').FirebaseFirestoreTypes.DocumentReference} DocumentReference
 * @typedef {import('snapshot').Unsubscribe} Unsubscribe
 */

/**
 * @param {Query | DocumentReference} reference
 * @param {unknown} args
 * @returns {Promise<unknown>}
 */
export function onSnapshot(reference, ...args) {
  return reference.onSnapshot(...args);
}
