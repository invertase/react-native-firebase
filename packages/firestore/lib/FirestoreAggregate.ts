/*
 * Copyright (c) 2022-present Invertase Limited & Contributors
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

import FieldPath, { fromDotSeparatedString } from './FirestoreFieldPath';

import type FirestorePath from './FirestorePath';
import type FirestoreQuery from './FirestoreQuery';
import type FirestoreQueryModifiers from './FirestoreQueryModifiers';

export class FirestoreAggregateQuery {
  _firestore: any;
  _query: FirestoreQuery;
  _collectionPath: FirestorePath;
  _modifiers: FirestoreQueryModifiers;

  constructor(
    firestore: any,
    query: FirestoreQuery,
    collectionPath: FirestorePath,
    modifiers: FirestoreQueryModifiers,
  ) {
    this._firestore = firestore;
    this._query = query;
    this._collectionPath = collectionPath;
    this._modifiers = modifiers;
  }

  get query(): FirestoreQuery {
    return this._query;
  }

  get(): Promise<FirestoreAggregateQuerySnapshot> {
    return this._firestore.native
      .collectionCount(
        this._collectionPath.relativeName,
        this._modifiers.type,
        this._modifiers.filters,
        this._modifiers.orders,
        this._modifiers.options,
      )
      .then(
        (data: { count?: number }) => new FirestoreAggregateQuerySnapshot(this._query, data, true),
      );
  }
}

export class FirestoreAggregateQuerySnapshot {
  _query: FirestoreQuery;
  _data: { count?: number; [key: string]: unknown };
  _isGetCountFromServer: boolean;

  constructor(
    query: FirestoreQuery,
    data: { count?: number; [key: string]: unknown },
    isGetCountFromServer: boolean,
  ) {
    this._query = query;
    this._data = data;
    this._isGetCountFromServer = isGetCountFromServer;
  }

  data(): { count?: number; [key: string]: unknown } {
    if (this._isGetCountFromServer) {
      return { count: this._data.count };
    }
    return { ...this._data };
  }
}

export const AggregateType = {
  SUM: 'sum',
  AVG: 'average',
  COUNT: 'count',
} as const;

export class AggregateField {
  aggregateType: string;
  _fieldPath: FieldPath | undefined;

  constructor(aggregateType: string, fieldPath?: FieldPath) {
    this.aggregateType = aggregateType;
    this._fieldPath = fieldPath;
  }
}

export function fieldPathFromArgument(path: string | FieldPath): FieldPath {
  if (path instanceof FieldPath) {
    return path;
  }
  if (typeof path === 'string') {
    return fromDotSeparatedString(path);
  }
  throw new Error('Field path arguments must be of type `string` or `FieldPath`');
}
