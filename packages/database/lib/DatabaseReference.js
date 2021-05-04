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
  generateDatabaseId,
  isBoolean,
  isFunction,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
  isValidPath,
  pathChild,
  pathParent,
  promiseWithOptionalCallback,
} from '@react-native-firebase/app/lib/common';
import DatabaseDataSnapshot from './DatabaseDataSnapshot';
import DatabaseOnDisconnect from './DatabaseOnDisconnect';
import DatabaseQuery, {
  provideReferenceClass as provideReferenceClassForQuery,
} from './DatabaseQuery';
import DatabaseQueryModifiers from './DatabaseQueryModifiers';
import DatabaseThenableReference, {
  provideReferenceClass as provideReferenceClassForThenable,
} from './DatabaseThenableReference';

const internalRefs = ['.info/connected', '.info/serverTimeOffset'];

export default class DatabaseReference extends DatabaseQuery {
  constructor(database, path) {
    // Validate the reference path
    if (!internalRefs.includes(path) && !isValidPath(path)) {
      throw new Error(
        'firebase.database() Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"',
      );
    }

    super(database, path, new DatabaseQueryModifiers());
    this._database = database;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#parent
   */
  get parent() {
    const parentPath = pathParent(this.path);
    if (parentPath === null) {
      return null;
    }
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
      throw new Error("firebase.database().ref().child(*) 'path' must be a string value.");
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
      throw new Error("firebase.database().ref().set(*) 'value' must be defined.");
    }

    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        "firebase.database().ref().set(_, *) 'onComplete' must be a function if provided.",
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
      throw new Error("firebase.database().ref().update(*) 'values' must be an object.");
    }

    const keys = Object.keys(values);
    for (let i = 0; i < keys.length; i++) {
      if (!isValidPath(keys[i])) {
        throw new Error(
          'firebase.database().update(*) \'values\' contains an invalid path. Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"',
        );
      }
    }

    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        "firebase.database().ref().update(_, *) 'onComplete' must be a function if provided.",
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
      throw new Error("firebase.database().ref().setWithPriority(*) 'newVal' must be defined.");
    }

    if (!isNumber(newPriority) && !isString(newPriority) && !isNull(newPriority)) {
      throw new Error(
        "firebase.database().ref().setWithPriority(_, *) 'newPriority' must be a number, string or null value.",
      );
    }

    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        "firebase.database().ref().setWithPriority(_, _, *) 'onComplete' must be a function if provided.",
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
        "firebase.database().ref().remove(*) 'onComplete' must be a function if provided.",
      );
    }

    return promiseWithOptionalCallback(this._database.native.remove(this.path), onComplete);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference#transaction
   * @param transactionUpdate
   * @param onComplete
   * @param applyLocally
   */
  transaction(transactionUpdate, onComplete, applyLocally) {
    if (!isFunction(transactionUpdate)) {
      throw new Error(
        "firebase.database().ref().transaction(*) 'transactionUpdate' must be a function.",
      );
    }

    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        "firebase.database().ref().transaction(_, *) 'onComplete' must be a function if provided.",
      );
    }

    if (!isUndefined(applyLocally) && !isBoolean(applyLocally)) {
      throw new Error(
        "firebase.database().ref().transaction(_, _, *) 'applyLocally' must be a boolean value if provided.",
      );
    }

    return new Promise((resolve, reject) => {
      const onCompleteWrapper = (error, committed, snapshotData) => {
        if (isFunction(onComplete)) {
          if (error) {
            onComplete(error, committed, null);
          } else {
            onComplete(null, committed, new DatabaseDataSnapshot(this, snapshotData));
          }
        }

        if (error) {
          return reject(error);
        }
        return resolve({
          committed,
          snapshot: new DatabaseDataSnapshot(this, snapshotData),
        });
      };

      // start the transaction natively
      this._database._transaction.add(this, transactionUpdate, onCompleteWrapper, applyLocally);
    });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference#setpriority
   * @param priority
   * @param onComplete
   */
  setPriority(priority, onComplete) {
    if (!isNumber(priority) && !isString(priority) && !isNull(priority)) {
      throw new Error(
        "firebase.database().ref().setPriority(*) 'priority' must be a number, string or null value.",
      );
    }

    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        "firebase.database().ref().setPriority(_, *) 'onComplete' must be a function if provided.",
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
    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        "firebase.database().ref().push(_, *) 'onComplete' must be a function if provided.",
      );
    }

    const id = generateDatabaseId(this._database._serverTimeOffset);

    if (isUndefined(value) || isNull(value)) {
      return new DatabaseThenableReference(
        this._database,
        pathChild(this.path, id),
        Promise.resolve(this.child(id)),
      );
    }

    const pushRef = this.child(id);

    const promise = pushRef.set(value, onComplete).then(() => pushRef);

    // Prevent unhandled promise rejection if onComplete is passed
    if (onComplete) {
      promise.catch(() => {});
    }

    return new DatabaseThenableReference(this._database, pathChild(this.path, id), promise);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference#ondisconnect
   */
  onDisconnect() {
    return new DatabaseOnDisconnect(this);
  }
}

// To avoid React Native require cycle warnings
provideReferenceClassForQuery(DatabaseReference);
provideReferenceClassForThenable(DatabaseReference);
