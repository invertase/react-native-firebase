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
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/lib/common';
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
    return query[this.type].call(query, ...this._args, MODULAR_DEPRECATION_ARG);
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
 * Creates a QueryEndAtConstraint that modifies the result set to end at the provided fields relative to the order of the query.
 * The order of the field values must match the order of the order by clauses of the query.
 *
 * @param {*} ...args Can be either a DocumentSnapshot or an array of field values.
 */

export function endAt(...args) {
  return new QueryConstraint('endAt', ...args);
}

/**
 * Creates a QueryEndAtConstraint that modifies the result set to end before the provided fields relative to the order of the query.
 * The order of the field values must match the order of the order by clauses of the query.
 *
 * @param {*} fieldValues
 */

export function endBefore(...fieldValues) {
  return new QueryConstraint('endBefore', ...fieldValues);
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
 * @param {DocumentReference} query
 * @returns {Promise<DocumentSnapshot>}
 */
export function getDoc(reference) {
  return reference.get.call(reference, { source: 'default' }, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {DocumentReference} query
 * @returns {Promise<DocumentSnapshot>}
 */
export function getDocFromCache(reference) {
  return reference.get.call(reference, { source: 'cache' }, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {DocumentReference} query
 * @returns {Promise<DocumentSnapshot>}
 */
export function getDocFromServer(reference) {
  return reference.get.call(reference, { source: 'server' }, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {Query} query
 * @returns {Promise<QuerySnapshot>}
 */
export function getDocs(query) {
  return query.get.call(query, { source: 'default' }, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {Query} query
 * @returns {Promise<QuerySnapshot>}
 */
export function getDocsFromCache(query) {
  return query.get.call(query, { source: 'cache' }, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {Query} query
 * @returns {Promise<QuerySnapshot>}
 */
export function getDocsFromServer(query) {
  return query.get.call(query, { source: 'server' }, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {DocumentReference} reference
 * @returns {Promise<void>}
 */
export function deleteDoc(reference) {
  return reference.delete.call(reference, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {Query} left
 * @param {Query} right
 * @returns boolean true if left equals right
 */
export function queryEqual(left, right) {
  return left.isEqual.call(left, right, MODULAR_DEPRECATION_ARG);
}
