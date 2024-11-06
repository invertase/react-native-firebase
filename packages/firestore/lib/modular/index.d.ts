import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseFirestoreTypes } from '../index';

import FirebaseApp = ReactNativeFirebase.FirebaseApp;
import Firestore = FirebaseFirestoreTypes.Module;
import CollectionReference = FirebaseFirestoreTypes.CollectionReference;
import DocumentReference = FirebaseFirestoreTypes.DocumentReference;
import DocumentData = FirebaseFirestoreTypes.DocumentData;
import Query = FirebaseFirestoreTypes.Query;
import FieldValue = FirebaseFirestoreTypes.FieldValue;
import FieldPath = FirebaseFirestoreTypes.FieldPath;
import PersistentCacheIndexManager = FirebaseFirestoreTypes.PersistentCacheIndexManager;
import AggregateQuerySnapshot = FirebaseFirestoreTypes.AggregateQuerySnapshot;

/** Primitive types. */
export type Primitive = string | number | boolean | undefined | null;

/**
 * Similar to Typescript's `Partial<T>`, but allows nested fields to be
 * omitted and FieldValues to be passed in as property values.
 */
export type PartialWithFieldValue<T> =
  | Partial<T>
  | (T extends Primitive
      ? T
      : T extends object
        ? { [K in keyof T]?: PartialWithFieldValue<T[K]> | FieldValue }
        : never);

/**
 * Given a union type `U = T1 | T2 | ...`, returns an intersected type (`T1 & T2 & ...`).
 *
 * Uses distributive conditional types and inference from conditional types.
 * This works because multiple candidates for the same type variable in contra-variant positions
 * causes an intersection type to be inferred.
 * https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-inference-in-conditional-types
 * https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
 */
export declare type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

/**
 * Returns a new map where every key is prefixed with the outer key appended to a dot.
 */
export declare type AddPrefixToKeys<Prefix extends string, T extends Record<string, unknown>> = {
  [K in keyof T & string as `${Prefix}.${K}`]+?: T[K];
};

/**
 * Helper for calculating the nested fields for a given type `T1`. This is needed to distribute
 * union types such as `undefined | {...}` (happens for optional props) or `{a: A} | {b: B}`.
 *
 * In this use case, `V` is used to distribute the union types of `T[K]` on Record, since `T[K]`
 * is evaluated as an expression and not distributed.
 *
 * See https://www.typescriptlang.org/docs/handbook/advanced-types.html#distributive-conditional-types
 */
export declare type ChildUpdateFields<K extends string, V> =
  V extends Record<string, unknown> ? AddPrefixToKeys<K, UpdateData<V>> : never;

/**
 * For each field (e.g. 'bar'), find all nested keys (e.g. {'bar.baz': T1, 'bar.qux': T2}).
 * Intersect them together to make a single map containing all possible keys that are all marked as optional
 */
export declare type NestedUpdateFields<T extends Record<string, unknown>> = UnionToIntersection<
  {
    [K in keyof T & string]: ChildUpdateFields<K, T[K]>;
  }[keyof T & string]
>;

/**
 * Update data (for use with {@link updateDoc}) that consists of field paths (e.g. 'foo' or 'foo.baz')
 * mapped to values. Fields that contain dots reference nested fields within the document.
 * FieldValues can be passed in as property values.
 */
export declare type UpdateData<T> = T extends Primitive
  ? T
  : T extends object
    ? {
        [K in keyof T]?: UpdateData<T[K]> | FieldValue;
      } & NestedUpdateFields<T>
    : Partial<T>;

/**
 * Allows FieldValues to be passed in as a property value while maintaining
 * type safety.
 */
export type WithFieldValue<T> =
  | T
  | (T extends Primitive
      ? T
      : T extends object
        ? { [K in keyof T]: WithFieldValue<T[K]> | FieldValue }
        : never);

/**
 * Returns the existing default {@link Firestore} instance that is associated with the
 * default {@link @firebase/app#FirebaseApp}. If no instance exists, initializes a new
 * instance with default settings.
 *
 * @returns The {@link Firestore} instance of the provided app.
 */
export declare function getFirestore(): Firestore;

/**
 * Returns the existing default {@link Firestore} instance that is associated with the
 * provided {@link @firebase/app#FirebaseApp}. If no instance exists, initializes a new
 * instance with default settings.
 *
 * @param app - The {@link @firebase/app#FirebaseApp} instance that the returned {@link Firestore}
 * instance is associated with.
 * @returns The {@link Firestore} instance of the provided app.
 * @internal
 */
export declare function getFirestore(app: FirebaseApp): Firestore;

export function getFirestore(app?: FirebaseApp): Firestore;

/**
 * Returns the existing default {@link Firestore} instance that is associated with the
 * provided {@link @firebase/app#FirebaseApp} and database ID. If no instance exists, initializes a new
 * instance with default settings.
 *
 * @param app - The {@link @firebase/app#FirebaseApp} instance that the returned {@link Firestore}
 * instance is associated with.
 * @param databaseId - The ID of the Firestore database to use. If not provided, the default database is used.
 * @returns The {@link Firestore}
 */
export declare function getFirestore(app?: FirebaseApp, databaseId?: string): Firestore;

/**
 * Gets a `DocumentReference` instance that refers to the document at the
 * specified absolute path.
 *
 * @param firestore - A reference to the root `Firestore` instance.
 * @param path - A slash-separated path to a document.
 * @param pathSegments - Additional path segments that will be applied relative
 * to the first argument.
 * @throws If the final path has an odd number of segments and does not point to
 * a document.
 * @returns The `DocumentReference` instance.
 */
export function doc(
  firestore: Firestore,
  path: string,
  ...pathSegments: string[]
): DocumentReference<DocumentData>;

/**
 * Gets a `DocumentReference` instance that refers to a document within
 * `reference` at the specified relative path. If no path is specified, an
 * automatically-generated unique ID will be used for the returned
 * `DocumentReference`.
 *
 * @param reference - A reference to a collection.
 * @param path - A slash-separated path to a document. Has to be omitted to use
 * auto-generated IDs.
 * @param pathSegments - Additional path segments that will be applied relative
 * to the first argument.
 * @throws If the final path has an odd number of segments and does not point to
 * a document.
 * @returns The `DocumentReference` instance.
 */
export function doc<T>(
  reference: CollectionReference<T>,
  path?: string,
  ...pathSegments: string[]
): DocumentReference<T>;

/**
 * Gets a `DocumentReference` instance that refers to a document within
 * `reference` at the specified relative path.
 *
 * @param reference - A reference to a Firestore document.
 * @param path - A slash-separated path to a document.
 * @param pathSegments - Additional path segments that will be applied relative
 * to the first argument.
 * @throws If the final path has an odd number of segments and does not point to
 * a document.
 * @returns The `DocumentReference` instance.
 */
export function doc(
  reference: DocumentReference<unknown>,
  path: string,
  ...pathSegments: string[]
): DocumentReference<DocumentData>;

export function doc<T>(
  parent: Firestore | CollectionReference<T> | DocumentReference<unknown>,
  path?: string,
  ...pathSegments: string[]
): DocumentReference;

/**
 * Gets a `CollectionReference` instance that refers to the collection at
 * the specified absolute path.
 *
 * @param firestore - A reference to the root `Firestore` instance.
 * @param path - A slash-separated path to a collection.
 * @param pathSegments - Additional path segments to apply relative to the first
 * argument.
 * @throws If the final path has an even number of segments and does not point
 * to a collection.
 * @returns The `CollectionReference` instance.
 */
export function collection(
  firestore: Firestore,
  path: string,
  ...pathSegments: string[]
): CollectionReference<DocumentData>;

/**
 * Gets a `CollectionReference` instance that refers to a subcollection of
 * `reference` at the specified relative path.
 *
 * @param reference - A reference to a collection.
 * @param path - A slash-separated path to a collection.
 * @param pathSegments - Additional path segments to apply relative to the first
 * argument.
 * @throws If the final path has an even number of segments and does not point
 * to a collection.
 * @returns The `CollectionReference` instance.
 */
export function collection(
  reference: CollectionReference<unknown>,
  path: string,
  ...pathSegments: string[]
): CollectionReference<DocumentData>;

/**
 * Gets a `CollectionReference` instance that refers to a subcollection of
 * `reference` at the specified relative path.
 *
 * @param reference - A reference to a Firestore document.
 * @param path - A slash-separated path to a collection.
 * @param pathSegments - Additional path segments that will be applied relative
 * to the first argument.
 * @throws If the final path has an even number of segments and does not point
 * to a collection.
 * @returns The `CollectionReference` instance.
 */
export function collection(
  reference: DocumentReference,
  path: string,
  ...pathSegments: string[]
): CollectionReference<DocumentData>;

export function collection(
  parent: Firestore | DocumentReference<unknown> | CollectionReference<unknown>,
  path: string,
  ...pathSegments: string[]
): CollectionReference<DocumentData>;

/**
 * Creates and returns a new `Query` instance that includes all documents in the
 * database that are contained in a collection or subcollection with the
 * given `collectionId`.
 *
 * @param firestore - A reference to the root `Firestore` instance.
 * @param collectionId - Identifies the collections to query over. Every
 * collection or subcollection with this ID as the last segment of its path
 * will be included. Cannot contain a slash.
 * @returns The created `Query`.
 */
export function collectionGroup(firestore: Firestore, collectionId: string): Query<DocumentData>;

/**
 * Writes to the document referred to by this `DocumentReference`. If the
 * document does not yet exist, it will be created.
 *
 * @param reference - A reference to the document to write.
 * @param data - A map of the fields and values for the document.
 * @returns A `Promise` resolved once the data has been successfully written
 * to the backend (note that it won't resolve while you're offline).
 */
export function setDoc<T>(reference: DocumentReference<T>, data: WithFieldValue<T>): Promise<void>;

/**
 * Writes to the document referred to by the specified `DocumentReference`. If
 * the document does not yet exist, it will be created. If you provide `merge`
 * or `mergeFields`, the provided data can be merged into an existing document.
 *
 * @param reference - A reference to the document to write.
 * @param data - A map of the fields and values for the document.
 * @param options - An object to configure the set behavior.
 * @returns A Promise resolved once the data has been successfully written
 * to the backend (note that it won't resolve while you're offline).
 */
export function setDoc<T>(
  reference: DocumentReference<T>,
  data: PartialWithFieldValue<T>,
  options: FirebaseFirestoreTypes.SetOptions,
): Promise<void>;

export function setDoc<T>(
  reference: DocumentReference<T>,
  data: PartialWithFieldValue<T>,
  options?: FirebaseFirestoreTypes.SetOptions,
): Promise<void>;

/**
 * Updates fields in the document referred to by the specified
 * `DocumentReference`. The update will fail if applied to a document that does
 * not exist.
 *
 * @param reference - A reference to the document to update.
 * @param data - An object containing the fields and values with which to
 * update the document. Fields can contain dots to reference nested fields
 * within the document.
 * @returns A `Promise` resolved once the data has been successfully written
 * to the backend (note that it won't resolve while you're offline).
 */
export function updateDoc<T>(reference: DocumentReference<T>, data: UpdateData<T>): Promise<void>;
/**
 * Updates fields in the document referred to by the specified
 * `DocumentReference` The update will fail if applied to a document that does
 * not exist.
 *
 * Nested fields can be updated by providing dot-separated field path
 * strings or by providing `FieldPath` objects.
 *
 * @param reference - A reference to the document to update.
 * @param field - The first field to update.
 * @param value - The first value.
 * @param moreFieldsAndValues - Additional key value pairs.
 * @returns A `Promise` resolved once the data has been successfully written
 * to the backend (note that it won't resolve while you're offline).
 */
export function updateDoc(
  reference: DocumentReference<unknown>,
  field: string | FieldPath,
  value: unknown,
  ...moreFieldsAndValues: unknown[]
): Promise<void>;

/**
 * Add a new document to specified `CollectionReference` with the given data,
 * assigning it a document ID automatically.
 *
 * @param reference - A reference to the collection to add this document to.
 * @param data - An Object containing the data for the new document.
 * @returns A `Promise` resolved with a `DocumentReference` pointing to the
 * newly created document after it has been written to the backend (Note that it
 * won't resolve while you're offline).
 */
export function addDoc<T>(
  reference: CollectionReference<T>,
  data: WithFieldValue<T>,
): Promise<DocumentReference<T>>;

/**
 * Re-enables use of the network for this {@link Firestore} instance after a prior
 * call to {@link disableNetwork}.
 *
 * @returns A `Promise` that is resolved once the network has been enabled.
 */
export function enableNetwork(firestore: Firestore): Promise<void>;

/**
 * Disables network usage for this instance. It can be re-enabled via {@link
 * enableNetwork}. While the network is disabled, any snapshot listeners,
 * `getDoc()` or `getDocs()` calls will return results from cache, and any write
 * operations will be queued until the network is restored.
 *
 * @returns A `Promise` that is resolved once the network has been disabled.
 */
export function disableNetwork(firestore: Firestore): Promise<void>;

/**
 * Aimed primarily at clearing up any data cached from running tests. Needs to be executed before any database calls
 * are made.
 *
 * @param firestore - A reference to the root `Firestore` instance.
 */
export function clearPersistence(firestore: Firestore): Promise<void>;

/**
 * Terminates the provided {@link Firestore} instance.
 *
 * To restart after termination, create a new instance of FirebaseFirestore with
 * {@link (getFirestore:1)}.
 *
 * Termination does not cancel any pending writes, and any promises that are
 * awaiting a response from the server will not be resolved. If you have
 * persistence enabled, the next time you start this instance, it will resume
 * sending these writes to the server.
 *
 * Note: Under normal circumstances, calling `terminate()` is not required. This
 * function is useful only when you want to force this instance to release all
 * of its resources or in combination with `clearIndexedDbPersistence()` to
 * ensure that all local state is destroyed between test runs.
 *
 * @returns A `Promise` that is resolved when the instance has been successfully
 * terminated.
 */
export function terminate(firestore: Firestore): Promise<void>;

/**
 * Waits until all currently pending writes for the active user have been
 * acknowledged by the backend.
 *
 * The returned promise resolves immediately if there are no outstanding writes.
 * Otherwise, the promise waits for all previously issued writes (including
 * those written in a previous app session), but it does not wait for writes
 * that were added after the function is called. If you want to wait for
 * additional writes, call `waitForPendingWrites()` again.
 *
 * Any outstanding `waitForPendingWrites()` promises are rejected during user
 * changes.
 *
 * @returns A `Promise` which resolves when all currently pending writes have been
 * acknowledged by the backend.
 */
export function waitForPendingWrites(firestore: Firestore): Promise<void>;

/*
 * @param app - The {@link @firebase/app#FirebaseApp} with which the {@link Firestore} instance will
 * be associated.
 * @param settings - A settings object to configure the {@link Firestore} instance.
 * @param databaseId - The name of database.
 * @returns A newly initialized {@link Firestore} instance.
 */
export function initializeFirestore(
  app: FirebaseApp,
  settings: FirestoreSettings,
  databaseId?: string,
): Promise<Firestore>;

/**
 * The verbosity you set for activity and error logging. Can be any of the following values:
 * - debug for the most verbose logging level, primarily for debugging.
 * - error to log errors only.
 * - silent to turn off logging.
 */
type LogLevel = 'debug' | 'error' | 'silent';

/**
 * Sets the verbosity of Cloud Firestore logs (debug, error, or silent).
 * @param logLevel - The verbosity you set for activity and error logging.
 */
export function setLogLevel(logLevel: LogLevel): void;

/**
 * Executes the given `updateFunction` and then attempts to commit the changes
 * applied within the transaction. If any document read within the transaction
 * has changed, Cloud Firestore retries the `updateFunction`. If it fails to
 * commit after 5 attempts, the transaction fails.
 *
 * The maximum number of writes allowed in a single transaction is 500.
 *
 * @param firestore - A reference to the Firestore database to run this
 * transaction against.
 * @param updateFunction - The function to execute within the transaction
 * context.
 * @returns If the transaction completed successfully or was explicitly aborted
 * (the `updateFunction` returned a failed promise), the promise returned by the
 * `updateFunction `is returned here. Otherwise, if the transaction failed, a
 * rejected promise with the corresponding failure error is returned.
 */
export function runTransaction<T>(
  firestore: Firestore,
  updateFunction: (transaction: FirebaseFirestoreTypes.Transaction) => Promise<T>,
): Promise<T>;

/**
 * Calculates the number of documents in the result set of the given query,
 * without actually downloading the documents.
 *
 * Using this function to count the documents is efficient because only the
 * final count, not the documents' data, is downloaded. This function can even
 * count the documents if the result set would be prohibitively large to
 * download entirely (e.g. thousands of documents).
 *
 * The result received from the server is presented, unaltered, without
 * considering any local state. That is, documents in the local cache are not
 * taken into consideration, neither are local modifications not yet
 * synchronized with the server. Previously-downloaded results, if any, are not
 * used: every request using this source necessarily involves a round trip to
 * the server.
 *
 * @param query - The query whose result set size to calculate.
 * @returns A Promise that will be resolved with the count; the count can be
 * retrieved from `snapshot.data().count`, where `snapshot` is the
 * `AggregateQuerySnapshot` to which the returned Promise resolves.
 */
export function getCountFromServer<AppModelType, DbModelType extends DocumentData>(
  query: Query<AppModelType, DbModelType>,
): Promise<
  FirebaseFirestoreTypes.AggregateQuerySnapshot<
    { count: FirebaseFirestoreTypes.AggregateField<number> },
    AppModelType,
    DbModelType
  >
>;

/**
 * Specifies a set of aggregations and their aliases.
 */
interface AggregateSpec {
  [field: string]: AggregateFieldType;
}

/**
 * The union of all `AggregateField` types that are supported by Firestore.
 */
export type AggregateFieldType =
  | ReturnType<typeof sum>
  | ReturnType<typeof average>
  | ReturnType<typeof count>;

export function getAggregateFromServer<
  AggregateSpecType extends AggregateSpec,
  AppModelType,
  DbModelType extends DocumentData,
>(
  query: Query<AppModelType, DbModelType>,
  aggregateSpec: AggregateSpecType,
): Promise<AggregateQuerySnapshot<AggregateSpecType, AppModelType, DbModelType>>;

/**
 * Create an AggregateField object that can be used to compute the sum of
 * a specified field over a range of documents in the result set of a query.
 * @param field Specifies the field to sum across the result set.
 */
export function sum(field: string | FieldPath): AggregateField<number>;

/**
 * Create an AggregateField object that can be used to compute the average of
 * a specified field over a range of documents in the result set of a query.
 * @param field Specifies the field to average across the result set.
 */
export function average(field: string | FieldPath): AggregateField<number | null>;

/**
 * Create an AggregateField object that can be used to compute the count of
 * documents in the result set of a query.
 */
export function count(): AggregateField<number>;

/**
 * Represents an aggregation that can be performed by Firestore.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class AggregateField<T> {
  /** A type string to uniquely identify instances of this class. */
  readonly type = 'AggregateField';

  /** Indicates the aggregation operation of this AggregateField. */
  readonly aggregateType: AggregateType;

  /**
   * Create a new AggregateField<T>
   * @param aggregateType Specifies the type of aggregation operation to perform.
   * @param _internalFieldPath Optionally specifies the field that is aggregated.
   * @internal
   */
  constructor(
    aggregateType: AggregateType = 'count',
    readonly _internalFieldPath?: InternalFieldPath,
  ) {
    this.aggregateType = aggregateType;
  }
}

/**
 * Represents the task of loading a Firestore bundle.
 * It provides progress of bundle loading, as well as task completion and error events.
 */
type LoadBundleTask = Promise<FirebaseFirestoreTypes.LoadBundleTaskProgress>;

/**
 * Loads a Firestore bundle into the local cache.
 *
 * @param firestore - The {@link Firestore} instance to load bundles for.
 * @param bundleData - An object representing the bundle to be loaded. Valid
 * objects are `ArrayBuffer`, `ReadableStream<Uint8Array>` or `string`.
 *
 * @returns A `LoadBundleTask` object, which notifies callers with progress
 * updates, and completion or error events. It can be used as a
 * `Promise<LoadBundleTaskProgress>`.
 */
export function loadBundle(
  firestore: Firestore,
  bundleData: ReadableStream<Uint8Array> | ArrayBuffer | string,
): LoadBundleTask;

/**
 * Reads a Firestore {@link Query} from local cache, identified by the given
 * name.
 *
 * The named queries are packaged  into bundles on the server side (along
 * with resulting documents), and loaded to local cache using `loadBundle`. Once
 * in local cache, use this method to extract a {@link Query} by name.
 *
 * @param firestore - The {@link Firestore} instance to read the query from.
 * @param name - The name of the query.
 * @returns A named Query.
 */
export function namedQuery(firestore: Firestore, name: string): Query<DocumentData>;

/**
 * Creates a write batch, used for performing multiple writes as a single
 * atomic operation. The maximum number of writes allowed in a single WriteBatch
 * is 500.
 *
 * The result of these writes will only be reflected in document reads that
 * occur after the returned promise resolves. If the client is offline, the
 * write fails. If you would like to see local modifications or buffer writes
 * until the client is online, use the full Firestore SDK.
 *
 * @returns A `WriteBatch` that can be used to atomically execute multiple
 * writes.
 */
export function writeBatch(firestore: Firestore): FirebaseFirestoreTypes.WriteBatch;

/**
 * Gets the `PersistentCacheIndexManager` instance used by this Cloud Firestore instance.
 * This is not the same as Cloud Firestore Indexes.
 * Persistent cache indexes are optional indexes that only exist within the SDK to assist in local query execution.
 * @param {Firestore} - The Firestore instance.
 * @return {PersistentCacheIndexManager | null} - The `PersistentCacheIndexManager` instance or `null` if local persistent storage is not in use.
 */
export function getPersistentCacheIndexManager(
  firestore: Firestore,
): PersistentCacheIndexManager | null;
/**
 * Enables the SDK to create persistent cache indexes automatically for local query
 * execution when the SDK believes cache indexes can help improves performance.
 * This feature is disabled by default.
 * @param {PersistentCacheIndexManager} - The `PersistentCacheIndexManager` instance.
 * @return {Promise<void>} - A promise that resolves when the operation is complete.
 */
export function enablePersistentCacheIndexAutoCreation(
  indexManager: PersistentCacheIndexManager,
): Promise<void>;
/**
 * Stops creating persistent cache indexes automatically for local query execution.
 * The indexes which have been created by calling `enableIndexAutoCreation()` still take effect.
 * @param {PersistentCacheIndexManager} - The `PersistentCacheIndexManager` instance.
 * @return {Promise<void>} - A promise that resolves when the operation is complete.
 */
export function disablePersistentCacheIndexAutoCreation(
  indexManager: PersistentCacheIndexManager,
): Promise<void>;
/**
 * Removes all persistent cache indexes. Note this function also deletes indexes
 * generated by `setIndexConfiguration()`, which is deprecated.
 * @param {PersistentCacheIndexManager} - The `PersistentCacheIndexManager` instance.
 * @return {Promise<void>} - A promise that resolves when the operation is complete.
 */
export function deleteAllPersistentCacheIndexes(
  indexManager: PersistentCacheIndexManager,
): Promise<void>;

export * from './query';
export * from './snapshot';
export * from './Bytes';
export * from './FieldPath';
export * from './FieldValue';
export * from './GeoPoint';
export * from './Timestamp';
