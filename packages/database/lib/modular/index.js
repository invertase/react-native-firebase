import { getApp } from '@react-native-firebase/app';
import DatabaseStatics from '../DatabaseStatics';

const { ServerValue } = DatabaseStatics;
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/lib/common';

/**
 * @typedef {import("..").FirebaseApp} FirebaseApp
 * @typedef {import("..").FirebaseDatabaseTypes.Module} Database
 */

/**
 * @param {FirebaseApp?} app - The FirebaseApp instance that the returned Realtime Database instance is associated with.
 * @param {string?} url
 * @returns {Database}
 */
export function getDatabase(app, url) {
  if (app) {
    return getApp(app.name).database(url);
  }

  return getApp().database(url);
}

/**
 * @param {Database} db
 * @param {string} host
 * @param {number} port
 * @returns {void}
 */
export function connectDatabaseEmulator(db, host, port) {
  db.useEmulator.call(db, host, port, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {Database} db
 * @returns {Promise<void>}
 */
export function goOffline(db) {
  return db.goOffline.call(db, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {Database} db
 * @returns {Promise<void>}
 */
export function goOnline(db) {
  return db.goOnline.call(db, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {Database} db
 * @param {string?} path
 * @returns {DatabaseReference}
 */
export function ref(db, path) {
  return db.ref.call(db, path, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {Database} db
 * @param {string} url
 * @returns {DatabaseReference}
 */
export function refFromURL(db, url) {
  return db.refFromURL.call(db, url, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {Database} db
 * @param {boolean} enabled
 * @returns {void}
 */
export function setPersistenceEnabled(db, enabled) {
  return db.setPersistenceEnabled.call(db, enabled, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {Database} db
 * @param {boolean} enabled
 * @returns {void}
 */
export function setLoggingEnabled(db, enabled) {
  return db.setLoggingEnabled.call(db, enabled, MODULAR_DEPRECATION_ARG);
}

/**
 * @param {Database} db
 * @param {number} bytes
 * @returns {void}
 */
export function setPersistenceCacheSizeBytes(db, bytes) {
  return db.setPersistenceCacheSizeBytes.call(db, bytes, MODULAR_DEPRECATION_ARG);
}

export function forceLongPolling() {
  throw new Error('forceLongPolling() is not implemented');
}

export function forceWebSockets() {
  throw new Error('forceWebSockets() is not implemented');
}

/**
 * @param {Database} db
 * @returns {Date}
 */
export function getServerTime(db) {
  return db.getServerTime.call(db, MODULAR_DEPRECATION_ARG);
}

/**
 * @returns {object}
 */
export function serverTimestamp() {
  return ServerValue.TIMESTAMP;
}

/**
 * @param {number} delta
 * @returns {object}
 */
export function increment(delta) {
  return ServerValue.increment.call(ServerValue, delta, MODULAR_DEPRECATION_ARG);
}

export { ServerValue };

export function enableLogging(_enabled, _persistent) {
  throw new Error('enableLogging() is not implemented');
}

export * from './query';
export * from './transaction';
