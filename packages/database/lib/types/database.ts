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

import type { FirebaseDatabaseTypes } from './namespaced';

export type Database = FirebaseDatabaseTypes.Module;
export type ServerValue = FirebaseDatabaseTypes.ServerValue;
export type TransactionResult = FirebaseDatabaseTypes.TransactionResult;
export type DatabaseReference = FirebaseDatabaseTypes.Reference;
export type ThenableReference = FirebaseDatabaseTypes.ThenableReference;
export type Query = FirebaseDatabaseTypes.Query;
export type OnDisconnect = FirebaseDatabaseTypes.OnDisconnect;
export type EventType = FirebaseDatabaseTypes.EventType;
export type DataSnapshot = FirebaseDatabaseTypes.DataSnapshot;

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

export interface TransactionOptions {
  readonly applyLocally?: boolean;
}
