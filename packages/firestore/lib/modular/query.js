/**
 * @typedef {import('..').FirebaseFirestoreTypes.DocumentReference} DocumentReference
 * @typedef {import('..').FirebaseFirestoreTypes.DocumentSnapshot} DocumentSnapshot
 * @typedef {import('..').FirebaseFirestoreTypes.FieldPath} FieldPath
 * @typedef {import('..').FirebaseFirestoreTypes.QueryCompositeFilterConstraint} QueryCompositeFilterConstraint
 * @typedef {import('..').FirebaseFirestoreTypes.QuerySnapshot} QuerySnapshot
 * @typedef {import('..').FirebaseFirestoreTypes.Query} Query
 * @typedef {import('..').FirebaseFirestoreTypes.WhereFilterOp} WhereFilterOp
 * @typedef {import('./query').IQueryConstraint} IQueryConstraint
 * @typedef {import('./query').OrderByDirection} OrderByDirection
 * @typedef {import('./query').QueryFieldFilterConstraint} QueryFieldFilterConstraint
 * @typedef {import('./query').QueryLimitConstraint} QueryLimitConstraint
 * @typedef {import('./query').QueryNonFilterConstraint} QueryNonFilterConstraint
 * @typedef {import('./query').QueryOrderByConstraint} QueryOrderByConstraint
 * @typedef {import('./query').QueryStartAtConstraint} QueryStartAtConstraint
 */

import { QueryStartAtConstraint } from './query';

/**
 * @implements {IQueryConstraint}
 */
class QueryConstraint {
  constructor(type, ...args) {
    this.type = type;
    this._args = args;
  }

  _apply(query) {
    return query[this.type].apply(query, this._args);
  }
}

/**
 * @param {Query} query
 * @param {QueryCompositeFilterConstraint | QueryConstraint | undefined} queryConstraint
 * @param {(QueryConstraint | QueryNonFilterConstraint)[]} additionalQueryConstraints
 * @returns {Query}
 */
export function query(query, queryConstraint, ...additionalQueryConstraints) {
  const queryConstraints = [queryConstraint, ...additionalQueryConstraints].filter(
    constraint => constraint !== undefined,
  );
  let q = query;
  for (const queryConstraint of queryConstraints) {
    q = queryConstraint._apply(q);
  }
  return q;
}

/**
 * @param {string | FieldPath} fieldPath
 * @param {WhereFilterOp} opStr
 * @param {unknown} value
 * @returns {QueryFieldFilterConstraint}
 */
export function where(fieldPath, opStr, value) {
  return new QueryConstraint('where', fieldPath, opStr, value);
}

/**
 * @param {string | FieldPath} fieldPath
 * @param {OrderByDirection} directionStr
 * @returns {QueryOrderByConstraint}
 */
export function orderBy(fieldPath, directionStr) {
  return new QueryConstraint('orderBy', fieldPath, directionStr);
}

/**
 * @param {(unknown | DocumentSnapshot)} docOrFields
 * @returns {QueryStartAtConstraint}
 */
export function startAt(...docOrFields) {
  return new QueryConstraint('startAt', ...docOrFields);
}

/**
 * @param {(unknown | DocumentSnapshot)} docOrFields
 * @returns {QueryStartAtConstraint}
 */
export function startAfter(...docOrFields) {
  return new QueryConstraint('startAfter', ...docOrFields);
}

/**
 * @param {number} limit
 * @returns {QueryLimitConstraint}
 */
export function limit(limit) {
  return new QueryConstraint('limit', limit);
}

/**
 * @param {Query} query
 * @returns {Promise<QuerySnapshot>}
 */
export function getDocs(query) {
  return query.get({ source: 'default' });
}

/**
 * @param {Query} query
 * @returns {Promise<QuerySnapshot>}
 */
export function getDocsFromCache(query) {
  return query.get({ source: 'cache' });
}

/**
 * @param {Query} query
 * @returns {Promise<QuerySnapshot>}
 */
export function getDocsFromServer(query) {
  return query.get({ source: 'server' });
}

/**
 * @param {DocumentReference} reference
 * @returns {Promise<void>}
 */
export function deleteDoc(reference) {
  return reference.delete();
}
