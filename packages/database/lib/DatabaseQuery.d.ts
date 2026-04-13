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

import type { DatabaseInternal } from './types/internal';
import type { FirebaseDatabaseTypes } from './types/namespaced';
import type DatabaseQueryModifiers from './DatabaseQueryModifiers';

export function provideReferenceClass(
  databaseReference: new (
    database: DatabaseInternal,
    path: string,
  ) => FirebaseDatabaseTypes.Reference,
): void;

export default class DatabaseQuery implements FirebaseDatabaseTypes.Query {
  constructor(database: DatabaseInternal, path: string, modifiers: DatabaseQueryModifiers);

  readonly path: string;
  readonly key: string | null;
  readonly _database: DatabaseInternal;
  readonly _modifiers: {
    _copy(): {
      endAt(value: number | string | boolean | null, key?: string): unknown;
      limitToFirst(limit: number): unknown;
      limitToLast(limit: number): unknown;
      orderByChild(path: string): unknown;
      orderByKey(): unknown;
      orderByPriority(): unknown;
      orderByValue(): unknown;
      startAt(value: number | string | boolean | null, key?: string): unknown;
      toArray(): unknown;
      validateModifiers(prefix: string): void;
    };
    hasEndAt(): boolean;
    hasLimit(): boolean;
    hasOrderBy(): boolean;
    hasStartAt(): boolean;
    isValidLimit(limit: number): boolean;
    toArray(): unknown;
    toString(): string;
  };

  get ref(): FirebaseDatabaseTypes.Reference;
  endAt(value: number | string | boolean | null, key?: string): FirebaseDatabaseTypes.Query;
  equalTo(value: number | string | boolean | null, key?: string): FirebaseDatabaseTypes.Query;
  isEqual(other: FirebaseDatabaseTypes.Query): boolean;
  limitToFirst(limit: number): FirebaseDatabaseTypes.Query;
  limitToLast(limit: number): FirebaseDatabaseTypes.Query;
  off(
    eventType?: FirebaseDatabaseTypes.EventType,
    callback?: (a: FirebaseDatabaseTypes.DataSnapshot, b?: string | null) => void,
    context?: Record<string, any>,
  ): void;
  on(
    eventType: FirebaseDatabaseTypes.EventType,
    callback: (data: FirebaseDatabaseTypes.DataSnapshot, previousChildKey?: string | null) => void,
    cancelCallbackOrContext?: ((a: Error) => void) | Record<string, any> | null,
    context?: Record<string, any> | null,
  ): (a: FirebaseDatabaseTypes.DataSnapshot | null, b?: string | null) => void;
  once(
    eventType: FirebaseDatabaseTypes.EventType,
    successCallback?: (a: FirebaseDatabaseTypes.DataSnapshot, b?: string | null) => any,
    failureCallbackContext?: ((a: Error) => void) | Record<string, any> | null,
  ): Promise<FirebaseDatabaseTypes.DataSnapshot>;
  orderByChild(path: string): FirebaseDatabaseTypes.Query;
  orderByKey(): FirebaseDatabaseTypes.Query;
  orderByPriority(): FirebaseDatabaseTypes.Query;
  orderByValue(): FirebaseDatabaseTypes.Query;
  startAt(value: number | string | boolean | null, key?: string): FirebaseDatabaseTypes.Query;
  toJSON(): object;
  toString(): string;
  keepSynced(bool: boolean): Promise<void>;
}
