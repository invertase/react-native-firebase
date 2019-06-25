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

import {
  ReactNativeFirebaseModule,
  ReactNativeFirebaseNamespace,
  ReactNativeFirebaseModuleAndStatics,
} from '@react-native-firebase/app-types';

/**
 * Firebase Cloud Firestore package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `firestore` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/firestore';
 *
 * // firebase.firestore().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `firestore` package:
 *
 * ```js
 * import firestore from '@react-native-firebase/firestore';
 *
 * // firestore().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
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
export namespace Firestore {
  export interface WriteBatch {}

  export interface CollectionReference extends Query {
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
     * TODO Example
     *
     * @param data An Object containing the data for the new document.
     */
    add(data: { [key]: value }): Promise<DocumentReference>;

    /**
     * Get a DocumentReference for the document within the collection at the specified path. If no
     * path is specified, an automatically-generated unique ID will be used for the returned DocumentReference.
     *
     * TODO Example
     *
     * @param documentPath A slash-separated path to a document.
     */
    doc(documentPath?: string): DocumentReference;
  }

  export interface Query {}

  export interface DocumentReference {
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
    parent: CollectionReference;

    /**
     * A string representing the path of the referenced document (relative to the root of the database).
     */
    path: string;

    /**
     * Gets a `CollectionReference` instance that refers to the collection at the specified path.
     *
     * TODO Example
     *
     * @param collectionPath A slash-separated path to a collection.
     */
    collection(collectionPath: string): CollectionReference;

    /**
     * Deletes the document referred to by this DocumentReference.
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
     * TODO Example
     *
     * @param options An object to configure the get behavior.
     */
    get(options?: GetOptions): Promise<DocumentSnapshot>;

    /**
     * Returns true if this DocumentReference is equal to the provided one.
     *
     * @param other The `DocumentReference` to compare against.
     */
    isEqual(other: DocumentReference): boolean;

    /**
     * TODO multiple signatures
     */
    onSnapshot(): Function;

    /**
     * Writes to the document referred to by this DocumentReference. If the document does not yet
     * exist, it will be created. If you pass SetOptions, the provided data can be merged into an
     * existing document.
     *
     * TODO example
     *
     * @param data A map of the fields and values for the document.
     * @param options An object to configure the set behavior.
     */
    set(data: { [key]: value }, options?: SetOptions): Promise<void>;

    /**
     * Updates fields in the document referred to by this `DocumentReference`. The update will fail
     * if applied to a document that does not exist.
     *
     * TODO example
     *
     * @param data An object containing the fields and values with which to update the document. Fields can contain dots to reference nested fields within the document.
     */
    update(data: { [key]: value }): Promise<void>;

    /**
     * Updates fields in the document referred to by this DocumentReference. The update will fail if
     * applied to a document that does not exist.
     *
     * TODO example: update('foo', 'bar', 'bar', 123)...
     *
     * @param field The first field to update.
     * @param value The first value.
     * @param moreFieldsAndValues Additional key value pairs.
     */
    update(field: string | FieldPath, value: any, ...moreFieldsAndValues: any[]): Promise<void>;
  }

  export interface DocumentSnapshot {}

  export interface DocumentData {}

  export interface GetOptions {}

  export interface SetOptions {}

  export interface Settings {}

  export interface FieldPath {}

  export interface FieldValue {}

  export interface Statics {}

  /**
   * The Firebase Cloud Firestore service is available for the default app or a given app.
   *
   * #### Example 1
   *
   * Get the firestore instance for the **default app**:
   *
   * ```js
   * const firestoreForDefaultApp = firebase.firestore();
   * ```
   *
   * #### Example 2
   *
   * Get the firestore instance for a **secondary app**:
   *
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const firestoreForOtherApp = firebase.firestore(otherApp);
   * ```
   *
   */
  export class Module extends ReactNativeFirebaseModule {
    batch(): WriteBatch;
    collection(collectionPath: string): CollectionReference;
    collectionGroup(collectionId: string): Query;
    disableNetwork(): Promise<void>;
    doc(documentPath: string): DocumentReference;
    enableNetwork(): Promise<void>;
    runTransaction(): Promise<void>; // TODO
    settings(settings: Settings): Promise<void>; // TODO promise or not?
  }
}

declare module '@react-native-firebase/firestore' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/firestore';
   * firebase.firestore().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const FirestoreDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Firestore.Module,
    Firestore.Statics
  >;
  /**
   * @example
   * ```js
   * import firestore from '@react-native-firebase/firestore';
   * firestore().X(...);
   * ```
   */
  export default FirestoreDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * Firestore
     */
    firestore: ReactNativeFirebaseModuleAndStatics<Firestore.Module, Firestore.Statics>;
  }

  interface FirebaseApp {
    /**
     * Firestore
     */
    firestore(): Firestore.Module;
  }
}
