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
  isValidPath,
  isArray,
  isFunction,
  isObject,
} from '@react-native-firebase/common';

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
    if (!isString(path)) {
      throw new Error(
        `snapshot().child(*) 'path' must be a string value`
      )
    }

    let value = null; // TODO deepGet value

    if (value === undefined) value = null;
    const childRef = this._ref.child(path);

    return new DatabaseDataSnapshot(childRef, {
      value,
      key: childRef.key,
      exists: value !== null,
      // TODO this is wrong - child keys needs to be the ordered keys, from FB
      // TODO potential solution is build up a tree/map of a snapshot and its children
      // TODO natively and send that back to JS to be use in this class.
      childKeys: isObject(value) ? Object.keys(value) : [],
    });
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

  /**
   * Iterate over keys in order from Firebase
   *
   * @param action
   * @return {boolean}
   */
  forEach(action) {
    if (!isFunction(action)) {
      throw new Error(`snapshot.forEach(*) 'action' must be a function.`);
    }

    if (!this._snapshot.childKeys.length) {
      return false;
    }

    let cancelled = false;

    for (let i = 0; i < this._snapshot.childKeys.length; i++) {
      const key = this._snapshot.childKeys[i];
      const snapshot = this.child(key);
      const actionReturn = action(snapshot, i);

      if (actionReturn === true) {
        cancelled = true;
        break;
      }
    }

    return cancelled;
  }

  getPriority() {
    return this._snapshot.priority;
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
