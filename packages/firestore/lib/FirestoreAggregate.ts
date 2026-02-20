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

import type {
  AggregateSpec,
  AggregateSpecData,
  AggregateType,
  DocumentData,
  Query,
} from './types/firestore';
import FieldPath, { fromDotSeparatedString } from './FieldPath';

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

  get(): Promise<AggregateQuerySnapshot> {
    return this._firestore.native
      .collectionCount(
        this._collectionPath.relativeName,
        this._modifiers.type,
        this._modifiers.filters,
        this._modifiers.orders,
        this._modifiers.options,
      )
      .then((data: { count?: number }) => new AggregateQuerySnapshot(this._query, data, true));
  }
}

export class AggregateQuerySnapshot<
  AggregateSpecType extends AggregateSpec = AggregateSpec,
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
> {
  readonly type = 'AggregateQuerySnapshot';
  _query: Query<AppModelType, DbModelType>;
  _data: { count?: number; [key: string]: unknown };
  _isGetCountFromServer: boolean;

  constructor(
    query: Query<AppModelType, DbModelType>,
    data: { count?: number; [key: string]: unknown },
    isGetCountFromServer: boolean,
  ) {
    this._query = query;
    this._data = data;
    this._isGetCountFromServer = isGetCountFromServer;
  }

  get query(): Query<AppModelType, DbModelType> {
    return this._query;
  }

  data(): AggregateSpecData<AggregateSpecType> {
    if (this._isGetCountFromServer) {
      return { count: this._data.count } as AggregateSpecData<AggregateSpecType>;
    }
    return { ...this._data } as AggregateSpecData<AggregateSpecType>;
  }

  _fieldsProto(): Record<string, unknown> {
    return { ...this._data };
  }
}

export class AggregateField<T = unknown> {
  readonly type = 'AggregateField';
  readonly aggregateType: AggregateType;
  readonly _internalFieldPath?: FieldPath;

  constructor(aggregateType: AggregateType = 'count', fieldPath?: FieldPath) {
    this.aggregateType = aggregateType;
    this._internalFieldPath = fieldPath;
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
