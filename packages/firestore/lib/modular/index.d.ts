import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseFirestoreTypes } from '../index';

import FirebaseApp = ReactNativeFirebase.FirebaseApp;
import Firestore = FirebaseFirestoreTypes.Module;
import CollectionReference = FirebaseFirestoreTypes.CollectionReference;
import DocumentReference = FirebaseFirestoreTypes.DocumentReference;
import DocumentData = FirebaseFirestoreTypes.DocumentData;
import Query = FirebaseFirestoreTypes.Query;
import FieldValue = FirebaseFirestoreTypes.FieldValue;

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
 * provided {@link @firebase/app#FirebaseApp}. If no instance exists, initializes a new
 * instance with default settings.
 *
 * @param app - The {@link @firebase/app#FirebaseApp} instance that the returned {@link Firestore}
 * instance is associated with.
 * @returns The {@link Firestore} instance of the provided app.
 */
export function getFirestore(app: FirebaseApp): Firestore;

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
