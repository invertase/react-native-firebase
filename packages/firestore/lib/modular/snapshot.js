/**
 * @typedef {import('../..').FirebaseFirestoreTypes.Query} Query
 * @typedef {import('../..').FirebaseFirestoreTypes.DocumentReference} DocumentReference
 * @typedef {import('snapshot').Unsubscribe} Unsubscribe
 */

import { MODULAR_DEPRECATION_ARG } from '../../../app/lib/common';

/**
 * @param {Query | DocumentReference} reference
 * @param {unknown} args
 * @returns {Promise<unknown>}
 */
export function onSnapshot(reference, ...args) {
  return reference.onSnapshot.call(reference, ...args, MODULAR_DEPRECATION_ARG);
}

export function snapshotEqual(left, right) {
  return left.isEqual.call(left, right, MODULAR_DEPRECATION_ARG);
}
