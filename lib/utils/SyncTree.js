import { NativeEventEmitter } from 'react-native';

import INTERNALS from './../internals';
import DatabaseSnapshot from './../modules/database/snapshot';
import DatabaseReference from './../modules/database/reference';
import { isString, nativeToJSError } from './../utils';

type Registration = {
  key: String,
  path: String,
  once?: Boolean,
  appName: String,
  eventType: String,
  listener: Function,
  eventRegistrationKey: String,
  ref: DatabaseReference,
}

/**
 * Internally used to manage firebase database realtime event
 * subscriptions and keep the listeners in sync in js vs native.
 */
export default class SyncTree {
  constructor(databaseNative) {
    this._tree = {};
    this._reverseLookup = {};
    this._databaseNative = databaseNative;
    this._nativeEmitter = new NativeEventEmitter(databaseNative);
    this._nativeEmitter.addListener(
      'database_sync_event',
      this._handleSyncEvent.bind(this),
    );
  }

  /**
   *
   * @param event
   * @private
   */
  _handleSyncEvent(event) {
    if (event.error) {
      this._handleErrorEvent(event);
    } else {
      this._handleValueEvent(event);
    }
  }

  /**
   * Routes native database 'on' events to their js equivalent counterpart.
   * If there is no longer any listeners remaining for this event we internally
   * call the native unsub method to prevent further events coming through.
   *
   * @param event
   * @private
   */
  _handleValueEvent(event) {
    // console.log('SyncTree.VALUE >>>', event);
    const { key, eventRegistrationKey } = event.registration;
    const registration = this.getRegistration(eventRegistrationKey);

    if (!registration) {
      // registration previously revoked
      // notify native that the registration
      // no longer exists so it can remove
      // the native listeners
      return this._databaseNative.off(key, eventRegistrationKey);
    }

    const { snapshot, previousChildName } = event.data;

    // forward on to users .on(successCallback <-- listener
    return INTERNALS.SharedEventEmitter.emit(
      eventRegistrationKey,
      new DatabaseSnapshot(registration.ref, snapshot),
      previousChildName,
    );
  }


  /**
   * Routes native database query listener cancellation events to their js counterparts.
   *
   * @param event
   * @private
   */
  _handleErrorEvent(event) {
    // console.log('SyncTree.ERROR >>>', event);
    const { code, message } = event.error;
    const { eventRegistrationKey, registrationCancellationKey } = event.registration;

    const registration = this.getRegistration(registrationCancellationKey);

    if (registration) {
      // build a new js error - we additionally attach
      // the ref as a property for easier debugging
      const error = nativeToJSError(code, message, { ref: registration.ref });

      // forward on to users .on(successCallback, cancellationCallback <-- listener
      INTERNALS.SharedEventEmitter.emit(registrationCancellationKey, error);

      // remove the paired event registration - if we received a cancellation
      // event then it's guaranteed that they'll be no further value events
      this.removeRegistration(eventRegistrationKey);
    }
  }

  /**
   * Returns registration information such as appName, ref, path and registration keys.
   *
   * @param registration
   * @return {null}
   */
  getRegistration(registration): Registration | null {
    return this._reverseLookup[registration] ? Object.assign({}, this._reverseLookup[registration]) : null;
  }

  /**
   * Removes all listeners for the specified registration keys.
   *
   * @param registrations
   * @return {number}
   */
  removeListenersForRegistrations(registrations) {
    if (isString(registrations)) {
      this.removeRegistration(registrations);
      INTERNALS.SharedEventEmitter.removeAllListeners(registrations);
      return 1;
    }

    if (!Array.isArray(registrations)) return 0;
    for (let i = 0, len = registrations.length; i < len; i++) {
      this.removeRegistration(registrations[i]);
      INTERNALS.SharedEventEmitter.removeAllListeners(registrations[i]);
    }

    return registrations.length;
  }

  /**
   * Removes a specific listener from the specified registrations.
   *
   * @param listener
   * @param registrations
   * @return {Array} array of registrations removed
   */
  removeListenerRegistrations(listener, registrations) {
    if (!Array.isArray(registrations)) return [];
    const removed = [];

    for (let i = 0, len = registrations.length; i < len; i++) {
      const registration = registrations[i];
      const subscriptions = INTERNALS.SharedEventEmitter._subscriber.getSubscriptionsForType(registration);
      if (subscriptions) {
        for (let j = 0, l = subscriptions.length; j < l; j++) {
          const subscription = subscriptions[j];
          // The subscription may have been removed during this event loop.
          // its listener matches the listener in method parameters
          if (subscription && subscription.listener === listener) {
            subscription.remove();
            removed.push(registration);
            this.removeRegistration(registration);
          }
        }
      }
    }

    return removed;
  }

  /**
   * Returns an array of all registration keys for the specified path.
   *
   * @param path
   * @return {Array}
   */
  getRegistrationsByPath(path): Array {
    const out = [];
    const eventKeys = Object.keys(this._tree[path] || {});

    for (let i = 0, len = eventKeys.length; i < len; i++) {
      Array.prototype.push.apply(out, Object.keys(this._tree[path][eventKeys[i]]));
    }

    return out;
  }

  /**
   * Returns an array of all registration keys for the specified path and eventType.
   *
   * @param path
   * @param eventType
   * @return {Array}
   */
  getRegistrationsByPathEvent(path, eventType): Array {
    if (!this._tree[path]) return [];
    if (!this._tree[path][eventType]) return [];

    return Object.keys(this._tree[path][eventType]);
  }

  /**
   * Returns a single registration key for the specified path, eventType, and listener
   *
   * @param path
   * @param eventType
   * @param listener
   * @return {Array}
   */
  getOneByPathEventListener(path: string, eventType: string, listener: Function): Array {
    if (!this._tree[path]) return [];
    if (!this._tree[path][eventType]) return [];

    const registrationsForPathEvent = Object.entries(this._tree[path][eventType]);

    for (let i = 0; i < registrationsForPathEvent.length; i++) {
      const registration = registrationsForPathEvent[i];
      if (registration[1] === listener) return registration[0];
    }

    return null;
  }


  /**
   * Register a new listener.
   *
   * @param parameters
   * @param listener
   * @return {String}
   */
  addRegistration(parameters: Registration, listener): String {
    const { path, eventType, eventRegistrationKey, once } = parameters;

    if (!this._tree[path]) this._tree[path] = {};
    if (!this._tree[path][eventType]) this._tree[path][eventType] = {};

    this._tree[path][eventType][eventRegistrationKey] = listener;
    this._reverseLookup[eventRegistrationKey] = Object.assign({ listener }, parameters);

    if (once) {
      INTERNALS.SharedEventEmitter.once(
        eventRegistrationKey,
        this._onOnceRemoveRegistration(eventRegistrationKey, listener),
      );
    } else {
      INTERNALS.SharedEventEmitter.addListener(eventRegistrationKey, listener);
    }

    return eventRegistrationKey;
  }

  /**
   * Remove a registration, if it's not a `once` registration then instructs native
   * to also remove the underlying database query listener.
   *
   * @param registration
   * @return {boolean}
   */
  removeRegistration(registration: String): Boolean {
    if (!this._reverseLookup[registration]) return false;
    const { path, eventType, once } = this._reverseLookup[registration];

    if (!this._tree[path]) {
      delete this._reverseLookup[registration];
      return false;
    }

    if (!this._tree[path][eventType]) {
      delete this._reverseLookup[registration];
      return false;
    }

    // we don't want `once` events to notify native as they're already
    // automatically unsubscribed on native when the first event is sent
    const registrationObj = this._reverseLookup[registration];
    if (registrationObj && !once) {
      this._databaseNative.off(registrationObj.key, registration);
    }

    delete this._tree[path][eventType][registration];
    delete this._reverseLookup[registration];

    return !!registrationObj;
  }

  /**
   * Wraps a `once` listener with a new function that self de-registers.
   *
   * @param registration
   * @param listener
   * @return {function(...[*])}
   * @private
   */
  _onOnceRemoveRegistration(registration, listener) {
    return (...args) => {
      this.removeRegistration(registration);
      listener(...args);
    };
  }
}

