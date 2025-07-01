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

/**
 * Attaches a listener for a snapshots-in-sync event.
 * The snapshots-in-sync event indicates that all listeners affected by a given change have fired, even if
 * a single server-generated change affects multiple listeners.
 *
 * @param {*} firestore
 * @param  {...any} args
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function onSnapshotsInSync(firestore, ...args) {
  throw new Error('onSnapshotsInSync() is not implemented');
}
