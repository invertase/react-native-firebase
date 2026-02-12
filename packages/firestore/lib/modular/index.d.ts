import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseFirestoreTypes } from '../index';
import { FieldValue } from './FieldValue';
import { FieldPath } from './FieldPath';

import FirebaseApp = ReactNativeFirebase.FirebaseApp;
import Firestore = FirebaseFirestoreTypes.Module;

export type PersistentCacheIndexManager = FirebaseFirestoreTypes.PersistentCacheIndexManager;
export type AggregateQuerySnapshot = FirebaseFirestoreTypes.AggregateQuerySnapshot;
export type SetOptions = FirebaseFirestoreTypes.SetOptions;
export type SnapshotListenOptions = FirebaseFirestoreTypes.SnapshotListenOptions;
export type WhereFilterOp = FirebaseFirestoreTypes.WhereFilterOp;
export type QueryCompositeFilterConstraint = FirebaseFirestoreTypes.QueryCompositeFilterConstraint;

/** Primitive types. */
export type Primitive = string | number | boolean | undefined | null;

/**
 * A `DocumentData` object represents the data in a document.
 * - Same as {@link FirebaseFirestoreTypes.DocumentData}
 */
export interface DocumentData {
  [key: string]: any;
}

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

export type EmulatorMockTokenOptions = ({ user_id: string } | { sub: string }) &
  Partial<FirebaseIdToken>;

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
 * Modify this instance to communicate with the Cloud Firestore emulator.
 *
 * @param firestore - A reference to the root `Firestore` instance.
 * instance is associated with.
 * @param host: emulator host (eg, 'localhost')
 * @param port: emulator port (eg, 8080)
 * @param options.mockUserToken - the mock auth token to use for unit testing
 * @returns void.
 */
export declare function connectFirestoreEmulator(
  firestore: Firestore,
  host: string,
  port: number,
  options?: {
    mockUserToken?: EmulatorMockTokenOptions | string;
  },
): void;

/**
 * Converter used by `withConverter()` to transform user objects of type
 * `AppModelType` into Firestore data of type `DbModelType`.
 *
 * Using the converter allows you to specify generic type arguments when
 * storing and retrieving objects from Firestore.
 *
 * In this context, an "AppModel" is a class that is used in an application to
 * package together related information and functionality. Such a class could,
 * for example, have properties with complex, nested data types, properties used
 * for memoization, properties of types not supported by Firestore (such as
 * `symbol` and `bigint`), and helper functions that perform compound
 * operations. Such classes are not suitable and/or possible to store into a
 * Firestore database. Instead, instances of such classes need to be converted
 * to "plain old JavaScript objects" (POJOs) with exclusively primitive
 * properties, potentially nested inside other POJOs or arrays of POJOs. In this
 * context, this type is referred to as the "DbModel" and would be an object
 * suitable for persisting into Firestore. For convenience, applications can
 * implement `FirestoreDataConverter` and register the converter with Firestore
 * objects, such as `DocumentReference` or `Query`, to automatically convert
 * `AppModel` to `DbModel` when storing into Firestore, and convert `DbModel`
 * to `AppModel` when retrieving from Firestore.
 *
 * @example
 *
 * Simple Example
 *
 * ```typescript
 * const numberConverter = {
 *     toFirestore(value: WithFieldValue<number>) {
 *         return { value };
 *     },
 *     fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions) {
 *         return snapshot.data(options).value as number;
 *     }
 * };
 *
 * async function simpleDemo(db: Firestore): Promise<void> {
 *     const documentRef = doc(db, 'values/value123').withConverter(numberConverter);
 *
 *     // converters are used with `setDoc`, `addDoc`, and `getDoc`
 *     await setDoc(documentRef, 42);
 *     const snapshot1 = await getDoc(documentRef);
 *     assertEqual(snapshot1.data(), 42);
 *
 *     // converters are not used when writing data with `updateDoc`
 *     await updateDoc(documentRef, { value: 999 });
 *     const snapshot2 = await getDoc(documentRef);
 *     assertEqual(snapshot2.data(), 999);
 * }
 * ```
 *
 * Advanced Example
 *
 * ```typescript
 * // The Post class is a model that is used by our application.
 * // This class may have properties and methods that are specific
 * // to our application execution, which do not need to be persisted
 * // to Firestore.
 * class Post {
 *     constructor(
 *         readonly title: string,
 *         readonly author: string,
 *         readonly lastUpdatedMillis: number
 *     ) {}
 *     toString(): string {
 *         return `${this.title} by ${this.author}`;
 *     }
 * }
 *
 * // The PostDbModel represents how we want our posts to be stored
 * // in Firestore. This DbModel has different properties (`ttl`,
 * // `aut`, and `lut`) from the Post class we use in our application.
 * interface PostDbModel {
 *     ttl: string;
 *     aut: { firstName: string; lastName: string };
 *     lut: Timestamp;
 * }
 *
 * // The `PostConverter` implements `FirestoreDataConverter` and specifies
 * // how the Firestore SDK can convert `Post` objects to `PostDbModel`
 * // objects and vice versa.
 * class PostConverter implements FirestoreDataConverter<Post, PostDbModel> {
 *     toFirestore(post: WithFieldValue<Post>): WithFieldValue<PostDbModel> {
 *         return {
 *             ttl: post.title,
 *             aut: this._autFromAuthor(post.author),
 *             lut: this._lutFromLastUpdatedMillis(post.lastUpdatedMillis)
 *         };
 *     }
 *
 *     fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Post {
 *         const data = snapshot.data(options) as PostDbModel;
 *         const author = `${data.aut.firstName} ${data.aut.lastName}`;
 *         return new Post(data.ttl, author, data.lut.toMillis());
 *     }
 *
 *     _autFromAuthor(
 *         author: string | FieldValue
 *     ): { firstName: string; lastName: string } | FieldValue {
 *         if (typeof author !== 'string') {
 *             // `author` is a FieldValue, so just return it.
 *             return author;
 *         }
 *         const [firstName, lastName] = author.split(' ');
 *         return {firstName, lastName};
 *     }
 *
 *     _lutFromLastUpdatedMillis(
 *         lastUpdatedMillis: number | FieldValue
 *     ): Timestamp | FieldValue {
 *         if (typeof lastUpdatedMillis !== 'number') {
 *             // `lastUpdatedMillis` must be a FieldValue, so just return it.
 *             return lastUpdatedMillis;
 *         }
 *         return Timestamp.fromMillis(lastUpdatedMillis);
 *     }
 * }
 *
 * async function advancedDemo(db: Firestore): Promise<void> {
 *     // Create a `DocumentReference` with a `FirestoreDataConverter`.
 *     const documentRef = doc(db, 'posts/post123').withConverter(new PostConverter());
 *
 *     // The `data` argument specified to `setDoc()` is type checked by the
 *     // TypeScript compiler to be compatible with `Post`. Since the `data`
 *     // argument is typed as `WithFieldValue<Post>` rather than just `Post`,
 *     // this allows properties of the `data` argument to also be special
 *     // Firestore values that perform server-side mutations, such as
 *     // `arrayRemove()`, `deleteField()`, and `serverTimestamp()`.
 *     await setDoc(documentRef, {
 *         title: 'My Life',
 *         author: 'Foo Bar',
 *         lastUpdatedMillis: serverTimestamp()
 *     });
 *
 *     // The TypeScript compiler will fail to compile if the `data` argument to
 *     // `setDoc()` is _not_ compatible with `WithFieldValue<Post>`. This
 *     // type checking prevents the caller from specifying objects with incorrect
 *     // properties or property values.
 *     // @ts-expect-error "Argument of type { ttl: string; } is not assignable
 *     // to parameter of type WithFieldValue<Post>"
 *     await setDoc(documentRef, { ttl: 'The Title' });
 *
 *     // When retrieving a document with `getDoc()` the `DocumentSnapshot`
 *     // object's `data()` method returns a `Post`, rather than a generic object,
 *     // which would have been returned if the `DocumentReference` did _not_ have a
 *     // `FirestoreDataConverter` attached to it.
 *     const snapshot1: DocumentSnapshot<Post> = await getDoc(documentRef);
 *     const post1: Post = snapshot1.data()!;
 *     if (post1) {
 *         assertEqual(post1.title, 'My Life');
 *         assertEqual(post1.author, 'Foo Bar');
 *     }
 *
 *     // The `data` argument specified to `updateDoc()` is type checked by the
 *     // TypeScript compiler to be compatible with `PostDbModel`. Note that
 *     // unlike `setDoc()`, whose `data` argument must be compatible with `Post`,
 *     // the `data` argument to `updateDoc()` must be compatible with
 *     // `PostDbModel`. Similar to `setDoc()`, since the `data` argument is typed
 *     // as `WithFieldValue<PostDbModel>` rather than just `PostDbModel`, this
 *     // allows properties of the `data` argument to also be those special
 *     // Firestore values, like `arrayRemove()`, `deleteField()`, and
 *     // `serverTimestamp()`.
 *     await updateDoc(documentRef, {
 *         'aut.firstName': 'NewFirstName',
 *         lut: serverTimestamp()
 *     });
 *
 *     // The TypeScript compiler will fail to compile if the `data` argument to
 *     // `updateDoc()` is _not_ compatible with `WithFieldValue<PostDbModel>`.
 *     // This type checking prevents the caller from specifying objects with
 *     // incorrect properties or property values.
 *     // @ts-expect-error "Argument of type { title: string; } is not assignable
 *     // to parameter of type WithFieldValue<PostDbModel>"
 *     await updateDoc(documentRef, { title: 'New Title' });
 *     const snapshot2: DocumentSnapshot<Post> = await getDoc(documentRef);
 *     const post2: Post = snapshot2.data()!;
 *     if (post2) {
 *         assertEqual(post2.title, 'My Life');
 *         assertEqual(post2.author, 'NewFirstName Bar');
 *     }
 * }
 * ```
 */
export interface FirestoreDataConverter<
  AppModelType,
  DbModelType extends DocumentData = DocumentData,
> {
  /**
   * Called by the Firestore SDK to convert a custom model object of type
   * `AppModelType` into a plain JavaScript object (suitable for writing
   * directly to the Firestore database) of type `DbModelType`. To use `set()`
   * with `merge` and `mergeFields`, `toFirestore()` must be defined with
   * `PartialWithFieldValue<AppModelType>`.
   *
   * The `WithFieldValue<T>` type extends `T` to also allow FieldValues such as
   * {@link (deleteField:1)} to be used as property values.
   */
  toFirestore(modelObject: WithFieldValue<AppModelType>): WithFieldValue<DbModelType>;

  /**
   * Called by the Firestore SDK to convert a custom model object of type
   * `AppModelType` into a plain JavaScript object (suitable for writing
   * directly to the Firestore database) of type `DbModelType`. Used with
   * {@link (setDoc:1)}, {@link (WriteBatch.set:1)} and
   * {@link (Transaction.set:1)} with `merge:true` or `mergeFields`.
   *
   * The `PartialWithFieldValue<T>` type extends `Partial<T>` to allow
   * FieldValues such as {@link (arrayUnion:1)} to be used as property values.
   * It also supports nested `Partial` by allowing nested fields to be
   * omitted.
   */
  toFirestore(
    modelObject: PartialWithFieldValue<AppModelType>,
    options: SetOptions,
  ): PartialWithFieldValue<DbModelType>;

  /**
   * Called by the Firestore SDK to convert Firestore data into an object of
   * type `AppModelType`. You can access your data by calling:
   * `snapshot.data(options)`.
   *
   * Generally, the data returned from `snapshot.data()` can be cast to
   * `DbModelType`; however, this is not guaranteed because Firestore does not
   * enforce a schema on the database. For example, writes from a previous
   * version of the application or writes from another client that did not use a
   * type converter could have written data with different properties and/or
   * property types. The implementation will need to choose whether to
   * gracefully recover from non-conforming data or throw an error.
   *
   * To override this method, see {@link (FirestoreDataConverter.fromFirestore:1)}.
   *
   * @param snapshot - A `QueryDocumentSnapshot` containing your data and metadata.
   * @param options - The `SnapshotOptions` from the initial call to `data()`.
   */
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>,
    options?: SnapshotOptions,
  ): AppModelType;
}

/**
 * A Query refers to a `Query` which you can read or listen to. You can also construct refined `Query` objects by
 * adding filters and ordering.
 */
export interface Query<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  /**
   * The Firestore instance the document is in. This is useful for performing transactions, for example.
   */
  firestore: Firestore;

  /**
   * If provided, the {@link FirestoreDataConverter} associated with this instance.
   */
  converter: FirestoreDataConverter<AppModelType, DbModelType> | null;

  /**
   * Removes the current converter.
   *
   * @param converter - `null` removes the current converter.
   * @returns A `Query<DocumentData, DocumentData>` that does not use a
   * converter.
   */
  withConverter(converter: null): Query<DocumentData, DocumentData>;
  /**
   * Applies a custom data converter to this query, allowing you to use your own
   * custom model objects with Firestore. When you call {@link getDocs} with
   * the returned query, the provided converter will convert between Firestore
   * data of type `NewDbModelType` and your custom type `NewAppModelType`.
   *z
   * @param converter - Converts objects to and from Firestore.
   * @returns A `Query` that uses the provided converter.
   */
  withConverter<NewAppModelType, NewDbModelType extends DocumentData = DocumentData>(
    converter: FirestoreDataConverter<NewAppModelType, NewDbModelType>,
  ): Query<NewAppModelType, NewDbModelType>;
}

/**
 * A `CollectionReference` object can be used for adding documents, getting document references, and querying for
 * documents (using the methods inherited from `Query`).
 */
export interface CollectionReference<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> extends Query<AppModelType, DbModelType> {
  /**
   * The collection's identifier.
   */
  id: string;

  /**
   * A reference to the containing `DocumentReference` if this is a subcollection. If this isn't a
   * subcollection, the reference is null.
   */
  parent: DocumentReference<DocumentData, DocumentData> | null;

  /**
   * A string representing the path of the referenced collection (relative to the root of the database).
   */
  path: string;

  /**
   * Removes the current converter.
   *
   * @param converter - `null` removes the current converter.
   * @returns A `CollectionReference<DocumentData, DocumentData>` that does not
   * use a converter.
   */
  withConverter(converter: null): CollectionReference<DocumentData, DocumentData>;
  /**
   * Applies a custom data converter to this `CollectionReference`, allowing you
   * to use your own custom model objects with Firestore. When you call {@link
   * addDoc} with the returned `CollectionReference` instance, the provided
   * converter will convert between Firestore data of type `NewDbModelType` and
   * your custom type `NewAppModelType`.
   *
   * @param converter - Converts objects to and from Firestore.
   * @returns A `CollectionReference` that uses the provided converter.
   */
  withConverter<NewAppModelType, NewDbModelType extends DocumentData = DocumentData>(
    converter: FirestoreDataConverter<NewAppModelType, NewDbModelType>,
  ): CollectionReference<NewAppModelType, NewDbModelType>;
}

/**
 * A `DocumentReference` refers to a document location in a Firestore database and can be used to write, read, or listen
 * to the location. The document at the referenced location may or may not exist. A `DocumentReference` can also be used
 * to create a `CollectionReference` to a subcollection.
 */
export interface DocumentReference<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  /**
   * The Firestore instance the document is in. This is useful for performing transactions, for example.
   */
  firestore: Firestore;

  /**
   * If provided, the {@link FirestoreDataConverter} associated with this instance.
   */
  converter: FirestoreDataConverter<AppModelType, DbModelType> | null;

  /**
   * The document's identifier within its collection.
   */
  id: string;

  /**
   * The Collection this `DocumentReference` belongs to.
   */
  parent: CollectionReference<AppModelType, DbModelType>;

  /**
   * A string representing the path of the referenced document (relative to the root of the database).
   */
  path: string;

  /**
   * Removes the current converter.
   *
   * @param converter - `null` removes the current converter.
   * @returns A `DocumentReference<DocumentData, DocumentData>` that does not
   * use a converter.
   */
  withConverter(converter: null): DocumentReference<DocumentData, DocumentData>;
  /**
   * Applies a custom data converter to this `DocumentReference`, allowing you
   * to use your own custom model objects with Firestore. When you call
   * {@link setDoc:1}, {@link getDoc:1}, etc. with the returned `DocumentReference`
   * instance, the provided converter will convert between Firestore data of
   * type `NewDbModelType` and your custom type `NewAppModelType`.
   *
   * @param converter - Converts objects to and from Firestore.
   * @returns A `DocumentReference` that uses the provided converter.
   */
  withConverter<NewAppModelType, NewDbModelType extends DocumentData = DocumentData>(
    converter: FirestoreDataConverter<NewAppModelType, NewDbModelType>,
  ): DocumentReference<NewAppModelType, NewDbModelType>;
}

/**
 * A write batch, used to perform multiple writes as a single atomic unit.
 *
 * A `WriteBatch` object can be acquired by calling {@link writeBatch}. It
 * provides methods for adding writes to the write batch. None of the writes
 * will be committed (or visible locally) until {@link WriteBatch.commit} is
 * called.
 */
export class WriteBatch {
  /**
   * Writes to the document referred to by the provided {@link
   * DocumentReference}. If the document does not exist yet, it will be created.
   *
   * @param documentRef - A reference to the document to be set.
   * @param data - An object of the fields and values for the document.
   * @returns This `WriteBatch` instance. Used for chaining method calls.
   */
  set<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    data: WithFieldValue<AppModelType>,
  ): WriteBatch;
  /**
   * Writes to the document referred to by the provided {@link
   * DocumentReference}. If the document does not exist yet, it will be created.
   * If you provide `merge` or `mergeFields`, the provided data can be merged
   * into an existing document.
   *
   * @param documentRef - A reference to the document to be set.
   * @param data - An object of the fields and values for the document.
   * @param options - An object to configure the set behavior.
   * @throws Error - If the provided input is not a valid Firestore document.
   * @returns This `WriteBatch` instance. Used for chaining method calls.
   */
  set<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    data: PartialWithFieldValue<AppModelType>,
    options: SetOptions,
  ): WriteBatch;
  /**
   * Updates fields in the document referred to by the provided {@link
   * DocumentReference}. The update will fail if applied to a document that does
   * not exist.
   *
   * @param documentRef - A reference to the document to be updated.
   * @param data - An object containing the fields and values with which to
   * update the document. Fields can contain dots to reference nested fields
   * within the document.
   * @throws Error - If the provided input is not valid Firestore data.
   * @returns This `WriteBatch` instance. Used for chaining method calls.
   */
  update<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    data: UpdateData<DbModelType>,
  ): WriteBatch;
  /**
   * Updates fields in the document referred to by this {@link
   * DocumentReference}. The update will fail if applied to a document that does
   * not exist.
   *
   * Nested fields can be update by providing dot-separated field path strings
   * or by providing `FieldPath` objects.
   *
   * @param documentRef - A reference to the document to be updated.
   * @param field - The first field to update.
   * @param value - The first value.
   * @param moreFieldsAndValues - Additional key value pairs.
   * @throws Error - If the provided input is not valid Firestore data.
   * @returns This `WriteBatch` instance. Used for chaining method calls.
   */
  update<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    field: string | FieldPath,
    value: unknown,
    ...moreFieldsAndValues: unknown[]
  ): WriteBatch;
  update<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    fieldOrUpdateData: string | FieldPath | UpdateData<DbModelType>,
    value?: unknown,
    ...moreFieldsAndValues: unknown[]
  ): WriteBatch;

  /**
   * Deletes the document referred to by the provided {@link DocumentReference}.
   *
   * @param documentRef - A reference to the document to be deleted.
   * @returns This `WriteBatch` instance. Used for chaining method calls.
   */
  delete<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
  ): WriteBatch;
  /**
   * Commits all of the writes in this write batch as a single atomic unit.
   *
   * The result of these writes will only be reflected in document reads that
   * occur after the returned promise resolves. If the client is offline, the
   * write fails. If you would like to see local modifications or buffer writes
   * until the client is online, use the full Firestore SDK.
   *
   * @returns A `Promise` resolved once all of the writes in the batch have been
   * successfully written to the backend as an atomic unit (note that it won't
   * resolve while you're offline).
   */
  commit(): Promise<void>;
}

/**
 * A reference to a transaction.
 *
 * The `Transaction` object passed to a transaction's `updateFunction` provides
 * the methods to read and write data within the transaction context. See
 * {@link runTransaction}.
 */
export class Transaction extends LiteTransaction {
  /**
   * Reads the document referenced by the provided {@link DocumentReference}.
   *
   * @param documentRef - A reference to the document to be read.
   * @returns A `DocumentSnapshot` with the read data.
   */
  get<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
  ): Promise<DocumentSnapshot<AppModelType, DbModelType>>;

  /**
   * Writes to the document referred to by the provided {@link
   * DocumentReference}. If the document does not exist yet, it will be created.
   *
   * @param documentRef - A reference to the document to be set.
   * @param data - An object of the fields and values for the document.
   * @throws Error - If the provided input is not a valid Firestore document.
   * @returns This `Transaction` instance. Used for chaining method calls.
   */
  set<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    data: WithFieldValue<AppModelType>,
  ): this;
  /**
   * Writes to the document referred to by the provided {@link
   * DocumentReference}. If the document does not exist yet, it will be created.
   * If you provide `merge` or `mergeFields`, the provided data can be merged
   * into an existing document.
   *
   * @param documentRef - A reference to the document to be set.
   * @param data - An object of the fields and values for the document.
   * @param options - An object to configure the set behavior.
   * @throws Error - If the provided input is not a valid Firestore document.
   * @returns This `Transaction` instance. Used for chaining method calls.
   */
  set<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    data: PartialWithFieldValue<AppModelType>,
    options: SetOptions,
  ): this;

  /**
   * Updates fields in the document referred to by the provided {@link
   * DocumentReference}. The update will fail if applied to a document that does
   * not exist.
   *
   * @param documentRef - A reference to the document to be updated.
   * @param data - An object containing the fields and values with which to
   * update the document. Fields can contain dots to reference nested fields
   * within the document.
   * @throws Error - If the provided input is not valid Firestore data.
   * @returns This `Transaction` instance. Used for chaining method calls.
   */
  update<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    data: UpdateData<DbModelType>,
  ): this;
  /**
   * Updates fields in the document referred to by the provided {@link
   * DocumentReference}. The update will fail if applied to a document that does
   * not exist.
   *
   * Nested fields can be updated by providing dot-separated field path
   * strings or by providing `FieldPath` objects.
   *
   * @param documentRef - A reference to the document to be updated.
   * @param field - The first field to update.
   * @param value - The first value.
   * @param moreFieldsAndValues - Additional key/value pairs.
   * @throws Error - If the provided input is not valid Firestore data.
   * @returns This `Transaction` instance. Used for chaining method calls.
   */
  update<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    field: string | FieldPath,
    value: unknown,
    ...moreFieldsAndValues: unknown[]
  ): this;
  update<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
    fieldOrUpdateData: string | FieldPath | UpdateData<DbModelType>,
    value?: unknown,
    ...moreFieldsAndValues: unknown[]
  ): this;
  /**
   * Deletes the document referred to by the provided {@link DocumentReference}.
   *
   * @param documentRef - A reference to the document to be deleted.
   * @returns This `Transaction` instance. Used for chaining method calls.
   */
  delete<AppModelType, DbModelType extends DocumentData>(
    documentRef: DocumentReference<AppModelType, DbModelType>,
  ): this;
}

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
 * @param options - An options object to configure maximum number of attempts to
 * commit.
 * @returns If the transaction completed successfully or was explicitly aborted
 * (the `updateFunction` returned a failed promise), the promise returned by the
 * `updateFunction `is returned here. Otherwise, if the transaction failed, a
 * rejected promise with the corresponding failure error is returned.
 */
export function runTransaction<T>(
  firestore: Firestore,
  updateFunction: (transaction: Transaction) => Promise<T>,
  options?: TransactionOptions,
): Promise<T>;

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
): DocumentReference<DocumentData, DocumentData>;

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
export declare function doc<AppModelType, DbModelType extends DocumentData>(
  reference: CollectionReference<AppModelType, DbModelType>,
  path?: string,
  ...pathSegments: string[]
): DocumentReference<AppModelType, DbModelType>;

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
export declare function doc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  path: string,
  ...pathSegments: string[]
): DocumentReference<DocumentData, DocumentData>;

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
): CollectionReference<DocumentData, DocumentData>;

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
export declare function collection<AppModelType, DbModelType extends DocumentData>(
  reference: CollectionReference<AppModelType, DbModelType>,
  path: string,
  ...pathSegments: string[]
): CollectionReference<DocumentData, DocumentData>;

/**
 * Gets a `CollectionReference` instance that refers to a subcollection of
 * `reference` at the specified relative path.
 *
 * @param reference - A reference to a document.
 * @param path - A slash-separated path to a collection.
 * @param pathSegments - Additional path segments to apply relative to the first
 * argument.
 * @throws If the final path has an even number of segments and does not point
 * to a collection.
 * @returns The `CollectionReference` instance.
 */
export declare function collection<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  path: string,
  ...pathSegments: string[]
): CollectionReference<DocumentData, DocumentData>;

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

/**
 *Returns true if the provided references are equal.
 *
 * @param left	DocumentReference<AppModelType, DbModelType> | CollectionReference<AppModelType, DbModelType>	A reference to compare.
 * @param right	DocumentReference<AppModelType, DbModelType> | CollectionReference<AppModelType, DbModelType>	A reference to compare.
 * @return boolean true if the references point to the same location in the same Firestore database.
 */
export declare function refEqual<AppModelType, DbModelType extends DocumentData>(
  left:
    | DocumentReference<AppModelType, DbModelType>
    | CollectionReference<AppModelType, DbModelType>,
  right:
    | DocumentReference<AppModelType, DbModelType>
    | CollectionReference<AppModelType, DbModelType>,
): boolean;

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
export function collectionGroup(
  firestore: Firestore,
  collectionId: string,
): Query<DocumentData, DocumentData>;

/**
 * Writes to the document referred to by this `DocumentReference`. If the
 * document does not yet exist, it will be created.
 *
 * @param reference - A reference to the document to write.
 * @param data - A map of the fields and values for the document.
 * @returns A `Promise` resolved once the data has been successfully written
 * to the backend (note that it won't resolve while you're offline).
 */
export function setDoc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  data: WithFieldValue<AppModelType>,
): Promise<void>;

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
export function setDoc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  data: PartialWithFieldValue<AppModelType>,
  options: SetOptions,
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
export function updateDoc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  data: UpdateData<DbModelType>,
): Promise<void>;
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
export function updateDoc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
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
export declare function addDoc<AppModelType, DbModelType extends DocumentData>(
  reference: CollectionReference<AppModelType, DbModelType>,
  data: WithFieldValue<AppModelType>,
): Promise<DocumentReference<AppModelType, DbModelType>>;

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
 * Deprecated, please use `clearIndexedDbPersistence` instead.
 * @param firestore - A reference to the root `Firestore` instance.
 */
export function clearPersistence(firestore: Firestore): Promise<void>;

/**
 * Aimed primarily at clearing up any data cached from running tests. Needs to be executed before any database calls
 * are made.
 *
 * @param firestore - A reference to the root `Firestore` instance.
 */
export function clearIndexedDbPersistence(firestore: Firestore): Promise<void>;

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
  updateFunction: (transaction: Transaction) => Promise<T>,
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

interface FirebaseIdToken {
  // Always set to https://securetoken.google.com/PROJECT_ID
  iss: string;

  // Always set to PROJECT_ID
  aud: string;

  // The user's unique ID
  sub: string;

  // The token issue time, in seconds since epoch
  iat: number;

  // The token expiry time, normally 'iat' + 3600
  exp: number;

  // The user's unique ID. Must be equal to 'sub'
  user_id: string;

  // The time the user authenticated, normally 'iat'
  auth_time: number;

  // The sign in provider, only set when the provider is 'anonymous'
  provider_id?: 'anonymous';

  // The user's primary email
  email?: string;

  // The user's email verification status
  email_verified?: boolean;

  // The user's primary phone number
  phone_number?: string;

  // The user's display name
  name?: string;

  // The user's profile photo URL
  picture?: string;

  // Information on all identities linked to this user
  firebase: {
    // The primary sign-in provider
    sign_in_provider: FirebaseSignInProvider;

    // A map of providers to the user's list of unique identifiers from
    // each provider
    identities?: { [provider in FirebaseSignInProvider]?: string[] };
  };

  // Custom claims set by the developer
  [claim: string]: unknown;

  uid?: never; // Try to catch a common mistake of "uid" (should be "sub" instead).
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
export function namedQuery(firestore: Firestore, name: string): Promise<Query | null>;

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
export function writeBatch(firestore: Firestore): WriteBatch;

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
export * from './VectorValue';
