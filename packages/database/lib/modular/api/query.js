/**
 * @typedef {import('../..').DatabaseReference} DatabaseReference
 * @typedef {import('../..').DataSnapshot} DataSnapshot
 * @typedef {import('./query.d').Query} Query
 * @typedef {import('./query.d').OnDisconnect} OnDisconnect
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
