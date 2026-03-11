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

import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type {
  Query,
  DataSnapshot,
  Reference,
  OnDisconnect,
  EventType,
  ThenableReference,
} from '../types/database';

export type Unsubscribe = () => void;

export interface ListenOptions {
  readonly onlyOnce?: boolean;
}

export type QueryConstraintType =
  | 'endAt'
  | 'endBefore'
  | 'startAt'
  | 'startAfter'
  | 'limitToFirst'
  | 'limitToLast'
  | 'orderByChild'
  | 'orderByKey'
  | 'orderByPriority'
  | 'orderByValue'
  | 'equalTo';

export interface QueryConstraint {
  readonly _type: QueryConstraintType;
  _apply(query: Query): Query;
}

class QueryConstraintImpl implements QueryConstraint {
  readonly _type: QueryConstraintType;
  private readonly _args: unknown[];

  constructor(type: QueryConstraintType, ...args: unknown[]) {
    this._type = type;
    this._args = args;
  }

  _apply(query: Query): Query {
    return (query[this._type] as (...args: unknown[]) => Query).apply(query, [
      ...this._args,
      MODULAR_DEPRECATION_ARG,
    ]);
  }
}

export function endAt(value: number | string | boolean | null, key?: string): QueryConstraint {
  return new QueryConstraintImpl('endAt', value, key);
}

export function endBefore(value: number | string | boolean | null, key?: string): QueryConstraint {
  return new QueryConstraintImpl('endBefore', value, key);
}

export function startAt(value?: number | string | boolean | null, key?: string): QueryConstraint {
  return new QueryConstraintImpl('startAt', value, key);
}

export function startAfter(value: number | string | boolean | null, key?: string): QueryConstraint {
  return new QueryConstraintImpl('startAfter', value, key);
}

export function limitToFirst(limit: number): QueryConstraint {
  return new QueryConstraintImpl('limitToFirst', limit);
}

export function limitToLast(limit: number): QueryConstraint {
  return new QueryConstraintImpl('limitToLast', limit);
}

export function orderByChild(path: string): QueryConstraint {
  return new QueryConstraintImpl('orderByChild', path);
}

export function orderByKey(): QueryConstraint {
  return new QueryConstraintImpl('orderByKey');
}

export function orderByPriority(): QueryConstraint {
  return new QueryConstraintImpl('orderByPriority');
}

export function orderByValue(): QueryConstraint {
  return new QueryConstraintImpl('orderByValue');
}

export function equalTo(value: number | string | boolean | null, key?: string): QueryConstraint {
  return new QueryConstraintImpl('equalTo', value, key);
}

export function query(query: Query, ...queryConstraints: QueryConstraint[]): Query {
  let q = query;
  for (const queryConstraint of queryConstraints) {
    q = queryConstraint._apply(q);
  }
  return q;
}

function addEventListener(
  query: Query,
  eventType: EventType,
  callback: (snapshot: DataSnapshot, previousChildKey?: string | null) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe {
  let cancelCallback: ((error: Error) => unknown) | undefined;
  let listenOptions: ListenOptions | undefined = options;

  if (typeof cancelCallbackOrListenOptions === 'object') {
    cancelCallback = undefined;
    listenOptions = cancelCallbackOrListenOptions;
  } else {
    cancelCallback = cancelCallbackOrListenOptions;
  }

  if (listenOptions && listenOptions.onlyOnce) {
    const userCallback = callback;
    callback = (snapshot: DataSnapshot, previousChildKey?: string | null) => {
      query.off.call(query, eventType, callback, null, MODULAR_DEPRECATION_ARG);
      return userCallback(snapshot, previousChildKey);
    };
  }

  query.on.call(query, eventType, callback, cancelCallback, null, MODULAR_DEPRECATION_ARG);

  return () => query.off.call(query, eventType, callback, null, MODULAR_DEPRECATION_ARG);
}

export function onValue(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe {
  return addEventListener(query, 'value', callback, cancelCallbackOrListenOptions, options);
}

export function onChildAdded(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe {
  return addEventListener(query, 'child_added', callback, cancelCallbackOrListenOptions, options);
}

export function onChildChanged(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe {
  return addEventListener(query, 'child_changed', callback, cancelCallbackOrListenOptions, options);
}

export function onChildMoved(
  query: Query,
  callback: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe {
  return addEventListener(query, 'child_moved', callback, cancelCallbackOrListenOptions, options);
}

export function onChildRemoved(
  query: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe {
  return addEventListener(query, 'child_removed', callback, cancelCallbackOrListenOptions, options);
}

export function set(ref: Reference, value: unknown): Promise<void> {
  return ref.set.call(ref, value, () => {}, MODULAR_DEPRECATION_ARG);
}

export function setPriority(ref: Reference, priority: string | number | null): Promise<void> {
  return ref.setPriority.call(ref, priority, () => {}, MODULAR_DEPRECATION_ARG);
}

export function setWithPriority(
  ref: Reference,
  value: unknown,
  priority: string | number | null,
): Promise<void> {
  return ref.setWithPriority.call(ref, value, priority, () => {}, MODULAR_DEPRECATION_ARG);
}

export function get(query: Query): Promise<DataSnapshot> {
  return query.once.call(
    query,
    'value',
    () => {},
    () => {},
    {},
    MODULAR_DEPRECATION_ARG,
  );
}

export function off(_query: Query, _eventType?: EventType, _callback?: unknown): void {
  throw new Error('off() is not implemented - use unsubscriber callback returned when subscribing');
}

export function child(parent: Reference, path: string): Reference {
  return parent.child.call(parent, path, MODULAR_DEPRECATION_ARG);
}

export function onDisconnect(ref: Reference): OnDisconnect {
  return ref.onDisconnect.call(ref, MODULAR_DEPRECATION_ARG);
}

export function keepSynced(ref: Reference, value: boolean): Promise<void> {
  return ref.keepSynced.call(ref, value, MODULAR_DEPRECATION_ARG);
}

export function push(parent: Reference, value?: unknown): ThenableReference {
  return parent.push.call(parent, value, MODULAR_DEPRECATION_ARG);
}

export function remove(ref: Reference): Promise<void> {
  return ref.remove.call(ref, MODULAR_DEPRECATION_ARG);
}

export function update(ref: Reference, values: { [key: string]: unknown }): Promise<void> {
  return ref.update.call(ref, values, MODULAR_DEPRECATION_ARG);
}
