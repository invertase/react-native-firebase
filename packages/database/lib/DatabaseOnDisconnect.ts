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
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
  isValidPath,
  promiseWithOptionalCallback,
} from '@react-native-firebase/app/dist/module/common';

import type { DatabaseModuleInternal } from './types/internal';
import type { FirebaseDatabaseTypes } from './types/namespaced';

interface DatabaseOnDisconnectReferenceInternal {
  readonly path: string;
  readonly _database: DatabaseModuleInternal;
}

export default class DatabaseOnDisconnect implements FirebaseDatabaseTypes.OnDisconnect {
  _ref: DatabaseOnDisconnectReferenceInternal;

  constructor(reference: DatabaseOnDisconnectReferenceInternal) {
    this._ref = reference;
  }

  cancel(onComplete?: (error: Error | null) => void): Promise<void> {
    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        "firebase.database().ref().onDisconnect().cancel(*) 'onComplete' must be a function if provided.",
      );
    }

    return promiseWithOptionalCallback(
      this._ref._database.native.onDisconnectCancel(this._ref.path),
      onComplete,
    );
  }

  remove(onComplete?: (error: Error | null) => void): Promise<void> {
    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        "firebase.database().ref().onDisconnect().remove(*) 'onComplete' must be a function if provided.",
      );
    }

    return promiseWithOptionalCallback(
      this._ref._database.native.onDisconnectRemove(this._ref.path),
      onComplete,
    );
  }

  set(value: any, onComplete?: (error: Error | null) => void): Promise<void> {
    if (isUndefined(value)) {
      throw new Error("firebase.database().ref().value(*) 'value' must be defined.");
    }

    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        "firebase.database().ref().onDisconnect().set(_, *) 'onComplete' must be a function if provided.",
      );
    }

    return promiseWithOptionalCallback(
      this._ref._database.native.onDisconnectSet(this._ref.path, { value }),
      onComplete,
    );
  }

  setWithPriority(
    value: any,
    priority: string | number | null,
    onComplete?: (error: Error | null) => void,
  ): Promise<void> {
    if (isUndefined(value)) {
      throw new Error("firebase.database().ref().setWithPriority(*) 'value' must be defined.");
    }

    if (!isNumber(priority) && !isString(priority) && !isNull(priority)) {
      throw new Error(
        "firebase.database().ref().onDisconnect().setWithPriority(_, *) 'priority' must be a number, string or null value.",
      );
    }

    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        "firebase.database().ref().onDisconnect().setWithPriority(_, _, *) 'onComplete' must be a function if provided.",
      );
    }

    return promiseWithOptionalCallback(
      this._ref._database.native.onDisconnectSetWithPriority(this._ref.path, { value, priority }),
      onComplete,
    );
  }

  update(
    values: { [key: string]: any },
    onComplete?: (error: Error | null) => void,
  ): Promise<void> {
    if (!isObject(values)) {
      throw new Error(
        "firebase.database().ref().onDisconnect().update(*) 'values' must be an object.",
      );
    }

    if (!Object.keys(values as Record<string, unknown>).length) {
      throw new Error(
        "firebase.database().ref().onDisconnect().update(*) 'values' must be an object containing multiple values.",
      );
    }

    const keys = Object.keys(values);
    for (let i = 0; i < keys.length; i++) {
      if (!isValidPath(keys[i])) {
        throw new Error(
          'firebase.database().onDisconnect().update(*) \'values\' contains an invalid path. Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"',
        );
      }
    }

    if (!isUndefined(onComplete) && !isFunction(onComplete)) {
      throw new Error(
        "firebase.database().ref().onDisconnect().update(_, *) 'onComplete' must be a function if provided.",
      );
    }

    return promiseWithOptionalCallback(
      this._ref._database.native.onDisconnectUpdate(this._ref.path, { values }),
      onComplete,
    );
  }
}
