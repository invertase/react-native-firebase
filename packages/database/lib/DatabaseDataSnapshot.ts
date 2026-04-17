/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
  isNumber,
  isObject,
  isString,
  MODULAR_DEPRECATION_ARG,
} from '@react-native-firebase/app/dist/module/common';
import { deepGet } from '@react-native-firebase/app/dist/module/common/deeps';

import type { DatabaseSnapshotInternal } from './types/internal';
import type { FirebaseDatabaseTypes } from './types/namespaced';

type ReferenceWithDeprecationArg = FirebaseDatabaseTypes.Reference & {
  child(path: string, deprecationArg?: string): FirebaseDatabaseTypes.Reference;
};

function ap(reference: FirebaseDatabaseTypes.Reference): ReferenceWithDeprecationArg {
  return reference as ReferenceWithDeprecationArg;
}

export default class DatabaseDataSnapshot implements FirebaseDatabaseTypes.DataSnapshot {
  _snapshot: DatabaseSnapshotInternal;
  _ref: FirebaseDatabaseTypes.Reference;

  constructor(reference: FirebaseDatabaseTypes.Reference, snapshot: DatabaseSnapshotInternal) {
    this._snapshot = snapshot;

    if (reference.key !== snapshot.key && isString(snapshot.key)) {
      this._ref = ap(reference.ref).child.call(
        reference.ref,
        snapshot.key,
        MODULAR_DEPRECATION_ARG,
      );
    } else {
      this._ref = reference;
    }
  }

  get key(): string | null {
    return this._snapshot.key;
  }

  get ref(): FirebaseDatabaseTypes.Reference {
    return this._ref;
  }

  child(path: string): FirebaseDatabaseTypes.DataSnapshot {
    if (!isString(path)) {
      throw new Error("snapshot().child(*) 'path' must be a string value");
    }

    const rootValue = this._snapshot.value as Record<string, unknown> | unknown[];
    let value = deepGet(rootValue, path);

    if (value === undefined) {
      value = null;
    }

    const childRef = ap(this._ref).child.call(this._ref, path, MODULAR_DEPRECATION_ARG);

    let childPriority: string | number | null = null;
    if (this._snapshot.childPriorities) {
      const childPriorityValue = this._snapshot.childPriorities[childRef.key as string];
      if (isString(childPriorityValue) || isNumber(childPriorityValue)) {
        childPriority = childPriorityValue;
      }
    }

    return createDeprecationProxy(
      new DatabaseDataSnapshot(childRef, {
        value,
        key: childRef.key,
        exists: value !== null,
        childKeys: isObject(value) ? Object.keys(value as Record<string, unknown>) : [],
        priority: childPriority,
      }),
    ) as FirebaseDatabaseTypes.DataSnapshot;
  }

  exists(): boolean {
    return this._snapshot.exists;
  }

  exportVal(): any {
    let { value } = this._snapshot;

    if (isObject(value) || isArray(value)) {
      value = JSON.parse(JSON.stringify(value));
    }

    return {
      '.value': value,
      '.priority': this._snapshot.priority,
    };
  }

  forEach(action: (child: FirebaseDatabaseTypes.DataSnapshot) => boolean | void): boolean {
    if (!isFunction(action)) {
      throw new Error("snapshot.forEach(*) 'action' must be a function.");
    }

    const iterate = action as (
      child: FirebaseDatabaseTypes.DataSnapshot,
      index?: number,
    ) => boolean | void;

    if (isArray(this._snapshot.value)) {
      return this._snapshot.value.some(
        (_value, i) => iterate(this.child(i.toString()), i) === true,
      );
    }

    if (!this._snapshot.childKeys.length) {
      return false;
    }

    let cancelled = false;

    for (let i = 0; i < this._snapshot.childKeys.length; i++) {
      const key = this._snapshot.childKeys[i];
      if (key === undefined) {
        continue;
      }
      const snapshot = this.child(key);
      const actionReturn = iterate(snapshot, i);

      if (actionReturn === true) {
        cancelled = true;
        break;
      }
    }

    return cancelled;
  }

  getPriority(): string | number | null {
    return this._snapshot.priority ?? null;
  }

  hasChild(path: string): boolean {
    if (!isString(path)) {
      throw new Error("snapshot.hasChild(*) 'path' must be a string value.");
    }

    const rootValue = this._snapshot.value as Record<string, unknown> | unknown[];
    return deepGet(rootValue, path) !== undefined;
  }

  hasChildren(): boolean {
    return this.numChildren() > 0;
  }

  numChildren(): number {
    const { value } = this._snapshot;
    if (isArray(value)) {
      return value.length;
    }
    if (!isObject(value)) {
      return 0;
    }
    return Object.keys(value as Record<string, unknown>).length;
  }

  toJSON(): object | null {
    return this.val() as object | null;
  }

  val(): any {
    const { value } = this._snapshot;

    if (isObject(value) || isArray(value)) {
      return JSON.parse(JSON.stringify(value));
    }

    return value;
  }
}
