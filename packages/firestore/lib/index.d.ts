/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Firebase Cloud Firestore package for React Native.
 *
 * #### Example: Access the firebase export from the `firestore` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/firestore';
 *
 * // firebase.firestore().X
 * ```
 *
 * #### Example: Using the default export from the `firestore` package:
 *
 * ```js
 * import firestore from '@react-native-firebase/firestore';
 *
 * // firestore().X
 * ```
 *
 * #### Example: Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/firestore';
 *
 * // firebase.firestore().X
 * ```
 *
 * @firebase firestore
 */
export namespace FirebaseFirestoreTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;
  /**
   * An instance of Filter used to generate Firestore Filter queries.
   */

  export type QueryFilterType = 'OR' | 'AND';

  export interface QueryFieldFilterConstraint {
    fieldPath: keyof T | FieldPath;
    operator: WhereFilterOp;
    value: any;
  }

  export interface QueryCompositeFilterConstraint {
    operator: QueryFilterType;
    queries: QueryFieldFilterConstraint[];
  }

  export type QueryFilterConstraint = QueryFieldFilterConstraint | QueryCompositeFilterConstraint;

  /**
   * The Filter functions used to generate an instance of Filter.
   */
  export interface FilterFunction {
    /**
     * The Filter function used to generate an instance of Filter.
     * e.g. Filter('name', '==', 'Ada')
     */
    (
      fieldPath: keyof T | FieldPath,
      operator: WhereFilterOp,
      value: any,
    ): QueryFieldFilterConstraint;
    /**
     * The Filter.or() static function used to generate a logical OR query using multiple Filter instances.
     * e.g. Filter.or(Filter('name', '==', 'Ada'), Filter('name', '==', 'Bob'))
     */
    or(...queries: QueryFilterConstraint[]): QueryCompositeFilterConstraint;
    /**
     * The Filter.and() static function used to generate a logical AND query using multiple Filter instances.
     * e.g. Filter.and(Filter('name', '==', 'Ada'), Filter('name', '==', 'Bob'))
     */
    and(...queries: QueryFilterConstraint[]): QueryCompositeFilterConstraint;
  }
  /**
   * The Filter function used to generate an instance of Filter.
   * e.g. Filter('name', '==', 'Ada')
   */
  export const Filter: FilterFunction;

  /**
   * An immutable object representing an array of bytes.
   */
  export class Blob {
    /**
     * Creates a new Blob from the given Base64 string, converting it to bytes.
     *
     * @param base64 The Base64 string used to create the Blob object.
     */
    static fromBase64String(base64: string): Blob;

    /**
     * Creates a new Blob from the given Uint8Array.
     *
     * @param array The Uint8Array used to create the Blob object.
     */
    static fromUint8Array(array: Uint8Array): Blob;

    /**
     * Returns true if this `Blob` is equal to the provided one.
     *
     * @param other The `Blob` to compare against.
     */
    isEqual(other: Blob): boolean;

    /**
     * Returns the bytes of a Blob as a Base64-encoded string.
     */
    toBase64(): string;

    /**
     * Returns the bytes of a Blob in a new Uint8Array.
     */
    toUint8Array(): Uint8Array;
  }

  /**
   * A `DocumentData` object represents the data in a document.
   */
  export interface DocumentData {
    [key: string]: any;
  }

  /**
   * A `CollectionReference` object can be used for adding documents, getting document references, and querying for
   * documents (using the methods inherited from `Query`).
   */
  export interface CollectionReference<T extends DocumentData = DocumentData> extends Query<T> {
    /**
     * The collection's identifier.
     */
    id: string;

    /**
     * A reference to the containing `DocumentReference` if this is a subcollection. If this isn't a
     * subcollection, the reference is null.
     */
    parent: DocumentReference | null;

    /**
     * A string representing the path of the referenced collection (relative to the root of the database).
     */
    path: string;

    /**
     * Add a new document to this collection with the specified data, assigning it a document ID automatically.
     *
     * #### Example
     *
     * ```js
     * const documentRef = await firebase.firestore().collection('users').add({
     *   name: 'Ada Lovelace',
     *   age: 30,
     * });
     * ```
     *
     * @param data An Object containing the data for the new document.
     */
    add(data: T): Promise<DocumentReference<T>>;

    /**
     * Get a DocumentReference for the document within the collection at the specified path. If no
     * path is specified, an automatically-generated unique ID will be used for the returned DocumentReference.
     *
     * #### Example
     *
     * ```js
     * await firebase.firestore().collection('users').doc('alovelace').set({
     *   name: 'Ada Lovelace',
     *   age: 30,
     * });
     * ```
     *
     * @param documentPath A slash-separated path to a document.
     */
    doc(documentPath?: string): DocumentReference<T>;
  }

  /**
   * A DocumentChange represents a change to the documents matching a query. It contains the document affected and the
   * type of change that occurred.
   */
  export interface DocumentChange<T extends DocumentData = DocumentData> {
    /**
     * The document affected by this change.
     */
    doc: QueryDocumentSnapshot<T>;

    /**
     * The index of the changed document in the result set immediately after this `DocumentChange`
     * (i.e. supposing that all prior `DocumentChange` objects and the current `DocumentChange` object have been applied).
     * Is -1 for 'removed' events.
     */
    newIndex: number;

    /**
     * The index of the changed document in the result set immediately prior to this `DocumentChange` (i.e.
     * supposing that all prior `DocumentChange` objects have been applied). Is -1 for 'added' events.
     */
    oldIndex: number;

    /**
     * The type of change ('added', 'modified', or 'removed').
     */
    type: DocumentChangeType;
  }

  /**
   * The type of a DocumentChange may be 'added', 'removed', or 'modified'.
   */
  export type DocumentChangeType = 'added' | 'removed' | 'modified';

  /**
   * The types for a DocumentSnapshot field that are supported by Firestore.
   */
  export type DocumentFieldType =
    | string
    | number
    | boolean
    | { [key: string]: DocumentFieldType }
    | DocumentFieldType[]
    | null
    | Timestamp
    | GeoPoint
    | Blob
    | FieldPath
    | FieldValue
    | DocumentReference
    | CollectionReference;

  /**
   * A `DocumentReference` refers to a document location in a Firestore database and can be used to write, read, or listen
   * to the location. The document at the referenced location may or may not exist. A `DocumentReference` can also be used
   * to create a `CollectionReference` to a subcollection.
   */
  export interface DocumentReference<T extends DocumentData = DocumentData> {
    /**
     * The Firestore instance the document is in. This is useful for performing transactions, for example.
     */
    firestore: Module;

    /**
     * The document's identifier within its collection.
     */
    id: string;

    /**
     * The Collection this `DocumentReference` belongs to.
     */
    parent: CollectionReference<T>;

    /**
     * A string representing the path of the referenced document (relative to the root of the database).
     */
    path: string;

    /**
     * Gets a `CollectionReference` instance that refers to the collection at the specified path.
     *
     * #### Example
     *
     * ```js
     * const collectionRef = firebase.firestore().doc('users/alovelace').collection('orders');
     * ```
     *
     * @param collectionPath A slash-separated path to a collection.
     */
    collection(collectionPath: string): CollectionReference;

    /**
     * Deletes the document referred to by this DocumentReference.
     *
     * #### Example
     *
     * ```js
     * await firebase.firestore().doc('users/alovelace').delete();
     * ```
     *
     * The Promise is resolved once the document has been successfully deleted from the backend
     * (Note that it won't resolve while you're offline).
     */
    delete(): Promise<void>;

    /**
     * Reads the document referred to by this DocumentReference.
     *
     * Note: By default, get() attempts to provide up-to-date data when possible by waiting for data
     * from the server, but it may return cached data or fail if you are offline and the server cannot
     * be reached. This behavior can be altered via the GetOptions parameter.
     *
     * #### Example
     *
     * ```js
     * await firebase.firestore().doc('users/alovelace').get({
     *   source: 'server',
     * });
     * ```
     *
     * @param options An object to configure the get behavior.
     */
    get(options?: GetOptions): Promise<DocumentSnapshot<T>>;

    /**
     * Returns true if this DocumentReference is equal to the provided one.
     *
     * #### Example
     *
     * ```js
     * const alovelace = firebase.firestore().doc('users/alovelace');
     * const dsmith = firebase.firestore().doc('users/dsmith');
     *
     * // false
     * alovelace.isEqual(dsmith);
     * ```
     *
     * @param other The `DocumentReference` to compare against.
     */
    isEqual(other: DocumentReference): boolean;

    /**
     * Attaches a listener for DocumentSnapshot events.
     *
     * NOTE: Although an complete callback can be provided, it will never be called because the snapshot stream is never-ending.
     *
     * Returns an unsubscribe function to stop listening to events.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.firestore().doc('users/alovelace')
     *   .onSnapshot({
     *     error: (e) => console.error(e),
     *     next: (documentSnapshot) => {},
     *   });
     *
     * unsubscribe();
     * ```
     *
     * @param observer A single object containing `next` and `error` callbacks.
     */
    onSnapshot(observer: {
      complete?: () => void;
      error?: (error: Error) => void;
      next?: (snapshot: DocumentSnapshot<T>) => void;
    }): () => void;

    /**
     * Attaches a listener for DocumentSnapshot events with snapshot listener options.
     *
     * NOTE: Although an complete callback can be provided, it will never be called because the snapshot stream is never-ending.
     *
     * Returns an unsubscribe function to stop listening to events.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.firestore().doc('users/alovelace')
     *   .onSnapshot({
     *     includeMetadataChanges: true,
     *   }, {
     *     error: (e) => console.error(e),
     *     next: (documentSnapshot) => {},
     *   });
     *
     * unsubscribe();
     * ```
     *
     * @param options Options controlling the listen behavior.
     * @param observer A single object containing `next` and `error` callbacks.
     */
    onSnapshot(
      options: SnapshotListenOptions,
      observer: {
        complete?: () => void;
        error?: (error: Error) => void;
        next?: (snapshot: DocumentSnapshot<T>) => void;
      },
    ): () => void;

    /**
     * Attaches a listener for DocumentSnapshot events.
     *
     * NOTE: Although an onCompletion callback can be provided, it will never be called because the snapshot stream is never-ending.
     *
     * Returns an unsubscribe function to stop listening to events.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.firestore().doc('users/alovelace')
     *   .onSnapshot(
     *     (documentSnapshot) => {}, // onNext
     *     (error) => console.error(error), // onError
     *   );
     *
     * unsubscribe();
     * ```
     * @param onNext A callback to be called every time a new `DocumentSnapshot` is available.
     * @param onError A callback to be called if the listen fails or is cancelled. No further callbacks will occur.
     * @param onCompletion An optional function which will never be called.
     */
    onSnapshot(
      onNext: (snapshot: DocumentSnapshot<T>) => void,
      onError?: (error: Error) => void,
      onCompletion?: () => void,
    ): () => void;

    /**
     * Attaches a listener for DocumentSnapshot events with snapshot listener options.
     *
     * NOTE: Although an onCompletion callback can be provided, it will never be called because the snapshot stream is never-ending.
     *
     * Returns an unsubscribe function to stop listening to events.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.firestore().doc('users/alovelace')
     *   .onSnapshot(
     *     { includeMetadataChanges: true }, // SnapshotListenerOptions
     *     (documentSnapshot) => {}, // onNext
     *     (error) => console.error(error), // onError
     *   );
     *
     * unsubscribe();
     * ```
     * @param options Options controlling the listen behavior.
     * @param onNext A callback to be called every time a new `DocumentSnapshot` is available.
     * @param onError A callback to be called if the listen fails or is cancelled. No further callbacks will occur.
     * @param onCompletion An optional function which will never be called.
     */
    onSnapshot(
      options: SnapshotListenOptions,
      onNext: (snapshot: DocumentSnapshot<T>) => void,
      onError?: (error: Error) => void,
      onCompletion?: () => void,
    ): () => void;

    /**
     * Writes to the document referred to by this DocumentReference. If the document does not yet
     * exist, it will be created. If you pass SetOptions, the provided data can be merged into an
     * existing document.
     *
     * #### Example
     *
     * ```js
     * const user = firebase.firestore().doc('users/alovelace');
     *
     * // Set new data
     * await user.set({
     *   name: 'Ada Lovelace',
     *   age: 30,
     *   city: 'LON',
     * });
     * ```
     *
     * @param data A map of the fields and values for the document.
     * @param options An object to configure the set behavior.
     */
    set(data: SetValue<T>, options?: SetOptions): Promise<void>;

    /**
     * Updates fields in the document referred to by this `DocumentReference`. The update will fail
     * if applied to a document that does not exist.
     *
     * #### Example
     *
     * ```
     * const user = firebase.firestore().doc('users/alovelace');
     *
     * // Update age but leave other fields untouched
     * await user.update({
     *   age: 31,
     * });
     * ```
     *
     * @param data An object containing the fields and values with which to update the document. Fields can contain dots to reference nested fields within the document.
     */
    update(data: Partial<SetValue<T>>): Promise<void>;

    /**
     * Updates fields in the document referred to by this DocumentReference. The update will fail if
     * applied to a document that does not exist.
     *
     * #### Example
     *
     * ```
     * const user = firebase.firestore().doc('users/alovelace');
     *
     * // Update age & city but leve other fields untouched
     * await user.update('age', 31, 'city', 'SF');
     * ```
     *
     * @param field The first field to update.
     * @param value The first value.
     * @param moreFieldsAndValues Additional key value pairs.
     */
    update(field: keyof T | FieldPath, value: any, ...moreFieldsAndValues: any[]): Promise<void>;
  }

  /**
   * A DocumentSnapshot contains data read from a document in your Firestore database. The data can be extracted with
   * .`data()` or `.get(:field)` to get a specific field.
   *
   * For a DocumentSnapshot that points to a non-existing document, any data access will return 'undefined'.
   * You can use the `exists` property to explicitly verify a document's existence.
   */
  export interface DocumentSnapshot<T extends DocumentData = DocumentData> {
    /**
     * Property of the `DocumentSnapshot` that signals whether or not the data exists. True if the document exists.
     */
    exists: boolean;

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
    ref: DocumentReference<T>;

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
    data(): T | undefined;

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
    get<fieldType extends DocumentFieldType>(fieldPath: keyof T | string | FieldPath): fieldType;

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
   * Since query results contain only existing documents, the exists property will always be true and data() will never return 'undefined'.
   */
  export interface QueryDocumentSnapshot<T extends DocumentData = DocumentData>
    extends DocumentSnapshot<T> {
    /**
     * A QueryDocumentSnapshot is always guaranteed to exist.
     */
    exists: true;

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
    data(): T;
  }

  /**
   * A FieldPath refers to a field in a document. The path may consist of a single field name (referring to a
   * top-level field in the document), or a list of field names (referring to a nested field in the document).
   *
   * Create a FieldPath by providing field names. If more than one field name is provided, the path will point to a nested field in a document.
   *
   * #### Example
   *
   * ```js
   * const user = await firebase.firestore().doc('users/alovelace').get();
   *
   * // Create a new field path
   * const fieldPath = new firebase.firestore.FieldPath('address', 'zip');
   *
   * console.log('Address ZIP Code', user.get(fieldPath));
   * ```
   */
  export class FieldPath {
    /**
     * Returns a special sentinel `FieldPath` to refer to the ID of a document. It can be used in queries to sort or filter by the document ID.
     */
    static documentId(): FieldPath;

    /**
     * Creates a FieldPath from the provided field names. If more than one field name is provided, the path will point to a nested field in a document.
     *
     * #### Example
     *
     * ```js
     * const fieldPath = new firebase.firestore.FieldPath('address', line', 'one');
     * ```
     *
     * @param fieldNames A list of field names.
     */
    constructor(...fieldNames: string[]);

    /**
     * Returns true if this `FieldPath` is equal to the provided one.
     *
     * #### Example
     *
     * ```js
     * const fieldPath1 = new firebase.firestore.FieldPath('address', 'zip');
     * const fieldPath2 = new firebase.firestore.FieldPath('address', line', 'one');
     *
     * // false
     * fieldPath1.isEqual(fieldPath2);
     * ```
     *
     * @param other The `FieldPath` to compare against.
     */
    isEqual(other: FieldPath): boolean;
  }

  /**
   * Sentinel values that can be used when writing document fields with `set()` or `update()`.
   *
   * #### Example
   *
   * ```js
   * const increment = firebase.firestore.FieldValue.increment(1);
   *
   * await firebase.firestore().doc('users/alovelace').update({
   *   age: increment, // increment age by 1
   * });
   * ```
   */
  export class FieldValue {
    /**
     * Returns a special value that can be used with `set()` or `update()` that tells the server to remove the given elements
     * from any array value that already exists on the server. All instances of each element specified will be removed from
     * the array. If the field being modified is not already an array it will be overwritten with an empty array.
     *
     * #### Example
     *
     * ```js
     * const arrayRemove = firebase.firestore.FieldValue.arrayRemove(2, '3');
     *
     * // Removes the values 2 & '3' from the values array on the document
     * await docRef.update({
     *   values: arrayRemove,
     * });
     * ```
     *
     * @param elements The elements to remove from the array.
     */
    static arrayRemove(...elements: any[]): FieldValue;

    /**
     * Returns a special value that can be used with `set()` or `update()` that tells the server to union the given
     * elements with any array value that already exists on the server. Each specified element that doesn't already exist
     * in the array will be added to the end. If the field being modified is not already an array it will be overwritten
     * with an array containing exactly the specified elements.
     *
     * #### Example
     *
     * ```js
     * const arrayUnion = firebase.firestore.FieldValue.arrayUnion(2, '3');
     *
     * // Appends the values 2 & '3' onto the values array on the document
     * await docRef.update({
     *   values: arrayUnion,
     * });
     * ```
     *
     * @param elements The elements to union into the array.
     */
    static arrayUnion(...elements: any[]): FieldValue;

    /**
     * Returns a sentinel for use with update() to mark a field for deletion.
     *
     * #### Example
     *
     * ```js
     * const delete = firebase.firestore.FieldValue.delete();
     *
     * // Deletes the name field on the document
     * await docRef.update({
     *   name: delete,
     * });
     * ```
     */
    static delete(): FieldValue;

    /**
     * Returns a special value that can be used with `set()` or `update()` that tells the server to increment the field's current value by the given value.
     *
     * If either the operand or the current field value uses floating point precision, all arithmetic follows IEEE 754 semantics.
     * If both values are integers, values outside of JavaScript's safe number range (`Number.MIN_SAFE_INTEGER` to `Number.MAX_SAFE_INTEGER`)
     * are also subject to precision loss. Furthermore, once processed by the Firestore backend, all integer operations are
     * capped between -2^63 and 2^63-1.
     *
     * If the current field value is not of type `number`, or if the field does not yet exist, the transformation sets the field to the given value.
     *
     * #### Example
     *
     * ```js
     * const increment = firebase.firestore.FieldValue.increment(1);
     *
     * // Increment the loginCount field by 1 on the document
     * await docRef.update({
     *   loginCount: increment,
     * });
     * ```
     *
     * Please be careful using this operator. It may not be reliable enough for use in circumstances where absolute accuracy is required,
     * as it appears writes to Firestore may sometimes be duplicated in situations not fully understood yet, but possibly correlated with
     * write frequency. See https://github.com/invertase/react-native-firebase/discussions/5914
     *
     * @param n The value to increment by.
     */
    static increment(n: number): FieldValue;

    /**
     * Returns a sentinel used with set() or update() to include a server-generated timestamp in the written data.
     *
     * #### Example
     *
     * ```js
     * const timestamp = firebase.firestore.FieldValue.serverTimestamp();
     *
     * // Set the updatedAt field to the current server time
     * await docRef.update({
     *   updatedAt: timestamp,
     * });
     * ```
     */
    static serverTimestamp(): FieldValue;

    /**
     * Returns true if this `FieldValue` is equal to the provided one.
     *
     * #### Example
     *
     * ```js
     * const increment = firebase.firestore.FieldValue.increment(1);
     * const timestamp = firebase.firestore.FieldValue.serverTimestamp();
     *
     * // false
     * increment.isEqual(timestamp);
     * ```
     *
     * @param other The `FieldValue` to compare against.
     */
    isEqual(other: FieldValue): boolean;
  }

  /**
   * An immutable object representing a geo point in Firestore. The geo point is represented as latitude/longitude pair.
   *
   * Latitude values are in the range of [-90, 90]. Longitude values are in the range of [-180, 180].
   */
  export class GeoPoint {
    /**
     * Creates a new immutable GeoPoint object with the provided latitude and longitude values.
     *
     * #### Example
     *
     * ```js
     * const geoPoint = new firebase.firestore.GeoPoint(60, -40);
     * ```
     *
     * @param latitude The latitude as number between -90 and 90.
     * @param longitude The longitude as number between -180 and 180.
     */
    constructor(latitude: number, longitude: number);

    /**
     * The latitude of this `GeoPoint` instance.
     */
    latitude: number;

    /**
     * The longitude of this `GeoPoint` instance.
     */
    longitude: number;

    /**
     * Returns true if this `GeoPoint` is equal to the provided one.
     *
     * #### Example
     *
     * ```js
     * const geoPoint1 = new firebase.firestore.GeoPoint(60, -40);
     * const geoPoint2 = new firebase.firestore.GeoPoint(60, -20);
     *
     * // false
     * geoPoint1.isEqual(geoPoint2);
     * ```
     *
     * @param other The `GeoPoint` to compare against.
     */
    isEqual(other: GeoPoint): boolean;

    /**
     * Returns a JSON-serializable representation of this GeoPoint.
     */
    toJSON(): { latitude: number; longitude: number };
  }

  /**
   * An options object that configures the behavior of get() calls on DocumentReference and Query.
   * By providing a GetOptions object, these methods can be configured to fetch results only from the
   * server, only from the local cache or attempt to fetch results from the server and fall back to the
   * cache (which is the default).
   */
  export interface GetOptions {
    /**
     * Describes whether we should get from server or cache.
     *
     * Setting to `default` (or not setting at all), causes Firestore to try to retrieve an up-to-date (server-retrieved)
     * snapshot, but fall back to returning cached data if the server can't be reached.
     *
     * Setting to `server` causes Firestore to avoid the cache, generating an error if the server cannot be reached. Note
     * that the cache will still be updated if the server request succeeds. Also note that latency-compensation still
     * takes effect, so any pending write operations will be visible in the returned data (merged into the server-provided data).
     *
     * Setting to `cache` causes Firestore to immediately return a value from the cache, ignoring the server completely
     * (implying that the returned value may be stale with respect to the value on the server.) If there is no data in the
     * cache to satisfy the `get()` call, `DocumentReference.get()` will return an error and `QuerySnapshot.get()` will return an
     * empty `QuerySnapshot` with no documents.
     */
    source: 'default' | 'server' | 'cache';
  }

  /**
   * Represents an aggregation that can be performed by Firestore.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export class AggregateField<T> {
    /** A type string to uniquely identify instances of this class. */
    type = 'AggregateField';
  }

  /**
   * The union of all `AggregateField` types that are supported by Firestore.
   */
  export type AggregateFieldType = AggregateField<number>;

  /**
   * A type whose property values are all `AggregateField` objects.
   */
  export interface AggregateSpec {
    [field: string]: AggregateFieldType;
  }

  /**
   * A type whose keys are taken from an `AggregateSpec`, and whose values are the
   * result of the aggregation performed by the corresponding `AggregateField`
   * from the input `AggregateSpec`.
   */
  export type AggregateSpecData<T extends AggregateSpec> = {
    [P in keyof T]: T[P] extends AggregateField<infer U> ? U : never;
  };

  /**
   * The results of executing an aggregation query.
   */
  export interface AggregateQuerySnapshot<
    AggregateSpecType extends AggregateSpec,
    AppModelType = DocumentData,
    DbModelType extends DocumentData = DocumentData,
  > {
    /**
     * The underlying query over which the aggregations recorded in this
     * `AggregateQuerySnapshot` were performed.
     */
    get query(): Query<AppModelType, DbModelType>;

    /**
     * Returns the results of the aggregations performed over the underlying
     * query.
     *
     * The keys of the returned object will be the same as those of the
     * `AggregateSpec` object specified to the aggregation method, and the values
     * will be the corresponding aggregation result.
     *
     * @returns The results of the aggregations performed over the underlying
     * query.
     */
    data(): AggregateSpecData<AggregateSpecType>;
  }

  /**
   * The results of requesting an aggregated query.
   */
  export interface AggregateQuery<T extends AggregateSpec> {
    /**
     * The underlying query for this instance.
     */
    get query(): Query<unknown>;

    /**
     * Executes the query and returns the results as a AggregateQuerySnapshot.
     *
     *
     * #### Example
     *
     * ```js
     * const querySnapshot = await firebase.firestore()
     *   .collection('users')
     *   .count()
     *   .get();
     * ```
     *
     * @param options An object to configure the get behavior.
     */
    get(): Promise<AggregateQuerySnapshot<T>>;
  }

  /**
   * A Query refers to a `Query` which you can read or listen to. You can also construct refined `Query` objects by
   * adding filters and ordering.
   */
  export interface Query<T extends DocumentData = DocumentData> {
    /**
     * Calculates the number of documents in the result set of the given query, without actually downloading
     * the documents.
     *
     * Using this function to count the documents is efficient because only the final count, not the
     * documents' data, is downloaded. This function can even count the documents if the result set
     * would be prohibitively large to download entirely (e.g. thousands of documents).
     *
     * The result received from the server is presented, unaltered, without considering any local state.
     * That is, documents in the local cache are not taken into consideration, neither are local
     * modifications not yet synchronized with the server. Previously-downloaded results, if any,
     *  are not used: every request using this source necessarily involves a round trip to the server.
     */
    count(): AggregateQuery<{ count: AggregateField<number> }>;

    /**
     * Same as count()
     */
    countFromServer(): AggregateQuery<{ count: AggregateField<number> }>;

    /**
     * Creates and returns a new Query that ends at the provided document (inclusive). The end
     * position is relative to the order of the query. The document must contain all of the
     * fields provided in the orderBy of this query.
     *
     * #### Example
     *
     * ```js
     * const user = await firebase.firestore().doc('users/alovelace').get();
     *
     * // Get all users up to a specific user in order of age
     * const querySnapshot = await firebase.firestore()
     *   .collection('users')
     *   .orderBy('age')
     *   .endAt(user);
     * ```
     *
     * > Cursor snapshot queries have limitations. Please see [Query limitations](/query-limitations) for more information.
     *
     * @param snapshot The snapshot of the document to end at.
     */
    endAt(snapshot: DocumentSnapshot<T>): Query<T>;

    /**
     * Creates and returns a new Query that ends at the provided fields relative to the order of the query.
     * The order of the field values must match the order of the order by clauses of the query.
     *
     * #### Example
     *
     * ```js
     * // Get all users who's age is 30 or less
     * const querySnapshot = await firebase.firestore()
     *   .collection('users')
     *   .orderBy('age')
     *   .endAt(30);
     * ```
     *
     * @param fieldValues The field values to end this query at, in order of the query's order by.
     */
    endAt(...fieldValues: any[]): Query<T>;

    /**
     * Creates and returns a new Query that ends before the provided document (exclusive). The end
     * position is relative to the order of the query. The document must contain all of the fields
     * provided in the orderBy of this query.
     *
     * #### Example
     *
     * ```js
     * const user = await firebase.firestore().doc('users/alovelace').get();
     *
     * // Get all users up to, but not including, a specific user in order of age
     * const querySnapshot = await firebase.firestore()
     *   .collection('users')
     *   .orderBy('age')
     *   .endBefore(user);
     * ```
     *
     * > Cursor snapshot queries have limitations. Please see [Query limitations](/query-limitations) for more information.
     *
     * @param snapshot The snapshot of the document to end before.
     */
    endBefore(snapshot: DocumentSnapshot<T>): Query<T>;

    /**
     * Creates and returns a new Query that ends before the provided fields relative to the order of
     * the query. The order of the field values must match the order of the order by clauses of the query.
     *
     * #### Example
     *
     * ```js
     * // Get all users who's age is 29 or less
     * const querySnapshot = await firebase.firestore()
     *   .collection('users')
     *   .orderBy('age')
     *   .endBefore(30);
     * ```
     *
     * @param fieldValues The field values to end this query before, in order of the query's order by.
     */
    endBefore(...fieldValues: any[]): Query<T>;

    /**
     * Executes the query and returns the results as a QuerySnapshot.
     *
     * Note: By default, get() attempts to provide up-to-date data when possible by waiting for data from the server,
     * but it may return cached data or fail if you are offline and the server cannot be reached. This behavior can be
     * altered via the `GetOptions` parameter.
     *
     * #### Example
     *
     * ```js
     * const querySnapshot = await firebase.firestore()
     *   .collection('users')
     *   .orderBy('age')
     *   .get({
     *     source: 'server',
     *   });
     * ```
     *
     * @param options An object to configure the get behavior.
     */
    get(options?: GetOptions): Promise<QuerySnapshot<T>>;

    /**
     * Returns true if this Query is equal to the provided one.
     *
     * #### Example
     *
     * ```js
     * const query = firebase.firestore()
     *   .collection('users')
     *   .orderBy('age');
     *
     * // false
     * query.isEqual(
     *   firebase.firestore()
     *     .collection('users')
     *     .orderBy('name')
     * );
     * ```
     *
     * @param other The `Query` to compare against.
     */
    isEqual(other: Query): boolean;

    /**
     * Creates and returns a new Query where the results are limited to the specified number of documents.
     *
     * #### Example
     *
     * ```js
     * // Get 10 users in order of age
     * const querySnapshot = firebase.firestore()
     *   .collection('users')
     *   .orderBy('age')
     *   .limit(10)
     *   .get();
     * ```
     *
     * @param limit The maximum number of items to return.
     */
    limit(limit: number): Query<T>;

    /**
     * Creates and returns a new Query where the results are limited to the specified number of documents
     * starting from the last document. The order is dependent on the second parameter for the `orderBy`
     * method. If `desc` is used, the order is reversed. `orderBy` method call is required when calling `limitToLast`.
     *
     * #### Example
     *
     * ```js
     * // Get the last 10 users in reverse order of age
     * const querySnapshot = firebase.firestore()
     *   .collection('users')
     *   .orderBy('age', 'desc')
     *   .limitToLast(10)
     *   .get();
     * ```
     *
     * @param limitToLast The maximum number of items to return.
     */
    limitToLast(limitToLast: number): Query<T>;

    /**
     * Attaches a listener for `QuerySnapshot` events.
     *
     * > Although an `onCompletion` callback can be provided, it will never be called because the snapshot stream is never-ending.
     *
     * Returns an unsubscribe function to stop listening to events.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.firestore().collection('users')
     *   .onSnapshot({
     *     error: (e) => console.error(e),
     *     next: (querySnapshot) => {},
     *   });
     *
     * unsubscribe();
     * ```
     *
     * @param observer A single object containing `next` and `error` callbacks.
     */
    onSnapshot(observer: {
      complete?: () => void;
      error?: (error: Error) => void;
      next?: (snapshot: QuerySnapshot<T>) => void;
    }): () => void;

    /**
     * Attaches a listener for `QuerySnapshot` events with snapshot listener options.
     *
     * > Although an `onCompletion` callback can be provided, it will never be called because the snapshot stream is never-ending.
     *
     * Returns an unsubscribe function to stop listening to events.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.firestore().collection('users')
     *   .onSnapshot({
     *     includeMetadataChanges: true,
     *   }, {
     *     error: (e) => console.error(e),
     *     next: (querySnapshot) => {},
     *   });
     *
     * unsubscribe();
     * ```
     *
     * @param options Options controlling the listen behavior.
     * @param observer A single object containing `next` and `error` callbacks.
     */
    onSnapshot(
      options: SnapshotListenOptions,
      observer: {
        complete?: () => void;
        error?: (error: Error) => void;
        next?: (snapshot: QuerySnapshot<T>) => void;
      },
    ): () => void;

    /**
     * Attaches a listener for `QuerySnapshot` events.
     *
     * > Although an `onCompletion` callback can be provided, it will never be called because the snapshot stream is never-ending.
     *
     * Returns an unsubscribe function to stop listening to events.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.firestore().collection('users')
     *   .onSnapshot(
     *     (querySnapshot) => {}, // onNext
     *     (error) => console.error(error), // onError
     *   );
     *
     * unsubscribe();
     * ```
     * @param onNext A callback to be called every time a new `QuerySnapshot` is available.
     * @param onError A callback to be called if the listen fails or is cancelled. No further callbacks will occur.
     * @param onCompletion An optional function which will never be called.
     */
    onSnapshot(
      onNext: (snapshot: QuerySnapshot<T>) => void,
      onError?: (error: Error) => void,
      onCompletion?: () => void,
    ): () => void;

    /**
     * Attaches a listener for `QuerySnapshot` events with snapshot listener options.
     *
     * NOTE: Although an onCompletion callback can be provided, it will never be called because the snapshot stream is never-ending.
     *
     * Returns an unsubscribe function to stop listening to events.
     *
     * #### Example
     *
     * ```js
     * const unsubscribe = firebase.firestore().collection('users')
     *   .onSnapshot(
     *     { includeMetadataChanges: true }, // SnapshotListenerOptions
     *     (querySnapshot) => {}, // onNext
     *     (error) => console.error(error), // onError
     *   );
     *
     * unsubscribe();
     * ```
     * @param options Options controlling the listen behavior.
     * @param onNext A callback to be called every time a new `QuerySnapshot` is available.
     * @param onError A callback to be called if the listen fails or is cancelled. No further callbacks will occur.
     * @param onCompletion An optional function which will never be called.
     */
    onSnapshot(
      options: SnapshotListenOptions,
      onNext: (snapshot: QuerySnapshot<T>) => void,
      onError?: (error: Error) => void,
      onCompletion?: () => void,
    ): () => void;

    /**
     * Creates and returns a new Query that's additionally sorted by the specified field, optionally in descending order instead of ascending.
     *
     * * #### Example
     *
     * #### Example
     *
     * ```js
     * // Get users in order of age, descending
     * const querySnapshot = firebase.firestore()
     *   .collection('users')
     *   .orderBy('age', 'desc')
     *   .get();
     * ```
     *
     * @param fieldPath The field to sort by. Either a string or FieldPath instance.
     * @param directionStr Optional direction to sort by (`asc` or `desc`). If not specified, order will be ascending.
     */
    orderBy(fieldPath: keyof T | string | FieldPath, directionStr?: 'asc' | 'desc'): Query<T>;

    /**
     * Creates and returns a new Query that starts after the provided document (exclusive). The start
     * position is relative to the order of the query. The document must contain all of the fields
     * provided in the orderBy of this query.
     *
     * #### Example
     *
     * ```js
     * const user = await firebase.firestore().doc('users/alovelace').get();
     *
     * // Get all users up to, but not including, a specific user in order of age
     * const querySnapshot = await firebase.firestore()
     *   .collection('users')
     *   .orderBy('age')
     *   .startAfter(user)
     *   .get();
     * ```
     *
     * > Cursor snapshot queries have limitations. Please see [Query limitations](/query-limitations) for more information.
     *
     * @param snapshot The snapshot of the document to start after.
     */
    startAfter(snapshot: DocumentSnapshot<T>): Query<T>;

    /**
     * Creates and returns a new Query that starts after the provided fields relative to the order of
     * the query. The order of the field values must match the order of the order by clauses of the query.
     *
     * #### Example
     *
     * ```js
     * // Get all users who's age is above 30
     * const querySnapshot = await firebase.firestore()
     *   .collection('users')
     *   .orderBy('age')
     *   .startAfter(30)
     *   .get();
     * ```
     *
     * @param fieldValues The field values to start this query after, in order of the query's order by.
     */
    startAfter(...fieldValues: any[]): Query<T>;

    /**
     * Creates and returns a new Query that starts at the provided document (inclusive). The start
     * position is relative to the order of the query. The document must contain all of the
     * fields provided in the orderBy of this query.
     *
     * #### Example
     *
     * ```js
     * const user = await firebase.firestore().doc('users/alovelace').get();
     *
     * // Get all users up to a specific user in order of age
     * const querySnapshot = await firebase.firestore()
     *   .collection('users')
     *   .orderBy('age')
     *   .startAt(user)
     *   .get();
     * ```
     *
     * > Cursor snapshot queries have limitations. Please see [Query limitations](/query-limitations) for more information.
     *
     * @param snapshot The snapshot of the document to start at.
     */
    startAt(snapshot: DocumentSnapshot<T>): Query<T>;

    /**
     * Creates and returns a new Query that starts at the provided fields relative to the order of the query.
     * The order of the field values must match the order of the order by clauses of the query.
     *
     * #### Example
     *
     * ```js
     * // Get all users who's age is 30 or above
     * const querySnapshot = await firebase.firestore()
     *   .collection('users')
     *   .orderBy('age')
     *   .startAt(30)
     *   .get();
     * ```
     *
     * @param fieldValues The field values to start this query at, in order of the query's order by.
     */
    startAt(...fieldValues: any[]): Query<T>;

    /**
     * Creates and returns a new Query with the additional filter that documents must contain the specified field and
     * the value should satisfy the relation constraint provided.
     *
     * #### Example
     *
     * ```js
     * // Get all users who's age is 30 or above
     * const querySnapshot = await firebase.firestore()
     *   .collection('users')
     *   .where('age', '>=', 30);
     *   .get();
     * ```
     *
     * @param fieldPath The path to compare.
     * @param opStr The operation string (e.g "<", "<=", "==", ">", ">=", "!=", "array-contains", "array-contains-any", "in", "not-in").
     * @param value The comparison value.
     */
    where(fieldPath: keyof T | FieldPath, opStr: WhereFilterOp, value: any): Query<T>;

    /**
     * Creates and returns a new Query with the additional filter that documents must contain the specified field and
     * the value should satisfy the relation constraint provided.
     *
     * #### Example
     *
     * ```js
     * // Get all users who's age is 30 or above
     * const querySnapshot = await firebase.firestore()
     *   .collection('users')
     *   .where(Filter('age', '>=', 30));
     *   .get();
     * ```
     *
     * @param filter The filter to apply to the query.
     */
    where(filter: QueryFilterConstraint): Query<T>;
  }

  /**
   * Filter conditions in a `Query.where()` clause are specified using the strings '<', '<=', '==', '>=', '>', 'array-contains', 'array-contains-any' or 'in'.
   */
  export type WhereFilterOp =
    | '<'
    | '<='
    | '=='
    | '>'
    | '>='
    | '!='
    | 'array-contains'
    | 'array-contains-any'
    | 'in'
    | 'not-in';

  /**
   * A `QuerySnapshot` contains zero or more `QueryDocumentSnapshot` objects representing the results of a query. The documents
   * can be accessed as an array via the `docs` property or enumerated using the `forEach` method. The number of documents
   * can be determined via the `empty` and `size` properties.
   */
  export interface QuerySnapshot<T extends DocumentData = DocumentData> {
    /**
     * An array of all the documents in the `QuerySnapshot`.
     */
    docs: QueryDocumentSnapshot<T>[];

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
    query: Query<T>;

    /**
     * The number of documents in the `QuerySnapshot`.
     */
    size: number;

    /**
     * Returns an array of the documents changes since the last snapshot. If this is the first snapshot, all documents
     * will be in the list as added changes.
     *
     * To include metadata changes, ensure that the `onSnapshot()` method includes metadata changes.
     *
     * #### Example
     *
     * ```js
     * firebase.firestore().collection('users')
     *   .onSnapshot((querySnapshot) => {
     *     console.log('Metadata Changes', querySnapshot.docChanges());
     *   });
     * ```
     *
     * #### Example - With metadata changes
     *
     * ```js
     * firebase.firestore().collection('users')
     *   .onSnapshot({ includeMetadataChanges: true }, (querySnapshot) => {
     *     console.log('Metadata Changes', querySnapshot.docChanges({
     *       includeMetadataChanges: true,
     *     }));
     *   });
     * ```
     *
     * @param options `SnapshotListenOptions` that control whether metadata-only changes (i.e. only `DocumentSnapshot.metadata` changed) should trigger snapshot events.
     */
    docChanges(options?: SnapshotListenOptions): DocumentChange<T>[];

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
      callback: (result: QueryDocumentSnapshot<T>, index: number) => void,
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
   * An options object that configures the behavior of set() calls in `DocumentReference`, `WriteBatch` and `Transaction`.
   * These calls can be configured to perform granular merges instead of overwriting the target documents in their entirety
   * by providing a `SetOptions` with `merge: true`.
   *
   * Using both `merge` and `mergeFields` together will throw an error.
   */
  export interface SetOptions {
    /**
     * Changes the behavior of a `set()` call to only replace the values specified in its data argument.
     * Fields omitted from the `set()` call remain untouched.
     */
    merge?: boolean;

    /**
     * Changes the behavior of `set()` calls to only replace the specified field paths.
     * Any field path that is not specified is ignored and remains untouched.
     */
    mergeFields?: (string | FieldPath)[];
  }

  /**
   * Specifies custom configurations for your Cloud Firestore instance. You must set these before invoking any other methods.
   *
   * Used with `firebase.firestore().settings()`.
   */
  export interface Settings {
    /**
     * Enables or disables local persistent storage.
     */
    persistence?: boolean;

    /**
     * An approximate cache size threshold for the on-disk data. If the cache grows beyond this size, Firestore will start
     * removing data that hasn't been recently used. The size is not a guarantee that the cache will stay below that size,
     * only that if the cache exceeds the given size, cleanup will be attempted.
     *
     * To disable garbage collection and set an unlimited cache size, use `firebase.firestore.CACHE_SIZE_UNLIMITED`.
     */
    cacheSizeBytes?: number;

    /**
     * The hostname to connect to.
     *
     * Note: on android, hosts 'localhost' and '127.0.0.1' are automatically remapped to '10.0.2.2' (the
     * "host" computer IP address for android emulators) to make the standard development experience easy.
     * If you want to use the emulator on a real android device, you will need to specify the actual host
     * computer IP address. Use of this property for emulator connection is deprecated. Use useEmulator instead
     */
    host?: string;

    /**
     * Whether to use SSL when connecting. A true value is incompatible with the firestore emulator.
     */
    ssl?: boolean;

    /**
     * Whether to skip nested properties that are set to undefined during object serialization.
     * If set to true, these properties are skipped and not written to Firestore.
     * If set to false or omitted, the SDK throws an exception when it encounters properties of type undefined.
     */
    ignoreUndefinedProperties?: boolean;

    /**
     * If set, controls the return value for server timestamps that have not yet been set to their final value.
     *
     * By specifying 'estimate', pending server timestamps return an estimate based on the local clock.
     * This estimate will differ from the final value and cause these values to change once the server result becomes available.
     *
     * By specifying 'previous', pending timestamps will be ignored and return their previous value instead.
     *
     * If omitted or set to 'none', null will be returned by default until the server value becomes available.
     *
     */
    serverTimestampBehavior?: 'estimate' | 'previous' | 'none';
  }

  /**
   * An options object that can be passed to `DocumentReference.onSnapshot()`, `Query.onSnapshot()` and `QuerySnapshot.docChanges()`
   * to control which types of changes to include in the result set.
   */
  export interface SnapshotListenOptions {
    /**
     * Include a change even if only the metadata of the query or of a document changed. Default is false.
     */
    includeMetadataChanges: boolean;
  }

  /**
   * Metadata about a snapshot, describing the state of the snapshot.
   */
  export interface SnapshotMetadata {
    /**
     * True if the snapshot includes local writes (`set()` or `update()` calls) that haven't been committed to the backend yet.
     * If your listener has opted into metadata updates (via `SnapshotListenOptions`) you will receive another snapshot with
     * `fromCache` equal to false once the client has received up-to-date data from the backend.
     */
    fromCache: boolean;

    /**
     * True if the snapshot contains the result of local writes (e.g. `set()` or `update()` calls) that have not yet been
     * committed to the backend. If your listener has opted into metadata updates (via `SnapshotListenOptions`) you will
     * receive another snapshot with `hasPendingWrites` equal to false once the writes have been committed to the backend.
     */
    hasPendingWrites: boolean;

    /**
     * Returns true if this `SnapshotMetadata` is equal to the provided one.
     *
     * @param other The `SnapshotMetadata` to compare against.
     */
    isEqual(other: SnapshotMetadata): boolean;
  }

  /**
   * A Timestamp represents a point in time independent of any time zone or calendar, represented as seconds and
   * fractions of seconds at nanosecond resolution in UTC Epoch time.
   *
   * It is encoded using the Proleptic Gregorian Calendar which extends the Gregorian calendar backwards to year one.
   * It is encoded assuming all minutes are 60 seconds long, i.e. leap seconds are "smeared" so that no leap second table
   * is needed for interpretation. Range is from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59.999999999Z.
   */
  export class Timestamp {
    /**
     * Creates a new timestamp from the given JavaScript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date).
     *
     * @param date The date to initialize the `Timestamp` from.
     */
    static fromDate(date: Date): Timestamp;

    /**
     * Creates a new timestamp from the given number of milliseconds.
     *
     * @param milliseconds Number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
     */
    static fromMillis(milliseconds: number): Timestamp;

    /**
     * Creates a new timestamp with the current date, with millisecond precision.
     */
    static now(): Timestamp;

    /**
     * Creates a new timestamp.
     *
     * @param seconds The number of seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive.
     * @param nanoseconds The non-negative fractions of a second at nanosecond resolution. Negative second values with fractions must still have non-negative nanoseconds values that count forward in time. Must be from 0 to 999,999,999 inclusive.
     */
    constructor(seconds: number, nanoseconds: number);

    /**
     * The number of nanoseconds of this `Timestamp`;
     */
    nanoseconds: number;

    /**
     * The number of seconds of this `Timestamp`.
     */
    seconds: number;

    /**
     * Returns true if this `Timestamp` is equal to the provided one.
     *
     * @param other The `Timestamp` to compare against.
     */
    isEqual(other: Timestamp): boolean;

    /**
     * Convert a Timestamp to a JavaScript Date object. This conversion causes a loss of precision since Date objects
     * only support millisecond precision.
     *
     * Returns a JavaScript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) with
     * millseconds precision.
     */
    toDate(): Date;

    /**
     * Convert a Timestamp to a numeric timestamp (in milliseconds since epoch). This operation causes a loss of precision.
     *
     * The point in time corresponding to this timestamp, represented as the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
     */
    toMillis(): number;

    /**
     * Convert a timestamp to a string in format "FirestoreTimestamp(seconds=`seconds`, nanoseconds=`nanoseconds`)",
     * with the `seconds` and `nanoseconds` replaced by the values in the Timestamp object
     */
    toString(): string;

    /**
     * Convert a Timestamp to a JSON object with seconds and nanoseconds members
     */
    toJSON(): { seconds: number; nanoseconds: number };

    /**
     * Converts this object to a primitive string, which allows Timestamp objects to be compared
     * using the `>`, `<=`, `>=` and `>` operators.
     */
    valueOf(): string;
  }

  /**
   * A reference to a transaction. The `Transaction` object passed to a transaction's updateFunction provides the methods to
   * read and write data within the transaction context. See `Firestore.runTransaction()`.
   *
   * A transaction consists of any number of `get()` operations followed by any number of write operations such as `set()`,
   * `update()`, or `delete()`. In the case of a concurrent edit, Cloud Firestore runs the entire transaction again. For example,
   * if a transaction reads documents and another client modifies any of those documents, Cloud Firestore retries the transaction.
   * This feature ensures that the transaction runs on up-to-date and consistent data.
   *
   * Transactions never partially apply writes. All writes execute at the end of a successful transaction.
   *
   * When using transactions, note that:
   *   - Read operations must come before write operations.
   *   - A function calling a transaction (transaction function) might run more than once if a concurrent edit affects a document that the transaction reads.
   *   - Transaction functions should not directly modify application state (return a value from the `updateFunction`).
   *   - Transactions will fail when the client is offline.
   */
  export interface Transaction {
    /**
     * Deletes the document referred to by the provided `DocumentReference`.
     *
     * #### Example
     *
     * ```js
     * const docRef = firebase.firestore().doc('users/alovelace');
     *
     * await firebase.firestore().runTransaction((transaction) => {
     *   return transaction.delete(docRef);
     * });
     * ```
     *
     * @param documentRef A reference to the document to be deleted.
     */
    delete(documentRef: DocumentReference): Transaction;

    /**
     * Reads the document referenced by the provided `DocumentReference`.
     *
     * #### Example
     *
     * ```js
     * const docRef = firebase.firestore().doc('users/alovelace');
     *
     * await firebase.firestore().runTransaction(async (transaction) => {
     *   const snapshot = await transaction.get(docRef);
     *    // use snapshot with transaction (see set() or update())
     *    ...
     * });
     * ```
     *
     * @param documentRef A reference to the document to be read.
     */
    get<T extends DocumentData = DocumentData>(
      documentRef: DocumentReference<T>,
    ): Promise<DocumentSnapshot<T>>;

    /**
     * Writes to the document referred to by the provided `DocumentReference`. If the document does not exist yet,
     * it will be created. If you pass `SetOptions`, the provided data can be merged into the existing document.
     *
     * #### Example
     *
     * ```js
     * const docRef = firebase.firestore().doc('users/alovelace');
     *
     * await firebase.firestore().runTransaction((transaction) => {
     *   const snapshot = await transaction.get(docRef);
     *   const snapshotData = snapshot.data();
     *
     *   return transaction.set(docRef, {
     *     ...data,
     *     age: 30, // new field
     *   });
     * });
     * ```
     *
     * @param documentRef A reference to the document to be set.
     * @param data An object of the fields and values for the document.
     * @param options An object to configure the set behavior.
     */
    set<T extends DocumentData = DocumentData>(
      documentRef: DocumentReference<T>,
      data: T,
      options?: SetOptions,
    ): Transaction;

    /**
     * Updates fields in the document referred to by the provided `DocumentReference`. The update will fail if applied
     * to a document that does not exist.
     *
     * #### Example
     *
     * ```js
     * const docRef = firebase.firestore().doc('users/alovelace');
     *
     * await firebase.firestore().runTransaction((transaction) => {
     *   const snapshot = await transaction.get(docRef);
     *
     *   return transaction.update(docRef, {
     *     age: snapshot.data().age + 1,
     *   });
     * });
     * ```
     *
     * @param documentRef A reference to the document to be updated.
     * @param data An object containing the fields and values with which to update the document. Fields can contain dots to reference nested fields within the document.
     */
    update<T extends DocumentData = DocumentData>(
      documentRef: DocumentReference<T>,
      data: Partial<{ [K in keyof T]: T[K] | FieldValue }>,
    ): Transaction;

    /**
     * Updates fields in the document referred to by the provided DocumentReference. The update will fail if applied to
     * a document that does not exist.
     *
     * Nested fields can be updated by providing dot-separated field path strings or by providing FieldPath objects.
     *
     * #### Example
     *
     * ```js
     * const docRef = firebase.firestore().doc('users/alovelace');
     *
     * await firebase.firestore().runTransaction((transaction) => {
     *   const snapshot = await transaction.get(docRef);
     *
     *   return transaction.update(docRef, 'age', snapshot.data().age + 1);
     * });
     * ```
     *
     * @param documentRef A reference to the document to be updated.
     * @param field The first field to update.
     * @param value The first value.
     * @param moreFieldsAndValues Additional key/value pairs.
     */
    update<T extends DocumentData = DocumentData, K extends keyof T = string>(
      documentRef: DocumentReference<T>,
      field: K | FieldPath,
      value: T[K],
      ...moreFieldsAndValues: any[]
    ): Transaction;
  }

  /**
   * A write batch, used to perform multiple writes as a single atomic unit.
   *
   * A WriteBatch object can be acquired by calling `firestore.batch()`. It provides methods for adding
   * writes to the write batch. None of the writes will be committed (or visible locally) until
   * `WriteBatch.commit()` is called.
   *
   * Unlike transactions, write batches are persisted offline and therefore are preferable when you don't need to
   * condition your writes on read data.
   */
  export interface WriteBatch {
    /**
     * Commits all of the writes in this write batch as a single atomic unit.
     *
     * Returns a Promise resolved once all of the writes in the batch have been successfully written
     * to the backend as an atomic unit. Note that it won't resolve while you're offline.
     *
     * #### Example
     *
     * ```js
     * const batch = firebase.firestore().batch();
     *
     * // Perform batch operations...
     *
     * await batch.commit();
     * ```
     */
    commit(): Promise<void>;

    /**
     * Deletes the document referred to by the provided `DocumentReference`.
     *
     * #### Example
     *
     * ```js
     * const batch = firebase.firestore().batch();
     * const docRef = firebase.firestore().doc('users/alovelace');
     *
     * batch.delete(docRef);
     * ```
     *
     * @param documentRef A reference to the document to be deleted.
     */
    delete(documentRef: DocumentReference): WriteBatch;

    /**
     * Writes to the document referred to by the provided DocumentReference. If the document does
     * not exist yet, it will be created. If you pass SetOptions, the provided data can be merged
     * into the existing document.
     *
     * #### Example
     *
     * ```js
     * const batch = firebase.firestore().batch();
     * const docRef = firebase.firestore().doc('users/dsmith');
     *
     * batch.set(docRef, {
     *   name: 'David Smith',
     *   age: 25,
     * });
     * ```
     *
     * @param documentRef A reference to the document to be set.
     * @param data An object of the fields and values for the document.
     * @param options An object to configure the set behavior.
     */
    set<T extends DocumentData = DocumentData>(
      documentRef: DocumentReference<T>,
      data: T,
      options?: SetOptions,
    ): WriteBatch;

    /**
     * Updates fields in the document referred to by the provided DocumentReference. The update will fail if applied to a document that does not exist.
     *
     * #### Example
     *
     * ```js
     * const batch = firebase.firestore().batch();
     * const docRef = firebase.firestore().doc('users/alovelace');
     *
     * batch.update(docRef, {
     *   city: 'SF',
     * });
     * ```
     *
     * @param documentRef A reference to the document to be updated.
     * @param data An object containing the fields and values with which to update the document. Fields can contain dots to reference nested fields within the document.
     */
    update<T extends DocumentData = DocumentData>(
      documentRef: DocumentReference<T>,
      data: Partial<{ [K in keyof T]: T[K] | FieldValue }>,
    ): WriteBatch;

    /**
     * Updates fields in the document referred to by this DocumentReference. The update will fail if applied to a document that does not exist.
     *
     * Nested fields can be update by providing dot-separated field path strings or by providing FieldPath objects.
     *
     * #### Example
     *
     * ```js
     * const batch = firebase.firestore().batch();
     * const docRef = firebase.firestore().doc('users/alovelace');
     *
     * batch.update(docRef, 'city', 'SF', 'age', 31);
     * ```
     *
     * @param documentRef A reference to the document to be updated.
     * @param field The first field to update.
     * @param value The first value.
     * @param moreFieldAndValues Additional key value pairs.
     */
    update<T extends DocumentData = DocumentData, K extends keyof T = string>(
      documentRef: DocumentReference<T>,
      field: K | FieldPath,
      value: T[K] | FieldValue,
      ...moreFieldAndValues: any[]
    ): WriteBatch;
  }

  /**
   * Returns the PersistentCache Index Manager used by the given Firestore object.
   * The PersistentCacheIndexManager instance, or null if local persistent storage is not in use.
   */
  export interface PersistentCacheIndexManager {
    /**
     * Enables the SDK to create persistent cache indexes automatically for local query
     * execution when the SDK believes cache indexes can help improves performance.
     * This feature is disabled by default.
     */
    enableIndexAutoCreation(): Promise<void>;
    /**
     * Stops creating persistent cache indexes automatically for local query execution.
     * The indexes which have been created by calling `enableIndexAutoCreation()` still take effect.
     */
    disableIndexAutoCreation(): Promise<void>;
    /**
     * Removes all persistent cache indexes. Note this function also deletes indexes
     * generated by `setIndexConfiguration()`, which is deprecated.
     */
    deleteAllIndexes(): Promise<void>;
  }

  /**
   * Represents the state of bundle loading tasks.
   *
   * Both 'Error' and 'Success' are sinking state: task will abort or complete and there will be no more
   * updates after they are reported.
   */
  export type TaskState = 'Error' | 'Running' | 'Success';

  /**
   * Represents a progress update or a final state from loading bundles.
   */
  export interface LoadBundleTaskProgress {
    /**
     * How many bytes have been loaded.
     */
    bytesLoaded: number;

    /**
     * How many documents have been loaded.
     */
    documentsLoaded: number;

    /**
     * Current task state.
     */
    taskState: TaskState;

    /**
     * How many bytes are in the bundle being loaded.
     */
    totalBytes: number;

    /**
     * How many documents are in the bundle being loaded.
     */
    totalDocuments: number;
  }

  /**
   * `firebase.firestore.X`
   */
  export interface Statics {
    /**
     * Returns the `Blob` class.
     */
    Blob: typeof Blob;

    /**
     * Returns the `FieldPath` class.
     */
    FieldPath: typeof FieldPath;

    /**
     * Returns the `FieldValue` class.
     */
    FieldValue: typeof FieldValue;

    /**
     * Returns the `GeoPoint` class.
     */
    GeoPoint: typeof GeoPoint;

    /**
     * Returns the `Timestamp` class.
     */
    Timestamp: typeof Timestamp;

    /**
     * Returns the `Filter` function.
     */
    Filter: typeof Filter;

    /**
     * Used to set the cache size to unlimited when passing to `cacheSizeBytes` in
     * `firebase.firestore().settings()`.
     */
    CACHE_SIZE_UNLIMITED: number;

    /**
     * Sets the verbosity of Cloud Firestore native device logs (debug, error, or silent).
     *
     * - `debug`: the most verbose logging level, primarily for debugging.
     * - `error`: logs only error events.
     * - `silent`: turn off logging.
     *
     * #### Example
     *
     * ```js
     * firebase.firestore.setLogLevel('silent');
     * ```
     *
     * @param logLevel The verbosity you set for activity and error logging.
     */
    setLogLevel(logLevel: 'debug' | 'error' | 'silent'): void;
  }

  /**
   * The Firebase Cloud Firestore service is available for the default app or a given app.
   *
   * #### Example: Get the firestore instance for the **default app**:
   *
   * ```js
   * const firestoreForDefaultApp = firebase.firestore();
   * ```
   *
   * #### Example: Get the firestore instance for a **secondary app**:
   *
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const firestoreForOtherApp = firebase.firestore(otherApp);
   * ```
   *
   */
  export class Module extends FirebaseModule {
    /**
     * Creates a write batch, used for performing multiple writes as a single atomic operation.
     * The maximum number of writes allowed in a single WriteBatch is 500, but note that each usage
     * of `FieldValue.serverTimestamp()`, `FieldValue.arrayUnion()`, `FieldValue.arrayRemove()`, or `FieldValue.increment()`
     * inside a WriteBatch counts as an additional write.
     *
     * #### Example
     *
     * ```js
     * const batch = firebase.firestore().batch();
     * batch.delete(...);
     * ```
     */
    batch(): WriteBatch;

    /**
     * Gets a `CollectionReference` instance that refers to the collection at the specified path.
     *
     * #### Example
     *
     * ```js
     * const collectionReference = firebase.firestore().collection('users');
     * ```
     *
     * @param collectionPath A slash-separated path to a collection.
     */
    collection<T extends DocumentData = DocumentData>(
      collectionPath: string,
    ): CollectionReference<T>;

    /**
     * Creates and returns a new Query that includes all documents in the database that are contained
     * in a collection or subcollection with the given collectionId.
     *
     * #### Example
     *
     * ```js
     * const collectionGroup = firebase.firestore().collectionGroup('orders');
     * ```
     *
     * @param collectionId Identifies the collections to query over. Every collection or subcollection with this ID as the last segment of its path will be included. Cannot contain a slash.
     */
    collectionGroup<T extends DocumentData = DocumentData>(collectionId: string): Query<T>;

    /**
     * Disables network usage for this instance. It can be re-enabled via `enableNetwork()`. While the
     * network is disabled, any snapshot listeners or get() calls will return results from cache, and any
     * write operations will be queued until the network is restored.
     *
     * Returns a promise that is resolved once the network has been disabled.
     *
     * #### Example
     *
     * ```js
     * await firebase.firestore().disableNetwork();
     * ```
     */
    disableNetwork(): Promise<void>;

    /**
     * Gets a `DocumentReference` instance that refers to the document at the specified path.
     *
     * #### Example
     *
     * ```js
     * const documentReference = firebase.firestore().doc('users/alovelace');
     * ```
     *
     * @param documentPath A slash-separated path to a document.
     */
    doc<T extends DocumentData = DocumentData>(documentPath: string): DocumentReference<T>;

    /**
     * Re-enables use of the network for this Firestore instance after a prior call to `disableNetwork()`.
     *
     * #### Example
     *
     * ```js
     * await firebase.firestore().enableNetwork();
     * ```
     */
    enableNetwork(): Promise<void>;

    /**
     * Executes the given `updateFunction` and then attempts to commit the changes applied within the transaction.
     * If any document read within the transaction has changed, Cloud Firestore retries the `updateFunction`.
     * If it fails to commit after 5 attempts, the transaction fails.
     *
     * The maximum number of writes allowed in a single transaction is 500, but note that each usage of
     * `FieldValue.serverTimestamp()`, `FieldValue.arrayUnion()`, `FieldValue.arrayRemove()`, or `FieldValue.increment()`
     * inside a transaction counts as an additional write.
     *
     * #### Example
     *
     * ```js
     * const cityRef = firebase.firestore().doc('cities/SF');
     *
     * await firebase.firestore()
     *   .runTransaction(async (transaction) => {
     *     const snapshot = await transaction.get(cityRef);
     *     await transaction.update(cityRef, {
     *       population: snapshot.data().population + 1,
     *     });
     *   });
     * ```
     */
    runTransaction(updateFunction: (transaction: Transaction) => Promise<any>): Promise<any>;

    /**
     * Specifies custom settings to be used to configure the Firestore instance. Must be set before invoking any other methods.
     *
     * #### Example
     *
     * ```js
     * const settings = {
     *   cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
     * };
     *
     * await firebase.firestore().settings(settings);
     * ```
     *
     * @param settings A `Settings` object.
     */
    settings(settings: Settings): Promise<void>;
    /**
     * Loads a Firestore bundle into the local cache.
     *
     * #### Example
     *
     * ```js
     * const resp = await fetch('/createBundle');
     * const bundleString = await resp.text();
     * await firestore().loadBundle(bundleString);
     * ```
     */
    loadBundle(bundle: string): Promise<LoadBundleTaskProgress>;
    /**
     * Reads a Firestore Query from local cache, identified by the given name.
     *
     * #### Example
     *
     * ```js
     * const query = firestore().namedQuery('latest-stories-query');
     * const storiesSnap = await query.get({ source: 'cache' });
     * ```
     */
    namedQuery<T extends DocumentData = DocumentData>(name: string): Query<T>;
    /**
     * Aimed primarily at clearing up any data cached from running tests. Needs to be executed before any database calls
     * are made.
     *
     * #### Example
     *
     *```js
     * await firebase.firestore().clearPersistence();
     * ```
     */
    clearPersistence(): Promise<void>;
    /**
     * Waits until all currently pending writes for the active user have been acknowledged by the
     * backend.
     *
     * The returned Promise resolves immediately if there are no outstanding writes. Otherwise, the
     * Promise waits for all previously issued writes (including those written in a previous app
     * session), but it does not wait for writes that were added after the method is called. If you
     * want to wait for additional writes, call `waitForPendingWrites()` again.
     *
     * Any outstanding `waitForPendingWrites()` Promises are rejected when the logged-in user changes.
     *
     * #### Example
     *
     *```js
     * await firebase.firestore().waitForPendingWrites();
     * ```
     */
    waitForPendingWrites(): Promise<void>;
    /**
     * Typically called to ensure a new Firestore instance is initialized before calling
     * `firebase.firestore().clearPersistence()`.
     *
     * #### Example
     *
     *```js
     * await firebase.firestore().terminate();
     * ```
     */
    terminate(): Promise<void>;

    /**
     * Modify this Firestore instance to communicate with the Firebase Firestore emulator.
     * This must be called before any other calls to Firebase Firestore to take effect.
     * Do not use with production credentials as emulator traffic is not encrypted.
     *
     * Note: on android, hosts 'localhost' and '127.0.0.1' are automatically remapped to '10.0.2.2' (the
     * "host" computer IP address for android emulators) to make the standard development experience easy.
     * If you want to use the emulator on a real android device, you will need to specify the actual host
     * computer IP address.
     *
     * @param host: emulator host (eg, 'localhost')
     * @param port: emulator port (eg, 8080)
     */
    useEmulator(host: string, port: number): void;

    /**
     * Gets the `PersistentCacheIndexManager` instance used by this Cloud Firestore instance.
     * This is not the same as Cloud Firestore Indexes.
     * Persistent cache indexes are optional indexes that only exist within the SDK to assist in local query execution.
     * Returns `null` if local persistent storage is not in use.
     */
    persistentCacheIndexManager(): PersistentCacheIndexManager | null;
  }

  /**
   * Utility type to allow FieldValue and to allow Date in place of Timestamp objects.
   */
  export type SetValue<T> = T extends Timestamp
    ? Timestamp | Date // allow Date in place of Timestamp
    : T extends object
      ? {
          [P in keyof T]: SetValue<T[P]> | FieldValue; // allow FieldValue in place of values
        }
      : T;
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseFirestoreTypes.Module,
  FirebaseFirestoreTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  firestore: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { firestore(): FirebaseFirestoreTypes.Module };
};

export * from './modular';

export const Filter: FirebaseFirestoreTypes.FilterFunction;

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      firestore: FirebaseModuleWithStaticsAndApp<
        FirebaseFirestoreTypes.Module,
        FirebaseFirestoreTypes.Statics
      >;
    }
    interface FirebaseApp {
      firestore(databaseId?: string): FirebaseFirestoreTypes.Module;
    }
  }
}
