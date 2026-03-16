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

import {
  isBoolean,
  isFunction,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
  pathIsEmpty,
  pathToUrlEncodedString,
  ReferenceBase,
  createDeprecationProxy,
  MODULAR_DEPRECATION_ARG,
} from '@react-native-firebase/app/dist/module/common';
import DatabaseDataSnapshot from './DatabaseDataSnapshot';
import DatabaseSyncTree from './DatabaseSyncTree';
import DatabaseQueryModifiers from './DatabaseQueryModifiers';
import type { DatabaseInternal } from './types/internal';
import type { EventType, Reference } from './types/database';
import type DatabaseReference from './DatabaseReference';

const eventTypes: EventType[] = [
  'value',
  'child_added',
  'child_changed',
  'child_moved',
  'child_removed',
];

// To avoid React Native require cycle warnings
let DatabaseReferenceClass: typeof DatabaseReference | null = null;
export function provideReferenceClass(databaseReference: typeof DatabaseReference): void {
  DatabaseReferenceClass = databaseReference;
}

// Internal listener count
let listeners = 0;

export default class DatabaseQuery extends ReferenceBase {
  protected _database: DatabaseInternal;
  protected _modifiers: DatabaseQueryModifiers;

  constructor(database: DatabaseInternal, path: string, modifiers: DatabaseQueryModifiers) {
    super(path);
    this._database = database;
    this._modifiers = modifiers;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#endat
   */
  get ref(): Reference {
    if (!DatabaseReferenceClass) {
      throw new Error('DatabaseReference class not provided. Call provideReferenceClass first.');
    }
    return createDeprecationProxy(
      new DatabaseReferenceClass(this._database, this.path),
    ) as unknown as Reference;
  }

  /**
   *
   * @param value
   * @param key
   * @return {DatabaseQuery}
   */
  endAt(value: number | string | boolean | null, key?: string): DatabaseQuery {
    if (!isNumber(value) && !isString(value) && !isBoolean(value) && !isNull(value)) {
      throw new Error(
        "firebase.database().ref().endAt(*) 'value' must be a number, string, boolean or null value.",
      );
    }

    if (!isUndefined(key) && !isString(key)) {
      throw new Error(
        "firebase.database().ref().endAt(_, *) 'key' must be a string value if defined.",
      );
    }

    if (this._modifiers.hasEndAt()) {
      throw new Error(
        'firebase.database().ref().endAt() Ending point was already set (by another call to endAt or equalTo).',
      );
    }

    const modifiers = this._modifiers._copy().endAt(value, key);
    modifiers.validateModifiers('firebase.database().ref().endAt()');

    return createDeprecationProxy(
      new DatabaseQuery(this._database, this.path, modifiers),
    ) as DatabaseQuery;
  }

  /**
   *
   * @param value
   * @param key
   * @return {DatabaseQuery}
   */
  equalTo(value: number | string | boolean | null, key?: string): DatabaseQuery {
    if (!isNumber(value) && !isString(value) && !isBoolean(value) && !isNull(value)) {
      throw new Error(
        "firebase.database().ref().equalTo(*) 'value' must be a number, string, boolean or null value.",
      );
    }

    if (!isUndefined(key) && !isString(key)) {
      throw new Error(
        "firebase.database().ref().equalTo(_, *) 'key' must be a string value if defined.",
      );
    }

    if (this._modifiers.hasStartAt()) {
      throw new Error(
        'firebase.database().ref().equalTo() Starting point was already set (by another call to startAt or equalTo).',
      );
    }

    if (this._modifiers.hasEndAt()) {
      throw new Error(
        'firebase.database().ref().equalTo() Ending point was already set (by another call to endAt or equalTo).',
      );
    }

    // Internal method calls should always use MODULAR_DEPRECATION_ARG to avoid false deprecation warnings
    return (
      this.startAt as (
        value: number | string | boolean | null,
        key?: string,
        ...args: unknown[]
      ) => DatabaseQuery
    )
      .call(this, value, key, MODULAR_DEPRECATION_ARG)
      .endAt.call(this, value, MODULAR_DEPRECATION_ARG);
  }

  /**
   *
   * @param other
   * @return {boolean}
   */
  isEqual(other: DatabaseQuery): boolean {
    if (!(other instanceof DatabaseQuery)) {
      throw new Error("firebase.database().ref().isEqual(*) 'other' must be an instance of Query.");
    }

    const sameApp = other._database.app === this._database.app;
    const sameDatabasePath = other.toString() === this.toString();
    const sameModifiers = other._modifiers.toString() === this._modifiers.toString();

    return sameApp && sameDatabasePath && sameModifiers;
  }

  /**
   *
   * @param limit
   * @return {DatabaseQuery}
   */
  limitToFirst(limit: number): DatabaseQuery {
    if (this._modifiers.isValidLimit(limit)) {
      throw new Error(
        "firebase.database().ref().limitToFirst(*) 'limit' must be a positive integer value.",
      );
    }

    if (this._modifiers.hasLimit()) {
      throw new Error(
        'firebase.database().ref().limitToFirst(*) Limit was already set (by another call to limitToFirst, or limitToLast)',
      );
    }

    return createDeprecationProxy(
      new DatabaseQuery(this._database, this.path, this._modifiers._copy().limitToFirst(limit)),
    ) as DatabaseQuery;
  }

  /**
   *
   * @param limit
   * @return {DatabaseQuery}
   */
  limitToLast(limit: number): DatabaseQuery {
    if (this._modifiers.isValidLimit(limit)) {
      throw new Error(
        "firebase.database().ref().limitToLast(*) 'limit' must be a positive integer value.",
      );
    }

    if (this._modifiers.hasLimit()) {
      throw new Error(
        'firebase.database().ref().limitToLast(*) Limit was already set (by another call to limitToFirst, or limitToLast)',
      );
    }

    return createDeprecationProxy(
      new DatabaseQuery(this._database, this.path, this._modifiers._copy().limitToLast(limit)),
    ) as DatabaseQuery;
  }

  /**
   *
   * @param eventType
   * @param callback
   * @param context
   * @return {DatabaseQuery}
   */
  off(
    eventType?: EventType,
    callback?: (snapshot: DatabaseDataSnapshot, previousChildKey?: string | null) => void,
    context?: Record<string, unknown>,
  ): number {
    //
    if (arguments.length === 0) {
      // Firebase Docs:
      //    if no eventType or callback is specified, all callbacks for the Reference will be removed
      return DatabaseSyncTree.removeListenersForRegistrations(
        DatabaseSyncTree.getRegistrationsByPath(this.path),
      );
    }

    if (!isUndefined(eventType) && !eventTypes.includes(eventType)) {
      throw new Error(
        `firebase.database().ref().off(*) 'eventType' must be one of ${eventTypes.join(', ')}.`,
      );
    }

    if (!isUndefined(callback) && !isFunction(callback)) {
      throw new Error("firebase.database().ref().off(_, *) 'callback' must be a function.");
    }

    if (!isUndefined(context) && !isNull(context) && !isObject(context)) {
      throw new Error("firebase.database().ref().off(_, _, *) 'context' must be an object.");
    }

    // Firebase Docs:
    //     Note that if on() was called
    //     multiple times with the same eventType and callback, the callback will be called
    //     multiple times for each event, and off() must be called multiple times to
    //     remove the callback.

    // Remove only a single registration
    if (eventType && callback) {
      const registration = DatabaseSyncTree.getOneByPathEventListener(
        this.path,
        eventType,
        callback,
      );
      if (!registration) {
        return 0;
      }

      // remove the paired cancellation registration if any exist
      DatabaseSyncTree.removeListenersForRegistrations([`${registration}$cancelled`]);

      // remove only the first registration to match firebase web sdk
      // call multiple times to remove multiple registrations
      return DatabaseSyncTree.removeListenerRegistrations(callback, [registration]).length;
    }

    // Firebase Docs:
    //     If a callback is not specified, all callbacks for the specified eventType will be removed.
    const registrations = DatabaseSyncTree.getRegistrationsByPathEvent(this.path, eventType!);

    DatabaseSyncTree.removeListenersForRegistrations(
      DatabaseSyncTree.getRegistrationsByPathEvent(
        this.path,
        `${eventType}$cancelled` as EventType,
      ),
    );

    return DatabaseSyncTree.removeListenersForRegistrations(registrations);
  }

  /**
   *
   * @param eventType
   * @param callback
   * @param cancelCallbackOrContext
   * @param context
   * @return {DatabaseQuery}
   */
  on(
    eventType: EventType,
    callback: (snapshot: DatabaseDataSnapshot, previousChildKey?: string | null) => void,
    cancelCallbackOrContext?: ((error: Error) => void) | Record<string, unknown>,
    context?: Record<string, unknown>,
  ): (snapshot: DatabaseDataSnapshot, previousChildKey?: string | null) => void {
    if (!eventTypes.includes(eventType)) {
      throw new Error(
        `firebase.database().ref().on(*) 'eventType' must be one of ${eventTypes.join(', ')}.`,
      );
    }

    if (!isFunction(callback)) {
      throw new Error("firebase.database().ref().on(_, *) 'callback' must be a function.");
    }

    if (
      !isUndefined(cancelCallbackOrContext) &&
      !isFunction(cancelCallbackOrContext) &&
      !isObject(cancelCallbackOrContext)
    ) {
      throw new Error(
        "firebase.database().ref().on(_, _, *) 'cancelCallbackOrContext' must be a function or object.",
      );
    }

    if (!isUndefined(context) && !isNull(context) && !isObject(context)) {
      throw new Error("firebase.database().ref().on(_, _, _, *) 'context' must be an object.");
    }

    const queryKey = this._generateQueryKey();
    const eventRegistrationKey = this._generateQueryEventKey(eventType);
    const registrationCancellationKey = `${eventRegistrationKey}$cancelled`;
    const _context =
      cancelCallbackOrContext && !isFunction(cancelCallbackOrContext)
        ? cancelCallbackOrContext
        : context;

    // Add a new SyncTree registration
    DatabaseSyncTree.addRegistration({
      eventType,
      ref: this.ref as any,
      path: this.path,
      key: queryKey,
      appName: this._database.app.name,
      dbURL: this._database._customUrlOrRegion,
      eventRegistrationKey,
      listener: _context ? callback.bind(_context) : callback,
    });

    if (cancelCallbackOrContext && isFunction(cancelCallbackOrContext)) {
      // cancellations have their own separate registration
      // as these are one off events, and they're not guaranteed
      // to occur either, only happens on failure to register on native

      DatabaseSyncTree.addRegistration({
        ref: this.ref as any,
        once: true,
        path: this.path,
        key: queryKey,
        appName: this._database.app.name,
        dbURL: this._database._customUrlOrRegion,
        eventType: `${eventType}$cancelled` as EventType,
        eventRegistrationKey: registrationCancellationKey,
        listener: _context
          ? (cancelCallbackOrContext as any).bind(_context)
          : (cancelCallbackOrContext as any),
      });
    }

    this._database.native.on({
      eventType,
      path: this.path,
      key: queryKey,
      modifiers: this._modifiers.toArray(),
      hasCancellationCallback: isFunction(cancelCallbackOrContext),
      registration: {
        eventRegistrationKey,
        key: queryKey,
        registrationCancellationKey,
      },
    });

    // increment number of listeners - just a short way of making
    // every registration unique per .on() call
    listeners += 1;

    return callback;
  }

  /**
   * @param eventType
   * @param successCallBack
   * @param failureCallbackOrContext
   * @param context
   */
  once(
    eventType: EventType,
    successCallBack?: (snapshot: DatabaseDataSnapshot, previousChildKey?: string | null) => void,
    failureCallbackOrContext?: ((error: Error) => void) | Record<string, unknown>,
    context?: Record<string, unknown>,
  ): Promise<DatabaseDataSnapshot> {
    if (!eventTypes.includes(eventType)) {
      throw new Error(
        `firebase.database().ref().once(*) 'eventType' must be one of ${eventTypes.join(', ')}.`,
      );
    }

    if (!isUndefined(successCallBack) && !isFunction(successCallBack)) {
      throw new Error("firebase.database().ref().once(_, *) 'successCallBack' must be a function.");
    }

    if (
      !isUndefined(failureCallbackOrContext) &&
      !isObject(failureCallbackOrContext) &&
      !isFunction(failureCallbackOrContext)
    ) {
      throw new Error(
        "firebase.database().ref().once(_, _, *) 'failureCallbackOrContext' must be a function or context.",
      );
    }

    if (!isUndefined(context) && !isObject(context)) {
      throw new Error(
        "firebase.database().ref().once(_, _, _, *) 'context' must be a context object.",
      );
    }

    const modifiers = this._modifiers._copy().toArray();

    return this._database.native
      .once(this.path, modifiers, eventType)
      .then(
        (result: {
          snapshot?: unknown;
          previousChildName?: string | null;
          value?: unknown;
          key?: string | null;
          exists?: boolean;
          childKeys?: string[];
          priority?: string | number | null;
        }) => {
          let dataSnapshot: DatabaseDataSnapshot;
          let previousChildName: string | null | undefined;

          // Child based events return a previousChildName
          if (eventType === 'value') {
            dataSnapshot = createDeprecationProxy(
              new DatabaseDataSnapshot(
                this.ref as any,
                result as {
                  value: unknown;
                  key: string | null;
                  exists: boolean;
                  childKeys: string[];
                  priority: string | number | null;
                },
              ),
            ) as DatabaseDataSnapshot;
          } else {
            dataSnapshot = createDeprecationProxy(
              new DatabaseDataSnapshot(
                this.ref as any,
                (result.snapshot as {
                  value: unknown;
                  key: string | null;
                  exists: boolean;
                  childKeys: string[];
                  priority: string | number | null;
                }) || { value: null, key: null, exists: false, childKeys: [], priority: null },
              ),
            ) as DatabaseDataSnapshot;
            previousChildName = result.previousChildName;
          }

          if (isFunction(successCallBack)) {
            if (isObject(failureCallbackOrContext)) {
              successCallBack.bind(failureCallbackOrContext)(dataSnapshot, previousChildName);
            } else if (isObject(context)) {
              successCallBack.bind(context)(dataSnapshot, previousChildName);
            } else {
              successCallBack(dataSnapshot, previousChildName);
            }
          }

          return dataSnapshot;
        },
      )
      .catch((error: Error) => {
        if (isFunction(failureCallbackOrContext)) {
          failureCallbackOrContext(error);
        }
        return Promise.reject(error);
      });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#orderbychild
   */
  orderByChild(path: string): DatabaseQuery {
    if (!isString(path)) {
      throw new Error("firebase.database().ref().orderByChild(*) 'path' must be a string value.");
    }

    if (pathIsEmpty(path)) {
      throw new Error(
        "firebase.database().ref().orderByChild(*) 'path' cannot be empty. Use orderByValue instead.",
      );
    }

    if (this._modifiers.hasOrderBy()) {
      throw new Error(
        "firebase.database().ref().orderByChild(*) You can't combine multiple orderBy calls.",
      );
    }

    const modifiers = this._modifiers._copy().orderByChild(path);
    modifiers.validateModifiers('firebase.database().ref().orderByChild()');

    return createDeprecationProxy(
      new DatabaseQuery(this._database, this.path, modifiers),
    ) as DatabaseQuery;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#orderbykey
   */
  orderByKey(): DatabaseQuery {
    if (this._modifiers.hasOrderBy()) {
      throw new Error(
        "firebase.database().ref().orderByKey() You can't combine multiple orderBy calls.",
      );
    }

    const modifiers = this._modifiers._copy().orderByKey();
    modifiers.validateModifiers('firebase.database().ref().orderByKey()');

    return createDeprecationProxy(
      new DatabaseQuery(this._database, this.path, modifiers),
    ) as DatabaseQuery;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#orderbypriority
   */
  orderByPriority(): DatabaseQuery {
    if (this._modifiers.hasOrderBy()) {
      throw new Error(
        "firebase.database().ref().orderByPriority() You can't combine multiple orderBy calls.",
      );
    }

    const modifiers = this._modifiers._copy().orderByPriority();
    modifiers.validateModifiers('firebase.database().ref().orderByPriority()');

    return createDeprecationProxy(
      new DatabaseQuery(this._database, this.path, modifiers),
    ) as DatabaseQuery;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#orderbyvalue
   */
  orderByValue(): DatabaseQuery {
    if (this._modifiers.hasOrderBy()) {
      throw new Error(
        "firebase.database().ref().orderByValue() You can't combine multiple orderBy calls.",
      );
    }

    const modifiers = this._modifiers._copy().orderByValue();
    modifiers.validateModifiers('firebase.database().ref().orderByValue()');

    return createDeprecationProxy(
      new DatabaseQuery(this._database, this.path, modifiers),
    ) as DatabaseQuery;
  }

  startAt(value?: number | string | boolean | null, key?: string): DatabaseQuery {
    if (!isNumber(value) && !isString(value) && !isBoolean(value) && !isNull(value)) {
      throw new Error(
        "firebase.database().ref().startAt(*) 'value' must be a number, string, boolean or null value.",
      );
    }

    if (!isUndefined(key) && !isString(key)) {
      throw new Error(
        "firebase.database().ref().startAt(_, *) 'key' must be a string value if defined.",
      );
    }

    if (this._modifiers.hasStartAt()) {
      throw new Error(
        'firebase.database().ref().startAt() Starting point was already set (by another call to startAt or equalTo).',
      );
    }

    const modifiers = this._modifiers._copy().startAt(value!, key);
    modifiers.validateModifiers('firebase.database().ref().startAt()');

    return createDeprecationProxy(
      new DatabaseQuery(this._database, this.path, modifiers),
    ) as DatabaseQuery;
  }

  toJSON(): string {
    return this.toString();
  }

  toString(): string {
    return `${this._database._customUrlOrRegion}${pathToUrlEncodedString(this.path)}`;
  }

  keepSynced(bool: boolean): Promise<void> {
    if (!isBoolean(bool)) {
      throw new Error(
        "firebase.database().ref().keepSynced(*) 'bool' value must be a boolean value.",
      );
    }

    return this._database.native.keepSynced(
      this._generateQueryKey(),
      this.path,
      this._modifiers.toArray(),
      bool,
    );
  }

  // Generates a unique string for a query
  // Ensures any queries called in various orders keep the same key
  _generateQueryKey(): string {
    return `$${this._database._customUrlOrRegion}$/${this.path}$${
      this._database.app.name
    }$${this._modifiers.toString()}`;
  }

  // Generates a unique event registration key
  _generateQueryEventKey(eventType: EventType): string {
    return `${this._generateQueryKey()}$${listeners}$${eventType}`;
  }
}
