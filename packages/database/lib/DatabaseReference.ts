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
  createDeprecationProxy,
  MODULAR_DEPRECATION_ARG,
} from '@react-native-firebase/app/dist/module/common';
import DatabaseDataSnapshot from './DatabaseDataSnapshot';
import DatabaseOnDisconnect from './DatabaseOnDisconnect';
import DatabaseQuery, {
  provideReferenceClass as provideReferenceClassForQuery,
} from './DatabaseQuery';
import DatabaseQueryModifiers from './DatabaseQueryModifiers';
import DatabaseThenableReference, {
  provideReferenceClass as provideReferenceClassForThenable,
} from './DatabaseThenableReference';
import type { DatabaseInternal } from './types/internal';
import type { TransactionResult } from './types/database';

const internalRefs = ['.info/connected', '.info/serverTimeOffset'];

export default class DatabaseReference extends DatabaseQuery {
  _database: DatabaseInternal;

  constructor(database: DatabaseInternal, path: string) {
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
  get parent(): DatabaseReference | null {
    const parentPath = pathParent(this.path);
    if (parentPath === null) {
      return null;
    }
    return createDeprecationProxy(
      new DatabaseReference(this._database, parentPath),
    ) as DatabaseReference;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#root
   */
  get root(): DatabaseReference {
    return createDeprecationProxy(
      new DatabaseReference(this._database, '/'),
    ) as DatabaseReference;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#child
   * @param path
   */
  child(path: string): DatabaseReference {
    if (!isString(path)) {
      throw new Error("firebase.database().ref().child(*) 'path' must be a string value.");
    }
    return createDeprecationProxy(
      new DatabaseReference(this._database, pathChild(this.path, path)),
    ) as DatabaseReference;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference.html#set
   * @param value
   * @param onComplete
   */
  set(value: unknown, onComplete?: (error: Error | null) => void): Promise<void> {
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
  update(
    values: { [key: string]: unknown },
    onComplete?: (error: Error | null) => void,
  ): Promise<void> {
    if (!isObject(values)) {
      throw new Error("firebase.database().ref().update(*) 'values' must be an object.");
    }

    const keys = Object.keys(values);
    for (let i = 0; i < keys.length; i++) {
      if (!isValidPath(keys[i]!)) {
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
  setWithPriority(
    newVal: unknown,
    newPriority: string | number | null,
    onComplete?: (error: Error | null) => void,
  ): Promise<void> {
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
  remove(onComplete?: (error: Error | null) => void): Promise<void> {
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
  transaction(
    transactionUpdate: (currentData: unknown) => unknown,
    onComplete?: (error: Error | null, committed: boolean, snapshot: DatabaseDataSnapshot | null) => void,
    applyLocally?: boolean,
  ): Promise<TransactionResult> {
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
      const onCompleteWrapper = (
        error: Error | null,
        committed: boolean,
        snapshotData: DatabaseDataSnapshot | null,
      ) => {
        if (isFunction(onComplete)) {
          if (error) {
            onComplete(error, committed, null);
          } else {
            onComplete(
              null,
              committed,
              createDeprecationProxy(new DatabaseDataSnapshot(this, snapshotData as { value: unknown; key: string | null; exists: boolean; childKeys: string[]; priority: string | number | null })) as DatabaseDataSnapshot,
            );
          }
        }

        if (error) {
          return reject(error);
        }
        return resolve({
          committed,
          snapshot: createDeprecationProxy(new DatabaseDataSnapshot(this, snapshotData as { value: unknown; key: string | null; exists: boolean; childKeys: string[]; priority: string | number | null })) as DatabaseDataSnapshot,
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
  setPriority(
    priority: string | number | null,
    onComplete?: (error: Error | null) => void,
  ): Promise<void> {
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
  push(value?: unknown, onComplete?: () => void): DatabaseThenableReference {
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
        Promise.resolve((this.child as (path: string, ...args: unknown[]) => DatabaseReference).call(this, id, MODULAR_DEPRECATION_ARG)),
      );
    }

    const pushRef = (this.child as (path: string, ...args: unknown[]) => DatabaseReference).call(
      this,
      id,
      MODULAR_DEPRECATION_ARG,
    );

    const promise = (pushRef.set as (
      value: unknown,
      onComplete?: (error: Error | null) => void,
      ...args: unknown[]
    ) => Promise<void>)
      .call(pushRef, value, onComplete, MODULAR_DEPRECATION_ARG)
      .then(() => pushRef);

    // Prevent unhandled promise rejection if onComplete is passed
    if (onComplete) {
      promise.catch(() => {});
    }

    return new DatabaseThenableReference(this._database, pathChild(this.path, id), promise);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.database.Reference#ondisconnect
   */
  onDisconnect(): DatabaseOnDisconnect {
    return new DatabaseOnDisconnect(this);
  }
}

// To avoid React Native require cycle warnings
provideReferenceClassForQuery(DatabaseReference);
provideReferenceClassForThenable(DatabaseReference);
