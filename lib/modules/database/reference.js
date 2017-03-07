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

// https://firebase.google.com/docs/reference/js/firebase.database.Reference

/**
 * @class Reference
 */
export default class Reference extends ReferenceBase {

  db: FirebaseDatabase;
  query: Query;

  constructor(db: FirebaseDatabase, path: string, existingModifiers?: Array<string>) {
    super(db.firebase, path);
    this.db = db;
    this.namespace = 'firebase:db:ref';
    this.query = new Query(this, path, existingModifiers);
    this.log.debug('Created new Reference', this.db._handle(path, existingModifiers));
  }

  /**
   *
   * @param bool
   * @returns {*}
   */
  keepSynced(bool: boolean) {
    const path = this._dbPath();
    return promisify('keepSynced', FirebaseDatabase)(path, bool);
  }

  /**
   *
   * @param value
   * @returns {*}
   */
  set(value: any) {
    const path = this._dbPath();
    const _value = this._serializeAnyType(value);
    return promisify('set', FirebaseDatabase)(path, _value);
  }

  /**
   *
   * @param val
   * @returns {*}
   */
  update(val: Object) {
    const path = this._dbPath();
    const value = this._serializeObject(val);
    return promisify('update', FirebaseDatabase)(path, value);
  }

  /**
   *
   * @returns {*}
   */
  remove() {
    return promisify('remove', FirebaseDatabase)(this._dbPath());
  }

  /**
   *
   * @param value
   * @param onComplete
   * @returns {*}
   */
  push(value: any, onComplete: Function) {
    if (value === null || value === undefined) {
      const _path = this.path + '/' + generatePushID(this.db.serverTimeOffset);
      return new Reference(this.db, _path);
    }

    const path = this._dbPath();
    const _value = this._serializeAnyType(value);
    return promisify('push', FirebaseDatabase)(path, _value)
      .then(({ ref }) => {
        const newRef = new Reference(this.db, ref);
        if (isFunction(onComplete)) return onComplete(null, newRef);
        return newRef;
      }).catch((e) => {
        if (isFunction(onComplete)) return onComplete(e, null);
        return e;
      });
  }

  /**
   *
   * @param eventType
   * @param successCallback
   * @param failureCallback
   * @param context TODO
   * @returns {*}
   */
  on(eventType: string, successCallback: () => any, failureCallback: () => any, context) {
    if (!isFunction(successCallback)) throw new Error('The specified callback must be a function');
    if (failureCallback && !isFunction(failureCallback)) throw new Error('The specified error callback must be a function');
    const path = this._dbPath();
    const modifiers = this.query.getModifiers();
    const modifiersString = this.query.getModifiersString();
    this.log.debug('adding reference.on', path, modifiersString, eventType);
    return this.db.on(path, modifiersString, modifiers, eventType, successCallback, failureCallback);
  }

  /**
   *
   * @param eventType
   * @param successCallback
   * @param failureCallback
   * @param context TODO
   * @returns {Promise.<TResult>}
   */
  once(eventType: string = 'value', successCallback: (snapshot: Object) => void, failureCallback: (error: Error) => void) {
    const path = this._dbPath();
    const modifiers = this.query.getModifiers();
    const modifiersString = this.query.getModifiersString();
    return promisify('once', FirebaseDatabase)(path, modifiersString, modifiers, eventType)
      .then(({ snapshot }) => new Snapshot(this, snapshot))
      .then((snapshot) => {
        if (isFunction(successCallback)) successCallback(snapshot);
        return snapshot;
      })
      .catch((error) => {
        const firebaseError = this.db._toFirebaseError(error);
        if (isFunction(failureCallback)) return failureCallback(firebaseError);
        return Promise.reject(firebaseError);
      });
  }

  /**
   *
   * @param eventType
   * @param origCB
   * @returns {*}
   */
  off(eventType?: string = '', origCB?: () => any) {
    const path = this._dbPath();
    const modifiersString = this.query.getModifiersString();
    this.log.debug('ref.off(): ', path, modifiersString, eventType);
    return this.db.off(path, modifiersString, eventType, origCB);
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
    const newRef = new Reference(this.db, this.path, this.query.getModifiers());
    newRef.query.setOrderBy(name, key);
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
    const newRef = new Reference(this.db, this.path, this.query.getModifiers());
    newRef.query.setLimit(name, limit);
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
    const newRef = new Reference(this.db, this.path, this.query.getModifiers());
    newRef.query.setFilter(name, value, key);
    return newRef;
  }

  onDisconnect() {
    return new Disconnect(this.path);
  }

  child(path: string) {
    return new Reference(this.db, this.path + '/' + path);
  }

  toString(): string {
    return this._dbPath();
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
    return new Reference(this.db, this.path.substring(0, this.path.lastIndexOf('/')));
  }


  /**
   * Returns a ref to the root of db - '/'
   * @returns {Reference}
   */
  get root(): Reference {
    return new Reference(this.db, '/');
  }

  /**
   * INTERNALS
   */

  _dbPath(): string {
    return this.path;
  }

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
