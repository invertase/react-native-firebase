/**
 * @flow
 * Database representation wrapper
 */
import { NativeModules, NativeEventEmitter } from 'react-native';

import { Base } from './../base';
import Snapshot from './snapshot';
import Reference from './reference';
import TransactionHandler from './transaction';
import { promisify } from './../../utils';

const FirebaseDatabase = NativeModules.RNFirebaseDatabase;
const FirebaseDatabaseEvt = new NativeEventEmitter(FirebaseDatabase);

/**
 * @class Database
 */
export default class Database extends Base {
  constructor(firebase: Object, options: Object = {}) {
    super(firebase, options);
    this.references = {};
    this.serverTimeOffset = 0;
    this.persistenceEnabled = false;
    this.namespace = 'firebase:database';
    this.transaction = new TransactionHandler(firebase, this, FirebaseDatabaseEvt);

    if (firebase.options.persistence === true) {
      this._setPersistence(true);
    }

    this.successListener = FirebaseDatabaseEvt.addListener(
      'database_event',
      event => this._handleDatabaseEvent(event)
    );

    this.errorListener = FirebaseDatabaseEvt.addListener(
      'database_error',
      err => this._handleDatabaseError(err)
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
   * @param path
   * @param modifiersString
   * @param modifiers
   * @param eventName
   * @param cb
   * @param errorCb
   * @returns {*}
   */
  on(ref: Reference, listener: DatabaseListener) {
    const { refId, path, query } = ref;
    const { listenerId, eventName } = listener;
    this.log.debug('on() : ', ref.refId, listenerId, eventName);
    this.references[refId] = ref;
    return promisify('on', FirebaseDatabase)(refId, path, query.getModifiers(), listenerId, eventName);
  }

  /**
   *
   * @param path
   * @param modifiersString
   * @param eventName
   * @param origCB
   * @returns {*}
   */
  off(
    refId: number,
    // $FlowFixMe
    listeners: Array<DatabaseListener>,
    remainingListenersCount: number
  ) {
    this.log.debug('off() : ', refId, listeners);

    // Delete the reference if there are no more listeners
    if (remainingListenersCount === 0) delete this.references[refId];

    if (listeners.length === 0) return Promise.resolve();

    return promisify('off', FirebaseDatabase)(refId, listeners.map(listener => ({
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
      promises.push(this.off(Number(refId), Object.values(ref.listeners), 0));
    });
    return Promise.all(promises);
  }

  goOnline() {
    FirebaseDatabase.goOnline();
  }

  goOffline() {
    FirebaseDatabase.goOffline();
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
      return promisify('enablePersistence', FirebaseDatabase)(enable);
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
    const { refId, listenerId, path, eventName, snapshot } = body;
    this.log.debug('_handleDatabaseEvent: ', refId, listenerId, path, eventName, snapshot && snapshot.key);
    if (this.references[refId] && this.references[refId].listeners[listenerId]) {
      const cb = this.references[refId].listeners[listenerId].successCallback;
      cb(new Snapshot(this.references[refId], snapshot));
    } else {
      FirebaseDatabase.off(refId, [{ listenerId, eventName }], () => {
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

    if (this.references[refId] && this.references[refId].listeners[listenerId]) {
      const failureCb = this.references[refId].listeners[listenerId].failureCallback;
      if (failureCb) failureCb(firebaseError);
    }
  }
}

export const statics = {
  ServerValue: {
    TIMESTAMP: FirebaseDatabase.serverValueTimestamp || { '.sv': 'timestamp' },
  },
};
