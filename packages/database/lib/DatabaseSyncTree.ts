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
import NativeError from '@react-native-firebase/app/dist/module/internal/NativeFirebaseError';
import SharedEventEmitter from '@react-native-firebase/app/dist/module/internal/SharedEventEmitter';
import { getReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import DatabaseDataSnapshot from './DatabaseDataSnapshot';
import type {
  DatabaseChildSnapshotResultInternal,
  DatabaseListenRegistrationInternal,
  DatabaseSnapshotInternal,
  RNFBDatabaseModule,
} from './types/internal';
import type { FirebaseDatabaseTypes } from './types/namespaced';

interface DatabaseSyncTreeRegistration {
  eventType: string;
  ref: FirebaseDatabaseTypes.Reference;
  path: string;
  key: string;
  appName: string;
  dbURL: string | null;
  eventRegistrationKey: string;
  listener: (...args: any[]) => void;
  once?: boolean;
}

interface SharedEventSubscriptionInternal {
  listener: (...args: any[]) => void;
  remove(): void;
}

interface DatabaseSyncEventBody {
  error?: unknown;
  eventType: string;
  data: DatabaseSnapshotInternal | DatabaseChildSnapshotResultInternal;
}

interface DatabaseSyncEventInternal {
  body: DatabaseSyncEventBody;
  error?: Parameters<typeof NativeError.fromEvent>[0];
  registration: DatabaseListenRegistrationInternal;
}

type DatabaseSyncTreeListener = DatabaseSyncTreeRegistration['listener'];
type DatabaseSyncTreePathMap = Record<
  string,
  Record<string, Record<string, DatabaseSyncTreeListener>>
>;
type DatabaseSyncTreeRegistry = Record<string, Set<SharedEventSubscriptionInternal>>;

class DatabaseSyncTree {
  private _tree: DatabaseSyncTreePathMap = {};
  private _reverseLookup: Record<string, DatabaseSyncTreeRegistration> = {};

  // We need to track individual emitter subscriptions so one callback can be removed
  // without clearing every listener bound to the same registration key.
  private _registry: DatabaseSyncTreeRegistry = {};

  constructor() {
    SharedEventEmitter.addListener(
      'database_sync_event',
      this._handleSyncEvent.bind(this) as (event: unknown) => void,
    );
  }

  private get native(): RNFBDatabaseModule {
    return getReactNativeModule('RNFBDatabaseQueryModule') as unknown as RNFBDatabaseModule;
  }

  private _allocate(
    registry: DatabaseSyncTreeRegistry,
    eventType: string,
  ): Set<SharedEventSubscriptionInternal> {
    let registrations = registry[eventType];
    if (registrations == null) {
      registrations = new Set<SharedEventSubscriptionInternal>();
      registry[eventType] = registrations;
    }
    return registrations;
  }

  /**
   * Handles an incoming event from native.
   */
  private _handleSyncEvent(event: DatabaseSyncEventInternal): void {
    const { body } = event;
    if (body.error) {
      this._handleErrorEvent(event);
    } else {
      this._handleValueEvent(event);
    }
  }

  /**
   * Routes native database query listener cancellation events to their JS counterparts.
   */
  private _handleErrorEvent(event: DatabaseSyncEventInternal): void {
    const { eventRegistrationKey, registrationCancellationKey } = event.registration;

    if (!registrationCancellationKey) {
      return;
    }

    const registration = this.getRegistration(registrationCancellationKey);

    if (registration) {
      const error = NativeError.fromEvent(
        (event.error ?? event.body.error) as Parameters<typeof NativeError.fromEvent>[0],
        'database',
      ) as Error;

      SharedEventEmitter.emit(registrationCancellationKey, error);

      // If native cancelled the listener, value events for the paired registration
      // are finished as well, so clean up the JS-side bookkeeping.
      this.removeRegistration(eventRegistrationKey);
    }
  }

  /**
   * Routes native database `on` events to their JS equivalents.
   * If there are no listeners left for the event, native is told to unsubscribe.
   */
  private _handleValueEvent(event: DatabaseSyncEventInternal): void {
    const { key, eventRegistrationKey } = event.registration;
    const registration = this.getRegistration(eventRegistrationKey);

    if (!registration) {
      this.native.off(key, eventRegistrationKey);
      return;
    }

    let snapshot: FirebaseDatabaseTypes.DataSnapshot;
    let previousChildName: string | null | undefined;

    if (event.body.eventType === 'value') {
      snapshot = createDeprecationProxy(
        new DatabaseDataSnapshot(registration.ref, event.body.data as DatabaseSnapshotInternal),
      ) as FirebaseDatabaseTypes.DataSnapshot;
    } else {
      const childData = event.body.data as DatabaseChildSnapshotResultInternal;
      snapshot = createDeprecationProxy(
        new DatabaseDataSnapshot(registration.ref, childData.snapshot),
      ) as FirebaseDatabaseTypes.DataSnapshot;
      previousChildName = childData.previousChildName;
    }

    SharedEventEmitter.emit(eventRegistrationKey, snapshot, previousChildName);
  }

  /**
   * Returns registration information such as appName, ref, path and registration keys.
   */
  getRegistration(registration: string): DatabaseSyncTreeRegistration | null {
    return this._reverseLookup[registration]
      ? Object.assign({}, this._reverseLookup[registration])
      : null;
  }

  /**
   * Removes all listeners for the specified registration keys.
   */
  removeListenersForRegistrations(registrations: string[] | string): number {
    if (isString(registrations)) {
      this.removeRegistration(registrations);
      SharedEventEmitter.removeAllListeners(registrations);
      delete this._registry[registrations];
      return 1;
    }

    if (!Array.isArray(registrations)) {
      return 0;
    }

    for (let i = 0, len = registrations.length; i < len; i++) {
      this.removeRegistration(registrations[i] as string);
      SharedEventEmitter.removeAllListeners(registrations[i] as string);
      delete this._registry[registrations[i] as string];
    }

    return registrations.length;
  }

  /**
   * Removes a specific listener from the specified registrations.
   */
  removeListenerRegistrations(
    listener: (...args: any[]) => void,
    registrations: string[],
  ): string[] {
    if (!Array.isArray(registrations)) {
      return [];
    }

    const removed: string[] = [];

    for (let i = 0, len = registrations.length; i < len; i++) {
      const registration = registrations[i] as string;
      let subscriptions: SharedEventSubscriptionInternal[] | undefined;

      const registrySubscriptionsSet = this._registry[registration];
      if (registrySubscriptionsSet) {
        subscriptions = Array.from(registrySubscriptionsSet);
      }

      if (subscriptions) {
        for (let j = 0, l = subscriptions.length; j < l; j++) {
          const subscription = subscriptions[j];
          if (subscription && subscription.listener === listener) {
            this._registry[registration]?.delete(subscription);
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
   * Returns all registration keys for the specified path.
   */
  getRegistrationsByPath(path: string): string[] {
    const out: string[] = [];
    const eventKeys = Object.keys(this._tree[path] || {});

    for (let i = 0, len = eventKeys.length; i < len; i++) {
      Array.prototype.push.apply(
        out,
        Object.keys(this._tree[path]?.[eventKeys[i] as string] || {}),
      );
    }

    return out;
  }

  /**
   * Returns all registration keys for the specified path and event type.
   */
  getRegistrationsByPathEvent(path: string, eventType?: string): string[] {
    if (!eventType) {
      return [];
    }

    if (!this._tree[path]) {
      return [];
    }

    if (!this._tree[path][eventType]) {
      return [];
    }

    return Object.keys(this._tree[path][eventType]);
  }

  /**
   * Returns a single registration key for the specified path, event type, and listener.
   */
  getOneByPathEventListener(
    path: string,
    eventType: string,
    listener: (...args: any[]) => void,
  ): string | null {
    if (!this._tree[path]) {
      return null;
    }

    if (!this._tree[path][eventType]) {
      return null;
    }

    const registrationsForPathEvent = Object.entries(this._tree[path][eventType]);

    for (let i = 0; i < registrationsForPathEvent.length; i++) {
      const registration = registrationsForPathEvent[i];
      if (registration?.[1] === listener) {
        return registration[0];
      }
    }

    return null;
  }

  /**
   * Register a new listener.
   */
  addRegistration(registration: DatabaseSyncTreeRegistration): string {
    const { eventRegistrationKey, eventType, listener, once, path } = registration;

    if (!this._tree[path]) {
      this._tree[path] = {};
    }

    if (!this._tree[path][eventType]) {
      this._tree[path][eventType] = {};
    }

    this._tree[path][eventType][eventRegistrationKey] = listener;
    this._reverseLookup[eventRegistrationKey] = registration;

    if (once) {
      const subscription = SharedEventEmitter.addListener(
        eventRegistrationKey,
        (event: unknown) => {
          this._onOnceRemoveRegistration(eventRegistrationKey, listener)(event);
          subscription.remove();
        },
      ) as unknown as SharedEventSubscriptionInternal;
      return eventRegistrationKey;
    }

    const emitterSubscription = SharedEventEmitter.addListener(
      eventRegistrationKey,
      listener,
    ) as unknown as SharedEventSubscriptionInternal;

    const registrations = this._allocate(this._registry, eventRegistrationKey);
    registrations.add(emitterSubscription);

    return eventRegistrationKey;
  }

  /**
   * Remove a registration and unsubscribe the paired native listener when needed.
   */
  removeRegistration(registration: string): boolean {
    if (!this._reverseLookup[registration]) {
      return false;
    }

    const registrationObj = this._reverseLookup[registration];
    const { path, eventType, once } = registrationObj;

    if (!this._tree[path]) {
      delete this._reverseLookup[registration];
      return false;
    }

    if (!this._tree[path][eventType]) {
      delete this._reverseLookup[registration];
      return false;
    }

    // `once` registrations are already unsubscribed by native after the first event.
    if (!once) {
      this.native.off(registrationObj.key, registration);
    }

    delete this._tree[path][eventType][registration];
    delete this._reverseLookup[registration];

    return true;
  }

  /**
   * Wraps a `once` listener with a function that self-deregisters.
   */
  private _onOnceRemoveRegistration(
    registration: string,
    listener: (...args: any[]) => void,
  ): (...args: any[]) => void {
    return (...args: any[]) => {
      this.removeRegistration(registration);
      listener(...args);
    };
  }
}

export default new DatabaseSyncTree();
