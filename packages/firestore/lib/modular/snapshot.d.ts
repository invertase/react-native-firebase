import { DocumentReference, Query, DocumentData, SnapshotListenOptions } from './index';

export type Unsubscribe = () => void;
export type FirestoreError = Error;

/**
 * A DocumentSnapshot contains data read from a document in your Firestore database. The data can be extracted with
 * .`data()` or `.get(:field)` to get a specific field.
 *
 * For a DocumentSnapshot that points to a non-existing document, any data access will return 'undefined'.
 * You can use the `exists()` method to explicitly verify a document's existence.
 */
export interface DocumentSnapshot<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  /**
   * Method of the `DocumentSnapshot` that signals whether or not the data exists. True if the document exists.
   */
  exists(): this is QueryDocumentSnapshot<AppModelType, DbModelType>;

  /**
   * Property of the `DocumentSnapshot` that provides the document's ID.
   */
  id: string;

  /**
   * Metadata about the `DocumentSnapshot`, including information about its source and local modifications.
   */
  metadata: SnapshotMetadata;

  /**
   * The `DocumentReference` for the document included in the `DocumentSnapshot`.
   */
  ref: DocumentReference<AppModelType, DbModelType>;

  /**
   * Retrieves all fields in the document as an Object. Returns 'undefined' if the document doesn't exist.
   *
   * #### Example
   *
   * ```js
   * const user = await firebase.firestore().doc('users/alovelace').get();
   *
   * console.log('User', user.data());
   * ```
   */
  data(): AppModelType | undefined;

  /**
   * Retrieves the field specified by fieldPath. Returns undefined if the document or field doesn't exist.
   *
   * #### Example
   *
   * ```js
   * const user = await firebase.firestore().doc('users/alovelace').get();
   *
   * console.log('Address ZIP Code', user.get('address.zip'));
   * ```
   *
   * @param fieldPath The path (e.g. 'foo' or 'foo.bar') to a specific field.
   */
  get<fieldType extends DbModelType[keyof DbModelType]>(
    fieldPath: keyof DbModelType | string | FieldPath,
  ): fieldType;

  /**
   * Returns true if this `DocumentSnapshot` is equal to the provided one.
   *
   * #### Example
   *
   * ```js
   * const user1 = await firebase.firestore().doc('users/alovelace').get();
   * const user2 = await firebase.firestore().doc('users/dsmith').get();
   *
   * // false
   * user1.isEqual(user2);
   * ```
   *
   * @param other The `DocumentSnapshot` to compare against.
   */
  isEqual(other: DocumentSnapshot): boolean;
}

/**
 * A QueryDocumentSnapshot contains data read from a document in your Firestore database as part of a query.
 * The document is guaranteed to exist and its data can be extracted with .data() or .get(:field) to get a specific field.
 *
 * A QueryDocumentSnapshot offers the same API surface as a DocumentSnapshot.
 * Since query results contain only existing documents, the exists() method will always be true and data() will never return 'undefined'.
 */
export class QueryDocumentSnapshot<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends DocumentSnapshot<AppModelType, DbModelType> {
  /**
   * A QueryDocumentSnapshot is always guaranteed to exist.
   */
  exists(): true;

  /**
   * Retrieves all fields in the document as an Object.
   *
   * #### Example
   *
   * ```js
   * const users = await firebase.firestore().collection('users').get();
   *
   * for (const user of users.docs) {
   *   console.log('User', user.data());
   * }
   * ```
   */
  data(): AppModelType;
}

/**
 * A `QuerySnapshot` contains zero or more `QueryDocumentSnapshot` objects representing the results of a query. The documents
 * can be accessed as an array via the `docs` property or enumerated using the `forEach` method. The number of documents
 * can be determined via the `empty` and `size` properties.
 */
export interface QuerySnapshot<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  /**
   * An array of all the documents in the `QuerySnapshot`.
   */
  docs: QueryDocumentSnapshot<AppModelType, DbModelType>[];

  /**
   * True if there are no documents in the `QuerySnapshot`.
   */
  empty: boolean;

  /**
   * Metadata about this snapshot, concerning its source and if it has local modifications.
   */
  metadata: SnapshotMetadata;

  /**
   * The query on which you called get or `onSnapshot` in order to `get` this `QuerySnapshot`.
   */
  query: Query<AppModelType, DbModelType>;

  /**
   * The number of documents in the `QuerySnapshot`.
   */
  size: number;

  /**
   * Enumerates all of the documents in the `QuerySnapshot`.
   *
   * #### Example
   *
   * ```js
   * const querySnapshot = await firebase.firestore().collection('users').get();
   *
   * querySnapshot.forEach((queryDocumentSnapshot) => {
   *   console.log('User', queryDocumentSnapshot.data());
   * })
   * ```
   *
   * @param callback A callback to be called with a `QueryDocumentSnapshot` for each document in the snapshot.
   * @param thisArg The `this` binding for the callback.
   */

  forEach(
    callback: (result: QueryDocumentSnapshot<AppModelType, DbModelType>, index: number) => void,
    thisArg?: any,
  ): void;

  /**
   * Returns true if this `QuerySnapshot` is equal to the provided one.
   *
   * #### Example
   *
   * ```js
   * const querySnapshot1 = await firebase.firestore().collection('users').limit(5).get();
   * const querySnapshot2 = await firebase.firestore().collection('users').limit(10).get();
   *
   * // false
   * querySnapshot1.isEqual(querySnapshot2);
   * ```
   *
   * > This operation can be resource intensive when dealing with large datasets.
   *
   * @param other The `QuerySnapshot` to compare against.
   */
  isEqual(other: QuerySnapshot): boolean;
}

/**
 * Attaches a listener for `DocumentSnapshot` events. You may either pass
 * individual `onNext` and `onError` callbacks or pass a single observer
 * object with `next` and `error` callbacks.
 *
 * NOTE: Although an `onCompletion` callback can be provided, it will
 * never be called because the snapshot stream is never-ending.
 *
 * @param reference - A reference to the document to listen to.
 * @param observer - A single object containing `next` and `error` callbacks.
 * @returns An unsubscribe function that can be called to cancel
 * the snapshot listener.
 */
export function onSnapshot<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  observer: {
    next?: (snapshot: DocumentSnapshot<AppModelType, DbModelType>) => void;
    error?: (error: FirestoreError) => void;
    complete?: () => void;
  },
): Unsubscribe;
/**
 * Attaches a listener for `DocumentSnapshot` events. You may either pass
 * individual `onNext` and `onError` callbacks or pass a single observer
 * object with `next` and `error` callbacks.
 *
 * NOTE: Although an `onCompletion` callback can be provided, it will
 * never be called because the snapshot stream is never-ending.
 *
 * @param reference - A reference to the document to listen to.
 * @param options - Options controlling the listen behavior.
 * @param observer - A single object containing `next` and `error` callbacks.
 * @returns An unsubscribe function that can be called to cancel
 * the snapshot listener.
 */
export function onSnapshot<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  options: SnapshotListenOptions,
  observer: {
    next?: (snapshot: DocumentSnapshot<AppModelType, DbModelType>) => void;
    error?: (error: FirestoreError) => void;
    complete?: () => void;
  },
): Unsubscribe;
/**
 * Attaches a listener for `DocumentSnapshot` events. You may either pass
 * individual `onNext` and `onError` callbacks or pass a single observer
 * object with `next` and `error` callbacks.
 *
 * NOTE: Although an `onCompletion` callback can be provided, it will
 * never be called because the snapshot stream is never-ending.
 *
 * @param reference - A reference to the document to listen to.
 * @param onNext - A callback to be called every time a new `DocumentSnapshot`
 * is available.
 * @param onError - A callback to be called if the listen fails or is
 * cancelled. No further callbacks will occur.
 * @param onCompletion - Can be provided, but will not be called since streams are
 * never ending.
 * @returns An unsubscribe function that can be called to cancel
 * the snapshot listener.
 */
export function onSnapshot<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  onNext: (snapshot: DocumentSnapshot<AppModelType, DbModelType>) => void,
  onError?: (error: FirestoreError) => void,
  onCompletion?: () => void,
): Unsubscribe;
/**
 * Attaches a listener for `DocumentSnapshot` events. You may either pass
 * individual `onNext` and `onError` callbacks or pass a single observer
 * object with `next` and `error` callbacks.
 *
 * NOTE: Although an `onCompletion` callback can be provided, it will
 * never be called because the snapshot stream is never-ending.
 *
 * @param reference - A reference to the document to listen to.
 * @param options - Options controlling the listen behavior.
 * @param onNext - A callback to be called every time a new `DocumentSnapshot`
 * is available.
 * @param onError - A callback to be called if the listen fails or is
 * cancelled. No further callbacks will occur.
 * @param onCompletion - Can be provided, but will not be called since streams are
 * never ending.
 * @returns An unsubscribe function that can be called to cancel
 * the snapshot listener.
 */
export function onSnapshot<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  options: SnapshotListenOptions,
  onNext: (snapshot: DocumentSnapshot<AppModelType, DbModelType>) => void,
  onError?: (error: FirestoreError) => void,
  onCompletion?: () => void,
): Unsubscribe;
/**
 * Attaches a listener for `QuerySnapshot` events. You may either pass
 * individual `onNext` and `onError` callbacks or pass a single observer
 * object with `next` and `error` callbacks. The listener can be cancelled by
 * calling the function that is returned when `onSnapshot` is called.
 *
 * NOTE: Although an `onCompletion` callback can be provided, it will
 * never be called because the snapshot stream is never-ending.
 *
 * @param query - The query to listen to.
 * @param observer - A single object containing `next` and `error` callbacks.
 * @returns An unsubscribe function that can be called to cancel
 * the snapshot listener.
 */
export declare function onSnapshot<AppModelType, DbModelType extends DocumentData>(
  query: Query<AppModelType, DbModelType>,
  observer: {
    next?: (snapshot: QuerySnapshot<AppModelType, DbModelType>) => void;
    error?: (error: FirestoreError) => void;
    complete?: () => void;
  },
): Unsubscribe;
/**
 * Attaches a listener for `QuerySnapshot` events. You may either pass
 * individual `onNext` and `onError` callbacks or pass a single observer
 * object with `next` and `error` callbacks. The listener can be cancelled by
 * calling the function that is returned when `onSnapshot` is called.
 *
 * NOTE: Although an `onCompletion` callback can be provided, it will
 * never be called because the snapshot stream is never-ending.
 *
 * @param query - The query to listen to.
 * @param options - Options controlling the listen behavior.
 * @param observer - A single object containing `next` and `error` callbacks.
 * @returns An unsubscribe function that can be called to cancel
 * the snapshot listener.
 */
export declare function onSnapshot<AppModelType, DbModelType extends DocumentData>(
  query: Query<AppModelType, DbModelType>,
  options: SnapshotListenOptions,
  observer: {
    next?: (snapshot: QuerySnapshot<AppModelType, DbModelType>) => void;
    error?: (error: FirestoreError) => void;
    complete?: () => void;
  },
): Unsubscribe;
/**
 * Attaches a listener for `QuerySnapshot` events. You may either pass
 * individual `onNext` and `onError` callbacks or pass a single observer
 * object with `next` and `error` callbacks. The listener can be cancelled by
 * calling the function that is returned when `onSnapshot` is called.
 *
 * NOTE: Although an `onCompletion` callback can be provided, it will
 * never be called because the snapshot stream is never-ending.
 *
 * @param query - The query to listen to.
 * @param onNext - A callback to be called every time a new `QuerySnapshot`
 * is available.
 * @param onCompletion - Can be provided, but will not be called since streams are
 * never ending.
 * @param onError - A callback to be called if the listen fails or is
 * cancelled. No further callbacks will occur.
 * @returns An unsubscribe function that can be called to cancel
 * the snapshot listener.
 */
export declare function onSnapshot<AppModelType, DbModelType extends DocumentData>(
  query: Query<AppModelType, DbModelType>,
  onNext: (snapshot: QuerySnapshot<AppModelType, DbModelType>) => void,
  onError?: (error: FirestoreError) => void,
  onCompletion?: () => void,
): Unsubscribe;
/**
 * Attaches a listener for `QuerySnapshot` events. You may either pass
 * individual `onNext` and `onError` callbacks or pass a single observer
 * object with `next` and `error` callbacks. The listener can be cancelled by
 * calling the function that is returned when `onSnapshot` is called.
 *
 * NOTE: Although an `onCompletion` callback can be provided, it will
 * never be called because the snapshot stream is never-ending.
 *
 * @param query - The query to listen to.
 * @param options - Options controlling the listen behavior.
 * @param onNext - A callback to be called every time a new `QuerySnapshot`
 * is available.
 * @param onCompletion - Can be provided, but will not be called since streams are
 * never ending.
 * @param onError - A callback to be called if the listen fails or is
 * cancelled. No further callbacks will occur.
 * @returns An unsubscribe function that can be called to cancel
 * the snapshot listener.
 */
export declare function onSnapshot<AppModelType, DbModelType extends DocumentData>(
  query: Query<AppModelType, DbModelType>,
  options: SnapshotListenOptions,
  onNext: (snapshot: QuerySnapshot<AppModelType, DbModelType>) => void,
  onError?: (error: FirestoreError) => void,
  onCompletion?: () => void,
): Unsubscribe;

/**
 * Returns true if the provided snapshots are equal.
 *
 * @param left	DocumentSnapshot<AppModelType, DbModelType> | QuerySnapshot<AppModelType, DbModelType>	A snapshot to compare.
 * @param right	DocumentSnapshot<AppModelType, DbModelType> | QuerySnapshot<AppModelType, DbModelType>	A snapshot to compare.
 *
 * @returns boolean true if the snapshots are equal.
 */
export function snapshotEqual<AppModelType, DbModelType extends DocumentData>(
  left: DocumentSnapshot<AppModelType, DbModelType> | QuerySnapshot<AppModelType, DbModelType>,
  right: DocumentSnapshot<AppModelType, DbModelType> | QuerySnapshot<AppModelType, DbModelType>,
): boolean;

/**
 * Returns true if the provided queries point to the same collection and apply the same constraints.
 *
 * @param left	Query<AppModelType, DbModelType> A Query to compare.
 * @param right	Query<AppModelType, DbModelType> A Query to compare.
 *
 * @return boolean true if the references point to the same location in the same Firestore database.
 */
export declare function queryEqual<AppModelType, DbModelType extends DocumentData>(
  left: Query<AppModelType, DbModelType>,
  right: Query<AppModelType, DbModelType>,
): boolean;

/**
 * Attaches a listener for a snapshots-in-sync event.
 * The snapshots-in-sync event indicates that all listeners affected by a given change have fired, even if
 * a single server-generated change affects multiple listeners.
 *
 * @param firestore
 * @param observer
 */
export declare function onSnapshotsInSync(
  firestore: Firestore,
  observer: {
    next?: (value: void) => void;
    error?: (error: FirestoreError) => void;
    complete?: () => void;
  },
): Unsubscribe;

/**
 * Attaches a listener for a snapshots-in-sync event.
 * The snapshots-in-sync event indicates that all listeners affected by a given change have fired, even if
 * a single server-generated change affects multiple listeners.
 *
 * @param firestore
 * @param onSync
 */
export declare function onSnapshotsInSync(firestore: Firestore, onSync: () => void): Unsubscribe;
