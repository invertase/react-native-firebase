/**
 * @flow
 */
import { NativeModules } from 'react-native';

import Query from './query.js';
import Snapshot from './snapshot';
import Disconnect from './disconnect';
import { ReferenceBase } from './../base';
import { promisify, isFunction, isObject, tryJSONParse, tryJSONStringify, generatePushID } from './../../utils';

const FirebaseDatabase = NativeModules.RNFirebaseDatabase;
// Unique Reference ID for native events
let refId = 1;

/**
 * @link https://firebase.google.com/docs/reference/js/firebase.database.Reference
 * @class Reference
 */
export default class Reference extends ReferenceBase {

  refId: number;
  listeners: { [listenerId: number]: DatabaseListener };
  database: FirebaseDatabase;
  query: Query;

  constructor(database: FirebaseDatabase, path: string, existingModifiers?: Array<DatabaseModifier>) {
    super(database.firebase, path);
    this.refId = refId++;
    this.listeners = {};
    this.database = database;
    this.namespace = 'firebase:db:ref';
    this.query = new Query(this, path, existingModifiers);
    this.log.debug('Created new Reference', this.refId, this.path);
  }

  /**
   *
   * @param bool
   * @returns {*}
   */
  keepSynced(bool: boolean) {
    const path = this.path;
    return promisify('keepSynced', FirebaseDatabase)(path, bool);
  }

  /**
   *
   * @param value
   * @returns {*}
   */
  set(value: any) {
    const path = this.path;
    const _value = this._serializeAnyType(value);
    return promisify('set', FirebaseDatabase)(path, _value);
  }

  /**
   *
   * @param val
   * @returns {*}
   */
  update(val: Object) {
    const path = this.path;
    const value = this._serializeObject(val);
    return promisify('update', FirebaseDatabase)(path, value);
  }

  /**
   *
   * @returns {*}
   */
  remove() {
    return promisify('remove', FirebaseDatabase)(this.path);
  }

  /**
   *
   * @param value
   * @param onComplete
   * @returns {*}
   */
  push(value: any, onComplete: Function) {
    if (value === null || value === undefined) {
      return new Reference(this.database, `${this.path}/${generatePushID(this.database.serverTimeOffset)}`);
    }

    const path = this.path;
    const _value = this._serializeAnyType(value);
    return promisify('push', FirebaseDatabase)(path, _value)
      .then(({ ref }) => {
        const newRef = new Reference(this.database, ref);
        if (isFunction(onComplete)) return onComplete(null, newRef);
        return newRef;
      }).catch((e) => {
        if (isFunction(onComplete)) return onComplete(e, null);
        return e;
      });
  }

  /**
   *
   * @param eventName
   * @param successCallback
   * @param failureCallback
   * @param context TODO
   * @returns {*}
   */
  on(eventName: string, successCallback: () => any, failureCallback: () => any) {
    if (!isFunction(successCallback)) throw new Error('The specified callback must be a function');
    if (failureCallback && !isFunction(failureCallback)) throw new Error('The specified error callback must be a function');
    this.log.debug('adding reference.on', this.refId, eventName);
    const listener = {
      listenerId: Object.keys(this.listeners).length + 1,
      eventName,
      successCallback,
      failureCallback,
    };
    this.listeners[listener.listenerId] = listener;
    this.database.on(this, listener);
    return successCallback;
  }

  /**
   *
   * @param eventName
   * @param successCallback
   * @param failureCallback
   * @param context TODO
   * @returns {Promise.<TResult>}
   */
  once(eventName: string = 'value', successCallback: (snapshot: Object) => void, failureCallback: (error: FirebaseError) => void) {
    return promisify('once', FirebaseDatabase)(this.refId, this.path, this.query.getModifiers(), eventName)
      .then(({ snapshot }) => new Snapshot(this, snapshot))
      .then((snapshot) => {
        if (isFunction(successCallback)) successCallback(snapshot);
        return snapshot;
      })
      .catch((error) => {
        const firebaseError = this.database._toFirebaseError(error);
        if (isFunction(failureCallback)) return failureCallback(firebaseError);
        return Promise.reject(firebaseError);
      });
  }

  /**
   *
   * @param eventName
   * @param origCB
   * @returns {*}
   */
  off(eventName?: string = '', origCB?: () => any) {
    this.log.debug('ref.off(): ', this.refId, eventName);
    // $FlowFixMe
    const listeners: Array<DatabaseListener> = Object.values(this.listeners);
    let listenersToRemove;
    if (eventName && origCB) {
      listenersToRemove = listeners.filter((listener) => {
        return listener.eventName === eventName && listener.successCallback === origCB;
      });
      // Only remove a single listener as per the web spec
      if (listenersToRemove.length > 1) listenersToRemove = [listenersToRemove[0]];
    } else if (eventName) {
      listenersToRemove = listeners.filter((listener) => {
        return listener.eventName === eventName;
      });
    } else if (origCB) {
      listenersToRemove = listeners.filter((listener) => {
        return listener.successCallback === origCB;
      });
    } else {
      listenersToRemove = listeners;
    }
    // Remove the listeners from the reference to prevent memory leaks
    listenersToRemove.forEach((listener) => {
      delete this.listeners[listener.listenerId];
    });
    return this.database.off(this.refId, listenersToRemove, Object.keys(this.listeners).length);
  }

  /**
   * Atomically modifies the data at this location.
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference#transaction
   * @param transactionUpdate
   * @param onComplete
   * @param applyLocally
   */
  transaction(transactionUpdate: Function, onComplete: (?Error, boolean, ?Snapshot) => *, applyLocally: boolean = false) {
    if (!isFunction(transactionUpdate)) return Promise.reject(new Error('Missing transactionUpdate function argument.'));

    return new Promise((resolve, reject) => {
      const onCompleteWrapper = (error, committed, snapshotData) => {
        if (error) {
          if (typeof onComplete === 'function') {
            onComplete(error, committed, null);
          }
          return reject(error);
        }

        const snapshot = new Snapshot(this, snapshotData);

        if (typeof onComplete === 'function') {
          onComplete(null, committed, snapshot);
        }

        return resolve({ committed, snapshot });
      };

      this.database.transaction.add(this, transactionUpdate, onCompleteWrapper, applyLocally);
    });
  }

  /**
   * MODIFIERS
   */

  /**
   *
   * @returns {Reference}
   */
  orderByKey(): Reference {
    return this.orderBy('orderByKey');
  }

  /**
   *
   * @returns {Reference}
   */
  orderByPriority(): Reference {
    return this.orderBy('orderByPriority');
  }

  /**
   *
   * @returns {Reference}
   */
  orderByValue(): Reference {
    return this.orderBy('orderByValue');
  }

  /**
   *
   * @param key
   * @returns {Reference}
   */
  orderByChild(key: string): Reference {
    return this.orderBy('orderByChild', key);
  }

  /**
   *
   * @param name
   * @param key
   * @returns {Reference}
   */
  orderBy(name: string, key?: string): Reference {
    const newRef = new Reference(this.database, this.path, this.query.getModifiers());
    newRef.query.orderBy(name, key);
    return newRef;
  }

  /**
   * LIMITS
   */

  /**
   *
   * @param limit
   * @returns {Reference}
   */
  limitToLast(limit: number): Reference {
    return this.limit('limitToLast', limit);
  }

  /**
   *
   * @param limit
   * @returns {Reference}
   */
  limitToFirst(limit: number): Reference {
    return this.limit('limitToFirst', limit);
  }

  /**
   *
   * @param name
   * @param limit
   * @returns {Reference}
   */
  limit(name: string, limit: number): Reference {
    const newRef = new Reference(this.database, this.path, this.query.getModifiers());
    newRef.query.limit(name, limit);
    return newRef;
  }

  /**
   * FILTERS
   */

  /**
   *
   * @param value
   * @param key
   * @returns {Reference}
   */
  equalTo(value: any, key?: string): Reference {
    return this.filter('equalTo', value, key);
  }

  /**
   *
   * @param value
   * @param key
   * @returns {Reference}
   */
  endAt(value: any, key?: string): Reference {
    return this.filter('endAt', value, key);
  }

  /**
   *
   * @param value
   * @param key
   * @returns {Reference}
   */
  startAt(value: any, key?: string): Reference {
    return this.filter('startAt', value, key);
  }

  /**
   *
   * @param name
   * @param value
   * @param key
   * @returns {Reference}
   */
  filter(name: string, value: any, key?: string): Reference {
    const newRef = new Reference(this.database, this.path, this.query.getModifiers());
    newRef.query.filter(name, value, key);
    return newRef;
  }

  /**
   *
   * @returns {Disconnect}
   */
  onDisconnect() {
    return new Disconnect(this.path);
  }

  /**
   * Get a specified child
   * @param path
   * @returns {Reference}
   */
  child(path: string) {
    return new Reference(this.database, `${this.path}/${path}`);
  }

  /**
   * Return the ref as a path string
   * @returns {string}
   */
  toString(): string {
    return this.path;
  }

  /**
   * Returns whether another Reference represent the same location and are from the
   * same instance of firebase.app.App - multiple firebase apps not currently supported.
   * @param {Reference} otherRef - Other reference to compare to this one
   * @return {Boolean} Whether otherReference is equal to this one
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#isEqual}
   */
  isEqual(otherRef: Reference): boolean {
    return !!otherRef && otherRef.constructor === Reference && otherRef.key === this.key;
  }

  /**
   * GETTERS
   */

  /**
   * Returns the parent ref of the current ref i.e. a ref of /foo/bar would return a new ref to '/foo'
   * @returns {*}
   */
  get parent(): Reference|null {
    if (this.path === '/') return null;
    return new Reference(this.database, this.path.substring(0, this.path.lastIndexOf('/')));
  }

  /**
   * A reference to itself
   * @type {!Reference}
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#ref}
   */
  get ref(): Reference {
    return this;
  }

  /**
   * Returns a ref to the root of db - '/'
   * @returns {Reference}
   */
  get root(): Reference {
    return new Reference(this.database, '/');
  }

  /**
   * INTERNALS
   */


  /**
   *
   * @param obj
   * @returns {Object}
   * @private
   */
  _serializeObject(obj: Object) {
    if (!isObject(obj)) return obj;

    // json stringify then parse it calls toString on Objects / Classes
    // that support it i.e new Date() becomes a ISO string.
    return tryJSONParse(tryJSONStringify(obj));
  }

  /**
   *
   * @param value
   * @returns {*}
   * @private
   */
  _serializeAnyType(value: any) {
    if (isObject(value)) {
      return {
        type: 'object',
        value: this._serializeObject(value),
      };
    }

    return {
      type: typeof value,
      value,
    };
  }
}
