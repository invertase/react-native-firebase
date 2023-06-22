import { isPartialObserver } from './utils/observer';

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
  let options = {};
  let observer = {};
  const optionsOrObserverOrOnNext = args[0];
  if (typeof options === 'object' && !isPartialObserver(optionsOrObserverOrOnNext)) {
    options = optionsOrObserverOrOnNext;
  }

  if (isPartialObserver(optionsOrObserverOrOnNext)) {
    observer = optionsOrObserverOrOnNext;
  }

  if (typeof optionsOrObserverOrOnNext === 'function') {
    observer = {
      next: optionsOrObserverOrOnNext,
      error: args[1],
      complete: args[2],
    };
  }

  return reference.onSnapshot(options, observer);
}
