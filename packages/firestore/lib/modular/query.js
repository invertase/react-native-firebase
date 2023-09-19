/**
 * @typedef {import('..').FirebaseFirestoreTypes.DocumentReference} DocumentReference
 * @typedef {import('..').FirebaseFirestoreTypes.DocumentSnapshot} DocumentSnapshot
 * @typedef {import('..').FirebaseFirestoreTypes.FieldPath} FieldPath
 * @typedef {import('..').FirebaseFirestoreTypes.QueryCompositeFilterConstraint} QueryCompositeFilterConstraint
 * @typedef {import('..').FirebaseFirestoreTypes.QuerySnapshot} QuerySnapshot
 * @typedef {import('..').FirebaseFirestoreTypes.Query} Query
 * @typedef {import('..').FirebaseFirestoreTypes.WhereFilterOp} WhereFilterOp
 * @typedef {import('../FirestoreFilter')._Filter} _Filter
 * @typedef {import('./query').IQueryConstraint} IQueryConstraint
 * @typedef {import('./query').OrderByDirection} OrderByDirection
 * @typedef {import('./query').QueryFieldFilterConstraint} QueryFieldFilterConstraint
 * @typedef {import('./query').QueryLimitConstraint} QueryLimitConstraint
 * @typedef {import('./query').QueryNonFilterConstraint} QueryNonFilterConstraint
 * @typedef {import('./query').QueryOrderByConstraint} QueryOrderByConstraint
 * @typedef {import('./query').QueryStartAtConstraint} QueryStartAtConstraint
 */

import { _Filter, Filter } from '../FirestoreFilter';

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
 * @param {QueryFieldFilterConstraint[]} queries
 * @returns {_Filter[]}
 */
function getFilterOps(queries) {
  const ops = [];
  for (const query of queries) {
    if (query.type !== 'where') {
      throw 'Not where'; // FIXME: Better error message
    }

    const args = query._args;
    if (!args.length) {
      throw 'No args'; // FIXME: Better error message
    }

    if (args[0] instanceof _Filter) {
      ops.push(args[0]);
      continue;
    }

    const [fieldPath, opStr, value] = args;
    ops.push(Filter(fieldPath, opStr, value));
  }
  return ops;
}

/**
 * @param {QueryFieldFilterConstraint[]} queries
 * @returns {QueryCompositeFilterConstraint}
 */
export function or(...queries) {
  const ops = getFilterOps(queries);
  return new QueryConstraint('where', Filter.or(...ops));
}

/**
 * @param {QueryFieldFilterConstraint[]} queries
 * @returns {QueryCompositeFilterConstraint}
 */
export function and(...queries) {
  const ops = getFilterOps(queries);
  return new QueryConstraint('where', Filter.and(...ops));
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
 * @param {number | string | boolean | null} value
 * @param {string?} key
 * @returns {QueryConstraint}
 */
export function endAt(value, key) {
  if (!key) {
    return new QueryConstraint('endAt', value);
  }
  return new QueryConstraint('endAt', value, key);
}

/**
 * @param {number | string | boolean | null} value
 * @param {string?} key
 * @returns {QueryConstraint}
 */
export function endBefore(value, key) {
  if (!key) {
    return new QueryConstraint('endBefore', value);
  }
  return new QueryConstraint('endBefore', value, key);
}

/**
 * @param {number} limit
 * @returns {QueryLimitConstraint}
 */
export function limit(limit) {
  return new QueryConstraint('limit', limit);
}

/**
 * @param {number} limit
 * @returns {QueryConstraint}
 */
export function limitToLast(limit) {
  return new QueryConstraint('limitToLast', limit);
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
