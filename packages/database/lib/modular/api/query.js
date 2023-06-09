/**
 * @typedef {import('../..').DatabaseReference} DatabaseReference
 * @typedef {import('../..').DataSnapshot} DataSnapshot
 * @typedef {import('./query').QueryConstraint} IQueryConstraint
 * @typedef {import('./query').Query} Query
 * @typedef {import('./query').OnDisconnect} OnDisconnect
 * @typedef {import('./query').ListenOptions} ListenOptions
 * @typedef {import('./query').Unsubscribe} Unsubscribe
 * @typedef {import('./query').EventType} EventType
 * @typedef {import('./query').ThenableReference} ThenableReference
 */

/**
 * @implements {IQueryConstraint}
 */
class QueryConstraint {
  constructor(type, ...args) {
    this._type = type;
    this._args = args;
  }

  _apply(query) {
    return query[this._type].apply(query, this._args);
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
 * @param {Query} query
 * @param {QueryConstraint[]} queryConstraints
 * @returns {Query}
 */
export function query(query, ...queryConstraints) {
  let q = query;
  for (const queryConstraint of queryConstraints) {
    q = queryConstraint._apply(q);
  }
  return q;
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
 * @param {((error: Error) => unknown) | ListenOptions | undefined} cancelCallbackOrListenOptions
 * @param {ListenOptions?} options
 * @returns {Unsubscribe}
 */
export function onValue(query, callback, cancelCallbackOrListenOptions, options) {
  return addEventListener(query, 'value', callback, cancelCallbackOrListenOptions, options);
}

/**
 * @param {Query} query
 * @param {(snapshot: DataSnapshot, previousChildName: string | null) => unknown} callback
 * @param {((error: Error) => unknown) | ListenOptions | undefined} cancelCallbackOrListenOptions
 * @param {ListenOptions?} options
 * @returns {Unsubscribe}
 */
export function onChildAdded(query, callback, cancelCallbackOrListenOptions, options) {
  return addEventListener(query, 'child_added', callback, cancelCallbackOrListenOptions, options);
}

/**
 * @param {Query} query
 * @param {(snapshot: DataSnapshot, previousChildName: string | null) => unknown} callback
 * @param {((error: Error) => unknown) | ListenOptions | undefined} cancelCallbackOrListenOptions
 * @param {ListenOptions?} options
 * @returns {Unsubscribe}
 */
export function onChildChanged(query, callback, cancelCallbackOrListenOptions, options) {
  return addEventListener(query, 'child_changed', callback, cancelCallbackOrListenOptions, options);
}

/**
 * @param {Query} query
 * @param {(snapshot: DataSnapshot, previousChildName: string | null) => unknown} callback
 * @param {((error: Error) => unknown) | ListenOptions | undefined} cancelCallbackOrListenOptions
 * @param {ListenOptions?} options
 * @returns {Unsubscribe}
 */
export function onChildMoved(query, callback, cancelCallbackOrListenOptions, options) {
  return addEventListener(query, 'child_moved', callback, cancelCallbackOrListenOptions, options);
}

/**
 * @param {Query} query
 * @param {(snapshot: DataSnapshot, previousChildName: string | null) => unknown} callback
 * @param {((error: Error) => unknown) | ListenOptions | undefined} cancelCallbackOrListenOptions
 * @param {ListenOptions?} options
 * @returns {Unsubscribe}
 */
export function onChildRemoved(query, callback, cancelCallbackOrListenOptions, options) {
  return addEventListener(query, 'child_removed', callback, cancelCallbackOrListenOptions, options);
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

/**
 * @param {DatabaseReference} ref
 * @param {boolean} value
 * @returns {Promise<void>}
 */
export function keepSynced(ref, value) {
  return ref.keepSynced(value);
}

/**
 * @param {DatabaseReference} parent
 * @param {unknown} value
 * @returns {ThenableReference}
 */
export function push(parent, value) {
  return parent.push(value);
}

/**
 * @param {DatabaseReference} ref
 * @returns {Promise<void>}
 */
export function remove(ref) {
  return ref.remove();
}

/**
 * @param {DatabaseReference} ref
 * @param {object} values
 * @returns {Promise<void>}
 */
export function update(ref, values) {
  return ref.update(values);
}
