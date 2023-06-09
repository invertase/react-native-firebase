import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseDatabaseTypes } from '..';

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
 * Returns a placeholder value that can be used to atomically increment the
 * current database value by the provided delta.
 *
 * @param delta - the amount to modify the current value atomically.
 * @returns A placeholder value for modifying data atomically server-side.
 */
export function increment(delta: number): object;
