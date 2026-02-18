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
// @ts-expect-error FirestoreFilter typings are migrated incrementally.
import { _Filter, Filter } from '../FirestoreFilter';
import type { DocumentData, DocumentReference, Query } from '../types/firestore';
import type { DocumentSnapshot, QuerySnapshot } from './snapshot';
import type { FieldPath } from './FieldPath';

export type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '>'
  | '>='
  | '!='
  | 'array-contains'
  | 'array-contains-any'
  | 'in'
  | 'not-in';

export type QueryConstraintType =
  | 'where'
  | 'orderBy'
  | 'limit'
  | 'limitToLast'
  | 'startAt'
  | 'startAfter'
  | 'endAt'
  | 'endBefore';

export class QueryConstraint {
  readonly type: QueryConstraintType;
  readonly _args: unknown[];

  constructor(type: QueryConstraintType, ...args: unknown[]) {
    this.type = type;
    this._args = args;
  }

  _apply<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    query: Query<AppModelType, DbModelType>,
  ): Query<AppModelType, DbModelType> {
    const method = (
      query as unknown as Record<string, (...args: unknown[]) => Query<AppModelType, DbModelType>>
    )[this.type];
    if (!method) {
      throw new Error(`Query method '${this.type}' is not available on query instance.`);
    }
    return method.call(query, ...this._args, MODULAR_DEPRECATION_ARG);
  }
}

export class QueryOrderByConstraint extends QueryConstraint {}
export class QueryLimitConstraint extends QueryConstraint {}
export class QueryStartAtConstraint extends QueryConstraint {}
export class QueryEndAtConstraint extends QueryConstraint {}
export class QueryFieldFilterConstraint extends QueryConstraint {}

export type QueryFilterConstraint = QueryFieldFilterConstraint | QueryCompositeFilterConstraint;
export type QueryCompositeFilterConstraint = QueryConstraint;
export type QueryNonFilterConstraint =
  | QueryOrderByConstraint
  | QueryLimitConstraint
  | QueryStartAtConstraint
  | QueryEndAtConstraint;
export type OrderByDirection = 'desc' | 'asc';

export function query<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  queryRef: Query<AppModelType, DbModelType>,
  queryConstraint?: QueryCompositeFilterConstraint | QueryConstraint,
  ...additionalQueryConstraints: Array<QueryConstraint | QueryNonFilterConstraint>
): Query<AppModelType, DbModelType> {
  const queryConstraints = [queryConstraint, ...additionalQueryConstraints].filter(
    constraint => constraint !== undefined,
  ) as QueryConstraint[];

  let constrainedQuery = queryRef;
  for (const constraint of queryConstraints) {
    constrainedQuery = constraint._apply(constrainedQuery);
  }
  return constrainedQuery;
}

export function where(
  fieldPath: string | FieldPath,
  opStr: WhereFilterOp,
  value: unknown,
): QueryFieldFilterConstraint {
  return new QueryConstraint('where', fieldPath, opStr, value) as QueryFieldFilterConstraint;
}

function getFilterOps(queries: QueryFieldFilterConstraint[]): _Filter[] {
  const ops: _Filter[] = [];

  for (const queryConstraint of queries) {
    if (queryConstraint.type !== 'where') {
      throw new Error('Invalid query constraint: expected where() constraint');
    }

    if (!queryConstraint._args.length) {
      throw new Error('Invalid query constraint: missing where() arguments');
    }

    if (queryConstraint._args[0] instanceof _Filter) {
      ops.push(queryConstraint._args[0]);
      continue;
    }

    const [fieldPath, opStr, value] = queryConstraint._args as [
      string | FieldPath,
      WhereFilterOp,
      unknown,
    ];
    ops.push(Filter(fieldPath, opStr, value));
  }

  return ops;
}

export function or(...queries: QueryFieldFilterConstraint[]): QueryCompositeFilterConstraint {
  return new QueryConstraint('where', Filter.or(...getFilterOps(queries)));
}

export function and(...queries: QueryFieldFilterConstraint[]): QueryCompositeFilterConstraint {
  return new QueryConstraint('where', Filter.and(...getFilterOps(queries)));
}

export function orderBy(
  fieldPath: string | FieldPath,
  directionStr?: OrderByDirection,
): QueryOrderByConstraint {
  return new QueryConstraint('orderBy', fieldPath, directionStr) as QueryOrderByConstraint;
}

export function startAt(...docOrFields: Array<unknown | DocumentSnapshot>): QueryStartAtConstraint {
  return new QueryConstraint('startAt', ...docOrFields) as QueryStartAtConstraint;
}

export function startAfter(
  ...docOrFields: Array<unknown | DocumentSnapshot>
): QueryStartAtConstraint {
  return new QueryConstraint('startAfter', ...docOrFields) as QueryStartAtConstraint;
}

export function endAt(...args: unknown[]): QueryEndAtConstraint {
  return new QueryConstraint('endAt', ...args) as QueryEndAtConstraint;
}

export function endBefore(...fieldValues: unknown[]): QueryEndAtConstraint {
  return new QueryConstraint('endBefore', ...fieldValues) as QueryEndAtConstraint;
}

export function limit(limitValue: number): QueryLimitConstraint {
  return new QueryConstraint('limit', limitValue) as QueryLimitConstraint;
}

export function limitToLast(limitValue: number): QueryConstraint {
  return new QueryConstraint('limitToLast', limitValue);
}

export function getDoc<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  reference: DocumentReference<AppModelType, DbModelType>,
): Promise<DocumentSnapshot<AppModelType, DbModelType>> {
  const get = (
    reference as unknown as {
      get: (...args: unknown[]) => Promise<DocumentSnapshot<AppModelType, DbModelType>>;
    }
  ).get;
  return get.call(reference, { source: 'default' }, MODULAR_DEPRECATION_ARG);
}

export function getDocFromCache<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  reference: DocumentReference<AppModelType, DbModelType>,
): Promise<DocumentSnapshot<AppModelType, DbModelType>> {
  const get = (
    reference as unknown as {
      get: (...args: unknown[]) => Promise<DocumentSnapshot<AppModelType, DbModelType>>;
    }
  ).get;
  return get.call(reference, { source: 'cache' }, MODULAR_DEPRECATION_ARG);
}

export function getDocFromServer<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  reference: DocumentReference<AppModelType, DbModelType>,
): Promise<DocumentSnapshot<AppModelType, DbModelType>> {
  const get = (
    reference as unknown as {
      get: (...args: unknown[]) => Promise<DocumentSnapshot<AppModelType, DbModelType>>;
    }
  ).get;
  return get.call(reference, { source: 'server' }, MODULAR_DEPRECATION_ARG);
}

export function getDocs<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(queryRef: Query<AppModelType, DbModelType>): Promise<QuerySnapshot<AppModelType, DbModelType>> {
  const get = (
    queryRef as unknown as {
      get: (...args: unknown[]) => Promise<QuerySnapshot<AppModelType, DbModelType>>;
    }
  ).get;
  return get.call(queryRef, { source: 'default' }, MODULAR_DEPRECATION_ARG);
}

export function getDocsFromCache<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(queryRef: Query<AppModelType, DbModelType>): Promise<QuerySnapshot<AppModelType, DbModelType>> {
  const get = (
    queryRef as unknown as {
      get: (...args: unknown[]) => Promise<QuerySnapshot<AppModelType, DbModelType>>;
    }
  ).get;
  return get.call(queryRef, { source: 'cache' }, MODULAR_DEPRECATION_ARG);
}

export function getDocsFromServer<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(queryRef: Query<AppModelType, DbModelType>): Promise<QuerySnapshot<AppModelType, DbModelType>> {
  const get = (
    queryRef as unknown as {
      get: (...args: unknown[]) => Promise<QuerySnapshot<AppModelType, DbModelType>>;
    }
  ).get;
  return get.call(queryRef, { source: 'server' }, MODULAR_DEPRECATION_ARG);
}

export function deleteDoc<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(reference: DocumentReference<AppModelType, DbModelType>): Promise<void> {
  const remove = (reference as unknown as { delete: (...args: unknown[]) => Promise<void> }).delete;
  return remove.call(reference, MODULAR_DEPRECATION_ARG);
}

export function queryEqual<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(left: Query<AppModelType, DbModelType>, right: Query<AppModelType, DbModelType>): boolean {
  const isEqual = (left as unknown as { isEqual: (...args: unknown[]) => boolean }).isEqual;
  return isEqual.call(left, right, MODULAR_DEPRECATION_ARG);
}
