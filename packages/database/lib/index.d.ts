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
 * Firebase Database package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `database` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/database';
 *
 * // firebase.database().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `database` package:
 *
 * ```js
 * import database from '@react-native-firebase/database';
 *
 * // database().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/database';
 *
 * // firebase.database().X
 * ```
 *
 * @firebase database
 */
export namespace Database {
  /**
   * The ServerValue interface provides access to Firebase server values.
   */
  export interface ServerValue {
    /**
     * A placeholder value for auto-populating the current timestamp (time since the Unix epoch,
     * in milliseconds) as determined by the Firebase servers.
     *
     * #### Example
     *
     * ```js
     * firebase.database().ref('sessions').push({
     *   startedAt: firebase.database.ServerValue.TIMESTAMP,
     * });
     * ```
     */
    TIMESTAMP: object;
  }

  /**
   * Realtime Database statics.
   *
   * #### Example
   *
   * ```js
   * firebase.database;
   * ```
   */
  export interface Statics {
    /**
     * Returns server specific values, such as the server timestamp.
     *
     * #### Example
     *
     * ```js
     * firebase.database.ServerValue;
     * ```
     */
    ServerValue: ServerValue;
  }

  /**
   * A Reference represents a specific location in your Database and can be used for reading or
   * writing data to that Database location.
   *
   * You can reference the root or child location in your Database by calling `firebase.database().ref()`
   * or `firebase.database().ref("child/path")`.
   */
  export interface Reference extends Query {
    /**
     * The parent location of a Reference. The parent of a root Reference is `null`.
     *
     * #### Example
     *
     * ```js
     * firebase.database().ref().parent; // null
     * firebase.database().ref('users/dave').parent; // 'users' reference
     * ```
     */
    parent: Reference | null;

    /**
     * The root Reference of the Database.
     *
     * #### Example
     *
     * ```js
     * firebase.database().ref().root; // '/' reference path
     * firebase.database().ref('users/ada').root; // '/' reference
     * ```
     */
    root: Reference;

    /**
     * Gets a Reference for the location at the specified relative path.
     *
     * The relative path can either be a simple child name (for example, "ada") or a deeper
     * slash-separated path (for example, "ada/name/first").
     *
     * #### Example
     *
     * ```js
     * const usersRef = firebase.database().ref('users');
     * const adaRef = usersRef.child('ada/name/first'); // childRef path is 'users/ada/name/first'
     * ```
     *
     * @param path A relative path from this location to the desired child location.
     */
    child(path: string): Reference;

    /**
     * Writes data to this Database location.
     *
     * This will overwrite any data at this location and all child locations.
     *
     * The effect of the write will be visible immediately, and the corresponding events
     * ("value", "child_added", etc.) will be triggered. Synchronization of the data to the
     * Firebase servers will also be started, and the returned Promise will resolve when
     * complete. If provided, the `onComplete` callback will be called asynchronously after
     * synchronization has finished.
     *
     * Passing `null` for the new value is equivalent to calling `remove();` namely, all data at
     * this location and all child locations will be deleted.
     *
     * `set()` will remove any priority stored at this location, so if priority is meant to be
     * preserved, you need to use `setWithPriority()` instead.
     *
     * Note that modifying data with set() will cancel any pending transactions at that location,
     * so extreme care should be taken if mixing set() and transaction() to modify the same data.
     *
     * A single set() will generate a single "value" event at the location where the set() was performed.
     *
     * #### Example - Setting values
     *
     * ```js
     * const ref = firebase.database().ref('users');
     *
     * // Set a single node value
     * await ref.child('ada/name/first').set('Ada');
     * await ref.child('ada/name/last').set('Lovelace');
     *
     * // Set an object value in a single call
     * await ref.child('ada/name').set({
     *   first: 'Ada',
     *   last: 'Lovelace',
     * });
     * ```
     *
     * #### Example - On complete listener
     *
     * ```js
     * const ref = firebase.database().ref('users');
     *
     * await ref.child('ada/first/name').set('Ada', (error) => {
     *   if (error) console.error(error);
     * });
     * ```
     *
     * @param value The value to be written (string, number, boolean, object, array, or null).
     * @param onComplete Callback called when write to server is complete. Contains the parameters (Error | null).
     */
    set(value: any, onComplete?: Function): Promise<any>;

    /**
     * Writes multiple values to the Database at once.
     *
     * The `values` argument contains multiple property-value pairs that will be written to the Database
     * together. Each child property can either be a simple property (for example, "name") or a
     * relative path (for example, "name/first") from the current location to the data to update.
     *
     * As opposed to the `set()` method, `update()` can be use to selectively update only the referenced
     * properties at the current location (instead of replacing all the child properties at the
     * current location).
     *
     * The effect of the write will be visible immediately, and the corresponding events ('value',
     * 'child_added', etc.) will be triggered. Synchronization of the data to the Firebase servers
     * will also be started, and the returned Promise will resolve when complete. If provided, the
     * `onComplete` callback will be called asynchronously after synchronization has finished.
     *
     * A single update() will generate a single "value" event at the location where the update()
     * was performed, regardless of how many children were modified.
     *
     * Note that modifying data with update() will cancel any pending transactions at that location,
     * so extreme care should be taken if mixing update() and transaction() to modify the same data.
     *
     * Passing `null` to `update()` will remove the data at this location.
     *
     * #### Example
     *
     * Modify the 'first' and 'last' properties, but leave other values unchanged at this location.
     *
     * ```js
     * await firebase.database().ref('users/ada/name').update({
     *   first: 'Ada',
     *   last: 'Lovelace',
     * })
     * ```
     *
     * @param values Object containing multiple values.
     * @param onComplete Callback called when write to server is complete. Contains the parameters (Error | null).
     */
    update(values: { [key]: value }, onComplete?: Function): Promise<any>;

    /**
     * Sets a priority for the data at this Database location. Setting null removes any priority at this location.
     *
     * See {@link database.Query#orderByPriority} to learn how to use priority values in your query.
     *
     * #### Example
     *
     * ```js
     * await firebase.database().ref('users/ada').setPriority(1, (error) => {
     *   if (error) console.error(error);
     * });
     * ```
     *
     * @param priority The priority value.
     * @param onComplete Callback called when write to server is complete. Contains the parameters (Error | null).
     */
    setPriority(priority: string | number | null, onComplete?: Function): Promise<any>;

    /**
     * Writes data the Database location. Like `set()` but also specifies the priority for that data.
     *
     * #### Example
     *
     * ```js
     * await firebase.database().ref('users/ada/name')
     *  .setWithPriority({
     *    first: 'Ada',
     *    last: 'Lovelace',
     *  }, 1, (error) => {
     *    if (error) console.error(error);
     *  });
     * ```
     *
     * @param newVal The new value to set.
     * @param newPriority The new priority to set.
     * @param onComplete Callback called when write to server is complete. Contains the parameters (Error | null).
     */
    setWithPriority(
      newVal: any,
      newPriority: string | number | null,
      onComplete?: Function,
    ): Promise<any>;

    /**
     * Atomically modifies the data at this location.
     *
     * Atomically modify the data at this location. Unlike a normal `set()`, which just overwrites
     * the data regardless of its previous value, `transaction()` is used to modify the existing
     * value to a new value, ensuring there are no conflicts with other clients writing to the same
     * location at the same time.
     *
     * To accomplish this, you pass `transaction()` an update function which is used to transform the
     * current value into a new value. If another client writes to the location before your new
     * value is successfully written, your update function will be called again with the new
     * current value, and the write will be retried. This will happen repeatedly until your write
     * succeeds without conflict or you abort the transaction by not returning a value from your
     * update function.
     *
     * Note: Modifying data with `set()` will cancel any pending transactions at that location, so
     * extreme care should be taken if mixing `set()` and `transaction()` to update the same data.
     *
     * Note: When using transactions with Security and Firebase Rules in place, be aware that a
     * client needs `.read` access in addition to `.write` access in order to perform a transaction.
     * This is because the client-side nature of transactions requires the client to read the data
     * in order to transactionally update it.
     *
     * #### Example
     *
     * ```js
     * const userRef = firebase.database().ref('users/ada/profileViews);
     *
     * userRef.transaction((currentViews) => {
     *   if (currentViews === null) return 1;
     *   return currentViews + 1;
     * });
     * ```
     *
     * @param transactionUpdate A developer-supplied function which will be passed the current data stored at this location (as a JavaScript object). The function should return the new value it would like written (as a JavaScript object). If undefined is returned (i.e. you return with no arguments) the transaction will be aborted and the data at this location will not be modified.
     * @param onComplete A callback function that will be called when the transaction completes. The callback is passed three arguments: a possibly-null Error, a boolean indicating whether the transaction was committed, and a DataSnapshot indicating the final result. If the transaction failed abnormally, the first argument will be an Error object indicating the failure cause. If the transaction finished normally, but no data was committed because no data was returned from transactionUpdate, then second argument will be false. If the transaction completed and committed data to Firebase, the second argument will be true. Regardless, the third argument will be a DataSnapshot containing the resulting data in this location.
     * @param applyLocally By default, events are raised each time the transaction update function runs. So if it is run multiple times, you may see intermediate states. You can set this to false to suppress these intermediate states and instead wait until the transaction has completed before events are raised.
     */
    transaction(
      transactionUpdate: Function,
      onComplete?: Function,
      applyLocally?: boolean,
    ): Promise<any>;

    /**
     * Generates a new child location using a unique key and returns its `Reference`.
     *
     * This is the most common pattern for adding data to a collection of items.
     *
     * If you provide a value to `push()`, the value will be written to the generated location.
     * If you don't pass a value, nothing will be written to the Database and the child will
     * remain empty (but you can use the `Reference` elsewhere).
     *
     * The unique key generated by push() are ordered by the current time, so the resulting list
     * of items will be chronologically sorted. The keys are also designed to be unguessable
     * (they contain 72 random bits of entropy).
     *
     * #### Example
     *
     * // TODO
     *
     * @param value Optional value to be written at the generated location.
     * @param onComplete Callback called when write to server is complete.
     */
    push(value?: any, onComplete?: Function): ThenableReference;

    /**
     * Returns an {@link database.OnDisconnect} instance.
     *
     * #### Example
     *
     * ```js
     * const userDisconnectRef = firebase.database().ref('users/ada/isOnline).onDisconnect();
     * // When going offline
     * await userDisconnectRef.update(false);
     * ```
     */
    onDisconnect(): OnDisconnect;
  }

  /**
   * TODO
   */
  export interface ThenableReference extends Reference {}

  export interface Query {
    key: string | null;

    ref: Reference;

    endAt(value: number | string | boolean | null, key?: string): Query;

    equalTo(value: number | string | boolean | null, key?: string): Query;

    isEqual(other: Query): boolean;

    limitToFirst(limit: number): Query;

    limitToLast(limit: number): Query;

    off(eventType?: EventType, callback?: Function): void; // TODO context?

    on(eventType?: EventType, callback?: Function): Function; // TODO context?

    once(eventType: EventType, successCallback?: Function): Promise<DataSnapshot>; // TODO

    orderByChild(path: string): Query;

    orderByKey(): Query;

    orderByPriority(): Query;

    orderByValue(): Query;

    startAt(value: number | string | boolean | null, key?: string): Query;

    toJSON(): object;

    toString(): string;

    keepSynced(bool: boolean): Promise<void>;
  }

  export interface OnDisconnect {
    cancel(onComplete?: Function): Promise<any>;

    remove(onComplete?: Function): Promise<any>;

    set(value: any, onComplete?: Function): Promise<any>;

    setWithPriority(
      value: any,
      priority: string | number | null,
      onComplete?: Function,
    ): Promise<any>;

    update(values: { [key]: value }, onComplete?: Function): Promise<any>;
  }

  export type EventType =
    | 'value'
    | 'child_added'
    | 'child_changed'
    | 'child_moved'
    | 'child_removed';

  export interface DataSnapshot {
    key: string | null;

    ref: Reference;

    child(path: string): DataSnapshot;

    exists(): boolean;

    exportVal(): any;

    forEach(action: Function): boolean;

    getPriority(): string | number | null;

    hasChild(path: string): boolean;

    hasChildren(): boolean;

    numChildren: number;

    toJSON(): object | null;

    val(): any;
  }

  /**
   *
   * The Firebase Database service is available for the default app or a given app.
   *
   * #### Example 1
   *
   * Get the database instance for the **default app**:
   *
   * ```js
   * const databaseForDefaultApp = firebase.database();
   * ```
   *
   * #### Example 2
   *
   * Get the database instance for a **secondary app**:
   *
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const databaseForOtherApp = firebase.database(otherApp);
   * ```
   *
   */
  export interface Module extends ReactNativeFirebaseModule {
    ref(path?: string): Reference;

    refFromURL(url: string): Reference;
  }
}

declare module '@react-native-firebase/database' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';
  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;
  export const firebase = FirebaseNamespaceExport;
  const DatabaseDefaultExport: ReactNativeFirebaseModuleAndStatics<
    Database.Module,
    Database.Statics
  >;
  export default DatabaseDefaultExport;
}

declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    database: ReactNativeFirebaseModuleAndStatics<Database.Module, Database.Statics>;
  }

  interface FirebaseApp {
    database(): Database.Module;
  }
}
