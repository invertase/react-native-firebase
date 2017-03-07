/**
 * @flow
 * Database representation wrapper
 */
import { NativeModules, NativeEventEmitter } from 'react-native';

import { Base } from './../base';
import Snapshot from './snapshot.js';
import Reference from './reference.js';
import { promisify } from './../../utils';

const FirebaseDatabase = NativeModules.RNFirebaseDatabase;
const FirebaseDatabaseEvt = new NativeEventEmitter(FirebaseDatabase);

/**
 * @class Database
 */
export default class Database extends Base {
  constructor(firebase: Object, options: Object = {}) {
    super(firebase, options);
    this.subscriptions = {};
    this.errorSubscriptions = {};
    this.serverTimeOffset = 0;
    this.persistenceEnabled = false;
    this.namespace = 'firebase:database';

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
   * https://firebase.google.com/docs/reference/js/firebase.database.ServerValue
   * @returns {{TIMESTAMP: (*|{[.sv]: string})}}
   * @constructor
   */
  get ServerValue(): Object {
    return {
      TIMESTAMP: FirebaseDatabase.serverValueTimestamp || { '.sv': 'timestamp' },
    };
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
  on(path: string, modifiersString: string, modifiers: Array<string>, eventName: string, cb: () => void, errorCb: () => void) {
    const handle = this._handle(path, modifiersString);
    this.log.debug('adding on listener', handle);

    if (!this.subscriptions[handle]) this.subscriptions[handle] = {};
    if (!this.subscriptions[handle][eventName]) this.subscriptions[handle][eventName] = [];
    this.subscriptions[handle][eventName].push(cb);
    if (errorCb) {
      if (!this.errorSubscriptions[handle]) this.errorSubscriptions[handle] = [];
      this.errorSubscriptions[handle].push(errorCb);
    }

    return promisify('on', FirebaseDatabase)(path, modifiersString, modifiers, eventName);
  }

  /**
   *
   * @param path
   * @param modifiersString
   * @param eventName
   * @param origCB
   * @returns {*}
   */
  off(path: string, modifiersString: string, eventName?: string, origCB?: () => void) {
    const handle = this._handle(path, modifiersString);
    this.log.debug('off() : ', handle, eventName);

    if (!this.subscriptions[handle] || (eventName && !this.subscriptions[handle][eventName])) {
      this.log.warn('off() called, but not currently listening at that location (bad path)', handle, eventName);
      return Promise.resolve();
    }

    if (eventName && origCB) {
      const i = this.subscriptions[handle][eventName].indexOf(origCB);

      if (i === -1) {
        this.log.warn('off() called, but the callback specified is not listening at that location (bad path)', handle, eventName);
        return Promise.resolve();
      }

      this.subscriptions[handle][eventName].splice(i, 1);
      if (this.subscriptions[handle][eventName].length > 0) return Promise.resolve();
    } else if (eventName) {
      this.subscriptions[handle][eventName] = [];
    } else {
      this.subscriptions[handle] = {};
    }
    this.errorSubscriptions[handle] = [];
    return promisify('off', FirebaseDatabase)(path, modifiersString, eventName);
  }

  /**
   * Removes all event handlers and their native subscriptions
   * @returns {Promise.<*>}
   */
  cleanup() {
    const promises = [];
    Object.keys(this.subscriptions).forEach((handle) => {
      Object.keys(this.subscriptions[handle]).forEach((eventName) => {
        const separator = handle.indexOf('|');
        const path = handle.substring(0, separator);
        const modifiersString = handle.substring(separator + 1);
        promises.push(this.off(path, modifiersString, eventName));
      });
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
      this.log.debug(`${enable ? 'Enabling' : 'Disabling'} persistence`);
      this.persistenceEnabled = enable;
      return this.whenReady(promisify('enablePersistence', FirebaseDatabase)(enable));
    }

    return this.whenReady(Promise.resolve({ status: 'Already enabled' }));
  }

  /**
   *
   * @param path
   * @param modifiersString
   * @returns {string}
   * @private
   */
  _handle(path: string = '', modifiersString: string = '') {
    return `${path}|${modifiersString}`;
  }


  /**
   *
   * @param event
   * @private
   */
  _handleDatabaseEvent(event: Object) {
    const body = event.body || {};
    const { path, modifiersString, eventName, snapshot } = body;
    const handle = this._handle(path, modifiersString);

    this.log.debug('_handleDatabaseEvent: ', handle, eventName, snapshot && snapshot.key);

    if (this.subscriptions[handle] && this.subscriptions[handle][eventName]) {
      this.subscriptions[handle][eventName].forEach((cb) => {
        cb(new Snapshot(new Reference(this, path, modifiersString.split('|')), snapshot), body);
      });
    } else {
      FirebaseDatabase.off(path, modifiersString, eventName, () => {
        this.log.debug('_handleDatabaseEvent: No JS listener registered, removed native listener', handle, eventName);
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
    let firebaseMessage = `FirebaseError: ${message}`;

    if (path) {
      firebaseMessage = `${firebaseMessage}\r\nPath: /${path}\r\n`;
    }

    const firebaseError = new Error(firebaseMessage);

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
    const { path, modifiers } = error;
    const handle = this._handle(path, modifiers);
    const firebaseError = this._toFirebaseError(error);

    this.log.debug('_handleDatabaseError ->', handle, 'database_error', error);

    if (this.errorSubscriptions[handle]) this.errorSubscriptions[handle].forEach(listener => listener(firebaseError));
  }
}
