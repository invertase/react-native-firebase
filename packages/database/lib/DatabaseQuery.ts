/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
  createDeprecationProxy,
  isBoolean,
  isFunction,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
  MODULAR_DEPRECATION_ARG,
  pathIsEmpty,
  pathToUrlEncodedString,
  ReferenceBase,
} from '@react-native-firebase/app/dist/module/common';
import DatabaseDataSnapshot from './DatabaseDataSnapshot';
import DatabaseSyncTree from './DatabaseSyncTree';
import type DatabaseQueryModifiers from './DatabaseQueryModifiers';
import type { DatabaseInternal } from './types/internal';
import type { FirebaseDatabaseTypes } from './types/namespaced';

const eventTypes = [
  'value',
  'child_added',
  'child_changed',
  'child_moved',
  'child_removed',
] as const;

type DatabaseReferenceConstructor = new (
  database: DatabaseInternal,
  path: string,
) => FirebaseDatabaseTypes.Reference;

type QueryWithDeprecationArgInternal = FirebaseDatabaseTypes.Query & {
  startAt(
    value: number | string | boolean | null,
    key?: string,
    deprecationArg?: string,
  ): FirebaseDatabaseTypes.Query;
  endAt(
    value: number | string | boolean | null,
    key?: string,
    deprecationArg?: string,
  ): FirebaseDatabaseTypes.Query;
};

type DatabaseOnceChildResultInternal = {
  snapshot: ConstructorParameters<typeof DatabaseDataSnapshot>[1];
  previousChildName?: string | null;
};

let DatabaseReferenceClass: DatabaseReferenceConstructor | null = null;

export function provideReferenceClass(databaseReference: DatabaseReferenceConstructor): void {
  DatabaseReferenceClass = databaseReference;
}

function ap(query: FirebaseDatabaseTypes.Query): QueryWithDeprecationArgInternal {
  return query as QueryWithDeprecationArgInternal;
}

function createReference(
  database: DatabaseInternal,
  path: string,
): FirebaseDatabaseTypes.Reference {
  if (!DatabaseReferenceClass) {
    throw new Error('DatabaseReference class has not been provided.');
  }

  return createDeprecationProxy(
    new DatabaseReferenceClass(database, path),
  ) as FirebaseDatabaseTypes.Reference;
}

let listeners = 0;

export default class DatabaseQuery extends ReferenceBase implements FirebaseDatabaseTypes.Query {
  _database: DatabaseInternal;
  _modifiers: DatabaseQueryModifiers;

  constructor(database: DatabaseInternal, path: string, modifiers: DatabaseQueryModifiers) {
    super(path);
    this._database = database;
    this._modifiers = modifiers;
  }

  get ref(): FirebaseDatabaseTypes.Reference {
    return createReference(this._database, this.path);
  }

  endAt(value: number | string | boolean | null, key?: string): FirebaseDatabaseTypes.Query {
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

    return createDeprecationProxy(new DatabaseQuery(this._database, this.path, modifiers));
  }

  equalTo(value: number | string | boolean | null, key?: string): FirebaseDatabaseTypes.Query {
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

    return ap(ap(this).startAt.call(this, value, key, MODULAR_DEPRECATION_ARG)).endAt.call(
      this,
      value,
      MODULAR_DEPRECATION_ARG,
    );
  }

  isEqual(other: FirebaseDatabaseTypes.Query): boolean {
    if (!(other instanceof DatabaseQuery)) {
      throw new Error("firebase.database().ref().isEqual(*) 'other' must be an instance of Query.");
    }

    const sameApp = other._database.app === this._database.app;
    const sameDatabasePath = other.toString() === this.toString();
    const sameModifiers = other._modifiers.toString() === this._modifiers.toString();

    return sameApp && sameDatabasePath && sameModifiers;
  }

  limitToFirst(limit: number): FirebaseDatabaseTypes.Query {
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
    ) as FirebaseDatabaseTypes.Query;
  }

  limitToLast(limit: number): FirebaseDatabaseTypes.Query {
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
    ) as FirebaseDatabaseTypes.Query;
  }

  off(
    eventType?: FirebaseDatabaseTypes.EventType,
    callback?: (a: FirebaseDatabaseTypes.DataSnapshot, b?: string | null) => void,
    context?: Record<string, any>,
  ): void {
    if (arguments.length === 0) {
      return DatabaseSyncTree.removeListenersForRegistrations(
        DatabaseSyncTree.getRegistrationsByPath(this.path),
      ) as never;
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

    if (eventType && callback) {
      const registration = DatabaseSyncTree.getOneByPathEventListener(
        this.path,
        eventType,
        callback,
      );
      if (!registration) {
        return [] as never;
      }

      DatabaseSyncTree.removeListenersForRegistrations([`${registration}$cancelled`]);
      return DatabaseSyncTree.removeListenerRegistrations(callback, [registration]) as never;
    }

    const registrations = DatabaseSyncTree.getRegistrationsByPathEvent(this.path, eventType);

    DatabaseSyncTree.removeListenersForRegistrations(
      DatabaseSyncTree.getRegistrationsByPathEvent(this.path, `${eventType}$cancelled`),
    );

    return DatabaseSyncTree.removeListenersForRegistrations(registrations) as never;
  }

  on(
    eventType: FirebaseDatabaseTypes.EventType,
    callback: (data: FirebaseDatabaseTypes.DataSnapshot, previousChildKey?: string | null) => void,
    cancelCallbackOrContext?: ((a: Error) => void) | Record<string, any> | null,
    context?: Record<string, any> | null,
  ): (a: FirebaseDatabaseTypes.DataSnapshot | null, b?: string | null) => void {
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
    const scopedContext =
      cancelCallbackOrContext && !isFunction(cancelCallbackOrContext)
        ? cancelCallbackOrContext
        : context;

    DatabaseSyncTree.addRegistration({
      eventType,
      ref: this.ref,
      path: this.path,
      key: queryKey,
      appName: this._database.app.name,
      dbURL: this._database._customUrlOrRegion,
      eventRegistrationKey,
      listener: scopedContext ? callback.bind(scopedContext) : callback,
    });

    if (cancelCallbackOrContext && isFunction(cancelCallbackOrContext)) {
      DatabaseSyncTree.addRegistration({
        ref: this.ref,
        once: true,
        path: this.path,
        key: queryKey,
        appName: this._database.app.name,
        dbURL: this._database._customUrlOrRegion,
        eventType: `${eventType}$cancelled`,
        eventRegistrationKey: registrationCancellationKey,
        listener: scopedContext
          ? cancelCallbackOrContext.bind(scopedContext)
          : cancelCallbackOrContext,
      });
    }

    this._database.native.on({
      eventType,
      path: this.path,
      key: queryKey,
      appName: this._database.app.name,
      modifiers: this._modifiers.toArray(),
      hasCancellationCallback: isFunction(cancelCallbackOrContext),
      registration: {
        eventRegistrationKey,
        key: queryKey,
        registrationCancellationKey,
      },
    });

    listeners += 1;

    return callback as (a: FirebaseDatabaseTypes.DataSnapshot | null, b?: string | null) => void;
  }

  once(
    eventType: FirebaseDatabaseTypes.EventType,
    successCallBack?: (a: FirebaseDatabaseTypes.DataSnapshot, b?: string | null) => any,
    failureCallbackOrContext?: ((a: Error) => void) | Record<string, any> | null,
    context?: Record<string, any>,
  ): Promise<FirebaseDatabaseTypes.DataSnapshot> {
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
      .then(result => {
        let dataSnapshot: FirebaseDatabaseTypes.DataSnapshot;
        let previousChildName: string | null | undefined;

        if (eventType === 'value') {
          dataSnapshot = createDeprecationProxy(
            new DatabaseDataSnapshot(
              this.ref,
              result as ConstructorParameters<typeof DatabaseDataSnapshot>[1],
            ),
          ) as FirebaseDatabaseTypes.DataSnapshot;
        } else {
          const childResult = result as DatabaseOnceChildResultInternal;
          dataSnapshot = createDeprecationProxy(
            new DatabaseDataSnapshot(this.ref, childResult.snapshot),
          ) as FirebaseDatabaseTypes.DataSnapshot;
          previousChildName = childResult.previousChildName;
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
      })
      .catch(error => {
        if (isFunction(failureCallbackOrContext)) {
          failureCallbackOrContext(error);
        }
        return Promise.reject(error);
      });
  }

  orderByChild(path: string): FirebaseDatabaseTypes.Query {
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

    return createDeprecationProxy(new DatabaseQuery(this._database, this.path, modifiers));
  }

  orderByKey(): FirebaseDatabaseTypes.Query {
    if (this._modifiers.hasOrderBy()) {
      throw new Error(
        "firebase.database().ref().orderByKey() You can't combine multiple orderBy calls.",
      );
    }

    const modifiers = this._modifiers._copy().orderByKey();
    modifiers.validateModifiers('firebase.database().ref().orderByKey()');

    return createDeprecationProxy(new DatabaseQuery(this._database, this.path, modifiers));
  }

  orderByPriority(): FirebaseDatabaseTypes.Query {
    if (this._modifiers.hasOrderBy()) {
      throw new Error(
        "firebase.database().ref().orderByPriority() You can't combine multiple orderBy calls.",
      );
    }

    const modifiers = this._modifiers._copy().orderByPriority();
    modifiers.validateModifiers('firebase.database().ref().orderByPriority()');

    return createDeprecationProxy(new DatabaseQuery(this._database, this.path, modifiers));
  }

  orderByValue(): FirebaseDatabaseTypes.Query {
    if (this._modifiers.hasOrderBy()) {
      throw new Error(
        "firebase.database().ref().orderByValue() You can't combine multiple orderBy calls.",
      );
    }

    const modifiers = this._modifiers._copy().orderByValue();
    modifiers.validateModifiers('firebase.database().ref().orderByValue()');

    return createDeprecationProxy(new DatabaseQuery(this._database, this.path, modifiers));
  }

  startAt(value: number | string | boolean | null, key?: string): FirebaseDatabaseTypes.Query {
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

    const modifiers = this._modifiers._copy().startAt(value, key);
    modifiers.validateModifiers('firebase.database().ref().startAt()');

    return createDeprecationProxy(new DatabaseQuery(this._database, this.path, modifiers));
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

  _generateQueryKey(): string {
    return `$${this._database._customUrlOrRegion}$/${this.path}$${
      this._database.app.name
    }$${this._modifiers.toString()}`;
  }

  _generateQueryEventKey(eventType: FirebaseDatabaseTypes.EventType): string {
    return `${this._generateQueryKey()}$${listeners}$${eventType}`;
  }
}
