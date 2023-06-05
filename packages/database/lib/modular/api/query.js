/**
 * @typedef {import('../..').DatabaseReference} DatabaseReference
 * @typedef {import('../..').DataSnapshot} DataSnapshot
 * @typedef {import('./query.d').Query} Query
 * @typedef {import('./query.d').OnDisconnect} OnDisconnect
 * @typedef {import('./query.d').ListenOptions} ListenOptions
 * @typedef {import('./query.d').Unsubscribe} Unsubscribe
 * @typedef {import('./query.d').EventType} EventType
 */

/**
 * @implements {import('./query').QueryConstraint}
 */
export class QueryConstraint {
  constructor(type, ...args) {
    this._type = type;
    this.args = args;
  }

  _apply(query) {
    query[this.type].apply(query, ...args);
  }
}

/**
 * @param {number | string | boolean | null} value
 * @param {string?} key
 * @returns {QueryConstraint}
 */
export function endAt(value, key) {
  return new QueryConstraint('endAt', value, key);
}

/**
 * @param {number | string | boolean | null} value
 * @param {string?} key
 * @returns {QueryConstraint}
 */
export function endBefore(value, key) {
  return new QueryConstraint('endBefore', value, key);
}

/**
 * @param {number | string | boolean | null} value,
 * @param {string?} key,
 * @returns {QueryConstraint}
 */
export function startAt(value, key) {
  return new QueryConstraint('startAt', value, key);
}

/**
 * @param {number | string | boolean | null} value,
 * @param {string?} key,
 * @returns {QueryConstraint}
 */
export function startAfter(value, key) {
  return new QueryConstraint('startAfter', value, key);
}

/**
 * @param {number} limit
 * @returns {QueryConstraint}
 */
export function limitToFirst(limit) {
  return new QueryConstraint('limitToFirst', limit);
}

/**
 * @param {number} limit
 * @returns {QueryConstraint}
 */
export function limitToLast(limit) {
  return new QueryConstraint('limitToLast', limit);
}

/**
 * @param {string} path
 * @returns {QueryConstraint}
 */
export function orderByChild(path) {
  return new QueryConstraint('orderByChild', path);
}

export function orderByKey() {
  return new QueryConstraint('orderByKey');
}

export function orderByPriority() {
  return new QueryConstraint('orderByPriority');
}

export function orderByValue() {
  return new QueryConstraint('orderByValue');
}

/**
 * @param {number | string | boolean | null} value
 * @param {string?} key
 * @returns {QueryConstraint}
 */
export function equalTo(value, key) {
  return new QueryConstraint('equalTo', value, key);
}

/**
 * @param {import('./query.d').Query} query
 * @param {QueryConstraint[]} queryConstraints
 * @returns {import('./query.d').Query}
 */
export function query(query, ...queryConstraints) {
  for (const queryConstraint of queryConstraints) {
    queryConstraint._apply(query);
  }
  return query;
}

/**
 * @param {Query} query
 * @param {EventType} eventType
 * @param {(snapshot: DataSnapshot) => unknown} callback
 * @param {((error: Error) => unknown) | ListenOptions} cancelCallbackOrListenOptions
 * @param {ListenOptions?} options
 * @returns {Unsubscribe}
 */
function addEventListener(query, eventType, callback, cancelCallbackOrListenOptions, options) {
  let cancelCallback = cancelCallbackOrListenOptions;

  if (typeof cancelCallbackOrListenOptions === 'object') {
    cancelCallback = undefined;
    options = cancelCallbackOrListenOptions;
  }

  if (options && options.onlyOnce) {
    const userCallback = callback;
    callback = snapshot => {
      query.off(eventType, callback);
      return userCallback(snapshot);
    };
  }

  query.on(eventType, callback, cancelCallback);

  return () => query.off(eventType, callback);
}

/**
 * @param {Query} query
 * @param {(snapshot: DataSnapshot) => unknown} callback
 * @param {((error: Error) => unknown) | ListenOptions} cancelCallbackOrListenOptions
 * @param {ListenOptions?} options
 * @returns {Unsubscribe}
 */
export function onValue(query, callback, cancelCallbackOrListenOptions, options) {
  return addEventListener(query, 'value', callback, cancelCallbackOrListenOptions, options);
}

/**
 * @param {Query} query
 * @param {(snapshot: DataSnapshot, previousChildName: string | null) => unknown} callback
 * @param {((error: Error) => unknown) | ListenOptions} cancelCallbackOrListenOptions
 * @param {ListenOptions?} options
 * @returns {Unsubscribe}
 */
export function onChildAdded(query, callback, cancelCallbackOrListenOptions, options) {
  return addEventListener(query, 'child_added', callback, cancelCallbackOrListenOptions, options);
}

/**
 * @param {DatabaseReference} ref
 * @param {unknown} value
 * @returns {Promise<void>}
 */
export function set(ref, value) {
  return ref.set(value);
}

/**
 * @param {DatabaseReference} ref
 * @param {string | number | null} priority
 * @returns {Promise<void>}
 */
export function setPriority(ref, priority) {
  return ref.setPriority(priority);
}

/**
 * @param {DatabaseReference} ref
 * @param {unknown} value
 * @param {string | number | null} priority
 * @returns {Promise<void>}
 */
export function setWithPriority(ref, value, priority) {
  return ref.setWithPriority(value, priority);
}

/**
 * @param {Query} query
 * @returns {DataSnapshot}
 */
export function get(query) {
  return query.once('value');
}

/**
 * @param {DatabaseReference} parent
 * @param {string} path
 * @returns {DatabaseReference}
 */
export function child(parent, path) {
  return parent.child(path);
}

/**
 * @param {DatabaseReference} ref
 * @returns {OnDisconnect}
 */
export function onDisconnect(ref) {
  return ref.onDisconnect();
}
