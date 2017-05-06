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
   * Called once with the initial data at the specified location and then once each
   * time the data changes.
   *
   * @callback onValueCallback
   * @param {!DataSnapshot} dataSnapshot - Snapshot representing data at the location
   * specified by the current ref. It won't trigger (.val() won't return a value)
   * until the entire contents have been synchronized. If location has no data, .val()
   * will return null.
   */

  /**
   * Called once for each initial child at the specified location and then again
   * every time a new child is added.
   *
   * @callback onChildAddedCallback
   * @param {!DataSnapshot} dataSnapshot - Snapshot reflecting the data for the
   * relevant child.
   * @param {?ReferenceKey} previousChildKey - For ordering purposes, the key
   * of the previous sibling child by sort order, or null if it is the first child.
   */

  /**
   * Called once every time a child is removed.
   *
   * A child will get removed when either:
   * - remove() is explicitly called on a child or one of its ancestors
   * - set(null) is called on that child or one of its ancestors
   * - a child has all of its children removed
   * - there is a query in effect which now filters out the child (because it's sort
   * order changed or the max limit was hit)
   *
   * @callback onChildRemovedCallback
   * @param {!DataSnapshot} dataSnapshot - Snapshot reflecting the old data for
   * the child that was removed.
   */

  /**
   * Called when a child (or any of its descendants) changes.
   *
   * A single child_changed event may represent multiple changes to the child.
   *
   * @callback onChildChangedCallback
   * @param {!DataSnapshot} dataSnapshot - Snapshot reflecting new child contents.
   * @param {?ReferenceKey} previousChildKey - For ordering purposes, the key
   * of the previous sibling child by sort order, or null if it is the first child.
   */

  /**
   * Called when a child's sort order changes, i.e. its position relative to its
   * siblings changes.
   *
   * @callback onChildMovedCallback
   * @param {!DataSnapshot} dataSnapshot - Snapshot reflecting the data of the moved
   * child.
   * @param {?ReferenceKey} previousChildKey - For ordering purposes, the key
   * of the previous sibling child by sort order, or null if it is the first child.
   */

  /**
   * @typedef (onValueCallback|onChildAddedCallback|onChildRemovedCallback|onChildChangedCallback|onChildMovedCallback) ReferenceEventCallback
   */

  /**
   * Called if the event subscription is cancelled because the client does
   * not have permission to read this data (or has lost the permission to do so).
   *
   * @callback onFailureCallback
   * @param {Error} error - Object indicating why the failure occurred
   */

  /**
   * Binds callback handlers to when data changes at the current ref's location.
   * The primary method of reading data from a Database.
   *
   * Callbacks can be unbound using {@link off}.
   *
   * Event Types:
   *
   * - value: {@link onValueCallback}.
   * - child_added: {@link onChildAddedCallback}
   * - child_removed: {@link onChildRemovedCallback}
   * - child_changed: {@link onChildChangedCallback}
   * - child_moved: {@link onChildMovedCallback}
   *
   * @param {ReferenceEventType} eventType - Type of event to attach a callback for.
   * @param {ReferenceEventCallback} successCallback - Function that will be called
   * when the event occurs with the new data.
   * @param {onFailureCallback=} failureCallbackOrContext - Optional callback that is called
   * if the event subscription fails. {@link onFailureCallback}
   * @param {*=} context - Optional object to bind the callbacks to when calling them.
   * @returns {ReferenceEventCallback} callback function, unmodified (unbound), for
   * convenience if you want to pass an inline function to on() and store it later for
   * removing using off().
   *
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#on}
   */
  on(eventType: string, successCallback: () => any, failureCallbackOrContext: () => any, context: any) {
    if (!eventType) throw new Error('Error: Query on failed: Was called with 0 arguments. Expects at least 2');
    if (!ReferenceEventTypes[eventType]) throw new Error('Query.on failed: First argument must be a valid event type: "value", "child_added", "child_removed", "child_changed", or "child_moved".');
    if (!successCallback) throw new Error('Query.on failed: Was called with 1 argument. Expects at least 2.');
    if (!isFunction(successCallback)) throw new Error('Query.on failed: Second argument must be a valid function.');
    if (arguments.length > 2 && !failureCallbackOrContext) throw new Error('Query.on failed: third argument  must either be a cancel callback or a context object.');

    this.log.debug('adding reference.on', this.refId, eventType);

    let _failureCallback;
    let _context;

    if (context) {
      _context = context;
      _failureCallback = failureCallbackOrContext;
    } else {
      if (isFunction(failureCallbackOrContext)) {
        _failureCallback = failureCallbackOrContext;
      } else {
        _context = failureCallbackOrContext;
      }
    }

    if (_failureCallback) {
      _failureCallback = (error) => {
        if (error.message.startsWith('FirebaseError: permission_denied')) {

          error.message = `permission_denied at /${this.path}: Client doesn\'t have permission to access the desired data.`
        }

        failureCallbackOrContext(error);

      }
    }

    let _successCallback;

    if (_context) {
      _successCallback = successCallback.bind(_context);
    } else {
      _successCallback = successCallback;
    }

    const listener = {
      listenerId: Object.keys(this.listeners).length + 1,
      eventName: eventType,
      successCallback: _successCallback,
      failureCallback: _failureCallback,
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
   * Detaches a callback attached with on().
   *
   * Calling off() on a parent listener will not automatically remove listeners
   * registered on child nodes.
   *
   * If on() was called multiple times with the same eventType off() must be
   * called multiple times to completely remove it.
   *
   * If a callback is not specified, all callbacks for the specified eventType
   * will be removed. If no eventType or callback is specified, all callbacks
   * for the Reference will be removed.
   *
   * If a context is specified, it too is used as a filter parameter: a callback
   * will only be detached if, when it was attached with on(), the same event type,
   * callback function and context were provided.
   *
   * If no callbacks matching the parameters provided are found, no callbacks are
   * detached.
   *
   * @param {('value'|'child_added'|'child_changed'|'child_removed'|'child_moved')=} eventType - Type of event to detach callback for.
   * @param {Function=} originalCallback - Original callback passed to on()
   * @param {*=} context - The context passed to on() when the callback was bound
   *
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#off}
   */
  off(eventType?: string = '', originalCallback?: () => any) {
    this.log.debug('ref.off(): ', this.refId, eventType);
    // $FlowFixMe
    const listeners: Array<DatabaseListener> = Object.values(this.listeners);
    let listenersToRemove;
    if (eventType && originalCallback) {
      listenersToRemove = listeners.filter((listener) => {
        return listener.eventName === eventType && listener.successCallback === originalCallback;
      });
      // Only remove a single listener as per the web spec
      if (listenersToRemove.length > 1) listenersToRemove = [listenersToRemove[0]];
    } else if (eventType) {
      listenersToRemove = listeners.filter((listener) => {
        return listener.eventName === eventType;
      });
    } else if (originalCallback) {
      listenersToRemove = listeners.filter((listener) => {
        return listener.successCallback === originalCallback;
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
   * Creates a Reference to a child of the current Reference, using a relative path.
   * No validation is performed on the path to ensure it has a valid format.
   * @param {String} path relative to current ref's location
   * @returns {!Reference} A new Reference to the path provided, relative to the current
   * Reference
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#child}
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
   *
   * {@link https://firebase.google.com/docs/reference/js/firebase.database.Reference#isEqual}
   */
  isEqual(otherRef: Reference): boolean {
    return !!otherRef && otherRef.constructor === Reference && otherRef.key === this.key;
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
  get parent(): Reference|null {
    if (this.path === '/') return null;
    return new Reference(this.database, this.path.substring(0, this.path.lastIndexOf('/')));
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
