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
  isArray,
  isFunction,
  isObject,
  isString,
  isNumber,
} from '@react-native-firebase/app/dist/module/common';
import { deepGet } from '@react-native-firebase/app/dist/module/common/deeps';

import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type DatabaseReference from './DatabaseReference';
import type DatabaseQuery from './DatabaseQuery';

interface SnapshotData {
  value: unknown;
  key: string | null;
  exists: boolean;
  childKeys: string[];
  priority: string | number | null;
  childPriorities?: { [key: string]: string | number | null };
}

export default class DatabaseDataSnapshot {
  _snapshot: SnapshotData;
  _ref: DatabaseReference;

  constructor(reference: DatabaseReference | DatabaseQuery, snapshot: SnapshotData) {
    this._snapshot = snapshot;

    if (reference.key !== snapshot.key) {
      // reference is a query?
      this._ref = (reference.ref.child as any).call(
        reference.ref,
        snapshot.key,
        MODULAR_DEPRECATION_ARG,
      ) as DatabaseReference;
    } else {
      this._ref = reference as DatabaseReference;
    }

    // TODO #894
    // if (this._ref.path === '.info/connected') {
    //  Handle 1/0 vs true/false values on ios/android
    // }
  }

  get key(): string | null {
    return this._snapshot.key;
  }

  get ref(): DatabaseReference {
    return this._ref;
  }

  /**
   * Returns a new snapshot of the child location
   * @param path
   * @returns {DatabaseDataSnapshot}
   */
  child(path: string): DatabaseDataSnapshot {
    if (!isString(path)) {
      throw new Error("snapshot().child(*) 'path' must be a string value");
    }

    let value = deepGet(this._snapshot.value as Record<string, unknown> | unknown[], path);

    if (value === undefined) {
      value = null;
    }

    const childRef = (this._ref.child as any).call(
      this._ref,
      path,
      MODULAR_DEPRECATION_ARG,
    ) as DatabaseReference;

    let childPriority: string | number | null = null;
    if (this._snapshot.childPriorities) {
      const childPriorityValue = this._snapshot.childPriorities[childRef.key || ''];
      if (isString(childPriorityValue) || isNumber(childPriorityValue)) {
        childPriority = childPriorityValue;
      }
    }
    return createDeprecationProxy(
      new DatabaseDataSnapshot(childRef, {
        value,
        key: childRef.key,
        exists: value !== null,
        childKeys: isObject(value) ? Object.keys(value) : [],
        priority: childPriority,
      }),
    ) as DatabaseDataSnapshot;
  }

  /**
   * Returns whether the value exists
   *
   * @returns {(function())|((path: PathLike, callback: (exists: boolean) => void) => void)|boolean|exists|(() => boolean)}
   */
  exists(): boolean {
    return this._snapshot.exists;
  }

  /**
   * Exports value and priority
   *
   * @returns {{'.priority': *, '.value': *}}
   */
  exportVal(): { '.value': unknown; '.priority': string | number | null } {
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
  forEach(action: (snapshot: DatabaseDataSnapshot, index: number) => true | undefined): boolean {
    if (!isFunction(action)) {
      throw new Error("snapshot.forEach(*) 'action' must be a function.");
    }

    // If the value is an array,
    if (isArray(this._snapshot.value)) {
      return this._snapshot.value.some((_value, i) => {
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
      const snapshot = (this.child as any).call(this, key, MODULAR_DEPRECATION_ARG);
      const actionReturn = action(snapshot, i);

      if (actionReturn === true) {
        cancelled = true;
        break;
      }
    }

    return cancelled;
  }

  getPriority(): string | number | null {
    return this._snapshot.priority;
  }

  /**
   * Checks the returned value for a nested child path
   *
   * @param path
   * @returns {boolean}
   */
  hasChild(path: string): boolean {
    if (!isString(path)) {
      throw new Error("snapshot.hasChild(*) 'path' must be a string value.");
    }

    return deepGet(this._snapshot.value as Record<string, unknown> | unknown[], path) !== undefined;
  }

  /**
   * Returns whether the snapshot has any children
   *
   * @returns {boolean}
   */
  hasChildren(): boolean {
    return this.numChildren() > 0;
  }

  /**
   * Returns the number of children this snapshot has
   *
   * @returns {number}
   */
  numChildren(): number {
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
  toJSON(): unknown {
    return this.val();
  }

  /**
   * Returns the serialized value of the snapshot returned from Firebase
   *
   * @returns {any}
   */
  val(): unknown {
    const { value } = this._snapshot;

    if (isObject(value) || isArray(value)) {
      return JSON.parse(JSON.stringify(value));
    }

    return value;
  }
}
