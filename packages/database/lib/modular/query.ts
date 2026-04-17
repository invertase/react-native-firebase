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

import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type {
  DataSnapshot,
  DatabaseReference,
  EventType,
  ListenOptions,
  OnDisconnect,
  Query,
  QueryConstraintType,
  ThenableReference,
  Unsubscribe,
} from '../types/database';
import { QueryConstraint } from '../types/database';
import type {
  DatabaseReferenceWithMethodsInternal,
  QueryConstraintWithApplyInternal,
  QueryWithModifiersInternal,
  QueryWithSubscriptionMethodsInternal,
} from '../types/internal';

class DatabaseQueryConstraint extends QueryConstraint {
  readonly type: QueryConstraintType;
  private readonly args: unknown[];

  constructor(type: QueryConstraintType, ...args: unknown[]) {
    super();
    this.type = type;
    this.args = args;
  }

  _apply(query: Query): Query {
    return (query as QueryWithModifiersInternal)[this.type].apply(query, [
      ...this.args,
      MODULAR_DEPRECATION_ARG,
    ]);
  }
}

type SnapshotCallbackInternal =
  | ((snapshot: DataSnapshot) => unknown)
  | ((snapshot: DataSnapshot, previousChildName: string | null) => unknown);

export function endAt(value: number | string | boolean | null, key?: string): QueryConstraint {
  return new DatabaseQueryConstraint('endAt', value, key);
}

export function endBefore(value: number | string | boolean | null, key?: string): QueryConstraint {
  return new DatabaseQueryConstraint('endBefore', value, key);
}

export function startAt(value?: number | string | boolean | null, key?: string): QueryConstraint {
  return new DatabaseQueryConstraint('startAt', value, key);
}

export function startAfter(value: number | string | boolean | null, key?: string): QueryConstraint {
  return new DatabaseQueryConstraint('startAfter', value, key);
}

export function limitToFirst(limit: number): QueryConstraint {
  return new DatabaseQueryConstraint('limitToFirst', limit);
}

export function limitToLast(limit: number): QueryConstraint {
  return new DatabaseQueryConstraint('limitToLast', limit);
}

export function orderByChild(path: string): QueryConstraint {
  return new DatabaseQueryConstraint('orderByChild', path);
}

export function orderByKey(): QueryConstraint {
  return new DatabaseQueryConstraint('orderByKey');
}

export function orderByPriority(): QueryConstraint {
  return new DatabaseQueryConstraint('orderByPriority');
}

export function orderByValue(): QueryConstraint {
  return new DatabaseQueryConstraint('orderByValue');
}

export function equalTo(value: number | string | boolean | null, key?: string): QueryConstraint {
  return new DatabaseQueryConstraint('equalTo', value, key);
}

export function query(queryRef: Query, ...queryConstraints: QueryConstraint[]): Query {
  let nextQuery = queryRef;
  for (const queryConstraint of queryConstraints as QueryConstraintWithApplyInternal[]) {
    nextQuery = queryConstraint._apply(nextQuery);
  }
  return nextQuery;
}

function addEventListener(
  queryRef: Query,
  eventType: EventType,
  callback: SnapshotCallbackInternal,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe {
  let cancelCallback = cancelCallbackOrListenOptions;

  if (typeof cancelCallbackOrListenOptions === 'object') {
    cancelCallback = undefined;
    options = cancelCallbackOrListenOptions;
  }

  const queryWithSubscriptions = queryRef as QueryWithSubscriptionMethodsInternal;
  let listenerCallback = callback;

  if (options?.onlyOnce) {
    const userCallback = callback;
    listenerCallback = ((snapshot: DataSnapshot, previousChildName?: string | null) => {
      queryWithSubscriptions.off.call(
        queryRef,
        eventType,
        listenerCallback as (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
        null,
        MODULAR_DEPRECATION_ARG,
      );

      return (
        userCallback as (snapshot: DataSnapshot, previousChildName?: string | null) => unknown
      )(snapshot, previousChildName);
    }) as SnapshotCallbackInternal;
  }

  queryWithSubscriptions.on.call(
    queryRef,
    eventType,
    listenerCallback as (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
    cancelCallback as ((error: Error) => unknown) | undefined,
    null,
    MODULAR_DEPRECATION_ARG,
  );

  return () =>
    queryWithSubscriptions.off.call(
      queryRef,
      eventType,
      listenerCallback as (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
      null,
      MODULAR_DEPRECATION_ARG,
    );
}

export function onValue(
  queryRef: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;
export function onValue(
  queryRef: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  options: ListenOptions,
): Unsubscribe;
export function onValue(
  queryRef: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;
export function onValue(
  queryRef: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe {
  return addEventListener(queryRef, 'value', callback, cancelCallbackOrListenOptions, options);
}

export function onChildAdded(
  queryRef: Query,
  callback: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;
export function onChildAdded(
  queryRef: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  options: ListenOptions,
): Unsubscribe;
export function onChildAdded(
  queryRef: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;
export function onChildAdded(
  queryRef: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe {
  return addEventListener(
    queryRef,
    'child_added',
    callback,
    cancelCallbackOrListenOptions,
    options,
  );
}

export function onChildChanged(
  queryRef: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;
export function onChildChanged(
  queryRef: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  options: ListenOptions,
): Unsubscribe;
export function onChildChanged(
  queryRef: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;
export function onChildChanged(
  queryRef: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe {
  return addEventListener(
    queryRef,
    'child_changed',
    callback,
    cancelCallbackOrListenOptions,
    options,
  );
}

export function onChildMoved(
  queryRef: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;
export function onChildMoved(
  queryRef: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  options: ListenOptions,
): Unsubscribe;
export function onChildMoved(
  queryRef: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;
export function onChildMoved(
  queryRef: Query,
  callback: (snapshot: DataSnapshot, previousChildName: string | null) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe {
  return addEventListener(
    queryRef,
    'child_moved',
    callback,
    cancelCallbackOrListenOptions,
    options,
  );
}

export function onChildRemoved(
  queryRef: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallback?: (error: Error) => unknown,
): Unsubscribe;
export function onChildRemoved(
  queryRef: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  options: ListenOptions,
): Unsubscribe;
export function onChildRemoved(
  queryRef: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallback: (error: Error) => unknown,
  options: ListenOptions,
): Unsubscribe;
export function onChildRemoved(
  queryRef: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions,
): Unsubscribe {
  return addEventListener(
    queryRef,
    'child_removed',
    callback,
    cancelCallbackOrListenOptions,
    options,
  );
}

export function set(ref: DatabaseReference, value: unknown): Promise<void> {
  return (ref as DatabaseReferenceWithMethodsInternal).set.call(
    ref,
    value,
    () => {},
    MODULAR_DEPRECATION_ARG,
  );
}

export function setPriority(
  ref: DatabaseReference,
  priority: string | number | null,
): Promise<void> {
  return (ref as DatabaseReferenceWithMethodsInternal).setPriority.call(
    ref,
    priority,
    () => {},
    MODULAR_DEPRECATION_ARG,
  );
}

export function setWithPriority(
  ref: DatabaseReference,
  value: unknown,
  priority: string | number | null,
): Promise<void> {
  return (ref as DatabaseReferenceWithMethodsInternal).setWithPriority.call(
    ref,
    value,
    priority,
    () => {},
    MODULAR_DEPRECATION_ARG,
  );
}

export function get(queryRef: Query): Promise<DataSnapshot> {
  return (queryRef as QueryWithSubscriptionMethodsInternal).once.call(
    queryRef,
    'value',
    () => {},
    () => {},
    {},
    MODULAR_DEPRECATION_ARG,
  );
}

export function off(
  _query: Query,
  _eventType?: EventType,
  _callback?: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown,
): void {
  throw new Error('off() is not implemented - use unsubscriber callback returned when subscribing');
}

export function child(parent: DatabaseReference, path: string): DatabaseReference {
  return (parent as DatabaseReferenceWithMethodsInternal).child.call(
    parent,
    path,
    MODULAR_DEPRECATION_ARG,
  );
}

export function onDisconnect(ref: DatabaseReference): OnDisconnect {
  return (ref as DatabaseReferenceWithMethodsInternal).onDisconnect.call(
    ref,
    MODULAR_DEPRECATION_ARG,
  );
}

export function keepSynced(ref: DatabaseReference, bool: boolean): Promise<void> {
  return (ref as DatabaseReferenceWithMethodsInternal).keepSynced.call(
    ref,
    bool,
    MODULAR_DEPRECATION_ARG,
  );
}

export function push(parent: DatabaseReference, value?: unknown): ThenableReference {
  return (parent as DatabaseReferenceWithMethodsInternal).push.call(
    parent,
    value,
    undefined,
    MODULAR_DEPRECATION_ARG,
  );
}

export function remove(ref: DatabaseReference): Promise<void> {
  return (ref as DatabaseReferenceWithMethodsInternal).remove.call(ref, MODULAR_DEPRECATION_ARG);
}

export function update(ref: DatabaseReference, values: object): Promise<void> {
  return (ref as DatabaseReferenceWithMethodsInternal).update.call(
    ref,
    values,
    MODULAR_DEPRECATION_ARG,
  );
}
