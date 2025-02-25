import { ReactNativeFirebase } from '@react-native-firebase/app';
import { DataSnapshot, FirebaseDatabaseTypes, Query, QueryConstraint } from '..';

import FirebaseApp = ReactNativeFirebase.FirebaseApp;
import Database = FirebaseDatabaseTypes.Module;
import DatabaseReference = FirebaseDatabaseTypes.Reference;

/**
 * Returns the instance of the Realtime Database SDK that is associated with
 * the provided FirebaseApp. Initializes a new instance with
 * default settings if no instance exists or if the existing
 * instance uses a custom database URL.
 *
 * @param {FirebaseApp?} app - The FirebaseApp instance that the returned Realtime Database instance is associated with.
 * @param {string?} url
 * @returns {*}
 */
export declare function getDatabase(app?: FirebaseApp, url?: string): Database;

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
 * @param db: The Database instance
 * @param host: emulator host (eg, 'localhost')
 * @param port: emulator port (eg, 9000)
 */
export declare function connectDatabaseEmulator(
  db: Database,
  host: string,
  port: number,
  // TODO: this exists in both the JS namespaced and modular versions of the SDK.
  //       But the RNFB namespaced version doesn't have it.
  // options?: {
  //   mockUserToken?: EmulatorMockTokenOptions | string;
  // },
): void;

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
 * const db = getDatabase();;
 * await goOnline(db);
 * ```
 */
export declare function goOffline(db: Database): Promise<void>;

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
 * const db = getDatabase();
 * await goOnline(db);
 * ```
 */
export declare function goOnline(db: Database): Promise<void>;

/**
 * Returns a `Reference` representing the location in the Database corresponding to the provided path.
 * If no path is provided, the Reference will point to the root of the Database.
 *
 * #### Example
 *
 * ```js
 * const db = getDatabase();
 *
 * // Get a reference to the root of the Database
 * const rootRef = ref(db);
 *
 * // Get a reference to the /users/ada node
 * const adaRef = ref(db, "users/ada");
 * ```
 *
 * @param db The Database instance.
 * @param path Optional path representing the location the returned `Reference` will point. If not provided, the returned `Reference` will point to the root of the Database.
 */
export declare function ref(db: Database, path?: string): DatabaseReference;

/**
 * Generates a Reference from a database URL.
 * Note domain must be the same.
 * Any query parameters are stripped as per the web SDK.
 *
 * @param db The Database instance.
 * @param url The Firebase URL at which the returned Reference will point.
 * @returns {DatabaseReference}
 */
export declare function refFromURL(db: Database, url: string): DatabaseReference;

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
 * const db = getDatabase();
 * setPersistenceEnabled(db, true);
 *
 * async function bootstrap() {
 *   // Bootstrapping application
 *   const snapshot = await ref(db, "settings").once("value");
 * }
 * ```
 *
 * @param db The Database instance.
 * @param enabled Whether persistence is enabled for the Database service.
 */
export declare function setPersistenceEnabled(db: Database, enabled: boolean): void;

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
 * const db = getDatabase();
 *
 * // Set debug logging if developing
 * if (__DEV__) {
 *   setLoggingEnabled(db, true);
 * }
 * ```
 *
 * @param db The Database instance.
 * @param enabled Whether debug logging is enabled.
 * @returns {void}
 */
export declare function setLoggingEnabled(db: Database, enabled: boolean): void;

/**
 * By default, Firebase Database will use up to 10MB of disk space to cache data. If the cache grows beyond this size,
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
 * const db = getDatabase();
 *
 * setPersistenceEnabled(db, true);
 * setPersistenceCacheSizeBytes(db, 2000000); // 2MB
 *
 * async function bootstrap() {
 *   // Bootstrapping application
 *   const snapshot = await ref(db, 'settings').once("value");
 * }
 * ```
 *
 * @param db The Database instance.
 * @param bytes The new size of the cache in bytes.
 */
export declare function setPersistenceCacheSizeBytes(db: Database, bytes: number): void;

/**
 * Force the use of longPolling instead of websockets. This will be ignored if websocket protocol is used in databaseURL.
 */
export declare function forceLongPolling(): void;

/**
 * Force the use of websockets instead of longPolling.
 */
export declare function forceWebSockets(): void;

/**
 * Returns a placeholder value for auto-populating the current timestamp (time
 * since the Unix epoch, in milliseconds) as determined by the Firebase
 * servers.
 */
export function serverTimestamp(): object;

/**
 * Creates a new QueryConstraint that orders by the key.
 * Sorts the results of a query by their (ascending) key values.
 */
export function orderByKey(): QueryConstraint;

/**
 * Creates a new QueryConstraint that orders by priority.
 * Applications need not use priority but can order collections by ordinary properties
 */
export function orderByPriority(): QueryConstraint;

/**
 * Creates a new QueryConstraint that orders by value.
 * If the children of a query are all scalar values (string, number, or boolean),
 * you can order the results by their (ascending) values.
 */
export function orderByValue(): QueryConstraint;

/**
 * Returns the current Firebase Database server time as a JavaScript Date object.
 */
export function getServerTime(db: Database): Promise<number>;
/**
 * Returns a placeholder value that can be used to atomically increment the
 * current database value by the provided delta.
 *
 * @param delta - the amount to modify the current value atomically.
 * @returns A placeholder value for modifying data atomically server-side.
 */
export function increment(delta: number): object;

/**
 * Logs debugging information to the console.
 *
 * @param enabled
 * @param persistent
 */
export declare function enableLogging(enabled: boolean, persistent?: boolean): any;

/**
 * Creates a new QueryConstraint that if limited to the first specific number of children.
 * The limitToFirst() method is used to set a maximum number of children to be synced for a given callback.
 *
 * @param limit
 */
export declare function limitToFirst(limit: number): QueryConstraint;

/**
 * Creates a new QueryConstraint that is limited to return only the last specified number of children.
 * The limitToLast() method is used to set a maximum number of children to be synced for a given callback.
 *
 * @param limit
 */
export declare function limitToLast(limit: number): QueryConstraint;

/**
 * Gets a Reference for the location at the specified relative path.
 * The relative path can either be a simple child name (for example, "ada")
 * or a deeper slash-separated path (for example, "ada/name/first").
 *
 * @param parent
 * @param path
 */
export declare function child(parent: DatabaseReference, path: string): DatabaseReference;

/**
 * Generates a new child location using a unique key and returns its Reference.
 * This is the most common pattern for adding data to a collection of items.
 *
 * @param parent
 * @param value
 */
export declare function push(parent: DatabaseReference, value?: unknown): DatabaseReference;

/**
 * Creates a new QueryConstraint that orders by the specified child key.
 * Queries can only order by one key at a time. Calling orderByChild() multiple times on the same query is an error.
 * @param path
 */
export declare function orderByChild(path: string): QueryConstraint;

/**
 * Gets the most up-to-date result for this query.
 * 
 * @param query 
 */
export declare function get(query: Query): Promise<DataSnapshot>;

/**
 * Detaches a callback previously attached with the corresponding on*() (onValue, onChildAdded) listener. 
 * Note: This is not the recommended way to remove a listener. 
 * Instead, please use the returned callback function from the respective on* callbacks.
 * 
 * @param query 
 * @param eventType 
 * @param callback 
 */
export declare function off(query: Query, eventType?: EventType, callback?: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown): void;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param cancelCallback 
 */
export declare function onChildAdded(query: Query, callback: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown, cancelCallback?: (error: Error) => unknown): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param options 
 */
export declare function onChildAdded(query: Query, callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown, options: ListenOptions): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param cancelCallback 
 * @param options 
 */
export declare function onChildAdded(query: Query, callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown, cancelCallback: (error: Error) => unknown, options: ListenOptions): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param cancelCallback 
 */
export declare function onChildChanged(query: Query, callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown, cancelCallback?: (error: Error) => unknown): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param options 
 */
export declare function onChildChanged(query: Query, callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown, options: ListenOptions): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param cancelCallback 
 * @param options 
 */
export declare function onChildChanged(query: Query, callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown, cancelCallback: (error: Error) => unknown, options: ListenOptions): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param cancelCallback 
 */
export declare function onChildMoved(query: Query, callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown, cancelCallback?: (error: Error) => unknown): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param options 
 */
export declare function onChildMoved(query: Query, callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown, options: ListenOptions): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param cancelCallback 
 * @param options 
 */
export declare function onChildMoved(query: Query, callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown, cancelCallback: (error: Error) => unknown, options: ListenOptions): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param cancelCallback 
 */
export declare function onChildRemoved(query: Query, callback: (snapshot: DataSnapshot) => unknown, cancelCallback?: (error: Error) => unknown): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param options 
 */
export declare function onChildRemoved(query: Query, callback: (snapshot: DataSnapshot) => unknown, options: ListenOptions): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param cancelCallback 
 * @param options 
 */
export declare function onChildRemoved(query: Query, callback: (snapshot: DataSnapshot) => unknown, cancelCallback: (error: Error) => unknown, options: ListenOptions): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param cancelCallback 
 */
export declare function onValue(query: Query, callback: (snapshot: DataSnapshot) => unknown, cancelCallback?: (error: Error) => unknown): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param options 
 */
export declare function onValue(query: Query, callback: (snapshot: DataSnapshot) => unknown, options: ListenOptions): Unsubscribe;

/**
 * Listens for data changes at a particular location.
 * This is the primary way to read data from a Database.
 * 
 * @param query 
 * @param callback 
 * @param cancelCallback 
 * @param options 
 */
export declare function onValue(query: Query, callback: (snapshot: DataSnapshot) => unknown, cancelCallback: (error: Error) => unknown, options: ListenOptions): Unsubscribe;

/**
 * Creates a new immutable instance of Query that is extended to also include additional query constraints.
 * 
 * @param query 
 * @param queryConstraints 
 */
export declare function query(query: Query, ...queryConstraints: QueryConstraint[]): Query;

/**
 * Returns an OnDisconnect object - see Enabling Offline Capabilities in JavaScript for more information on how to use it.
 * 
 * @param ref 
 */
export declare function onDisconnect(ref: DatabaseReference): OnDisconnect;

/**
 * Removes the data at this Database location.
 * Any data at child locations will also be deleted.
 * @param ref 
 */
export declare function remove(ref: DatabaseReference): Promise<void>;

/**
 * Atomically modifies the data at this location.
 * Atomically modify the data at this location. 
 * Unlike a normal set(), which just overwrites the data regardless of its previous value, 
 * runTransaction() is used to modify the existing value to a new value, ensuring there are no 
 * conflicts with other clients writing to the same location at the same time.
 * 
 * @param ref 
 * @param transactionUpdate 
 * @param options 
 */
export declare function runTransaction(ref: DatabaseReference, transactionUpdate: (currentData: any) => unknown, options?: TransactionOptions): Promise<TransactionResult>;

/**
 * Writes data to this Database location.
 * This will overwrite any data at this location and all child locations.
 * @param ref 
 * @param value 
 */
export declare function set(ref: DatabaseReference, value: unknown): Promise<void>;

/**
 * 
 * Sets a priority for the data at this Database location.
 * @param ref 
 * @param priority 
 */
export declare function setPriority(ref: DatabaseReference, priority: string | number | null): Promise<void>;

/**
 * Writes data the Database location. Like set() but also specifies the priority for that data.
 * 
 * @param ref 
 * @param value 
 * @param priority 
 */
export declare function setWithPriority(ref: DatabaseReference, value: unknown, priority: string | number | null): Promise<void>;

/**
 * Writes multiple values to the Database at once.
 * The values argument contains multiple property-value pairs that will be written to the Database together. 
 * Each child property can either be a simple property (for example, "name") or a relative path 
 * (for example, "name/first") from the current location to the data to update.
 * 
 * @param ref 
 * @param values 
 */
export declare function update(ref: DatabaseReference, values: object): Promise<void>;

/**
 * Creates a QueryConstraint with the specified ending point.
 * Using startAt(), startAfter(), endBefore(), endAt() and equalTo() allows you to choose arbitrary 
 * starting and ending points for your queries.
 * 
 * @param value 
 * @param key 
 */
export declare function endAt(value: number | string | boolean | null, key?: string): QueryConstraint;

/**
 * Creates a QueryConstraint with the specified ending point (exclusive).
 * 
 * @param value 
 * @param key 
 */
export declare function endBefore(value: number | string | boolean | null, key?: string): QueryConstraint;

/**
 * Creates a QueryConstraint that includes children that match the specified value.
 * 
 * @param value 
 * @param key 
 */
export declare function equalTo(value: number | string | boolean | null, key?: string): QueryConstraint;

/**
 * Creates a QueryConstraint with the specified starting point (exclusive).
 * 
 * @param value 
 * @param key 
 */
export declare function startAfter(value: number | string | boolean | null, key?: string): QueryConstraint;

/**
 * Creates a QueryConstraint with the specified starting point.
 * 
 * @param value 
 * @param key 
 */
export declare function startAt(value?: number | string | boolean | null, key?: string): QueryConstraint;

export * from './query';
export * from './transaction';
