/* eslint-disable no-console */
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
  isFunction,
  isNumber,
  isObject,
  isString,
  isUndefined,
  pathIsEmpty,
  pathToUrlEncodedString,
  ReferenceBase,
} from '@react-native-firebase/common';
import DatabaseReference from './DatabaseReference';
import DatabaseDataSnapshot from './DatabaseDataSnapshot';

const eventTypes = ['value', 'child_added', 'child_changed', 'child_moved', 'child_removed'];

export default class DatabaseQuery extends ReferenceBase {
  // static _validateQueryEndpoints(params) {}
  //
  // static _validateLimit(params) {
  //   if (
  //     params.hasStartAt() &&
  //     params.hasEndAt() &&
  //     params.hasLimit() &&
  //     !params.hasAnchoredLimit()
  //   ) {
  //     throw new Error(
  //       `Can't combine startAt(), endAt(), and limit(). Use limitToFirst() or limitToLast() instead.`,
  //     );
  //   }
  // }
  //
  // static _modifiersToString(modifiers = []) {
  //   const sorted = modifiers.sort((a, b) => {
  //     if (a.id < b.id) return -1;
  //     if (a.id > b.id) return 1;
  //     return 0;
  //   });
  //
  //   let key = '{';
  //   for (let i = 0; i < sorted.length; i++) {
  //     if (i !== 0) key += ',';
  //     key += sorted[i].id;
  //   }
  //   key += '}';
  //   return key;
  // }
  //
  // static _orderByModifier(name, key) {
  //   return {
  //     id: 'TODO',
  //     type: 'orderBy',
  //     name: `orderBy${name}`,
  //     key,
  //   };
  // }
  //
  // static _limitModifier(name, limit) {
  //   return {
  //     id: 'TODO',
  //     type: 'limit',
  //     name: `limitTo${name}`,
  //     limit,
  //   };
  // }
  //
  // static _filterModifier(name, value, key) {
  //   return {
  //     id: 'TODO',
  //     type: 'filter',
  //     name,
  //     value,
  //     valueType: typeof value,
  //     key,
  //   };
  // }

  constructor(database, path, modifiers, orderByCalled = false) {
    super(path);
    this._database = database;
    this._modifiers = modifiers;
    this._orderByCalled = orderByCalled;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#endat
   */
  get ref() {
    // TODO require cycle warning
    // Require cycle: ../packages/database/lib/DatabaseReference.js -> ../packages/database/lib/DatabaseQuery.js -> ../packages/database/lib/DatabaseReference.js
    return new DatabaseReference(this._database, this.path);
  }

  endAt(value, name = null) {
    // TODO validate args https://github.com/firebase/firebase-js-sdk/blob/master/packages/database/src/api/Query.ts#L530
    const newParams = this._queryParams.endAt(value, name);
    DatabaseQuery._validateLimit(newParams);
    DatabaseQuery._validateQueryEndpoints(newParams);

    return new DatabaseQuery(this.path, newParams, this._orderByCalled);
  }

  equalTo() {}

  isEqual() {}

  limitToFirst(limit) {
    if (this._modifiers.isValidLimit(limit)) {
      throw new Error(
        `firebase.database().ref().limitToFirst(*) 'limit' must be a positive integer value.`,
      );
    }

    if (this._modifiers.hasLimit()) {
      throw new Error(
        `firebase.database().ref().limitToFirst(*) Limit was already set (by another call to limitToFirst, or limitToLast)`,
      );
    }

    return new DatabaseQuery(this.path, this._modifiers.limitToFirst(limit));
  }

  limitToLast(limit) {
    if (!isNumber(limit)) {
      throw new Error(`firebase.database().ref().limitToLast(*) 'limit' must be a number value.`);
    }

    if (Math.floor(limit) !== limit || limit <= 0) {
      throw new Error(
        `firebase.database().ref().limitToLast(*) 'limit' must be a positive integer.`,
      );
    }

    if (this._queryParams.hasLimit()) {
      throw new Error(
        `firebase.database().ref().limitToLast(*) Limit was already set (by another call to limit, limitToFirst, or limitToLast)`,
      );
    }

    return new DatabaseQuery(this.path, this._queryParams.limitToLast(limit), this._orderByCalled);
  }

  off(eventType, callback, context) {
    if (!isUndefined(eventType) && !eventTypes.includes(eventType)) {
      throw new Error(
        `firebase.database().ref().off(*) 'eventType' must be one of ${eventTypes.join(', ')}.`,
      );
    }

    if (!isUndefined(callback) && !isFunction(callback)) {
      throw new Error(`firebase.database().ref().off(_, *) 'callback' must be a function.`);
    }

    if (!isUndefined(context) && !isObject(context)) {
      throw new Error(`firebase.database().ref().off(_, _, *) 'context' must be an object.`);
    }

    // TODO
    return this;
  }

  on(eventType, callback, cancelCallbackOrContext, context) {
    if (!eventTypes.includes(eventType)) {
      throw new Error(
        `firebase.database().ref().on(*) 'eventType' must be one of ${eventTypes.join(', ')}.`,
      );
    }

    if (!isFunction(callback)) {
      throw new Error(`firebase.database().ref().on(_, *) 'callback' must be a function.`);
    }

    if (
      !isUndefined(cancelCallbackOrContext) &&
      (!isFunction(cancelCallbackOrContext) || !isObject(cancelCallbackOrContext))
    ) {
      throw new Error(
        `firebase.database().ref().on(_, _, *) 'cancelCallbackOrContext' must be a function or object.`,
      );
    }

    if (!isUndefined(context) && !isObject(context)) {
      throw new Error(`firebase.database().ref().on(_, _, _, *) 'context' must be an object.`);
    }

    // TODO
    return this;
  }

  /**
   * @param eventType
   * @param successCallBack
   * @param failureCallbackOrContext
   * @param context
   */
  once(eventType, successCallBack, failureCallbackOrContext, context) {
    if (!eventTypes.includes(eventType)) {
      throw new Error(
        `firebase.database().ref().once(*) 'eventType' must be one of ${eventTypes.join(', ')}.`,
      );
    }

    if (!isUndefined(successCallBack) && !isFunction(successCallBack)) {
      throw new Error(`firebase.database().ref().once(_, *) 'successCallBack' must be a function.`);
    }

    if (
      !isUndefined(failureCallbackOrContext) &&
      !!context &&
      !isFunction(failureCallbackOrContext)
    ) {
      throw new Error(
        `firebase.database().ref().once(_, *) 'failureCallbackOrContext' must be a function if context.`,
      );
    }

    if (
      !isUndefined(failureCallbackOrContext) &&
      (!isObject(failureCallbackOrContext) || !isFunction(failureCallbackOrContext))
    ) {
      throw new Error(
        `firebase.database().ref().once(_, *) 'failureCallbackOrContext' must be a function.`,
      );
    }

    const key = this._generateQueryKey();
    const modifiers = this._modifiers.toArray();

    return this._database.native
      .once(key, this.path, modifiers, eventType)
      .then(snapshot => {
        const dataSnapshot = new DatabaseDataSnapshot(this.ref, snapshot);

        if (isFunction(successCallBack)) {
          if (isObject(failureCallbackOrContext)) {
            successCallBack.bind(failureCallbackOrContext)(dataSnapshot);
          } else if (isObject(context)) {
            successCallBack.bind(context)(dataSnapshot);
          } else {
            successCallBack(dataSnapshot);
          }
        }

        return dataSnapshot;
      })
      .catch(error => {
        if (isFunction(failureCallbackOrContext)) failureCallbackOrContext(error);
        return Promise.reject(error);
      });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#orderbychild
   */
  orderByChild(path) {
    if (!isString(path)) {
      throw new Error(`firebase.database().ref().orderByChild(*) 'path' must be a string value.`);
    }

    if (pathIsEmpty(path)) {
      throw new Error(
        `firebase.database().ref().orderByChild(*) 'path' cannot be empty. Use orderByValue instead.`,
      );
    }

    if (this._orderByCalled) {
      throw new Error(
        `firebase.database().ref().orderByChild(*) You can't combine multiple orderBy calls.`,
      );
    }

    const newParams = this._queryParams.orderBy('TODO');
    return new DatabaseQuery(path, newParams, true);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#orderbykey
   */
  orderByKey(...args) {}

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#orderbypriority
   */
  orderByPriority(...args) {}

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#orderbyvalue
   */
  orderByValue(...args) {}

  startAt(value, key) {
    if (isUndefined(value)) {
      throw new Error(`firebase.database().ref().startAt(*) 'value' cannot be undefined.`);
    }

    if (!isUndefined(key) && !isString(key)) {
      throw new Error(
        `firebase.database().ref().startAt(*) 'key' must be a string value if defined.`,
      );
    }

    const newParams = this._queryParams.startAt(value, key);
    DatabaseQuery._validateLimit(newParams);
    DatabaseQuery._validateQueryEndpoints(newParams);

    if (this._queryParams.hasStartAt()) {
      throw new Error(
        `firebase.database().ref().startAt(*) Starting point was already set (by another call to startAt or equalTo).`,
      );
    }

    return new DatabaseQuery(this.path, newParams, this._orderByCalled);
  }

  toJSON() {
    // TODO
  }

  toString() {
    return `${this._database._customUrlOrRegion}/${pathToUrlEncodedString(this.path)}`;
  }

  _generateQueryKey() {
    return `$${this._database._customUrlOrRegion}$/${this.path}$${'todo'}`;
  }
}
