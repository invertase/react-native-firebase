/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { createDeprecationProxy, isString } from '@react-native-firebase/app/dist/module/common';
import { getReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import NativeError from '@react-native-firebase/app/dist/module/internal/NativeFirebaseError';
import SharedEventEmitter from '@react-native-firebase/app/dist/module/internal/SharedEventEmitter';
import DatabaseDataSnapshot from './DatabaseDataSnapshot';
import type DatabaseReference from './DatabaseReference';
import type { EventType } from './types/database';

interface Registration {
  eventRegistrationKey: string;
  registrationCancellationKey?: string;
  eventType: EventType;
  listener: (snapshot: DatabaseDataSnapshot, previousChildName?: string | null) => void;
  once?: boolean;
  path: string;
  ref: DatabaseReference;
  key: string;
  appName?: string;
  dbURL?: string;
}

interface SyncEventBody {
  error?: unknown;
  registration?: {
    eventRegistrationKey: string;
    registrationCancellationKey?: string;
  };
  key?: string;
  eventRegistrationKey?: string;
  eventType?: EventType;
  data?: {
    snapshot?: unknown;
    previousChildName?: string | null;
  };
}

interface SyncEvent {
  body: SyncEventBody;
}

class DatabaseSyncTree {
  private _tree: Record<
    string,
    Record<
      EventType,
      Record<string, (snapshot: DatabaseDataSnapshot, previousChildName?: string | null) => void>
    >
  >;
  private _reverseLookup: Record<string, Registration>;
  private _registry: Record<
    string,
    Set<{
      listener: (snapshot: DatabaseDataSnapshot, previousChildName?: string | null) => void;
      remove: () => void;
      context?: Record<string, unknown>;
    }>
  >;

  constructor() {
    this._tree = {};
    this._reverseLookup = {};

    // we need to be able to register multiple listeners for a single event,
    // *then delete a specific single listener for that event*, so we have to
    // be able to identify specific listeners for removal which means we need
    // to mirror the private registration accounting from upstream EventEmitter
    // so we have access here and can do our single emitter removal
    // This is a map of emitter-key <-> set of listener registrations
    // The listener registrations have { context, listener, remove() }
    this._registry = {};

    SharedEventEmitter.addListener('database_sync_event', this._handleSyncEvent.bind(this));
  }

  get native(): ReturnType<typeof getReactNativeModule> {
    return getReactNativeModule('RNFBDatabaseQueryModule');
  }

  // from upstream EventEmitter: initialize registrations for an emitter key
  _allocate(
    registry: Record<
      string,
      Set<{
        listener: (snapshot: DatabaseDataSnapshot, previousChildName?: string | null) => void;
        remove: () => void;
        context?: Record<string, unknown>;
      }>
    >,
    eventType: string,
  ): Set<{
    listener: (snapshot: DatabaseDataSnapshot, previousChildName?: string | null) => void;
    remove: () => void;
    context?: Record<string, unknown>;
  }> {
    let registrations = registry[eventType];
    if (registrations == null) {
      registrations = new Set();
      registry[eventType] = registrations;
    }
    return registrations;
  }

  /**
   * Handles an incoming event from native
   * @param event
   * @private
   */
  _handleSyncEvent(event: SyncEvent): void {
    const { body } = event;
    if (body.error) {
      this._handleErrorEvent(body);
    } else {
      this._handleValueEvent(body);
    }
  }

  /**
   * Routes native database query listener cancellation events to their js counterparts.
   *
   * @param event
   * @private
   */
  _handleErrorEvent(event: SyncEventBody): void {
    // console.log('SyncTree.ERROR >>>', event);
    const { eventRegistrationKey, registrationCancellationKey } = event.registration || {};

    if (!eventRegistrationKey || !registrationCancellationKey) {
      return;
    }

    const registration = this.getRegistration(registrationCancellationKey);

    if (registration) {
      // build a new js error - we additionally attach
      // the ref as a property for easier debugging
      const error = NativeError.fromEvent(event.error as any, 'database');

      // forward on to users .on(successCallback, cancellationCallback <-- listener
      SharedEventEmitter.emit(registrationCancellationKey, error);

      // remove the paired event registration - if we received a cancellation
      // event then it's guaranteed that they'll be no further value events
      this.removeRegistration(eventRegistrationKey);
    }
  }

  /**
   * Routes native database 'on' events to their js equivalent counterpart.
   * If t is no longer any listeners remaining for this event we internally
   * call the native unsub method to prevent further events coming through.
   *
   * @param event
   * @private
   */
  _handleValueEvent(event: SyncEventBody): void {
    // console.log('SyncTree.VALUE >>>', event);
    const { key, eventType, registration: registrationData } = event;
    const eventRegistrationKey = registrationData?.eventRegistrationKey;
    if (!eventRegistrationKey || !key || !eventType) {
      return;
    }

    const registration = this.getRegistration(eventRegistrationKey);
    // console.log('SyncTree.registration >>>', registration);

    if (!registration) {
      // registration previously revoked
      // notify native that the registration
      // no longer exists so it can remove
      // the native listeners
      return (this.native as any)?.off(key, eventRegistrationKey);
    }

    let snapshot: DatabaseDataSnapshot;
    let previousChildName: string | null | undefined;

    // Value events don't return a previousChildName
    if (eventType === 'value') {
      snapshot = createDeprecationProxy(
        new DatabaseDataSnapshot(
          registration.ref,
          event.data as {
            value: unknown;
            key: string | null;
            exists: boolean;
            childKeys: string[];
            priority: string | number | null;
          },
        ),
      ) as DatabaseDataSnapshot;
    } else {
      snapshot = createDeprecationProxy(
        new DatabaseDataSnapshot(
          registration.ref,
          (event.data?.snapshot as {
            value: unknown;
            key: string | null;
            exists: boolean;
            childKeys: string[];
            priority: string | number | null;
          }) || { value: null, key: null, exists: false, childKeys: [], priority: null },
        ),
      ) as DatabaseDataSnapshot;
      previousChildName = event.data?.previousChildName;
    }

    // forward on to users .on(successCallback <-- listener
    return SharedEventEmitter.emit(eventRegistrationKey, snapshot, previousChildName);
  }

  /**
   * Returns registration information such as appName, ref, path and registration keys.
   *
   * @param registration
   * @return {null}
   */
  getRegistration(registration: string): Registration | null {
    return this._reverseLookup[registration]
      ? Object.assign({}, this._reverseLookup[registration])
      : null;
  }

  /**
   * Removes all listeners for the specified registration keys.
   *
   * @param registrations
   * @return {number}
   */
  removeListenersForRegistrations(registrations: string | string[]): number {
    if (isString(registrations)) {
      this.removeRegistration(registrations);
      SharedEventEmitter.removeAllListeners(registrations);

      // mirror upstream accounting - clear out all registrations for this key
      if (registrations == null) {
        this._registry = {};
      } else {
        delete this._registry[registrations];
      }
      return 1;
    }

    if (!Array.isArray(registrations)) {
      return 0;
    }
    for (let i = 0, len = registrations.length; i < len; i++) {
      this.removeRegistration(registrations[i]!);
      SharedEventEmitter.removeAllListeners(registrations[i]!);
      // mirror upstream accounting - clear out all registrations for this key
      if (registrations[i] == null) {
        this._registry = {};
      } else {
        delete this._registry[registrations[i]!];
      }
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
  removeListenerRegistrations(
    listener: (snapshot: DatabaseDataSnapshot, previousChildName?: string | null) => void,
    registrations: string[],
  ): string[] {
    if (!Array.isArray(registrations)) {
      return [];
    }
    const removed: string[] = [];

    for (let i = 0, len = registrations.length; i < len; i++) {
      const registration = registrations[i]!;
      let subscriptions:
        | Array<{
            listener: (snapshot: DatabaseDataSnapshot, previousChildName?: string | null) => void;
            remove: () => void;
            context?: Record<string, unknown>;
          }>
        | undefined;

      // get all registrations for this key so we can find our specific listener
      const registrySubscriptionsSet = this._registry[registration];
      if (registrySubscriptionsSet) {
        subscriptions = Array.from(registrySubscriptionsSet);
      }

      if (subscriptions) {
        for (let j = 0, l = subscriptions.length; j < l; j++) {
          const subscription = subscriptions[j];
          // The subscription may have been removed during this event loop.
          // its listener matches the listener in method parameters
          if (subscription && subscription.listener === listener) {
            this._registry[registration]!.delete(subscription);
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
  getRegistrationsByPath(path: string): string[] {
    const out: string[] = [];
    const eventKeys = Object.keys(this._tree[path] || {});

    for (let i = 0, len = eventKeys.length; i < len; i++) {
      Array.prototype.push.apply(
        out,
        Object.keys(this._tree[path]![eventKeys[i]! as EventType] || {}),
      );
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
  getRegistrationsByPathEvent(path: string, eventType: EventType): string[] {
    if (!this._tree[path]) {
      return [];
    }
    if (!this._tree[path]![eventType]) {
      return [];
    }

    return Object.keys(this._tree[path]![eventType]!);
  }

  /**
   * Returns a single registration key for the specified path, eventType, and listener
   *
   * @param path
   * @param eventType
   * @param listener
   * @return {Array}
   */
  getOneByPathEventListener(
    path: string,
    eventType: EventType,
    listener: (snapshot: DatabaseDataSnapshot, previousChildName?: string | null) => void,
  ): string | null {
    if (!this._tree[path]) {
      return null;
    }
    if (!this._tree[path]![eventType]) {
      return null;
    }

    const registrationsForPathEvent = Object.entries(this._tree[path]![eventType]!);

    for (let i = 0; i < registrationsForPathEvent.length; i++) {
      const registration = registrationsForPathEvent[i]!;
      if (registration[1] === listener) {
        return registration[0]!;
      }
    }

    return null;
  }

  /**
   * Register a new listener.
   *
   * @param registration
   */
  addRegistration(registration: Registration): string {
    const { eventRegistrationKey, eventType, listener, once, path } = registration;

    if (!this._tree[path]) {
      this._tree[path] = {} as Record<
        EventType,
        Record<string, (snapshot: DatabaseDataSnapshot, previousChildName?: string | null) => void>
      >;
    }
    if (!this._tree[path]![eventType]) {
      this._tree[path]![eventType] = {};
    }

    this._tree[path]![eventType]![eventRegistrationKey] = listener;
    this._reverseLookup[eventRegistrationKey] = registration;

    if (once) {
      const subscription = SharedEventEmitter.addListener(
        eventRegistrationKey,
        (event: DatabaseDataSnapshot) => {
          this._onOnceRemoveRegistration(eventRegistrationKey, listener)(event);
          subscription.remove();
        },
      );
    } else {
      const registrationSubscription = SharedEventEmitter.addListener(
        eventRegistrationKey,
        listener,
      );

      // add this listener registration info to our emitter-key map
      // in case we need to identify and remove a specific listener later
      const registrations = this._allocate(this._registry, eventRegistrationKey);
      registrations.add(registrationSubscription);
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
  removeRegistration(registration: string): boolean {
    if (!this._reverseLookup[registration]) {
      return false;
    }
    const { path, eventType, once } = this._reverseLookup[registration]!;

    if (!this._tree[path]) {
      delete this._reverseLookup[registration];
      return false;
    }

    if (!this._tree[path]![eventType]) {
      delete this._reverseLookup[registration];
      return false;
    }

    // we don't want `once` events to notify native as they're already
    // automatically unsubscribed on native when the first event is sent
    const registrationObj = this._reverseLookup[registration];
    if (registrationObj && !once) {
      (this.native as any)?.off(registrationObj.key, registration);
    }

    delete this._tree[path]![eventType]![registration];
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
  _onOnceRemoveRegistration(
    registration: string,
    listener: (snapshot: DatabaseDataSnapshot, previousChildName?: string | null) => void,
  ): (snapshot: DatabaseDataSnapshot, previousChildName?: string | null) => void {
    return (...args) => {
      this.removeRegistration(registration);
      listener(...args);
    };
  }
}

export default new DatabaseSyncTree();
