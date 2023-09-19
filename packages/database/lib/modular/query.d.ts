import { FirebaseDatabaseTypes } from '../..';

import Query = FirebaseDatabaseTypes.Query;
import DataSnapshot = FirebaseDatabaseTypes.DataSnapshot;
import DatabaseReference = FirebaseDatabaseTypes.Reference;
import OnDisconnect = FirebaseDatabaseTypes.OnDisconnect;

export type Query = Query;
export type DataSnapshot = DataSnapshot;
export type DatabaseReference = DatabaseReference;
export type OnDisconnect = OnDisconnect;

/**
 * A `Promise` that can also act as a `DatabaseReference` when returned by
 * {@link push}. The reference is available immediately and the `Promise` resolves
 * as the write to the backend completes.
 */
export interface ThenableReference
  extends DatabaseReference,
    Pick<Promise<DatabaseReference>, 'then' | 'catch'> {}

export type Unsubscribe = () => void;

export interface ListenOptions {
  readonly onlyOnce?: boolean;
}

/** Describes the different query constraints available in this SDK. */
export type QueryConstraintType =
  | 'endAt'
  | 'endBefore'
  | 'startAt'
  | 'startAfter'
  | 'limitToFirst'
  | 'limitToLast'
  | 'orderByChild'
  | 'orderByKey'
  | 'orderByPriority'
  | 'orderByValue'
  | 'equalTo';

/**
 * A `QueryConstraint` is used to narrow the set of documents returned by a
 * Database query. `QueryConstraint`s are created by invoking {@link endAt},
 * {@link endBefore}, {@link startAt}, {@link startAfter}, {@link
 * limitToFirst}, {@link limitToLast}, {@link orderByChild},
 * {@link orderByChild}, {@link orderByKey} , {@link orderByPriority} ,
 * {@link orderByValue}  or {@link equalTo} and
 * can then be passed to {@link query} to create a new query instance that
 * also contains this `QueryConstraint`.
 */
export interface QueryConstraint {
  /** The type of this query constraints */
  readonly _type: QueryConstraintType;

  _apply(query: Query): Query;
}

/**
 * Creates a `QueryConstraint` with the specified ending point.
 *
 * Using `startAt()`, `startAfter()`, `endBefore()`, `endAt()` and `equalTo()`
 * allows you to choose arbitrary starting and ending points for your queries.
 *
 * The ending point is inclusive, so children with exactly the specified value
 * will be included in the query. The optional key argument can be used to
 * further limit the range of the query. If it is specified, then children that
 * have exactly the specified value must also have a key name less than or equal
 * to the specified key.
 *
 * @param value - The value to end at. The argument type depends on which
 * `orderBy*()` function was used in this query. Specify a value that matches
 * the `orderBy*()` type. When used in combination with `orderByKey()`, the
 * value must be a string.
 * @param key - The child key to end at, among the children with the previously
 * specified priority. This argument is only allowed if ordering by child,
 * value, or priority.
 */
export declare function endAt(
  value: number | string | boolean | null,
  key?: string,
): QueryConstraint;

/**
 * Creates a QueryConstraint with the specified ending point (exclusive).
 *
 * Using `startAt()`, `startAfter()`, `endBefore()`, `endAt()` and `equalTo()` allows you to
 * choose arbitrary starting and ending points for your queries.
 *
 * The ending point is exclusive. If only a value is provided, children with a
 * value less than the specified value will be included in the query. If a key
 * is specified, then children must have a value less than or equal to the
 * specified value and a key name less than the specified key.
 *
 * @param value - The value to end before. The argument type depends on which
 * `orderBy*()` function was used in this query. Specify a value that matches
 * the `orderBy*()` type. When used in combination with `orderByKey()`, the
 * value must be a string.
 * @param key - The child key to end before, among the children with the
 * previously specified priority. This argument is only allowed if ordering by
 * child, value, or priority.
 */
export declare function endBefore(
  value: number | string | boolean | null,
  key?: string,
): QueryConstraint;

/**
 * Creates a QueryConstraint that includes children that match the specified value.
 *
 * Using `startAt()`, `startAfter()`, `endBefore()`, `endAt()` and `equalTo()` allows
 * you to choose arbitrary starting and ending points for your queries.
 *
 * The optional key argument can be used to further limit the range of the
 * query. If it is specified, then children that have exactly the specified
 * value must also have exactly the specified key as their key name. This
 * can be used to filter result sets with many matches for the same value.
 *
 * @param value - The value to match for. The argument type depends on which
 * `orderBy*()` function was used in this query. Specify a value that matches
 * the `orderBy*()` type. When used in combination with `orderByKey()`, the
 * value must be a string.
 * @param key - The child key to start at, among the children with the
 * previously specified priority. This argument is only allowed if ordering by
 * child, value, or priority.
 */
export declare function equalTo(
  value: number | string | boolean | null,
  key?: string,
): QueryConstraint;

/**
 * Creates a `QueryConstraint` that includes children that match the specified
 * value.
 *
 * Using `startAt()`, `startAfter()`, `endBefore()`, `endAt()` and `equalTo()`
 * allows you to choose arbitrary starting and ending points for your queries.
 *
 * The optional key argument can be used to further limit the range of the
 * query. If it is specified, then children that have exactly the specified
 * value must also have exactly the specified key as their key name. This can be
 * used to filter result sets with many matches for the same value.
 *
 * @param value - The value to match for. The argument type depends on which
 * `orderBy*()` function was used in this query. Specify a value that matches
 * the `orderBy*()` type. When used in combination with `orderByKey()`, the
 * value must be a string.
 * @param key - The child key to start at, among the children with the
 * previously specified priority. This argument is only allowed if ordering by
 * child, value, or priority.
 */
export function equalTo(value: number | string | boolean | null, key?: string): QueryConstraint;

/**
 * Creates a QueryConstraint with the specified starting point.
 *
 * Using `startAt()`, `startAfter()`, `endBefore()`, `endAt()` and `equalTo()`
 * allows you to choose arbitrary starting and ending points for your queries.
 *
 * The starting point is inclusive, so children with exactly the specified
 * value will be included in the query. The optional key argument can be used
 * to further limit the range of the query. If it is specified, then children
 * that have exactly the specified value must also have a key name greater than
 * or equal to the specified key.
 *
 * @param value - The value to start at. The argument type depends on which
 * `orderBy*()` function was used in this query. Specify a value that matches
 * the `orderBy*()` type. When used in combination with `orderByKey()`, the
 * value must be a string.
 * @param key - The child key to start at. This argument is only allowed if
 * ordering by child, value, or priority.
 */
export declare function startAt(
  value?: number | string | boolean | null,
  key?: string,
): QueryConstraint;

/**
 * Creates a `QueryConstraint` with the specified starting point.
 *
 * Using `startAt()`, `startAfter()`, `endBefore()`, `endAt()` and `equalTo()`
 * allows you to choose arbitrary starting and ending points for your queries.
 *
 * The starting point is inclusive, so children with exactly the specified value
 * will be included in the query. The optional key argument can be used to
 * further limit the range of the query. If it is specified, then children that
 * have exactly the specified value must also have a key name greater than or
 * equal to the specified key.
 *
 * @param value - The value to start at. The argument type depends on which
 * `orderBy*()` function was used in this query. Specify a value that matches
 * the `orderBy*()` type. When used in combination with `orderByKey()`, the
 * value must be a string.
 * @param key - The child key to start at. This argument is only allowed if
 * ordering by child, value, or priority.
 */
export function startAt(
  value: number | string | boolean | null = null,
  key?: string,
): QueryConstraint;

/**
 * Creates a `QueryConstraint` with the specified starting point (exclusive).
 *
 * Using `startAt()`, `startAfter()`, `endBefore()`, `endAt()` and `equalTo()`
 * allows you to choose arbitrary starting and ending points for your queries.
 *
 * The starting point is exclusive. If only a value is provided, children
 * with a value greater than the specified value will be included in the query.
 * If a key is specified, then children must have a value greater than or equal
 * to the specified value and a a key name greater than the specified key.
 *
 * @param value - The value to start after. The argument type depends on which
 * `orderBy*()` function was used in this query. Specify a value that matches
 * the `orderBy*()` type. When used in combination with `orderByKey()`, the
 * value must be a string.
 * @param key - The child key to start after. This argument is only allowed if
 * ordering by child, value, or priority.
 */
export function startAfter(value: number | string | boolean | null, key?: string): QueryConstraint;

/**
 * Creates a `QueryConstraint` with the specified starting point (exclusive).
 *
 * Using `startAt()`, `startAfter()`, `endBefore()`, `endAt()` and `equalTo()`
 * allows you to choose arbitrary starting and ending points for your queries.
 *
 * The starting point is exclusive. If only a value is provided, children
 * with a value greater than the specified value will be included in the query.
 * If a key is specified, then children must have a value greater than or equal
 * to the specified value and a key name greater than the specified key.
 *
 * @param value - The value to start after. The argument type depends on which
 * `orderBy*()` function was used in this query. Specify a value that matches
 * the `orderBy*()` type. When used in combination with `orderByKey()`, the
 * value must be a string.
 * @param key - The child key to start after. This argument is only allowed if
 * ordering by child, value, or priority.
 */
export function startAfter(value: number | string | boolean | null, key?: string): QueryConstraint;

/**
 * Creates a new `QueryConstraint` that if limited to the first specific number
 * of children.
 *
 * The `limitToFirst()` method is used to set a maximum number of children to be
 * synced for a given callback. If we set a limit of 100, we will initially only
 * receive up to 100 `child_added` events. If we have fewer than 100 messages
 * stored in our Database, a `child_added` event will fire for each message.
 * However, if we have over 100 messages, we will only receive a `child_added`
 * event for the first 100 ordered messages. As items change, we will receive
 * `child_removed` events for each item that drops out of the active list so
 * that the total number stays at 100.
 *
 * @param limit - The maximum number of nodes to include in this query.
 */
export function limitToFirst(limit: number): QueryConstraint;

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
 * @param limit - The maximum number of nodes to include in this query.
 */
export function limitToLast(limit: number): QueryConstraint;

/**
 * Creates a new `QueryConstraint` that orders by the specified child key.
 *
 * Queries can only order by one key at a time. Calling `orderByChild()`
 * multiple times on the same query is an error.
 *
 * Firebase queries allow you to order your data by any child key on the fly.
 * However, if you know in advance what your indexes will be, you can define
 * them via the .indexOn rule in your Security Rules for better performance.
 *
 * @param path - The path to order by.
 */
export function orderByChild(path: string): QueryConstraint;

/**
 * Creates a new `QueryConstraint` that orders by the key.
 *
 * Sorts the results of a query by their (ascending) key values.
 */
export function orderByKey(): QueryConstraint;

/**
 * Creates a new `QueryConstraint` that orders by priority.
 *
 * Applications need not use priority but can order collections by
 * ordinary properties
 */
export function orderByPriority(): QueryConstraint;

/**
 * Creates a new `QueryConstraint` that orders by value.
 *
 * If the children of a query are all scalar values (string, number, or
 * boolean), you can order the results by their (ascending) values.
 */
export function orderByValue(): QueryConstraint;

/**
 * Creates a new immutable instance of `Query` that is extended to also include
 * additional query constraints.
 *
 * @param query - The Query instance to use as a base for the new constraints.
 * @param queryConstraints - The list of `QueryConstraint`s to apply.
 * @throws if any of the provided query constraints cannot be combined with the
 * existing or new constraints.
 */
export function query(query: Query, ...queryConstraints: QueryConstraint[]): Query;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates.
 *
 * An `onValue` event will trigger once with the initial data stored at this
 * location, and then trigger again each time the data changes. The
 * `DataSnapshot` passed to the callback will be for the location at which
 * `on()` was called. It won't trigger until the entire contents has been
 * synchronized. If the location has no data, it will be triggered with an empty
 * `DataSnapshot` (`val()` will return `null`).
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs. The
 * callback will be passed a DataSnapshot.
 * @param cancelCallback - An optional callback that will be notified if your
 * event subscription is ever canceled because your client does not have
 * permission to read this data (or it had permission but has now lost it).
 * This callback will be passed an `Error` object indicating why the failure
 * occurred.
 * @returns A function that can be invoked to remove the listener.
 */
export function onValue(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates.
 *
 * An `onValue` event will trigger once with the initial data stored at this
 * location, and then trigger again each time the data changes. The
 * `DataSnapshot` passed to the callback will be for the location at which
 * `on()` was called. It won't trigger until the entire contents has been
 * synchronized. If the location has no data, it will be triggered with an empty
 * `DataSnapshot` (`val()` will return `null`).
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs. The
 * callback will be passed a DataSnapshot.
 * @param options - An object that can be used to configure `onlyOnce`, which
 * then removes the listener after its first invocation.
 * @returns A function that can be invoked to remove the listener.
 */
export function onValue(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  options: ListenOptions,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates.
 *
 * An `onValue` event will trigger once with the initial data stored at this
 * location, and then trigger again each time the data changes. The
 * `DataSnapshot` passed to the callback will be for the location at which
 * `on()` was called. It won't trigger until the entire contents has been
 * synchronized. If the location has no data, it will be triggered with an empty
 * `DataSnapshot` (`val()` will return `null`).
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs. The
 * callback will be passed a DataSnapshot.
 * @param cancelCallback - An optional callback that will be notified if your
 * event subscription is ever canceled because your client does not have
 * permission to read this data (or it had permission but has now lost it).
 * This callback will be passed an `Error` object indicating why the failure
 * occurred.
 * @param options - An object that can be used to configure `onlyOnce`, which
 * then removes the listener after its first invocation.
 * @returns A function that can be invoked to remove the listener.
 */
export function onValue(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;

export function onValue(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates.
 *
 * An `onChildAdded` event will be triggered once for each initial child at this
 * location, and it will be triggered again every time a new child is added. The
 * `DataSnapshot` passed into the callback will reflect the data for the
 * relevant child. For ordering purposes, it is passed a second argument which
 * is a string containing the key of the previous sibling child by sort order,
 * or `null` if it is the first child.
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs.
 * The callback will be passed a DataSnapshot and a string containing the key of
 * the previous child, by sort order, or `null` if it is the first child.
 * @param cancelCallback - An optional callback that will be notified if your
 * event subscription is ever canceled because your client does not have
 * permission to read this data (or it had permission but has now lost it).
 * This callback will be passed an `Error` object indicating why the failure
 * occurred.
 * @returns A function that can be invoked to remove the listener.
 */
export function onChildAdded(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates.
 *
 * An `onChildAdded` event will be triggered once for each initial child at this
 * location, and it will be triggered again every time a new child is added. The
 * `DataSnapshot` passed into the callback will reflect the data for the
 * relevant child. For ordering purposes, it is passed a second argument which
 * is a string containing the key of the previous sibling child by sort order,
 * or `null` if it is the first child.
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs.
 * The callback will be passed a DataSnapshot and a string containing the key of
 * the previous child, by sort order, or `null` if it is the first child.
 * @param options - An object that can be used to configure `onlyOnce`, which
 * then removes the listener after its first invocation.
 * @returns A function that can be invoked to remove the listener.
 */
export function onChildAdded(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  options: ListenOptions,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates.
 *
 * An `onChildAdded` event will be triggered once for each initial child at this
 * location, and it will be triggered again every time a new child is added. The
 * `DataSnapshot` passed into the callback will reflect the data for the
 * relevant child. For ordering purposes, it is passed a second argument which
 * is a string containing the key of the previous sibling child by sort order,
 * or `null` if it is the first child.
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs.
 * The callback will be passed a DataSnapshot and a string containing the key of
 * the previous child, by sort order, or `null` if it is the first child.
 * @param cancelCallback - An optional callback that will be notified if your
 * event subscription is ever canceled because your client does not have
 * permission to read this data (or it had permission but has now lost it).
 * This callback will be passed an `Error` object indicating why the failure
 * occurred.
 * @param options - An object that can be used to configure `onlyOnce`, which
 * then removes the listener after its first invocation.
 * @returns A function that can be invoked to remove the listener.
 */
export function onChildAdded(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;

export function onChildAdded(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates.
 *
 * An `onChildChanged` event will be triggered when the data stored in a child
 * (or any of its descendants) changes. Note that a single `child_changed` event
 * may represent multiple changes to the child. The `DataSnapshot` passed to the
 * callback will contain the new child contents. For ordering purposes, the
 * callback is also passed a second argument which is a string containing the
 * key of the previous sibling child by sort order, or `null` if it is the first
 * child.
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs.
 * The callback will be passed a DataSnapshot and a string containing the key of
 * the previous child, by sort order, or `null` if it is the first child.
 * @param cancelCallback - An optional callback that will be notified if your
 * event subscription is ever canceled because your client does not have
 * permission to read this data (or it had permission but has now lost it).
 * This callback will be passed an `Error` object indicating why the failure
 * occurred.
 * @returns A function that can be invoked to remove the listener.
 */
export function onChildChanged(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates.
 *
 * An `onChildChanged` event will be triggered when the data stored in a child
 * (or any of its descendants) changes. Note that a single `child_changed` event
 * may represent multiple changes to the child. The `DataSnapshot` passed to the
 * callback will contain the new child contents. For ordering purposes, the
 * callback is also passed a second argument which is a string containing the
 * key of the previous sibling child by sort order, or `null` if it is the first
 * child.
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs.
 * The callback will be passed a DataSnapshot and a string containing the key of
 * the previous child, by sort order, or `null` if it is the first child.
 * @param options - An object that can be used to configure `onlyOnce`, which
 * then removes the listener after its first invocation.
 * @returns A function that can be invoked to remove the listener.
 */
export function onChildChanged(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  options: ListenOptions,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates.
 *
 * An `onChildChanged` event will be triggered when the data stored in a child
 * (or any of its descendants) changes. Note that a single `child_changed` event
 * may represent multiple changes to the child. The `DataSnapshot` passed to the
 * callback will contain the new child contents. For ordering purposes, the
 * callback is also passed a second argument which is a string containing the
 * key of the previous sibling child by sort order, or `null` if it is the first
 * child.
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs.
 * The callback will be passed a DataSnapshot and a string containing the key of
 * the previous child, by sort order, or `null` if it is the first child.
 * @param cancelCallback - An optional callback that will be notified if your
 * event subscription is ever canceled because your client does not have
 * permission to read this data (or it had permission but has now lost it).
 * This callback will be passed an `Error` object indicating why the failure
 * occurred.
 * @param options - An object that can be used to configure `onlyOnce`, which
 * then removes the listener after its first invocation.
 * @returns A function that can be invoked to remove the listener.
 */
export function onChildChanged(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;

export function onChildChanged(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates.
 *
 * An `onChildMoved` event will be triggered when a child's sort order changes
 * such that its position relative to its siblings changes. The `DataSnapshot`
 * passed to the callback will be for the data of the child that has moved. It
 * is also passed a second argument which is a string containing the key of the
 * previous sibling child by sort order, or `null` if it is the first child.
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs.
 * The callback will be passed a DataSnapshot and a string containing the key of
 * the previous child, by sort order, or `null` if it is the first child.
 * @param cancelCallback - An optional callback that will be notified if your
 * event subscription is ever canceled because your client does not have
 * permission to read this data (or it had permission but has now lost it).
 * This callback will be passed an `Error` object indicating why the failure
 * occurred.
 * @returns A function that can be invoked to remove the listener.
 */
export function onChildMoved(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates.
 *
 * An `onChildMoved` event will be triggered when a child's sort order changes
 * such that its position relative to its siblings changes. The `DataSnapshot`
 * passed to the callback will be for the data of the child that has moved. It
 * is also passed a second argument which is a string containing the key of the
 * previous sibling child by sort order, or `null` if it is the first child.
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs.
 * The callback will be passed a DataSnapshot and a string containing the key of
 * the previous child, by sort order, or `null` if it is the first child.
 * @param options - An object that can be used to configure `onlyOnce`, which
 * then removes the listener after its first invocation.
 * @returns A function that can be invoked to remove the listener.
 */
export function onChildMoved(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  options: ListenOptions,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates.
 *
 * An `onChildMoved` event will be triggered when a child's sort order changes
 * such that its position relative to its siblings changes. The `DataSnapshot`
 * passed to the callback will be for the data of the child that has moved. It
 * is also passed a second argument which is a string containing the key of the
 * previous sibling child by sort order, or `null` if it is the first child.
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs.
 * The callback will be passed a DataSnapshot and a string containing the key of
 * the previous child, by sort order, or `null` if it is the first child.
 * @param cancelCallback - An optional callback that will be notified if your
 * event subscription is ever canceled because your client does not have
 * permission to read this data (or it had permission but has now lost it).
 * This callback will be passed an `Error` object indicating why the failure
 * occurred.
 * @param options - An object that can be used to configure `onlyOnce`, which
 * then removes the listener after its first invocation.
 * @returns A function that can be invoked to remove the listener.
 */
export function onChildMoved(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;

export function onChildMoved(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates. See
 * {@link https://firebase.google.com/docs/database/web/retrieve-data | Retrieve Data on the Web}
 * for more details.
 *
 * An `onChildRemoved` event will be triggered once every time a child is
 * removed. The `DataSnapshot` passed into the callback will be the old data for
 * the child that was removed. A child will get removed when either:
 *
 * - a client explicitly calls `remove()` on that child or one of its ancestors
 * - a client calls `set(null)` on that child or one of its ancestors
 * - that child has all of its children removed
 * - there is a query in effect which now filters out the child (because it's
 *   sort order changed or the max limit was hit)
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs.
 * The callback will be passed a DataSnapshot and a string containing the key of
 * the previous child, by sort order, or `null` if it is the first child.
 * @param cancelCallback - An optional callback that will be notified if your
 * event subscription is ever canceled because your client does not have
 * permission to read this data (or it had permission but has now lost it).
 * This callback will be passed an `Error` object indicating why the failure
 * occurred.
 * @returns A function that can be invoked to remove the listener.
 */
export function onChildRemoved(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates. See
 * {@link https://firebase.google.com/docs/database/web/retrieve-data | Retrieve Data on the Web}
 * for more details.
 *
 * An `onChildRemoved` event will be triggered once every time a child is
 * removed. The `DataSnapshot` passed into the callback will be the old data for
 * the child that was removed. A child will get removed when either:
 *
 * - a client explicitly calls `remove()` on that child or one of its ancestors
 * - a client calls `set(null)` on that child or one of its ancestors
 * - that child has all of its children removed
 * - there is a query in effect which now filters out the child (because it's
 *   sort order changed or the max limit was hit)
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs.
 * The callback will be passed a DataSnapshot and a string containing the key of
 * the previous child, by sort order, or `null` if it is the first child.
 * @param options - An object that can be used to configure `onlyOnce`, which
 * then removes the listener after its first invocation.
 * @returns A function that can be invoked to remove the listener.
 */
export function onChildRemoved(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  options: ListenOptions,
): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 *
 * This is the primary way to read data from a Database. Your callback
 * will be triggered for the initial data and again whenever the data changes.
 * Invoke the returned unsubscribe callback to stop receiving updates. See
 * {@link https://firebase.google.com/docs/database/web/retrieve-data | Retrieve Data on the Web}
 * for more details.
 *
 * An `onChildRemoved` event will be triggered once every time a child is
 * removed. The `DataSnapshot` passed into the callback will be the old data for
 * the child that was removed. A child will get removed when either:
 *
 * - a client explicitly calls `remove()` on that child or one of its ancestors
 * - a client calls `set(null)` on that child or one of its ancestors
 * - that child has all of its children removed
 * - there is a query in effect which now filters out the child (because it's
 *   sort order changed or the max limit was hit)
 *
 * @param query - The query to run.
 * @param callback - A callback that fires when the specified event occurs.
 * The callback will be passed a DataSnapshot and a string containing the key of
 * the previous child, by sort order, or `null` if it is the first child.
 * @param cancelCallback - An optional callback that will be notified if your
 * event subscription is ever canceled because your client does not have
 * permission to read this data (or it had permission but has now lost it).
 * This callback will be passed an `Error` object indicating why the failure
 * occurred.
 * @param options - An object that can be used to configure `onlyOnce`, which
 * then removes the listener after its first invocation.
 * @returns A function that can be invoked to remove the listener.
 */
export function onChildRemoved(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;

export function onChildRemoved(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe;

/**
 * Writes data to this Database location.
 *
 * This will overwrite any data at this location and all child locations.
 *
 * The effect of the write will be visible immediately, and the corresponding
 * events ("value", "child_added", etc.) will be triggered. Synchronization of
 * the data to the Firebase servers will also be started, and the returned
 * Promise will resolve when complete. If provided, the `onComplete` callback
 * will be called asynchronously after synchronization has finished.
 *
 * Passing `null` for the new value is equivalent to calling `remove()`; namely,
 * all data at this location and all child locations will be deleted.
 *
 * `set()` will remove any priority stored at this location, so if priority is
 * meant to be preserved, you need to use `setWithPriority()` instead.
 *
 * Note that modifying data with `set()` will cancel any pending transactions
 * at that location, so extreme care should be taken if mixing `set()` and
 * `transaction()` to modify the same data.
 *
 * A single `set()` will generate a single "value" event at the location where
 * the `set()` was performed.
 *
 * @param ref - The location to write to.
 * @param value - The value to be written (string, number, boolean, object,
 *   array, or null).
 * @returns Resolves when write to server is complete.
 */
export function set(ref: DatabaseReference, value: unknown): Promise<void>;

/**
 * Sets a priority for the data at this Database location.
 *
 * Applications need not use priority but can order collections by
 * ordinary properties
 *
 * @param ref - The location to write to.
 * @param priority - The priority to be written (string, number, or null).
 * @returns Resolves when write to server is complete.
 */
export function setPriority(
  ref: DatabaseReference,
  priority: string | number | null,
): Promise<void>;

/**
 * Writes data the Database location. Like `set()` but also specifies the
 * priority for that data.
 *
 * Applications need not use priority but can order collections by
 * ordinary properties
 *
 * @param ref - The location to write to.
 * @param value - The value to be written (string, number, boolean, object,
 *   array, or null).
 * @param priority - The priority to be written (string, number, or null).
 * @returns Resolves when write to server is complete.
 */
export function setWithPriority(
  ref: DatabaseReference,
  value: unknown,
  priority: string | number | null,
): Promise<void>;

/**
 * Gets the most up-to-date result for this query.
 *
 * @param query - The query to run.
 * @returns A `Promise` which resolves to the resulting DataSnapshot if a value is
 * available, or rejects if the client is unable to return a value (e.g., if the
 * server is unreachable and there is nothing cached).
 */
export function get(query: Query): Promise<DataSnapshot>;

/**
 * Gets a `Reference` for the location at the specified relative path.
 *
 * The relative path can either be a simple child name (for example, "ada") or
 * a deeper slash-separated path (for example, "ada/name/first").
 *
 * @param parent - The parent location.
 * @param path - A relative path from this location to the desired child
 *   location.
 * @returns The specified child location.
 */
export function child(parent: DatabaseReference, path: string): DatabaseReference;

/**
 * Returns an `OnDisconnect` object - see
 * {@link https://firebase.google.com/docs/database/web/offline-capabilities | Enabling Offline Capabilities in JavaScript}
 * for more information on how to use it.
 *
 * @param ref - The reference to add OnDisconnect triggers for.
 */
export function onDisconnect(ref: DatabaseReference): OnDisconnect;

/**
 * By calling `keepSynced(true)` on a location, the data for that location will automatically
 * be downloaded and kept in sync, even when no listeners are attached for that location.
 *
 * #### Example
 *
 * ```js
 * const dbRef = ref(getDatabase(), 'users');
 * await keepSynced(dbRef, true);
 * ```
 *
 * @param ref A location to keep synchronized.
 * @param bool  Pass `true` to keep this location synchronized, pass `false` to stop synchronization.
 */
export function keepSynced(ref: DatabaseReference, bool: boolean): Promise<void>;

/**
 * Generates a new child location using a unique key and returns its
 * `Reference`.
 *
 * This is the most common pattern for adding data to a collection of items.
 *
 * If you provide a value to `push()`, the value is written to the
 * generated location. If you don't pass a value, nothing is written to the
 * database and the child remains empty (but you can use the `Reference`
 * elsewhere).
 *
 * The unique keys generated by `push()` are ordered by the current time, so the
 * resulting list of items is chronologically sorted. The keys are also
 * designed to be unguessable (they contain 72 random bits of entropy).
 *
 * See {@link https://firebase.google.com/docs/database/web/lists-of-data#append_to_a_list_of_data | Append to a list of data}.
 * See {@link https://firebase.googleblog.com/2015/02/the-2120-ways-to-ensure-unique_68.html | The 2^120 Ways to Ensure Unique Identifiers}.
 *
 * @param parent - The parent location.
 * @param value - Optional value to be written at the generated location.
 * @returns Combined `Promise` and `Reference`; resolves when write is complete,
 * but can be used immediately as the `Reference` to the child location.
 */
export function push(parent: DatabaseReference, value?: unknown): ThenableReference;

/**
 * Removes the data at this Database location.
 *
 * Any data at child locations will also be deleted.
 *
 * The effect of the remove will be visible immediately and the corresponding
 * event 'value' will be triggered. Synchronization of the remove to the
 * Firebase servers will also be started, and the returned Promise will resolve
 * when complete. If provided, the onComplete callback will be called
 * asynchronously after synchronization has finished.
 *
 * @param ref - The location to remove.
 * @returns Resolves when remove on server is complete.
 */
export function remove(ref: DatabaseReference): Promise<void>;

/**
 * Writes multiple values to the Database at once.
 *
 * The `values` argument contains multiple property-value pairs that will be
 * written to the Database together. Each child property can either be a simple
 * property (for example, "name") or a relative path (for example,
 * "name/first") from the current location to the data to update.
 *
 * As opposed to the `set()` method, `update()` can be use to selectively update
 * only the referenced properties at the current location (instead of replacing
 * all the child properties at the current location).
 *
 * The effect of the write will be visible immediately, and the corresponding
 * events ('value', 'child_added', etc.) will be triggered. Synchronization of
 * the data to the Firebase servers will also be started, and the returned
 * Promise will resolve when complete. If provided, the `onComplete` callback
 * will be called asynchronously after synchronization has finished.
 *
 * A single `update()` will generate a single "value" event at the location
 * where the `update()` was performed, regardless of how many children were
 * modified.
 *
 * Note that modifying data with `update()` will cancel any pending
 * transactions at that location, so extreme care should be taken if mixing
 * `update()` and `transaction()` to modify the same data.
 *
 * Passing `null` to `update()` will remove the data at this location.
 *
 * See
 * {@link https://firebase.googleblog.com/2015/09/introducing-multi-location-updates-and_86.html | Introducing multi-location updates and more}.
 *
 * @param ref - The location to write to.
 * @param values - Object containing multiple values.
 * @returns Resolves when update on server is complete.
 */
export function update(ref: DatabaseReference, values: object): Promise<void>;
