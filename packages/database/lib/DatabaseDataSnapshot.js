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

import { isArray, isFunction, isObject, isString } from '@react-native-firebase/app/lib/common';
import { deepGet } from '@react-native-firebase/app/lib/common/deeps';

export default class DatabaseDataSnapshot {
  constructor(reference, snapshot) {
    this._snapshot = snapshot;

    if (reference.key !== snapshot.key) {
      // reference is a query?
      this._ref = reference.ref.child(snapshot.key);
    } else {
      this._ref = reference;
    }

    // TODO #894
    // if (this._ref.path === '.info/connected') {
    //  Handle 1/0 vs true/false values on ios/android
    // }
  }

  get key() {
    return this._snapshot.key;
  }

  get ref() {
    return this._ref;
  }

  /**
   * Returns a new snapshot of the child location
   * @param path
   * @returns {DatabaseDataSnapshot}
   */
  child(path) {
    if (!isString(path)) {
      throw new Error("snapshot().child(*) 'path' must be a string value");
    }

    let value = deepGet(this._snapshot.value, path);

    if (value === undefined) {
      value = null;
    }

    const childRef = this._ref.child(path);

    return new DatabaseDataSnapshot(childRef, {
      value,
      key: childRef.key,
      exists: value !== null,
      childKeys: isObject(value) ? Object.keys(value) : [],
    });
  }

  /**
   * Returns whether the value exists
   *
   * @returns {(function())|((path: PathLike, callback: (exists: boolean) => void) => void)|boolean|exists|(() => boolean)}
   */
  exists() {
    return this._snapshot.exists;
  }

  /**
   * Exports value and priority
   *
   * @returns {{'.priority': *, '.value': *}}
   */
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
      throw new Error("snapshot.forEach(*) 'action' must be a function.");
    }

    // If the value is an array,
    if (isArray(this._snapshot.value)) {
      return this._snapshot.value.some((value, i) => {
        const snapshot = this.child(i.toString());
        return action(snapshot, i) === true;
      });
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

  /**
   * Checks the returned value for a nested child path
   *
   * @param path
   * @returns {boolean}
   */
  hasChild(path) {
    if (!isString(path)) {
      throw new Error("snapshot.hasChild(*) 'path' must be a string value.");
    }

    return deepGet(this._snapshot.value, path) !== undefined;
  }

  /**
   * Returns whether the snapshot has any children
   *
   * @returns {boolean}
   */
  hasChildren() {
    return this.numChildren() > 0;
  }

  /**
   * Returns the number of children this snapshot has
   *
   * @returns {number}
   */
  numChildren() {
    const { value } = this._snapshot;
    if (isArray(value)) {
      return value.length;
    }
    if (!isObject(value)) {
      return 0;
    }
    return Object.keys(value).length;
  }

  /**
   * Overrides the .toJSON implementation for snapshot
   * Same as snapshot.val()
   * @returns {any}
   */
  toJSON() {
    return this.val();
  }

  /**
   * Returns the serialized value of the snapshot returned from Firebase
   *
   * @returns {any}
   */
  val() {
    const { value } = this._snapshot;

    if (isObject(value) || isArray(value)) {
      return JSON.parse(JSON.stringify(value));
    }

    return value;
  }
}
