import { firebase } from '..';

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
    return firebase.app(app.name).database(url);
  }

  return firebase.app().database(url);
}

/**
 * @param {Database} db
 * @param {string} host
 * @param {number} port
 * @returns {void}
 */
export function connectDatabaseEmulator(db, host, port) {
  db.useEmulator(host, port);
}

/**
 * @param {Database} db
 * @returns {Promise<void>}
 */
export function goOffline(db) {
  return db.goOffline();
}

/**
 * @param {Database} db
 * @returns {Promise<void>}
 */
export function goOnline(db) {
  return db.goOnline();
}

/**
 * @param {Database} db
 * @param {string?} path
 * @returns {DatabaseReference}
 */
export function ref(db, path) {
  return db.ref(path);
}

/**
 * @param {Database} db
 * @param {string} url
 * @returns {DatabaseReference}
 */
export function refFromURL(db, url) {
  return db.refFromURL(url);
}

/**
 * @param {Database} db
 * @param {boolean} enabled
 * @returns {void}
 */
export function setPersistenceEnabled(db, enabled) {
  return db.setPersistenceEnabled(enabled);
}

/**
 * @param {Database} db
 * @param {boolean} enabled
 * @returns {void}
 */
export function setLoggingEnabled(db, enabled) {
  return db.setLoggingEnabled(enabled);
}

/**
 * @param {Database} db
 * @param {number} bytes
 * @returns {void}
 */
export function setPersistenceCacheSizeBytes(db, bytes) {
  return db.setPersistenceCacheSizeBytes(bytes);
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
  return db.getServerTime();
}

/**
 * @returns {object}
 */
export function serverTimestamp() {
  return firebase.database.ServerValue.TIMESTAMP;
}

/**
 * @param {number} delta
 * @returns {object}
 */
export function increment(delta) {
  return firebase.database.ServerValue.increment(delta);
}

export * from './query';
export * from './transaction';
