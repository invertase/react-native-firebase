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
  constructor(database, path, modifiers) {
    super(path);
    this._database = database;
    this._modifiers = modifiers;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#endat
   */
  get ref() {
    // TODO require cycle warning?
    // Require cycle: ../packages/database/lib/DatabaseReference.js -> ../packages/database/lib/DatabaseQuery.js -> ../packages/database/lib/DatabaseReference.js
    return new DatabaseReference(this._database, this.path);
  }

  endAt(value, name = null) {
    // TODO validate args https://github.com/firebase/firebase-js-sdk/blob/master/packages/database/src/api/Query.ts#L530
    const newParams = this._queryParams.endAt(value, name);
    // DatabaseQuery._validateLimit(newParams);
    // DatabaseQuery._validateQueryEndpoints(newParams);

    return new DatabaseQuery(this._database, this.path, newParams);
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

    return new DatabaseQuery(this._database, this.path, this._modifiers.limitToFirst(limit));
  }

  limitToLast(limit) {
    if (this._modifiers.isValidLimit(limit)) {
      throw new Error(
        `firebase.database().ref().limitToLast(*) 'limit' must be a positive integer value.`,
      );
    }

    if (this._modifiers.hasLimit()) {
      throw new Error(
        `firebase.database().ref().limitToLast(*) Limit was already set (by another call to limitToFirst, or limitToLast)`,
      );
    }

    return new DatabaseQuery(this._database, this.path, this._modifiers.limitToLast(limit));
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
      (!isObject(failureCallbackOrContext) && !isFunction(failureCallbackOrContext))
    ) {
      throw new Error(
        `firebase.database().ref().once(_, _, *) 'failureCallbackOrContext' must be a function or context.`,
      );
    }

    if (!isUndefined(context) && !isObject(context)) {
      throw new Error(
        `firebase.database().ref().once(_, _, _, *) 'context' must be a context object.`,
      );
    }

    const key = this._generateQueryKey();
    const modifiers = this._modifiers.toArray();

    return this._database.native
      .once(key, this.path, modifiers, eventType)
      .then(result => {
        let dataSnapshot;

        // Child based events return a previousChildName
        if (eventType === 'value') {
          dataSnapshot = new DatabaseDataSnapshot(this.ref, result);
        } else {
          dataSnapshot = new DatabaseDataSnapshot(this.ref, result.snapshot);
        }

        if (isFunction(successCallBack)) {
          if (isObject(failureCallbackOrContext)) {
            successCallBack.bind(failureCallbackOrContext)(dataSnapshot, result.previousChildName);
          } else if (isObject(context)) {
            successCallBack.bind(context)(dataSnapshot, result.previousChildName);
          } else {
            successCallBack(dataSnapshot, result.previousChildName);
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

    if (this._modifiers.hasOrderBy()) {
      throw new Error(
        `firebase.database().ref().orderByChild(*) You can't combine multiple orderBy calls.`,
      );
    }

    return new DatabaseQuery(this._database, path, this._modifiers.orderByChild(path));
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#orderbykey
   */
  orderByKey() {
    if (this._modifiers.hasOrderBy()) {
      throw new Error(
        `firebase.database().ref().orderByKey() You can't combine multiple orderBy calls.`,
      );
    }

    return new DatabaseQuery(this._database, path, this._modifiers.orderByKey());
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#orderbypriority
   */
  orderByPriority() {
    if (this._modifiers.hasOrderBy()) {
      throw new Error(
        `firebase.database().ref().orderByPriority() You can't combine multiple orderBy calls.`,
      );
    }

    return new DatabaseQuery(this._database, path, this._modifiers.orderByPriority());
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Query.html#orderbyvalue
   */
  orderByValue() {
    if (this._modifiers.hasOrderBy()) {
      throw new Error(
        `firebase.database().ref().orderByValue() You can't combine multiple orderBy calls.`,
      );
    }

    return new DatabaseQuery(this._database, path, this._modifiers.orderByValue());
  }

  startAt(value, key) {
    if (isUndefined(value)) {
      throw new Error(`firebase.database().ref().startAt(*) 'value' cannot be undefined.`);
    }

    if (!isUndefined(key) && !isString(key)) {
      throw new Error(
        `firebase.database().ref().startAt(*) 'key' must be a string value if defined.`,
      );
    }

    // const newParams = this._queryParams.startAt(value, key);
    // DatabaseQuery._validateLimit(newParams);
    // DatabaseQuery._validateQueryEndpoints(newParams);
    //
    // if (this._queryParams.hasStartAt()) {
    //   throw new Error(
    //     `firebase.database().ref().startAt(*) Starting point was already set (by another call to startAt or equalTo).`,
    //   );
    // }

    return new DatabaseQuery(this._database, this.path);
  }

  toJSON() {
    return this.toString();
  }

  toString() {
    return `${this._database._customUrlOrRegion}/${pathToUrlEncodedString(this.path)}`;
  }

  _generateQueryKey() {
    return `$${this._database._customUrlOrRegion}$/${this.path}$${this._modifiers.toString()}`;
  }
}
