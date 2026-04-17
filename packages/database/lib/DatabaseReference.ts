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
  createDeprecationProxy,
  generateDatabaseId,
  isBoolean,
  isFunction,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
  isValidPath,
  MODULAR_DEPRECATION_ARG,
  pathChild,
  pathParent,
  promiseWithOptionalCallback,
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
import type { FirebaseDatabaseTypes } from './types/namespaced';

const internalRefs = ['.info/connected', '.info/serverTimeOffset'] as const;

type ReferenceWithChildInternal = FirebaseDatabaseTypes.Reference & {
  child(path: string, deprecationArg?: string): FirebaseDatabaseTypes.Reference;
};

type ReferenceWithSetInternal = FirebaseDatabaseTypes.Reference & {
  set(
    value: unknown,
    onComplete?: (error: Error | null) => void,
    deprecationArg?: string,
  ): Promise<void>;
};

function apChild(reference: FirebaseDatabaseTypes.Reference): ReferenceWithChildInternal {
  return reference as ReferenceWithChildInternal;
}

function apSet(reference: FirebaseDatabaseTypes.Reference): ReferenceWithSetInternal {
  return reference as ReferenceWithSetInternal;
}

export default class DatabaseReference
  extends DatabaseQuery
  implements FirebaseDatabaseTypes.Reference
{
  readonly _database: DatabaseInternal;

  constructor(database: DatabaseInternal, path: string) {
    if (!internalRefs.includes(path as (typeof internalRefs)[number]) && !isValidPath(path)) {
      throw new Error(
        'firebase.database() Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"',
      );
    }

    super(database, path, new DatabaseQueryModifiers());
    this._database = database;
  }

  get parent(): FirebaseDatabaseTypes.Reference | null {
    const parentPath = pathParent(this.path);
    if (parentPath === null) {
      return null;
    }
    return createDeprecationProxy(
      new DatabaseReference(this._database, parentPath),
    ) as FirebaseDatabaseTypes.Reference;
  }

  get root(): FirebaseDatabaseTypes.Reference {
    return createDeprecationProxy(
      new DatabaseReference(this._database, '/'),
    ) as FirebaseDatabaseTypes.Reference;
  }

  child(path: string): FirebaseDatabaseTypes.Reference {
    if (!isString(path)) {
      throw new Error("firebase.database().ref().child(*) 'path' must be a string value.");
    }
    return createDeprecationProxy(
      new DatabaseReference(this._database, pathChild(this.path, path)),
    ) as FirebaseDatabaseTypes.Reference;
  }

  set(value: any, onComplete?: (error: Error | null) => void): Promise<void> {
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

  update(
    values: { [key: string]: any },
    onComplete?: (error: Error | null) => void,
  ): Promise<void> {
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

  setWithPriority(
    newVal: any,
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

  remove(onComplete?: (error: Error | null) => void): Promise<void> {
    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        "firebase.database().ref().remove(*) 'onComplete' must be a function if provided.",
      );
    }

    return promiseWithOptionalCallback(this._database.native.remove(this.path), onComplete);
  }

  transaction(
    transactionUpdate: (currentData: any) => any | undefined,
    onComplete?: (
      error: Error | null,
      committed: boolean,
      finalResult: FirebaseDatabaseTypes.DataSnapshot | null,
    ) => void,
    applyLocally?: boolean,
  ): Promise<FirebaseDatabaseTypes.TransactionResult> {
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
        snapshotData: unknown | null,
      ) => {
        if (isFunction(onComplete)) {
          if (error) {
            onComplete(error, committed, null);
          } else {
            onComplete(
              null,
              committed,
              createDeprecationProxy(
                new DatabaseDataSnapshot(
                  this,
                  snapshotData as ConstructorParameters<typeof DatabaseDataSnapshot>[1],
                ),
              ) as FirebaseDatabaseTypes.DataSnapshot,
            );
          }
        }

        if (error) {
          reject(error);
          return;
        }

        resolve({
          committed,
          snapshot: createDeprecationProxy(
            new DatabaseDataSnapshot(
              this,
              snapshotData as ConstructorParameters<typeof DatabaseDataSnapshot>[1],
            ),
          ) as FirebaseDatabaseTypes.DataSnapshot,
        });
      };

      this._database._transaction.add(this, transactionUpdate, onCompleteWrapper, applyLocally);
    });
  }

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

  push(
    value?: any,
    onComplete?: (error: Error | null) => void,
  ): FirebaseDatabaseTypes.ThenableReference {
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
        Promise.resolve(apChild(this).child.call(this, id, MODULAR_DEPRECATION_ARG)),
      ) as unknown as FirebaseDatabaseTypes.ThenableReference;
    }

    const pushRef = apChild(this).child.call(this, id, MODULAR_DEPRECATION_ARG);

    const promise = apSet(pushRef)
      .set.call(pushRef, value, onComplete, MODULAR_DEPRECATION_ARG)
      .then(() => pushRef);

    if (onComplete) {
      promise.catch(() => {});
    }

    return new DatabaseThenableReference(
      this._database,
      pathChild(this.path, id),
      promise,
    ) as unknown as FirebaseDatabaseTypes.ThenableReference;
  }

  onDisconnect(): FirebaseDatabaseTypes.OnDisconnect {
    return new DatabaseOnDisconnect(this);
  }
}

provideReferenceClassForQuery(DatabaseReference);
provideReferenceClassForThenable(DatabaseReference);
