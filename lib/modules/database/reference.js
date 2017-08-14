/**
 * @flow
 */

import Query from './query.js';
import Snapshot from './snapshot';
import Disconnect from './disconnect';
import INTERNALS from './../../internals';
import ReferenceBase from './../../utils/ReferenceBase';
import {
  promiseOrCallback,
  isFunction,
  isObject,
  isString,
  tryJSONParse,
  tryJSONStringify,
  generatePushID,
} from './../../utils';

// Unique Reference ID for native events
let refId = 1;

/**
 * Enum for event types
 * @readonly
 * @enum {String}
 */
const ReferenceEventTypes = {
  value: 'value',
  child_added: 'child_added',
  child_removed: 'child_removed',
  child_changed: 'child_changed',
  child_moved: 'child_moved',
};

/**
 * @typedef {String} ReferenceLocation - Path to location in the database, relative
 * to the root reference. Consists of a path where segments are separated by a
 * forward slash (/) and ends in a ReferenceKey - except the root location, which
 * has no ReferenceKey.
 *
 * @example
 * // root reference location: '/'
 * // non-root reference: '/path/to/referenceKey'
 */

/**
 * @typedef {String} ReferenceKey - Identifier for each location that is unique to that
 * location, within the scope of its parent. The last part of a ReferenceLocation.
 */

/**
 * Represents a specific location in your Database that can be used for
 * reading or writing data.
 *
 * You can reference the root using firebase.database().ref() or a child location
 * by calling firebase.database().ref("child/path").
 *
 * @link https://firebase.google.com/docs/reference/js/firebase.database.Reference
 * @class Reference
 * @extends ReferenceBase
 */
export default class Reference extends ReferenceBase {

  _refId: number;
  _refListeners: { [listenerId: number]: DatabaseListener };
  _database: Object;
  _query: Query;

  constructor(database: Object, path: string, existingModifiers?: Array<DatabaseModifier>) {
    super(path, database);
    this._promise = null;
    this._refId = refId++;
    this._listeners = 0;
    this._refListeners = {};
    this._database = database;
    this._query = new Query(this, path, existingModifiers);
    this.log = this._database.log;
    this.log.debug('Created new Reference', this._refId, this.path);
  }

  /**
   * By calling `keepSynced(true)` on a location, the data for that location will
   * automatically be downloaded and kept in sync, even when no listeners are
   * attached for that location. Additionally, while a location is kept synced,
   *  it will not be evicted from the persistent disk cache.
   *
   * @link https://firebase.google.com/docs/reference/android/com/google/firebase/database/Query.html#keepSynced(boolean)
   * @param bool
   * @returns {*}
   */
  keepSynced(bool: boolean) {
    return this._database._native.keepSynced(this._refId, this.path, this._query.getModifiers(), bool);
  }

  /**
   * Writes data to this Database location.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.database.Reference#set
   * @param value
   * @param onComplete
   * @returns {Promise}
   */
  set(value: any, onComplete?: Function): Promise {
    return promiseOrCallback(
      this._database._native.set(this.path, this._serializeAnyType(value)),
      onComplete,
    );
  }

  /**
   * Sets a priority for the data at this Database location.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.database.Reference#setPriority
   * @param priority
   * @param onComplete
   * @returns {Promise}
   */
  setPriority(priority: string | number | null, onComplete?: Function): Promise {
    const _priority = this._serializeAnyType(priority);

    return promiseOrCallback(
      this._database._native.setPriority(this.path, _priority),
      onComplete,
    );
  }

  /**
   * Writes data the Database location. Like set() but also specifies the priority for that data.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.database.Reference#setWithPriority
   * @param value
   * @param priority
   * @param onComplete
   * @returns {Promise}
   */
  setWithPriority(value: any, priority: string | number | null, onComplete?: Function): Promise {
    const _value = this._serializeAnyType(value);
    const _priority = this._serializeAnyType(priority);

    return promiseOrCallback(
      this._database._native.setWithPriority(this.path, _value, _priority),
      onComplete,
    );
  }

  /**
   * Writes multiple values to the Database at once.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.database.Reference#update
   * @param val
   * @param onComplete
   * @returns {Promise}
   */
  update(val: Object, onComplete?: Function): Promise {
    const value = this._serializeObject(val);

    return promiseOrCallback(
      this._database._native.update(this.path, value),
      onComplete,
    );
  }

  /**
   * Removes the data at this Database location.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove
   * @param onComplete
   * @return {Promise}
   */
  remove(onComplete?: Function): Promise {
    return promiseOrCallback(
      this._database._native.remove(this.path),
      onComplete,
    );
  }

  /**
   * Atomically modifies the data at this location.
   *
   * @link https://firebase.google.com/docs/reference/js/firebase.database.Reference#transaction
   * @param transactionUpdate
   * @param onComplete
   * @param applyLocally
   */
  transaction(
    transactionUpdate: Function,
    onComplete: (error: ?Error, committed: boolean, snapshot: ?Snapshot) => *,
    applyLocally: boolean = false,
  ) {
    if (!isFunction(transactionUpdate)) {
      return Promise.reject(
        new Error('Missing transactionUpdate function argument.'),
      );
    }

    return new Promise((resolve, reject) => {
      const onCompleteWrapper = (error, committed, snapshotData) => {
        if (isFunction(onComplete)) {
          if (error) return onComplete(error, committed, null);
          return onComplete(null, committed, new Snapshot(this, snapshotData));
        }

        if (error) return reject(error);
        return resolve({ committed, snapshot: new Snapshot(this, snapshotData) });
      };

      // start the transaction natively
      this._database._transactionHandler.add(this, transactionUpdate, onCompleteWrapper, applyLocally);
    });
  }


  /**
   *
   * @param eventName
   * @param successCallback
   * @param cancelOrContext
   * @param context
   * @returns {Promise.<any>}
   */
  once(
    eventName: string = 'value',
    successCallback: (snapshot: Object) => void,
    cancelOrContext: (error: FirebaseError) => void,
    context?: Object,
  ) {
    return this._database._native.once(this._refId, this.path, this._query.getModifiers(), eventName)
      .then(({ snapshot }) => {
        const _snapshot = new Snapshot(this, snapshot);

        if (isFunction(successCallback)) {
          if (isObject(cancelOrContext)) successCallback.bind(cancelOrContext)(_snapshot);
          if (context && isObject(context)) successCallback.bind(context)(_snapshot);
          successCallback(_snapshot);
        }

        return _snapshot;
      })
      .catch((error) => {
        if (isFunction(cancelOrContext)) return cancelOrContext(error);
        return error;
      });
  }

  /**
   *
   * @param value
   * @param onComplete
   * @returns {*}
   */
  push(value: any, onComplete?: Function) {
    if (value === null || value === undefined) {
      return new Reference(this._database, `${this.path}/${generatePushID(this._database.serverTimeOffset)}`);
    }

    const newRef = new Reference(this._database, `${this.path}/${generatePushID(this._database.serverTimeOffset)}`);
    const promise = newRef.set(value);

    // if callback provided then internally call the set promise with value
    if (isFunction(onComplete)) {
      return promise
        .then(() => onComplete(null, newRef))
        .catch(error => onComplete(error, null));
    }

    // otherwise attach promise to 'thenable' reference and return the
    // new reference
    newRef._setThenable(promise);
    return newRef;
  }

  /**
   * MODIFIERS
   */

  /**
   *
   * @returns {Reference}
   */
  orderByKey(): Reference {
    return this._query.orderBy('orderByKey');
  }

  /**
   *
   * @returns {Reference}
   */
  orderByPriority(): Reference {
    return this._query.orderBy('orderByPriority');
  }

  /**
   *
   * @returns {Reference}
   */
  orderByValue(): Reference {
    return this._query.orderBy('orderByValue');
  }

  /**
   *
   * @param key
   * @returns {Reference}
   */
  orderByChild(key: string): Reference {
    return this._query.orderBy('orderByChild', key);
  }

  /**
   *
   * @param name
   * @param key
   * @returns {Reference}
   */
  orderBy(name: string, key?: string): Reference {
    const newRef = new Reference(this._database, this.path, this._query.getModifiers());
    newRef._query.orderBy(name, key);
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
    return this._query.limit('limitToLast', limit);
  }

  /**
   *
   * @param limit
   * @returns {Reference}
   */
  limitToFirst(limit: number): Reference {
    return this._query.limit('limitToFirst', limit);
  }

  /**
   *
   * @param name
   * @param limit
   * @returns {Reference}
   */
  limit(name: string, limit: number): Reference {
    const newRef = new Reference(this._database, this.path, this._query.getModifiers());
    newRef._query.limit(name, limit);
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
    return this._query.filter('equalTo', value, key);
  }

  /**
   *
   * @param value
   * @param key
   * @returns {Reference}
   */
  endAt(value: any, key?: string): Reference {
    return this._query.filter('endAt', value, key);
  }

  /**
   *
   * @param value
   * @param key
   * @returns {Reference}
   */
  startAt(value: any, key?: string): Reference {
    return this._query.filter('startAt', value, key);
  }

  /**
   *
   * @param name
   * @param value
   * @param key
   * @returns {Reference}
   */
  filter(name: string, value: any, key?: string): Reference {
    const newRef = new Reference(this._database, this.path, this._query.getModifiers());
    newRef._query.filter(name, value, key);
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
   * Creates a Reference to a child of the current Reference, using a relative path.
   * No validation is performed on the path to ensure it has a valid format.
   * @param {String} path relative to current ref's location
   * @returns {!Reference} A new Reference to the path provided, relative to the current
   * Reference
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#child}
   */
  child(path: string) {
    return new Reference(this._database, `${this.path}/${path}`);
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
   *
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#isEqual}
   */
  isEqual(otherRef: Reference): boolean {
    return !!otherRef
      && otherRef.constructor === Reference
      && otherRef.key === this.key
      && this._query.queryIdentifier() === otherRef._query.queryIdentifier();
  }

  /**
   * GETTERS
   */

  /**
   * The parent location of a Reference, or null for the root Reference.
   * @type {Reference}
   *
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#parent}
   */
  get parent(): Reference | null {
    if (this.path === '/') return null;
    return new Reference(this._database, this.path.substring(0, this.path.lastIndexOf('/')));
  }

  /**
   * A reference to itself
   * @type {!Reference}
   *
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#ref}
   */
  get ref(): Reference {
    return this;
  }

  /**
   * Reference to the root of the database: '/'
   * @type {!Reference}
   *
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#root}
   */
  get root(): Reference {
    return new Reference(this._database, '/');
  }

  /**
   * Access then method of promise if set
   * @return {*}
   */
  get then() {
    if (this._promise && this._promise.then) {
      return this._promise.then.bind(this._promise)(() => {
        this._promise = null;
        return this;
      });
    }

    return undefined;
  }

  /**
   * Access catch method of promise if set
   * @return {*}
   */
  get catch() {
    if (this._promise && this._promise.catch) {
      return this._promise.catch.bind(this._promise)((exception) => {
        this._promise = null;
        return Promise.reject(exception);
      });
    }

    return undefined;
  }

  /**
   * INTERNALS
   */

  /**
   * Generate a unique key based on this refs path and query modifiers
   * @return {string}
   */
  makeQueryKey() {
    return `$${this.path}$${this._query.queryIdentifier()}$${this._refId}$${this._listeners}`;
  }

  /**
   * Return instance of db logger
   */
  get log() {
    return this._database.log;
  }

  /**
   * Set the promise this 'thenable' reference relates to
   * @param promise
   * @private
   */
  _setThenable(promise) {
    this._promise = promise;
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


  /**
   *
   * @param eventType
   * @param callback
   * @param cancelCallbackOrContext
   * @param context
   * @return {*}
   */
  // todo:context shouldn't be needed - confirm
  // todo refId should no longer be required - update native to work without it then remove from js internals
  on(eventType: string, callback: () => any, cancelCallbackOrContext?: () => any, context?: Object): Function {
    if (!eventType) {
      throw new Error('Query.on failed: Function called with 0 arguments. Expects at least 2.');
    }

    if (!isString(eventType) || !ReferenceEventTypes[eventType]) {
      throw new Error(`Query.on failed: First argument must be a valid string event type: "${Object.keys(ReferenceEventTypes).join(', ')}"`);
    }

    if (!callback) {
      throw new Error('Query.on failed: Function called with 1 argument. Expects at least 2.');
    }

    if (!isFunction(callback)) {
      throw new Error('Query.on failed: Second argument must be a valid function.');
    }

    if (cancelCallbackOrContext && !isFunction(cancelCallbackOrContext) && !isObject(context) && !isObject(cancelCallbackOrContext)) {
      throw new Error('Query.on failed: Function called with 3 arguments, but third optional argument `cancelCallbackOrContext` was not a function.');
    }

    if (cancelCallbackOrContext && !isFunction(cancelCallbackOrContext) && context) {
      throw new Error('Query.on failed: Function called with 4 arguments, but third optional argument `cancelCallbackOrContext` was not a function.');
    }

    const eventQueryKey = `${this.makeQueryKey()}$${eventType}`;
    const _context = (cancelCallbackOrContext && !isFunction(cancelCallbackOrContext)) ? cancelCallbackOrContext : context;

    INTERNALS.SharedEventEmitter.addListener(eventQueryKey, _context ? callback.bind(_context) : callback);

    if (isFunction(cancelCallbackOrContext)) {
      INTERNALS.SharedEventEmitter.once(`${eventQueryKey}:cancelled`, _context ? cancelCallbackOrContext.bind(_context) : cancelCallbackOrContext);
    }

    // initialise the native listener if not already listening
    this._database._native.on({
      eventType,
      eventQueryKey,
      id: this._refId, // todo remove
      path: this.path,
      modifiers: this._query.getModifiers(),
    });

    if (!this._database._references[this._refId]) {
      this._database._references[this._refId] = this;
    }

    this._listeners = this._listeners + 1;
    return callback;
  }

  /**
   *
   * @param eventType
   * @param originalCallback
   */
  off(eventType?: string = '', originalCallback?: () => any) {
    if (eventType && (!isString(eventType) || !ReferenceEventTypes[eventType])) {
      throw new Error(`Query.off failed: First argument must be a valid string event type: "${Object.keys(ReferenceEventTypes).join(', ')}"`);
    }

    if (originalCallback && !isFunction(originalCallback)) {
      throw new Error('Query.off failed: Function called with 2 arguments, but second optional argument was not a function.');
    }

    if (eventType) {
      const eventQueryKey = `${this.makeQueryKey()}$${eventType}`;

      if (originalCallback) {
        INTERNALS.SharedEventEmitter.removeListener(eventQueryKey, originalCallback);
      } else {
        INTERNALS.SharedEventEmitter.removeAllListeners(eventQueryKey);
        INTERNALS.SharedEventEmitter.removeAllListeners(`${this.makeQueryKey()}:cancelled`);
      }

      // check if there's any listeners remaining in the js thread
      // if there's isn't then call the native .off method which
      // will unsubscribe from the native firebase listeners
      const remainingListeners = INTERNALS.SharedEventEmitter.listeners(eventQueryKey);

      if (!remainingListeners || !remainingListeners.length) {
        this._database._native.off(
          this._refId, // todo remove
          eventQueryKey,
        );

        // remove straggling cancellation listeners
        INTERNALS.SharedEventEmitter.removeAllListeners(`${this.makeQueryKey()}:cancelled`);
      }
    } else {
      // todo remove all associated event subs if no event type && no orignalCb
    }
  }


}
