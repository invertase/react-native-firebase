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
export namespace FirebaseDatabaseTypes {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

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
    // eslint-disable-next-line @typescript-eslint/ban-types
    TIMESTAMP: object;

    /**
     * Returns a placeholder value that can be used to atomically increment the current database value by the provided delta.
     *
     * #### Example
     *
     * ```js
     * firebase.database().ref('posts/123').update({
     *   likes: firebase.database.ServerValue.increment(1),
     * });
     * ```
     *
     * @param delta The amount to modify the current value atomically.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    increment(delta: number): object;
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

  export interface TransactionResult {
    committed: boolean;
    snapshot: DataSnapshot;
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
     * The last part of the Reference's path.
     * For example, "ada" is the key for https://<DATABASE_NAME>.firebaseio.com/users/ada.
     * The key of a root Reference is null.
     */
    key: string | null;

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
    set(value: any, onComplete?: (error: Error | null) => void): Promise<void>;

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
    update(
      values: { [key: string]: any },
      onComplete?: (error: Error | null) => void,
    ): Promise<void>;

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
    setPriority(
      priority: string | number | null,
      onComplete?: (error: Error | null) => void,
    ): Promise<void>;

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
      onComplete?: (error: Error | null) => void,
    ): Promise<void>;

    /**
     * Removes the data at this Database location.
     *
     * Any data at child locations will also be deleted.
     *
     * The effect of the remove will be visible immediately and the corresponding event 'value' will be triggered.
     * Synchronization of the remove to the Firebase servers will also be started, and the returned Promise will
     * resolve when complete. If provided, the onComplete callback will be called asynchronously after synchronization
     * has finished.
     *
     * #### Example
     *
     * ```js
     * await firebase.database().ref('users/ada/name')
     *  .remove(() => {
     *    console.log('Operation Complete');
     *  });
     * ```
     *
     * @param onComplete Callback called when write to server is complete. Contains the parameters (Error | null).
     */
    remove(onComplete?: (error: Error | null) => void): Promise<void>;

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
     * @param transactionUpdate A developer-supplied function which will be passed the current data stored at this location (as a JavaScript object). The function should return the new value it would like written (as a JavaScript object). If undefined is returned (i.e. you return with no result) the transaction will be aborted and the data at this location will not be modified.
     * @param onComplete A callback function that will be called when the transaction completes. The callback is passed three arguments: a possibly-null Error, a boolean indicating whether the transaction was committed, and a DataSnapshot indicating the final result. If the transaction failed abnormally, the first argument will be an Error object indicating the failure cause. If the transaction finished normally, but no data was committed because no data was returned from transactionUpdate, then second argument will be false. If the transaction completed and committed data to Firebase, the second argument will be true. Regardless, the third argument will be a DataSnapshot containing the resulting data in this location.
     * @param applyLocally By default, events are raised each time the transaction update function runs. So if it is run multiple times, you may see intermediate states. You can set this to false to suppress these intermediate states and instead wait until the transaction has completed before events are raised.
     */
    transaction(
      // eslint-disable-next-line @typescript-eslint/ban-types
      transactionUpdate: (currentData: any) => any | undefined,
      onComplete?: (error: Error | null, committed: boolean, finalResult: DataSnapshot) => void,
      applyLocally?: boolean,
    ): Promise<TransactionResult>;

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
     * ```js
     * const newUserRef = firebase.database().ref('users').push();
     * console.log('New record key:', newUserRef.key);
     * await newUserRef.set({
     *   first: 'Ada',
     *   last: 'Lovelace',
     * });
     * ```
     *
     * @param value Optional value to be written at the generated location.
     * @param onComplete Callback called when write to server is complete.
     */
    push(value?: any, onComplete?: () => void): ThenableReference;

    /**
     * Returns an {@link database.OnDisconnect} instance.
     *
     * #### Example
     *
     * ```js
     * const userDisconnectRef = firebase.database().ref('users/ada/isOnline').onDisconnect();
     * // When going offline
     * await userDisconnectRef.update(false);
     * ```
     */
    onDisconnect(): OnDisconnect;
  }

  export type ThenableReference = Reference;

  /**
   * A Query sorts and filters the data at a Database location so only a subset of the child data
   * is included. This can be used to order a collection of data by some attribute (for example,
   * height of dinosaurs) as well as to restrict a large list of items (for example, chat messages)
   * down to a number suitable for synchronizing to the client. Queries are created by chaining
   * together one or more of the filter methods defined here.
   *
   * Just as with a `Reference`, you can receive data from a Query by using the on() method. You will
   * only receive events and `DataSnapshot`s for the subset of the data that matches your query.
   */
  export interface Query {
    /**
     * Returns a Reference to the Query's location.
     */
    ref: Reference;

    /**
     * Creates a Query with the specified ending point.
     *
     * Using `startAt()`, `endAt()`, and `equalTo()` allows you to choose arbitrary starting and
     * ending points for your queries.
     *
     * The ending point is inclusive, so children with exactly the specified value will be included
     * in the query. The optional key argument can be used to further limit the range of the query.
     * If it is specified, then children that have exactly the specified value must also have a key
     * name less than or equal to the specified key.
     *
     * You can read more about endAt() in [Filtering data](https://firebase.google.com/docs/database/web/lists-of-data?authuser=0#filtering_data).
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.database().ref('users');
     * const snapshot = await ref.orderByKey().endAt('Ada Lovelace').once('value');
     * ```
     *
     * @param value The value to end at. The argument type depends on which `orderBy*()` function was used in this query. Specify a value that matches the `orderBy*()` type. When used in combination with `orderByKey()`, the value must be a string.
     * @param key The child key to end at, among the children with the previously specified priority. This argument is only allowed if ordering by child, value, or priority.
     */
    endAt(value: number | string | boolean | null, key?: string): Query;

    /**
     * Creates a Query with the specified ending point.
     *
     * Using `startAt()`, `endAt()`, and `equalTo()` allows you to choose arbitrary starting and
     * ending points for your queries.
     *
     * The optional key argument can be used to further limit the range of the query. If it is
     * specified, then children that have exactly the specified value must also have exactly the
     * specified key as their key name. This can be used to filter result sets with many matches for the same value.
     *
     * You can read more about equalTo() in [Filtering data](https://firebase.google.com/docs/database/web/lists-of-data?authuser=0#filtering_data).
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.database().ref('users');
     * const snapshot = await ref.orderByChild('age').equalTo(30).once('value');
     * ```
     *
     * @param value The value to match for. The argument type depends on which `orderBy*()` function was used in this query. Specify a value that matches the `orderBy*()` type. When used in combination with `orderByKey()`, the value must be a string.
     * @param key The child key to start at, among the children with the previously specified priority. This argument is only allowed if ordering by child, value, or priority.
     */
    equalTo(value: number | string | boolean | null, key?: string): Query;

    /**
     * Returns whether or not the current and provided queries represent the same location, have the same query parameters.
     *
     * Two Reference objects are equivalent if they represent the same location and are from the same instance of
     * {@link app}.  Equivalent queries share the same sort order, limits, and starting and ending points.
     *
     * #### Example
     *
     * ```js
     * const ref1 = firebase.database().ref('users').orderByKey().endAt('Ada Lovelace');
     * const ref2 = firebase.database().ref('users').orderByKey();
     *
     * console.log(ref1.isEqual(ref2)); // false
     * ```
     *
     * #### Example
     *
     * ```js
     * const ref1 = firebase.database().ref('users').orderByKey().endAt('Ada Lovelace');
     * const ref2 = firebase.database().ref('users').endAt('Ada Lovelace').orderByKey();
     *
     * console.log(ref1.isEqual(ref2)); // true
     * ```
     *
     * @param other The query to compare against.
     */
    isEqual(other: Query): boolean;

    /**
     * Generates a new `Query` limited to the first specific number of children.
     *
     * The `limitToFirst()` method is used to set a maximum number of children to be synced for a
     * given callback. If we set a limit of 100, we will initially only receive up to 100 `child_added`
     * events. If we have fewer than 100 messages stored in our Database, a child_added event will
     * fire for each message. However, if we have over 100 messages, we will only receive a `child_added`
     * event for the first 100 ordered messages. As items change, we will receive `child_removed` events
     * for each item that drops out of the active list so that the total number stays at 100.
     *
     * You can read more about `limitToFirst()` in [Filtering data](https://firebase.google.com/docs/database/web/lists-of-data?authuser=0#filtering_data).
     *
     * #### Example
     *
     * ```js
     * const snapshot = firebase.database().ref('users').orderByKey().limitToFirst(2).once('value');
     * console.log(snapshot.numChildren()); // 2
     * ```
     *
     * @param limit The maximum number of nodes to include in this query.
     */
    limitToFirst(limit: number): Query;

    /**
     * Generates a new `Query` object limited to the last specific number of children.
     *
     * The `limitToLast()` method is used to set a maximum number of children to be synced for a given
     * callback. If we set a limit of 100, we will initially only receive up to 100 `child_added` events.
     * If we have fewer than 100 messages stored in our Database, a `child_added` event will fire for
     * each message. However, if we have over 100 messages, we will only receive a `child_added` event
     * for the last 100 ordered messages. As items change, we will receive `child_removed` events for
     * each item that drops out of the active list so that the total number stays at 100.
     *
     * You can read more about `limitToLast()` in [Filtering data](https://firebase.google.com/docs/database/web/lists-of-data?authuser=0#filtering_data).
     *
     * #### Example
     *
     * ```js
     * const snapshot = firebase.database().ref('users').orderByKey().limitToLast(2).once('value');
     * console.log(snapshot.numChildren()); // 2
     * ```
     *
     * @param limit The maximum number of nodes to include in this query.
     */
    limitToLast(limit: number): Query;

    /**
     * Detaches a callback previously attached with `on()`.
     *
     * Detach a callback previously attached with `on()`. Note that if `on()` was called multiple times
     * with the same eventType and callback, the callback will be called multiple times for each
     * event, and `off()` must be called multiple times to remove the callback. Calling `off()` on a parent
     * listener will not automatically remove listeners registered on child nodes, `off()` must also be
     * called on any child listeners to remove the callback.
     *
     * If a callback is not specified, all callbacks for the specified eventType will be removed.
     * Similarly, if no eventType is specified, all callbacks for the `Reference` will be removed.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.database().ref('settings');
     * const onValueChange = function(snapshot) { ... };
     * const onChildAdded = function(snapshot) { ... };
     *
     * ref.on('value', onValueChange);
     * ref.child('meta-data').on('child_added', onChildAdded);
     * // Sometime later...
     * ref.off('value', onValueChange);
     * ref.child('meta-data').off('child_added', onChildAdded);
     * ```
     *
     * @param eventType One of the following strings: "value", "child_added", "child_changed", "child_removed", or "child_moved." If omitted, all callbacks for the Reference will be removed.
     * @param callback The callback function that was passed to `on()` or `undefined` to remove all callbacks.
     * @param context The context that was passed to `on()`.
     */
    off(
      eventType?: EventType,
      callback?: (a: DataSnapshot, b?: string | null) => void,
      context?: Record<string, any>,
    ): void;

    /**
     * Listens for data changes at a particular location.
     *
     * This is the primary way to read data from a Database. Your callback will be triggered for the
     * initial data and again whenever the data changes. Use `off()` to stop receiving updates..
     *
     * **value** event
     *
     * This event will trigger once with the initial data stored at this location, and then trigger
     * again each time the data changes. The `DataSnapshot` passed to the callback will be for the location
     * at which on() was called. It won't trigger until the entire contents has been synchronized.
     * If the location has no data, it will be triggered with an empty `DataSnapshot`
     * (`val()` will return `null`).
     *
     * **child_added** event
     *
     * This event will be triggered once for each initial child at this location, and it will be
     * triggered again every time a new child is added. The `DataSnapshot` passed into the callback
     * will reflect the data for the relevant child. For ordering purposes, it is passed a second argument
     * which is a string containing the key of the previous sibling child by sort order, or `null` if
     * it is the first child.
     *
     * **child_removed** event
     *
     * This event will be triggered once every time a child is removed. The `DataSnapshot` passed into
     * the callback will be the old data for the child that was removed. A child will get removed when either:
     * - a client explicitly calls `remove()` on that child or one of its ancestors
     * - a client calls `set(null)` on that child or one of its ancestors
     * - that child has all of its children removed
     * - there is a query in effect which now filters out the child (because it's sort order changed or the max limit was hit)
     *
     * **child_changed** event
     *
     * This event will be triggered when the data stored in a child (or any of its descendants) changes.
     * Note that a single `child_changed` event may represent multiple changes to the child. The
     * `DataSnapshot` passed to the callback will contain the new child contents. For ordering purposes,
     * the callback is also passed a second argument which is a string containing the key of the previous
     * sibling child by sort order, or `null` if it is the first child.
     *
     * **child_moved** event
     *
     * This event will be triggered when a child's sort order changes such that its position relative
     * to its siblings changes. The `DataSnapshot` passed to the callback will be for the data of the child
     * that has moved. It is also passed a second argument which is a string containing the key of the
     * previous sibling child by sort order, or `null` if it is the first child.
     *
     * @param eventType One of the following strings: "value", "child_added", "child_changed", "child_removed", or "child_moved."
     * @param callback A callback that fires when the specified event occurs. The callback will be passed a DataSnapshot. For ordering purposes, "child_added", "child_changed", and "child_moved" will also be passed a string containing the key of the previous child, by sort order, or `null` if it is the first child.
     * @param cancelCallbackOrContext An optional callback that will be notified if your event subscription is ever canceled because your client does not have permission to read this data (or it had permission but has now lost it). This callback will be passed an `Error` object indicating why the failure occurred.
     * @param context If provided, this object will be used as `this` when calling your callback(s).
     *
     */
    on(
      eventType: EventType,
      callback: (data: DataSnapshot, previousChildKey?: string | null) => void,
      cancelCallbackOrContext?: ((a: Error) => void) | Record<string, any> | null,
      context?: Record<string, any> | null,
    ): (a: DataSnapshot | null, b?: string | null) => void;

    /**
     * Listens for exactly one event of the specified event type, and then stops listening.
     *
     * This is equivalent to calling `on()`, and then calling `off()` inside the callback function. See `on()` for details on the event types.
     *
     * #### Example
     *
     * ```js
     * // Promise
     * const snapshot = await firebase.database().ref('users').once('value');
     * // Callback
     * firebase.database().ref('users).once('value', (snapshot) => {
     *   console.log(snapshot.val());
     * });
     * ```
     *
     * @param eventType One of the following strings: "value", "child_added", "child_changed", "child_removed", or "child_moved."
     * @param successCallback A callback that fires when the specified event occurs. The callback will be passed a DataSnapshot. For ordering purposes, "child_added", "child_changed", and "child_moved" will also be passed a string containing the key of the previous child by sort order, or `null` if it is the first child.
       @param failureCallbackContext An optional callback that will be notified if your client does not have permission to read the data. This callback will be passed an Error object indicating why the failure occurred.
     */

    once(
      eventType: EventType,
      successCallback?: (a: DataSnapshot, b?: string | null) => any,
      failureCallbackContext?: ((a: Error) => void) | Record<string, any> | null,
    ): Promise<DataSnapshot>;

    /**
     * Generates a new `Query` object ordered by the specified child key.
     *
     * Queries can only order by one key at a time. Calling `orderByChild()` multiple times on the same query is an error.
     *
     * Firebase queries allow you to order your data by any child key on the fly. However, if you know in advance what
     * your indexes will be, you can define them via the [.indexOn](https://firebase.google.com/docs/database/security/indexing-data?authuser=0)
     * rule in your Security Rules for better performance.
     *
     * You can read more about orderByChild() in [Sort data](https://firebase.google.com/docs/database/web/lists-of-data?authuser=0#sort_data).
     *
     * #### Example
     *
     * ```js
     * const snapshot = await firebase.database().ref('users').orderByChild('age').once('value');
     * snapshot.forEach((snapshot) => {
     *  console.log('Users age:', snapshot.val().age);
     * });
     * ```
     *
     * @param path The child path node to order by.
     */
    orderByChild(path: string): Query;

    /**
     * Generates a new `Query` object ordered by key.
     *
     * Sorts the results of a query by their (ascending) key values.
     *
     * You can read more about `orderByKey()` in [Sort data](https://firebase.google.com/docs/database/web/lists-of-data?authuser=0#sort_data).
     *
     * #### Example
     *
     * ```js
     * const snapshot = await firebase.database().ref('users').orderByKey().once('value');
     * snapshot.forEach((snapshot) => {
     *  console.log('User:', snapshot.val());
     * });
     * ```
     */
    orderByKey(): Query;

    /**
     * Generates a new Query object ordered by priority.
     *
     * Applications need not use priority but can order collections by ordinary properties
     * (see [Sort data](https://firebase.google.com/docs/database/web/lists-of-data?authuser=0#sort_data)
     * for alternatives to priority).
     */
    orderByPriority(): Query;

    /**
     * Generates a new `Query` object ordered by value.
     *
     * If the children of a query are all scalar values (string, number, or boolean), you can order
     * the results by their (ascending) values.
     *
     * You can read more about `orderByValue()` in [Sort data](https://firebase.google.com/docs/database/web/lists-of-data?authuser=0#sort_data).
     *
     * #### Example
     *
     * ```js
     * await firebase.database().ref('scores').orderByValue().once('value');
     * ```
     */
    orderByValue(): Query;

    /**
     * Creates a `Query` with the specified starting point.
     *
     * Using `startAt()`, `endAt()`, and `equalTo()` allows you to choose arbitrary starting and
     * ending points for your queries.
     *
     * The starting point is inclusive, so children with exactly the specified value will be included
     * in the query. The optional key argument can be used to further limit the range of the query.
     * If it is specified, then children that have exactly the specified value must also have a key
     * name greater than or equal to the specified key.
     *
     * You can read more about `startAt()` in [Filtering data](https://firebase.google.com/docs/database/web/lists-of-data?authuser=0#filtering_data).
     *
     * #### Example
     *
     * ```js
     * await firebase.database().ref('users').orderByChild('age').startAt(21).once('value');
     * ```
     *
     * @param value The value to start at. The argument type depends on which `orderBy*()` function was used in this query. Specify a value that matches the `orderBy*()` type. When used in combination with `orderByKey()`, the value must be a string.
     * @param key The child key to start at. This argument is only allowed if ordering by child, value, or priority.
     */
    startAt(value: number | string | boolean | null, key?: string): Query;

    /**
     * Returns a JSON-serializable representation of this object.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    toJSON(): object;

    /**
     * Gets the absolute URL for this location.
     *
     * The `toString()` method returns a URL that is ready to be put into a browser, curl command, or
     * a `firebase.database().refFromURL()` call. Since all of those expect the URL to be url-encoded,
     * `toString()` returns an encoded URL.
     *
     * Append '.json' to the returned URL when typed into a browser to download JSON-formatted data.
     * If the location is secured (that is, not publicly readable), you will get a permission-denied error.
     *
     * #### Example
     *
     * ```js
     * const ref1 = firebase.database().ref();
     * const ref2 = firebase.database().ref('users').orderByValue();
     *
     * ref1.toString(); // https://sample-app.firebaseio.com/
     * ref2.toString(); // https://sample-app.firebaseio.com/users
     * ```
     */
    toString(): string;

    /**
     * By calling `keepSynced(true)` on a location, the data for that location will automatically
     * be downloaded and kept in sync, even when no listeners are attached for that location.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.database().ref('users');
     * await ref.keepSynced(true);
     * ```
     *
     * @param bool  Pass `true` to keep this location synchronized, pass `false` to stop synchronization.
     */
    keepSynced(bool: boolean): Promise<void>;
  }

  /**
   * The `onDisconnect` class allows you to write or clear data when your client disconnects from the Database server.
   * These updates occur whether your client disconnects cleanly or not, so you can rely on them to clean up data
   * even if a connection is dropped or a client crashes.
   *
   * The onDisconnect class is most commonly used to manage presence in applications where it is
   * useful to detect how many clients are connected and when other clients disconnect.
   *
   * To avoid problems when a connection is dropped before the requests can be transferred to the Database
   * server, these functions should be called before writing any data.
   *
   * Note that `onDisconnect` operations are only triggered once. If you want an operation to occur each time a
   * disconnect occurs, you'll need to re-establish the `onDisconnect` operations each time you reconnect.
   */
  export interface OnDisconnect {
    /**
     * Cancels all previously queued `onDisconnect()` set or update events for this location and all children.
     *
     * If a write has been queued for this location via a `set()` or `update()` at a parent location,
     * the write at this location will be canceled, though writes to sibling locations will still occur.
     *
     * #### Example
     *
     * ```js
     * const ref = firebase.database().ref('onlineState');
     * await ref.onDisconnect().set(false);
     * // Sometime later...
     * await ref.onDisconnect().cancel();
     * ```
     *
     * @param onComplete An optional callback function that will be called when synchronization to the server has completed. The callback will be passed a single parameter: null for success, or an Error object indicating a failure.
     */
    cancel(onComplete?: (error: Error | null) => void): Promise<void>;

    /**
     * Ensures the data at this location is deleted when the client is disconnected (due to closing the browser, navigating to a new page, or network issues).
     *
     * @param onComplete An optional callback function that will be called when synchronization to the server has completed. The callback will be passed a single parameter: null for success, or an Error object indicating a failure.
     */
    remove(onComplete?: (error: Error | null) => void): Promise<void>;

    /**
     * Ensures the data at this location is set to the specified value when the client is disconnected
     * (due to closing the app, navigating to a new view, or network issues).
     *
     * `set()` is especially useful for implementing "presence" systems, where a value should be changed
     * or cleared when a user disconnects so that they appear "offline" to other users.
     *
     * Note that `onDisconnect` operations are only triggered once. If you want an operation to occur each time a
     * disconnect occurs, you'll need to re-establish the `onDisconnect` operations each time.
     *
     * #### Example
     *
     * ```js
     * var ref = firebase.database().ref('users/ada/status');
     * await ref.onDisconnect().set('I disconnected!');
     * ```
     *
     * @param value The value to be written to this location on disconnect (can be an object, array, string, number, boolean, or null).
     * @param onComplete An optional callback function that will be called when synchronization to the Database server has completed. The callback will be passed a single parameter: null for success, or an Error object indicating a failure.
     */
    set(value: any, onComplete?: (error: Error | null) => void): Promise<void>;

    /**
     * Ensures the data at this location is set to the specified value and priority when the client is disconnected (due to closing the browser, navigating to a new page, or network issues).
     *
     * @param value The value to set.
     * @param priority The priority to set
     * @param onComplete An optional callback function that will be called when synchronization to the Database server has completed. The callback will be passed a single parameter: null for success, or an Error object indicating a failure.
     */
    setWithPriority(
      value: any,
      priority: string | number | null,
      onComplete?: (error: Error | null) => void,
    ): Promise<void>;

    /**
     * Writes multiple values at this location when the client is disconnected (due to closing the browser, navigating to a new page, or network issues).
     *
     * The `values` argument contains multiple property-value pairs that will be written to the Database together.
     * Each child property can either be a simple property (for example, "name") or a relative path (for example,
     * "name/first") from the current location to the data to update.
     *
     * As opposed to the `set()` method, `update()` can be use to selectively update only the referenced
     * properties at the current location (instead of replacing all the child properties at the current location).
     *
     * #### Example
     *
     * ```js
     * var ref = firebase.database().ref("users/ada");
     * ref.update({
     *   onlineState: true,
     *   status: "I'm online."
     * });
     * ref.onDisconnect().update({
     *   onlineState: false,
     *   status: "I'm offline."
     * });
     * ```
     *
     * @param values Object containing multiple values.
     * @param onComplete An optional callback function that will be called when synchronization to the server has completed. The callback will be passed a single parameter: null for success, or an Error object indicating a failure.
     */
    update(
      values: { [key: string]: any },
      onComplete?: (error: Error | null) => void,
    ): Promise<void>;
  }

  export type EventType =
    | 'value'
    | 'child_added'
    | 'child_changed'
    | 'child_moved'
    | 'child_removed';

  /**
   * A `DataSnapshot` contains data from a Database location.
   *
   * Any time you read data from the Database, you receive the data as a `DataSnapshot`. A `DataSnapshot`
   * is passed to the event callbacks you attach with `on()` or `once()`. You can extract the contents
   * of the snapshot as a JavaScript object by calling the val() method. Alternatively, you can traverse
   * into the snapshot by calling `child()` to return child snapshots (which you could then call `val()` on).
   */
  export interface DataSnapshot {
    /**
     * The key (last part of the path) of the location of this `DataSnapshot`.
     *
     * The last token in a Database location is considered its key. For example, "ada" is the key
     * for the /users/ada/ node. Accessing the key on any `DataSnapshot` will return the key for the
     * location that generated it. However, accessing the key on the root URL of a Database will return `null`.
     */
    key: string | null;

    /**
     * The Reference for the location that generated this `DataSnapshot`.
     */
    ref: Reference;

    /**
     * Gets another `DataSnapshot` for the location at the specified relative path.
     *
     * Passing a relative path to the `child()` method of a DataSnapshot returns another `DataSnapshot`
     * for the location at the specified relative path. The relative path can either be a simple child
     * name (for example, "ada") or a deeper, slash-separated path (for example, "ada/name/first").
     * If the child location has no data, an empty `DataSnapshot` (that is, a `DataSnapshot` whose value
     * is `null`) is returned.
     *
     * #### Example
     *
     * ```js
     * const snapshot = await firebase.database().ref('users/ada').once('value');
     * snapshot.child('name').val(); // {first:"Ada",last:"Lovelace"}
     * snapshot.child('name/first').val(); // "Ada"
     * snapshot.child('name/foo').val(); // null
     * ```
     *
     * @param path A relative path to the location of child data.
     */
    child(path: string): DataSnapshot;

    /**
     * Returns true if this `DataSnapshot` contains any data. It is slightly more efficient than using snapshot.val() !== null.
     *
     * #### Example
     *
     * ```js
     * const snapshot = await firebase.database().ref('users/ada').once('value');
     * snapshot.exists(); // true
     * snapshot.child('name/foo').exists(); // false
     * ```
     */
    exists(): boolean;

    /**
     * Exports the entire contents of the DataSnapshot as a JavaScript object.
     *
     * The `exportVal()` method is similar to val(), except priority information is included (if available),
     * making it suitable for backing up your data.
     *
     * #### Example
     *
     * ```js
     * const snapshot = await firebase.database().ref('users/ada').once('value');
     * const data = snapshot.exportVal();
     * console.log(data['.value']); // { ... }
     * console.log(data['.priority']); // null
     * ```
     */
    exportVal(): any;

    /**
     * Enumerates the top-level children in the `DataSnapshot`.
     *
     * Because of the way JavaScript objects work, the ordering of data in the JavaScript object
     * returned by `val()` is not guaranteed to match the ordering on the server nor the ordering
     * of `child_added` events. That is where `forEach()` comes in handy. It guarantees the children of
     * a DataSnapshot will be iterated in their query order.
     *
     * If no explicit `orderBy*()` method is used, results are returned ordered by key (unless priorities are used, in which case, results are returned by priority).
     *
     * @param action A function that will be called for each child DataSnapshot. The callback can return true to cancel further enumeration.
     */
    forEach(action: (child: DataSnapshot) => true | undefined): boolean;

    /**
     * Gets the priority value of the data in this DataSnapshot.
     */
    getPriority(): string | number | null;

    /**
     * Returns true if the specified child path has (non-null) data.
     *
     * #### Example
     *
     * ```js
     * const snapshot = await firebase.database().ref('users/ada').once('value');
     * console.log(snapshot.hasChild('name')); // true
     * console.log(snapshot.hasChild('foo')); // false
     * ```
     *
     * @param path A relative path to the location of a potential child.
     */
    hasChild(path: string): boolean;

    /**
     * Returns whether or not the `DataSnapshot` has any non-null child properties.
     *
     * You can use `hasChildren()` to determine if a `DataSnapshot` has any children. If it does, you
     * can enumerate them using `forEach()`. If it doesn't, then either this snapshot contains a primitive
     * value (which can be retrieved with `val()`) or it is empty (in which case, `val()` will return null).
     *
     * #### Example
     *
     * ```js
     * const snapshot = await firebase.database().ref('users').once('value');
     * console.log(snapshot.hasChildren()); // true
     * ```
     */
    hasChildren(): boolean;

    /**
     * Returns the number of child properties of this DataSnapshot.
     */
    numChildren(): number;

    /**
     * Returns a JSON-serializable representation of this object.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    toJSON(): object | null;

    /**
     * Extracts a JavaScript value from a `DataSnapshot`.
     *
     * Depending on the data in a DataSnapshot, the `val()` method may return a scalar type (string,
     * number, or boolean), an array, or an object. It may also return null, indicating that the
     * `DataSnapshot` is empty (contains no data).
     *
     * #### Example
     *
     * ```js
     * const snapshot = await firebase.database().ref('users/ada/last').once('value');
     * snapshot.val(); // "Lovelace"
     * ```
     */
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
  export class Module extends FirebaseModule {
    /**
     * Returns the current Firebase Database server time as a JavaScript Date object.
     */
    getServerTime(): Date;

    /**
     * Returns a `Reference` representing the location in the Database corresponding to the provided path.
     * If no path is provided, the Reference will point to the root of the Database.
     *
     * #### Example
     *
     * ```js
     * // Get a reference to the root of the Database
     * const rootRef = firebase.database().ref();
     *
     * // Get a reference to the /users/ada node
     * const adaRef = firebase.database().ref("users/ada");
     * ```
     *
     * @param path Optional path representing the location the returned `Reference` will point. If not provided, the returned `Reference` will point to the root of the Database.
     */
    ref(path?: string): Reference;

    /**
     * Returns a `Reference` representing the location in the Database corresponding to the provided Firebase URL.
     *
     * An exception is thrown if the URL is not a valid Firebase Database URL or it has a different domain than the current Database instance.
     *
     * Note that all query parameters (orderBy, limitToLast, etc.) are ignored and are not applied to the returned Reference.
     *
     * #### Example
     *
     * ```js
     * // Get a reference to the root of the Database
     * const rootRef = firebase.database().ref("https://<DATABASE_NAME>.firebaseio.com");
     * ```
     *
     * @param url The Firebase URL at which the returned Reference will point.
     */
    refFromURL(url: string): Reference;

    /**
     * Reconnects to the server and synchronizes the offline Database state with the server state.
     *
     * This method should be used after disabling the active connection with `goOffline()`. Once
     * reconnected, the client will transmit the proper data and fire the appropriate events so that
     * your client "catches up" automatically.
     *
     * #### Example
     *
     * ```js
     * await firebase.database().goOnline();
     * ```
     */
    goOnline(): Promise<void>;

    /**
     * Disconnects from the server (all Database operations will be completed offline).
     *
     * The client automatically maintains a persistent connection to the Database server, which
     * will remain active indefinitely and reconnect when disconnected. However, the `goOffline()` and
     * `goOnline()` methods may be used to control the client connection in cases where a persistent
     * connection is undesirable.
     *
     * While offline, the client will no longer receive data updates from the Database. However,
     * all Database operations performed locally will continue to immediately fire events, allowing
     * your application to continue behaving normally. Additionally, each operation performed locally
     * will automatically be queued and retried upon reconnection to the Database server.
     *
     * To reconnect to the Database and begin receiving remote events, see `goOnline()`.
     *
     * #### Example
     *
     * ```js
     * await firebase.database().goOnline();
     * ```
     */
    goOffline(): Promise<void>;

    /**
     * Sets whether persistence is enabled for all database calls for the current app
     * instance.
     *
     * > Ensure this is called before any database calls are performed, otherwise
     * persistence will only come into effect when the app is next started.
     *
     * #### Example
     *
     * ```js
     * firebase.database().setPersistenceEnabled(true);
     *
     * async function bootstrap() {
     *   // Bootstrapping application
     *   const snapshot = await firebase.database().ref('settings').once('value');
     * }
     * ```
     *
     * @param enabled Whether persistence is enabled for the Database service.
     */
    setPersistenceEnabled(enabled: boolean): void;

    /**
     * Sets the native logging level for the database module. By default,
     * only warnings and errors are logged natively. Setting this to true will log all
     * database events.
     *
     * > Ensure logging is disabled for production apps, as excessive logging can cause performance issues.
     *
     * #### Example
     *
     * ```js
     * // Set debug logging if developing
     * if (__DEV__) {
     *   firebase.database().setLoggingEnabled(true);
     * }
     * ```
     *
     * @param enabled Whether debug logging is enabled.
     */
    setLoggingEnabled(enabled: boolean): void;

    /**
     * By default Firebase Database will use up to 10MB of disk space to cache data. If the cache grows beyond this size,
     * Firebase Database will start removing data that hasn't been recently used. If you find that your application
     * caches too little or too much data, call this method to change the cache size. This method must be called before
     * creating your first Database reference and only needs to be called once per application.
     *
     * Note that the specified cache size is only an approximation and the size on disk may temporarily exceed it at times.
     * Cache sizes smaller than 1 MB or greater than 100 MB are not supported.
     *
     * #### Example
     *
     * ```js
     * firebase.database().setPersistenceEnabled(true);
     * firebase.database().setPersistenceCacheSizeBytes(2000000); // 2MB
     *
     * async function bootstrap() {
     *   // Bootstrapping application
     *   const snapshot = await firebase.database().ref('settings').once('value');
     * }
     * ```
     *
     * @param bytes The new size of the cache in bytes.
     */
    setPersistenceCacheSizeBytes(bytes: number): void;

    /**
     * Modify this Database instance to communicate with the Firebase Database emulator.
     * This must be called synchronously immediately following the first call to firebase.database().
     * Do not use with production credentials as emulator traffic is not encrypted.
     *
     * Note: on android, hosts 'localhost' and '127.0.0.1' are automatically remapped to '10.0.2.2' (the
     * "host" computer IP address for android emulators) to make the standard development experience easy.
     * If you want to use the emulator on a real android device, you will need to specify the actual host
     * computer IP address.
     *
     * @param host: emulator host (eg, 'localhost')
     * @param port: emulator port (eg, 9000)
     */
    useEmulator(host: string, port: number): void;
  }
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseDatabaseTypes.Module,
  FirebaseDatabaseTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  database: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { database(): FirebaseDatabaseTypes.Module };
};

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      database: FirebaseModuleWithStaticsAndApp<
        FirebaseDatabaseTypes.Module,
        FirebaseDatabaseTypes.Statics
      >;
    }

    interface FirebaseApp {
      database(databaseUrl?: string): FirebaseDatabaseTypes.Module;
    }
  }
}
