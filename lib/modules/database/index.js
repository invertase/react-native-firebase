/**
 * @flow
 * Database representation wrapper
 */
import { NativeModules } from 'react-native';

import ModuleBase from './../../utils/ModuleBase';
import Snapshot from './snapshot';
import Reference from './reference';
import TransactionHandler from './transaction';
import { promisify } from './../../utils';

/**
 * @class Database
 */
// TODO refactor native and js - legacy code here using old fb methods
export default class Database extends ModuleBase {
  constructor(firebaseApp: Object, options: Object = {}) {
    super(firebaseApp, options, 'Database', true);
    this.references = {};
    this.serverTimeOffset = 0;
    this.persistenceEnabled = false;
    this.transaction = new TransactionHandler(this);

    if (options.persistence === true) {
      this._setPersistence(true);
    }

    this.successListener = this._eventEmitter.addListener(
      'database_event',
      event => this._handleDatabaseEvent(event),
    );

    this.errorListener = this._eventEmitter.addListener(
      'database_error',
      err => this._handleDatabaseError(err),
    );

    this.offsetRef = this.ref('.info/serverTimeOffset');

    this.offsetRef.on('value', (snapshot) => {
      this.serverTimeOffset = snapshot.val() || this.serverTimeOffset;
    });

    this.log.debug('Created new Database instance', this.options);
  }

  /**
   * Returns a new firebase reference instance
   * @param path
   * @returns {Reference}
   */
  ref(path: string) {
    return new Reference(this, path);
  }

  /**
   *
   * @returns {*}
   * @param ref
   * @param listener
   */
  on(ref: Reference, listener: DatabaseListener) {
    const { refId, path, query } = ref;
    const { listenerId, eventName } = listener;
    this.log.debug('on() : ', ref.refId, listenerId, eventName);
    this.references[refId] = ref;
    return promisify('on', this._native)(refId, path, query.getModifiers(), listenerId, eventName);
  }

  /**
   *
   * @returns {*}
   * @param refId
   * @param listeners
   * @param remainingListenersCount
   */
  off(refId: number, listeners: Array<DatabaseListener>, remainingListenersCount: number) {
    this.log.debug('off() : ', refId, listeners);

    // Delete the reference if there are no more listeners
    if (remainingListenersCount === 0) delete this.references[refId];

    if (listeners.length === 0) return Promise.resolve();

    return promisify('off', this._native)(refId, listeners.map(listener => ({
      listenerId: listener.listenerId,
      eventName: listener.eventName,
    })));
  }

  /**
   * Removes all references and their native listeners
   * @returns {Promise.<*>}
   */
  cleanup() {
    const promises = [];
    Object.keys(this.references).forEach((refId) => {
      const ref = this.references[refId];
      promises.push(this.off(Number(refId), Object.values(ref.refListeners), 0));
    });
    return Promise.all(promises);
  }

  goOnline() {
    this._native.goOnline();
  }

  goOffline() {
    this._native.goOffline();
  }

  /**
   *  INTERNALS
   */
  _getServerTime() {
    return new Date().getTime() + this.serverTimeOffset;
  }

  /**
   * Enabled / disable database persistence
   * @param enable
   * @returns {*}
   * @private
   */
  _setPersistence(enable: boolean = true) {
    if (this.persistenceEnabled !== enable) {
      this.persistenceEnabled = enable;
      this.log.debug(`${enable ? 'Enabling' : 'Disabling'} persistence.`);
      return promisify('enablePersistence', this._native)(enable);
    }

    return Promise.reject({ status: 'Already enabled' });
  }

  /**
   *
   * @param event
   * @private
   */
  _handleDatabaseEvent(event: Object) {
    const body = event.body || {};
    const { refId, listenerId, path, eventName, snapshot, previousChildName } = body;
    this.log.debug('_handleDatabaseEvent: ', refId, listenerId, path, eventName, snapshot && snapshot.key);
    if (this.references[refId] && this.references[refId].refListeners[listenerId]) {
      const cb = this.references[refId].refListeners[listenerId].successCallback;
      cb(new Snapshot(this.references[refId], snapshot), previousChildName);
    } else {
      this._native.off(refId, [{ listenerId, eventName }], () => {
        this.log.debug('_handleDatabaseEvent: No JS listener registered, removed native listener', refId, listenerId, eventName);
      });
    }
  }

  /**
   * Converts an native error object to a 'firebase like' error.
   * @param error
   * @returns {Error}
   * @private
   */
  _toFirebaseError(error) {
    const { path, message, modifiers, code, details } = error;
    let firebaseMessage = `FirebaseError: ${message.toLowerCase().replace(/\s/g, '_')}`;

    if (path) {
      firebaseMessage = `${firebaseMessage} at /${path}\r\n`;
    }

    // $FlowFixMe
    const firebaseError: FirebaseError = new Error(firebaseMessage);

    firebaseError.code = code;
    firebaseError.path = path;
    firebaseError.details = details;
    firebaseError.modifiers = modifiers;

    return firebaseError;
  }

  /**
   *
   * @param error
   * @private
   */
  _handleDatabaseError(error: Object = {}) {
    const { refId, listenerId, path } = error;
    const firebaseError = this._toFirebaseError(error);

    this.log.debug('_handleDatabaseError ->', refId, listenerId, path, 'database_error', error);

    if (this.references[refId] && this.references[refId].refListeners[listenerId]) {
      const failureCb = this.references[refId].refListeners[listenerId].failureCallback;
      if (failureCb) failureCb(firebaseError);
    }
  }
}

export const statics = {
  ServerValue: NativeModules.FirebaseDatabase ? {
    TIMESTAMP: NativeModules.FirebaseDatabase.serverValueTimestamp || { '.sv': 'timestamp' },
  } : {},
};
