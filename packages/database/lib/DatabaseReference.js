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
  isString,
  pathParent,
  pathChild,
  isValidPath,
  generateDatabaseId,
  isNumber,
  isNull,
  isUndefined,
  isFunction,
  promiseWithOptionalCallback,
  isObject,
} from '@react-native-firebase/common';

import DatabaseQuery from './DatabaseQuery';
import DatabaseQueryParams from './DatabaseQueryParams';
import DatabaseOnDisconnect from './DatabaseOnDisconnect';

export default class DatabaseReference extends DatabaseQuery {
  constructor(database, path) {
    super(database, path, DatabaseQueryParams.DEFAULT);
    this._database = database;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#parent
   */
  get parent() {
    const parentPath = pathParent(this.path);
    if (parentPath === null) return null;
    return new DatabaseReference(this._database, parentPath);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#root
   */
  get root() {
    return new DatabaseReference(this._database, '/');
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#child
   * @param path
   */
  child(path) {
    if (!isString(path)) {
      throw new Error(`firebase.database().ref().child(*) 'path' must be a string value.`);
    }

    if (!isValidPath(path)) {
      throw new Error(
        `firebase.database().ref().child(*) 'path' can't contain ".", "#", "$", "[", or "]"`,
      );
    }

    return new DatabaseReference(this._database, pathChild(this.path, path));
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#set
   * @param value
   * @param onComplete
   */
  set(value, onComplete) {
    if (isUndefined(value)) {
      throw new Error(`firebase.database().ref().set(*) 'value' must be defined.`);
    }

    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        `firebase.database().ref().set(_, *) 'onComplete' must be a function if provided.`,
      );
    }

    return promiseWithOptionalCallback(this._database.native.set(this.path, { value }), onComplete);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#update
   * @param values
   * @param onComplete
   */
  update(values, onComplete) {
    if (!isObject(values)) {
      throw new Error(`firebase.database().ref().update(*) 'values' must be an object.`);
    }

    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        `firebase.database().ref().update(_, *) 'onComplete' must be a function if provided.`,
      );
    }

    return promiseWithOptionalCallback(
      this._database.native.update(this.path, { values }),
      onComplete,
    );
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference#setwithpriority
   * @param newVal
   * @param newPriority
   * @param onComplete
   */
  setWithPriority(newVal, newPriority, onComplete) {
    if (isUndefined(newVal)) {
      throw new Error(`firebase.database().ref().setWithPriority(*) 'newVal' must be defined.`);
    }

    if (!isNumber(newPriority) && !isString(newPriority) && !isNull(newPriority)) {
      throw new Error(
        `firebase.database().ref().setWithPriority(_, *) 'newPriority' must be a number, string or null value.`,
      );
    }

    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        `firebase.database().ref().setWithPriority(_, _, *) 'onComplete' must be a function if provided.`,
      );
    }

    return promiseWithOptionalCallback(
      this._database.native.setWithPriority(this.path, {
        value: newVal,
        priority: newPriority,
      }),
      onComplete,
    );
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove
   * @param onComplete
   */
  remove(onComplete) {
    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        `firebase.database().ref().remove(*) 'onComplete' must be a function if provided.`,
      );
    }

    return promiseWithOptionalCallback(this._database.native.remove(this.path), onComplete);
  }

  transaction() {}

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference#setpriority
   * @param priority
   * @param onComplete
   */
  setPriority(priority, onComplete) {
    if (!isNumber(priority) && !isString(priority) && !isNull(priority)) {
      throw new Error(
        `firebase.database().ref().setPriority(*) 'priority' must be a number, string or null value.`,
      );
    }

    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        `firebase.database().ref().setPriority(_, *) 'onComplete' must be a function if provided.`,
      );
    }

    return promiseWithOptionalCallback(
      this._database.native.setPriority(this.path, { priority }),
      onComplete,
    );
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference#push
   * @param value
   * @param onComplete
   * @returns {DatabaseReference}
   */
  push(value, onComplete) {
    // TODO validate value?

    const id = generateDatabaseId(this._database._serverTime);
    const pushRef = this.child(id);
    const thennablePushRef = this.child(id);

    return thennablePushRef;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference#ondisconnect
   */
  onDisconnect() {
    return new DatabaseOnDisconnect(this);
  }
}
