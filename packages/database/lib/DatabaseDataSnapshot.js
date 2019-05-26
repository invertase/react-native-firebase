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

import { isArray, isFunction, isObject } from '@react-native-firebase/common';

export default class DatabaseDataSnapshot {
  constructor(reference, snapshot) {
    this._snapshot = snapshot;

    if (reference.key !== snapshot.key) {
      this._ref = reference.child(snapshot.key);
    } else {
      this._ref = reference;
    }
  }

  get key() {
    return this._snapshot.key;
  }

  get ref() {
    return this._ref;
  }

  child(path) {
    // TODO
  }

  exists() {
    return this._snapshot.exists;
  }

  exportVal() {
    let { value } = this._snapshot;

    if (isObject(value) || isArray(value)) {
      value = JSON.parse(JSON.stringify(value));
    }

    return {
      '.value': value,
      '.priority': this._snapshot.priority,
    };
  }

  forEach(action) {
    if (!isFunction(action)) {
      throw new Error(`snapshot.forEach(*) 'action' must be a function.`);
    }

    // TODO
  }

  getPriority() {
    // TODO
  }

  hasChild() {
    // TODO
  }

  hasChildren() {
    // TODO
  }

  numChildren() {
    // TODO
  }

  toJSON() {
    return this.val();
  }

  val() {
    const { value } = this._snapshot;

    if (isObject(value) || isArray(value)) {
      return JSON.parse(JSON.stringify(value));
    }

    return value;
  }
}
