import { FirebaseFirestoreTypes } from '../..';

import Query = FirebaseFirestoreTypes.Query;
import QueryCompositeFilterConstraint = FirebaseFirestoreTypes.QueryCompositeFilterConstraint;
import WhereFilterOp = FirebaseFirestoreTypes.WhereFilterOp;
import FieldPath = FirebaseFirestoreTypes.FieldPath;
import QuerySnapshot = FirebaseFirestoreTypes.QuerySnapshot;
import DocumentReference = FirebaseFirestoreTypes.DocumentReference;
import DocumentSnapshot = FirebaseFirestoreTypes.DocumentSnapshot;
import DocumentData = FirebaseFirestoreTypes.DocumentData;

/** Describes the different query constraints available in this SDK. */
export type QueryConstraintType =
  | 'where'
  | 'orderBy'
  | 'limit'
  | 'limitToLast'
  | 'startAt'
  | 'startAfter'
  | 'endAt'
  | 'endBefore';

/**
 * An `AppliableConstraint` is an abstraction of a constraint that can be applied
 * to a Firestore query.
 */
export interface AppliableConstraint {
  /**
   * Takes the provided {@link Query} and returns a copy of the {@link Query} with this
   * {@link AppliableConstraint} applied.
   */
  _apply<T>(query: Query<T>): Query<T>;
}

/**
 * A `QueryConstraint` is used to narrow the set of documents returned by a
 * Firestore query. `QueryConstraint`s are created by invoking {@link where},
 * {@link orderBy}, {@link (startAt:1)}, {@link (startAfter:1)}, {@link
 * (endBefore:1)}, {@link (endAt:1)}, {@link limit}, {@link limitToLast} and
 * can then be passed to {@link (query:1)} to create a new query instance that
 * also contains this `QueryConstraint`.
 */
export interface QueryConstraint extends AppliableConstraint {
  /** The type of this query constraint */
  readonly type: QueryConstraintType;

  /**
   * Takes the provided {@link Query} and returns a copy of the {@link Query} with this
   * {@link AppliableConstraint} applied.
   */
  _apply<T>(query: Query<T>): Query<T>;
}

export class QueryOrderByConstraint extends QueryConstraint {
  readonly type: QueryConstraintType = 'orderBy';
}

export class QueryLimitConstraint extends QueryConstraint {
  readonly type: QueryConstraintType = 'limit';
}

export class QueryStartAtConstraint extends QueryConstraint {
  readonly type: QueryConstraintType = 'startAt';
}

export class QueryEndAtConstraint extends QueryConstraint {
  readonly type: QueryConstraintType = 'endAt';
}

export class QueryFieldFilterConstraint extends QueryConstraint {
  readonly type: QueryConstraintType = 'where';
}

/**
 * `QueryNonFilterConstraint` is a helper union type that represents
 * QueryConstraints which are used to narrow or order the set of documents,
 * but that do not explicitly filter on a document field.
 * `QueryNonFilterConstraint`s are created by invoking {@link orderBy},
 * {@link (startAt:1)}, {@link (startAfter:1)}, {@link (endBefore:1)}, {@link (endAt:1)},
 * {@link limit} or {@link limitToLast} and can then be passed to {@link (query:1)}
 * to create a new query instance that also contains the `QueryConstraint`.
 */
export type QueryNonFilterConstraint =
  | QueryOrderByConstraint
  | QueryLimitConstraint
  | QueryStartAtConstraint
  | QueryEndAtConstraint;

/**
 * Creates a new immutable instance of {@link Query} that is extended to also
 * include additional query constraints.
 *
 * @param query - The {@link Query} instance to use as a base for the new
 * constraints.
 * @param compositeFilter - The {@link QueryCompositeFilterConstraint} to
 * apply. Create {@link QueryCompositeFilterConstraint} using {@link and} or
 * {@link or}.
 * @param queryConstraints - Additional {@link QueryNonFilterConstraint}s to
 * apply (e.g. {@link orderBy}, {@link limit}).
 * @throws if any of the provided query constraints cannot be combined with the
 * existing or new constraints.
 */
export declare function query<AppModelType, DbModelType extends DocumentData>(
  query: Query<AppModelType, DbModelType>,
  compositeFilter: QueryCompositeFilterConstraint,
  ...queryConstraints: QueryNonFilterConstraint[]
): Query<AppModelType, DbModelType>;

/**
 * Creates a new immutable instance of {@link Query} that is extended to also
 * include additional query constraints.
 *
 * @param query - The {@link Query} instance to use as a base for the new
 * constraints.
 * @param queryConstraints - The list of {@link IQueryConstraint}s to apply.
 * @throws if any of the provided query constraints cannot be combined with the
 * existing or new constraints.
 */
export declare function query<AppModelType, DbModelType extends DocumentData>(
  query: Query<AppModelType, DbModelType>,
  ...queryConstraints: QueryConstraint[]
): Query<AppModelType, DbModelType>;

export function query<T>(
  query: Query<T>,
  queryConstraint: QueryCompositeFilterConstraint | IQueryConstraint | undefined,
  ...additionalQueryConstraints: Array<IQueryConstraint | QueryNonFilterConstraint>
): Query<T>;

/**
 * Creates a {@link QueryFieldFilterConstraint} that enforces that documents
 * must contain the specified field and that the value should satisfy the
 * relation constraint provided.
 *
 * @param fieldPath - The path to compare
 * @param opStr - The operation string (e.g "&lt;", "&lt;=", "==", "&lt;",
 *   "&lt;=", "!=").
 * @param value - The value for comparison
 * @returns The created {@link QueryFieldFilterConstraint}.
 */
export function where(
  fieldPath: string | FieldPath,
  opStr: WhereFilterOp,
  value: unknown,
): QueryFieldFilterConstraint;

/**
 * The or() function used to generate a logical OR query.
 * e.g. or(where('name', '==', 'Ada'), where('name', '==', 'Bob'))
 */
export function or(...queries: QueryFilterConstraint[]): QueryCompositeFilterConstraint;

/**
 * The and() function used to generate a logical AND query.
 * e.g. and(where('name', '==', 'Ada'), where('name', '==', 'Bob'))
 */
export function and(...queries: QueryFilterConstraint[]): QueryCompositeFilterConstraint;

/**
 * The direction of a {@link orderBy} clause is specified as 'desc' or 'asc'
 * (descending or ascending).
 */
export type OrderByDirection = 'desc' | 'asc';

/**
 * Creates a {@link QueryOrderByConstraint} that sorts the query result by the
 * specified field, optionally in descending order instead of ascending.
 *
 * Note: Documents that do not contain the specified field will not be present
 * in the query result.
 *
 * @param fieldPath - The field to sort by.
 * @param directionStr - Optional direction to sort by ('asc' or 'desc'). If
 * not specified, order will be ascending.
 * @returns The created {@link QueryOrderByConstraint}.
 */
export function orderBy(
  fieldPath: string | FieldPath,
  directionStr?: OrderByDirection = 'asc',
): QueryOrderByConstraint;

/**
 * Creates a {@link QueryStartAtConstraint} that modifies the result set to
 * start at the provided document (inclusive). The starting position is relative
 * to the order of the query. The document must contain all of the fields
 * provided in the `orderBy` of this query.
 *
 * @param snapshot - The snapshot of the document to start at.
 * @returns A {@link QueryStartAtConstraint} to pass to `query()`.
 */
export function startAt(snapshot: DocumentSnapshot<unknown>): QueryStartAtConstraint;
/**
 *
 * Creates a {@link QueryStartAtConstraint} that modifies the result set to
 * start at the provided fields relative to the order of the query. The order of
 * the field values must match the order of the order by clauses of the query.
 *
 * @param fieldValues - The field values to start this query at, in order
 * of the query's order by.
 * @returns A {@link QueryStartAtConstraint} to pass to `query()`.
 */
export function startAt(...fieldValues: unknown[]): QueryStartAtConstraint;

export function startAt(
  ...docOrFields: Array<unknown | DocumentSnapshot<unknown>>
): QueryStartAtConstraint;

/**
 * Creates a {@link QueryStartAtConstraint} that modifies the result set to
 * start after the provided document (exclusive). The starting position is
 * relative to the order of the query. The document must contain all of the
 * fields provided in the orderBy of the query.
 *
 * @param snapshot - The snapshot of the document to start after.
 * @returns A {@link QueryStartAtConstraint} to pass to `query()`
 */
export function startAfter<AppModelType, DbModelType extends DocumentData>(
  snapshot: DocumentSnapshot<AppModelType, DbModelType>,
): QueryStartAtConstraint;

/**
 * Creates a {@link QueryStartAtConstraint} that modifies the result set to
 * start after the provided fields relative to the order of the query. The order
 * of the field values must match the order of the order by clauses of the query.
 *
 * @param fieldValues - The field values to start this query after, in order
 * of the query's order by.
 * @returns A {@link QueryStartAtConstraint} to pass to `query()`
 */
export function startAfter(...fieldValues: unknown[]): QueryStartAtConstraint;

export function startAfter<AppModelType, DbModelType extends DocumentData>(
  ...docOrFields: Array<unknown | DocumentSnapshot<AppModelType, DbModelType>>
): QueryStartAtConstraint;

/**
 * Creates a {@link QueryLimitConstraint} that only returns the first matching
 * documents.
 *
 * @param limit - The maximum number of items to return.
 * @returns The created {@link QueryLimitConstraint}.
 */
export function limit(limit: number): QueryLimitConstraint;

/**
 * Reads the document referred to by this `DocumentReference`.
 *
 * Note: `getDoc()` attempts to provide up-to-date data when possible by waiting
 * for data from the server, but it may return cached data or fail if you are
 * offline and the server cannot be reached. To specify this behavior, invoke
 * {@link getDocFromCache} or {@link getDocFromServer}.
 *
 * @param reference - The reference of the document to fetch.
 * @returns A Promise resolved with a `DocumentSnapshot` containing the
 * current document contents.
 */
export declare function getDoc<T>(reference: DocumentReference<T>): Promise<DocumentSnapshot<T>>;

/**
 * Reads the document referred to by this `DocumentReference` from cache.
 * Returns an error if the document is not currently cached.
 *
 * @returns A `Promise` resolved with a `DocumentSnapshot` containing the
 * current document contents.
 */
export declare function getDocFromCache<T>(
  reference: DocumentReference<T>,
): Promise<DocumentSnapshot<T>>;

/**
 * Reads the document referred to by this `DocumentReference` from the server.
 * Returns an error if the network is not available.
 *
 * @returns A `Promise` resolved with a `DocumentSnapshot` containing the
 * current document contents.
 */
export declare function getDocFromServer<T>(
  reference: DocumentReference<T>,
): Promise<DocumentSnapshot<T>>;

/**
 * Executes the query and returns the results as a `QuerySnapshot`.
 *
 * Note: `getDocs()` attempts to provide up-to-date data when possible by
 * waiting for data from the server, but it may return cached data or fail if
 * you are offline and the server cannot be reached. To specify this behavior,
 * invoke {@link getDocsFromCache} or {@link getDocsFromServer}.
 *
 * @returns A `Promise` that will be resolved with the results of the query.
 */
export declare function getDocs<AppModelType, DbModelType extends DocumentData>(
  query: Query<AppModelType, DbModelType>,
): Promise<QuerySnapshot<AppModelType, DbModelType>>;

/**
 * Executes the query and returns the results as a `QuerySnapshot` from cache.
 * Returns an empty result set if no documents matching the query are currently
 * cached.
 *
 * @returns A `Promise` that will be resolved with the results of the query.
 */
export declare function getDocsFromCache<AppModelType, DbModelType extends DocumentData>(
  query: Query<AppModelType, DbModelType>,
): Promise<QuerySnapshot<AppModelType, DbModelType>>;

/**
 * Executes the query and returns the results as a `QuerySnapshot` from the
 * server. Returns an error if the network is not available.
 *
 * @returns A `Promise` that will be resolved with the results of the query.
 */
export declare function getDocsFromServer<AppModelType, DbModelType extends DocumentData>(
  query: Query<AppModelType, DbModelType>,
): Promise<QuerySnapshot<AppModelType, DbModelType>>;

/**
 * Deletes the document referred to by the specified `DocumentReference`.
 *
 * @param reference - A reference to the document to delete.
 * @returns A Promise resolved once the document has been successfully
 * deleted from the backend (note that it won't resolve while you're offline).
 */
export declare function deleteDoc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
): Promise<void>;

/**
 * Creates a QueryEndAtConstraint that modifies the result set to end at the provided fields relative to the order of the query.
 * The order of the field values must match the order of the order by clauses of the query.
 *
 * @param fieldValues
 */
export declare function endAt(...fieldValues: unknown[]): QueryEndAtConstraint;

/**
 * reates a QueryEndAtConstraint that modifies the result set to end at the provided document (inclusive).
 * The end position is relative to the order of the query. The document must contain all of the fields provided in the orderBy of the query.
 * @param snapshot
 */
export function endAt<AppModelType, DbModelType extends DocumentData>(
  snapshot: DocumentSnapshot<AppModelType, DbModelType>,
): QueryEndAtConstraint;

/**
 * Creates a QueryEndAtConstraint that modifies the result set to end before the provided fields relative to the order of the query.
 * The order of the field values must match the order of the order by clauses of the query.
 *
 * @param fieldValues
 */
export declare function endBefore(...fieldValues: unknown[]): QueryEndAtConstraint;

/**
 * Creates a new `QueryConstraint` that is limited to return only the last
 * specified number of children.
 *
 * The `limitToLast()` method is used to set a maximum number of children to be
 * synced for a given callback. If we set a limit of 100, we will initially only
 * receive up to 100 `child_added` events. If we have fewer than 100 messages
 * stored in our Database, a `child_added` event will fire for each message.
 * However, if we have over 100 messages, we will only receive a `child_added`
 * event for the last 100 ordered messages. As items change, we will receive
 * `child_removed` events for each item that drops out of the active list so
 * that the total number stays at 100.
 *
 * You can read more about `limitToLast()` in
 * {@link https://firebase.google.com/docs/database/web/lists-of-data#filtering_data | Filtering data}.
 *
 * @param limit - The maximum number of nodes to include in this query.
 */
export function limitToLast(limit: number): QueryConstraint;
