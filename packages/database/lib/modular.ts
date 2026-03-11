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

import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type { FirebaseApp } from '@react-native-firebase/app';
import type { Database, Reference } from './types/database';
import type { DatabaseInternal } from './types/internal';
import DatabaseStatics from './DatabaseStatics';

const { ServerValue } = DatabaseStatics;

type WithModularDeprecationArg<F> = F extends (...args: infer P) => infer R
  ? (...args: [...P, typeof MODULAR_DEPRECATION_ARG]) => R
  : never;

/**
 * Returns the instance of the Realtime Database SDK that is associated with
 * the provided FirebaseApp. Initializes a new instance with
 * default settings if no instance exists or if the existing
 * instance uses a custom database URL.
 *
 * @param app - The FirebaseApp instance that the returned Realtime Database instance is associated with. Optional.
 * @param url - Database URL. Optional.
 * @returns {Database}
 */
export function getDatabase(app?: FirebaseApp, url?: string): Database {
  if (app) {
    return getApp(app.name).database(url);
  }

  return getApp().database(url);
}

/**
 * Modify this Database instance to communicate with the Firebase Database emulator.
 * @param db - Database instance.
 * @param host - emulator host (e.g. - 'localhost')
 * @param port - emulator port (e.g. - 9000)
 * @returns {void}
 */
export function connectDatabaseEmulator(db: Database, host: string, port: number): void {
  return (
    (db as DatabaseInternal).useEmulator as WithModularDeprecationArg<
      DatabaseInternal['useEmulator']
    >
  ).call(db, host, port, MODULAR_DEPRECATION_ARG);
}

/**
 * Disconnects from the server (all Database operations will be completed offline).
 * @param db - Database instance.
 * @returns {Promise<void>}
 */
export function goOffline(db: Database): Promise<void> {
  return (
    (db as DatabaseInternal).goOffline as WithModularDeprecationArg<
      DatabaseInternal['goOffline']
    >
  ).call(db, MODULAR_DEPRECATION_ARG);
}

/**
 * Reconnects to the server and synchronizes the offline Database state with the server state.
 * @param db - Database instance.
 * @returns {Promise<void>}
 */
export function goOnline(db: Database): Promise<void> {
  return (
    (db as DatabaseInternal).goOnline as WithModularDeprecationArg<DatabaseInternal['goOnline']>
  ).call(db, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a Reference representing the location in the Database corresponding to the provided path.
 * @param db - Database instance.
 * @param path - Optional path representing the location the returned Reference will point.
 * @returns {Reference}
 */
export function ref(db: Database, path?: string): Reference {
  return (
    (db as DatabaseInternal).ref as WithModularDeprecationArg<DatabaseInternal['ref']>
  ).call(db, path, MODULAR_DEPRECATION_ARG);
}

/**
 * Generates a Reference from a database URL.
 * @param db - Database instance.
 * @param url - The Firebase URL at which the returned Reference will point.
 * @returns {Reference}
 */
export function refFromURL(db: Database, url: string): Reference {
  return (
    (db as DatabaseInternal).refFromURL as WithModularDeprecationArg<
      DatabaseInternal['refFromURL']
    >
  ).call(db, url, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets whether persistence is enabled for all database calls for the current app instance.
 * @param db - Database instance.
 * @param enabled - Whether persistence is enabled for the Database service.
 * @returns {void}
 */
export function setPersistenceEnabled(db: Database, enabled: boolean): void {
  return (
    (db as DatabaseInternal).setPersistenceEnabled as WithModularDeprecationArg<
      DatabaseInternal['setPersistenceEnabled']
    >
  ).call(db, enabled, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the native logging level for the database module.
 * @param db - Database instance.
 * @param enabled - Whether debug logging is enabled.
 * @returns {void}
 */
export function setLoggingEnabled(db: Database, enabled: boolean): void {
  return (
    (db as DatabaseInternal).setLoggingEnabled as WithModularDeprecationArg<
      DatabaseInternal['setLoggingEnabled']
    >
  ).call(db, enabled, MODULAR_DEPRECATION_ARG);
}

/**
 * Sets the cache size for persistence.
 * @param db - Database instance.
 * @param bytes - The new size of the cache in bytes.
 * @returns {void}
 */
export function setPersistenceCacheSizeBytes(db: Database, bytes: number): void {
  return (
    (db as DatabaseInternal).setPersistenceCacheSizeBytes as WithModularDeprecationArg<
      DatabaseInternal['setPersistenceCacheSizeBytes']
    >
  ).call(db, bytes, MODULAR_DEPRECATION_ARG);
}

/**
 * Force the use of longPolling instead of websockets.
 */
export function forceLongPolling(): void {
  throw new Error('forceLongPolling() is not implemented');
}

/**
 * Force the use of websockets instead of longPolling.
 */
export function forceWebSockets(): void {
  throw new Error('forceWebSockets() is not implemented');
}

/**
 * Returns the current Firebase Database server time as a JavaScript Date object.
 * @param db - Database instance.
 * @returns {Date}
 */
export function getServerTime(db: Database): Date {
  return (
    (db as DatabaseInternal).getServerTime as WithModularDeprecationArg<
      DatabaseInternal['getServerTime']
    >
  ).call(db, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a placeholder value for auto-populating the current timestamp.
 * @returns {object}
 */
export function serverTimestamp(): object {
  return ServerValue.TIMESTAMP;
}

/**
 * Returns a placeholder value that can be used to atomically increment the current database value.
 * @param delta - The amount to modify the current value atomically.
 * @returns {object}
 */
export function increment(delta: number): object {
  return ServerValue.increment.call(ServerValue, delta, MODULAR_DEPRECATION_ARG);
}

export { ServerValue };

/**
 * Logs debugging information to the console. Not implemented on native.
 * @param _enabled - Whether logging is enabled.
 * @param _persistent - Whether logging should persist. Optional.
 */
export function enableLogging(_enabled: boolean, _persistent?: boolean): void {
  throw new Error('enableLogging() is not implemented');
}

export * from './modular/query';
export * from './modular/transaction';
