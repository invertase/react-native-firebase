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
import { _Filter, Filter } from '../FirestoreFilter';
import type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  OrderByDirection,
  Query,
  QueryConstraintType,
  QuerySnapshot,
  WhereFilterOp,
} from '../types/firestore';
import type { FieldPath } from './FieldPath';

export type { OrderByDirection, QueryConstraintType, WhereFilterOp } from '../types/firestore';

export abstract class QueryConstraint {
  abstract readonly type: QueryConstraintType;
  private readonly _args: unknown[];

  protected constructor(...args: unknown[]) {
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

export class QueryCompositeFilterConstraint {
  readonly type: 'or' | 'and';
  readonly _filter: _Filter;

  constructor(type: 'or' | 'and', filters: _Filter[]) {
    this.type = type;
    this._filter = type === 'or' ? Filter.or(...filters) : Filter.and(...filters);
  }

  _apply<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    query: Query<AppModelType, DbModelType>,
  ): Query<AppModelType, DbModelType> {
    const where = (
      query as unknown as {
        where: (...args: unknown[]) => Query<AppModelType, DbModelType>;
      }
    ).where;
    return where.call(query, this._filter, MODULAR_DEPRECATION_ARG);
  }
}

export class QueryOrderByConstraint extends QueryConstraint {
  readonly type = 'orderBy';

  constructor(fieldPath: string | FieldPath, directionStr?: OrderByDirection) {
    super(fieldPath, directionStr);
  }
}

export class QueryLimitConstraint extends QueryConstraint {
  readonly type: 'limit' | 'limitToLast';

  constructor(type: 'limit' | 'limitToLast', limitValue: number) {
    super(limitValue);
    this.type = type;
  }
}

export class QueryStartAtConstraint extends QueryConstraint {
  readonly type: 'startAt' | 'startAfter';

  constructor(type: 'startAt' | 'startAfter', ...docOrFields: Array<unknown | DocumentSnapshot>) {
    super(...docOrFields);
    this.type = type;
  }
}

export class QueryEndAtConstraint extends QueryConstraint {
  readonly type: 'endAt' | 'endBefore';

  constructor(type: 'endAt' | 'endBefore', ...fieldValues: unknown[]) {
    super(...fieldValues);
    this.type = type;
  }
}

export class QueryFieldFilterConstraint extends QueryConstraint {
  readonly type = 'where';
  readonly _filter: _Filter;

  constructor(fieldPath: string | FieldPath, opStr: WhereFilterOp, value: unknown) {
    super(fieldPath, opStr, value);
    this._filter = Filter(fieldPath, opStr, value);
  }
}

export type QueryFilterConstraint = QueryFieldFilterConstraint | QueryCompositeFilterConstraint;
export type QueryNonFilterConstraint =
  | QueryOrderByConstraint
  | QueryLimitConstraint
  | QueryStartAtConstraint
  | QueryEndAtConstraint;

export function query<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  queryRef: Query<AppModelType, DbModelType>,
  compositeFilter: QueryCompositeFilterConstraint,
  ...queryConstraints: QueryNonFilterConstraint[]
): Query<AppModelType, DbModelType>;
export function query<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  queryRef: Query<AppModelType, DbModelType>,
  ...queryConstraints: QueryConstraint[]
): Query<AppModelType, DbModelType>;
export function query<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  queryRef: Query<AppModelType, DbModelType>,
  ...queryConstraints: Array<QueryCompositeFilterConstraint | QueryConstraint>
): Query<AppModelType, DbModelType> {
  let constrainedQuery = queryRef;
  for (const constraint of queryConstraints) {
    if (!constraint) {
      continue;
    }
    const apply = (
      constraint as unknown as { _apply?: (q: Query<AppModelType, DbModelType>) => any }
    )._apply;
    if (!apply) {
      continue;
    }
    constrainedQuery = apply.call(constraint, constrainedQuery);
  }
  return constrainedQuery;
}

export function where(
  fieldPath: string | FieldPath,
  opStr: WhereFilterOp,
  value: unknown,
): QueryFieldFilterConstraint {
  return new QueryFieldFilterConstraint(fieldPath, opStr, value);
}

function toFilter(queryConstraint: QueryFilterConstraint): _Filter {
  if (queryConstraint instanceof QueryCompositeFilterConstraint) {
    return (queryConstraint as unknown as { _filter: _Filter })._filter;
  }
  if (queryConstraint instanceof QueryFieldFilterConstraint) {
    return (queryConstraint as unknown as { _filter: _Filter })._filter;
  }
  throw new Error('Invalid query constraint: expected filter constraint');
}

export function or(...queryConstraints: QueryFilterConstraint[]): QueryCompositeFilterConstraint {
  return new QueryCompositeFilterConstraint('or', queryConstraints.map(toFilter));
}

export function and(...queryConstraints: QueryFilterConstraint[]): QueryCompositeFilterConstraint {
  return new QueryCompositeFilterConstraint('and', queryConstraints.map(toFilter));
}

export function orderBy(
  fieldPath: string | FieldPath,
  directionStr?: OrderByDirection,
): QueryOrderByConstraint {
  return new QueryOrderByConstraint(fieldPath, directionStr);
}

export function startAt<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(snapshot: DocumentSnapshot<AppModelType, DbModelType>): QueryStartAtConstraint;
export function startAt(...fieldValues: unknown[]): QueryStartAtConstraint;
export function startAt(...docOrFields: Array<unknown | DocumentSnapshot>): QueryStartAtConstraint {
  return new QueryStartAtConstraint('startAt', ...docOrFields);
}

export function startAfter<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(snapshot: DocumentSnapshot<AppModelType, DbModelType>): QueryStartAtConstraint;
export function startAfter(...fieldValues: unknown[]): QueryStartAtConstraint;
export function startAfter(
  ...docOrFields: Array<unknown | DocumentSnapshot>
): QueryStartAtConstraint {
  return new QueryStartAtConstraint('startAfter', ...docOrFields);
}

export function endAt<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
  snapshot: DocumentSnapshot<AppModelType, DbModelType>,
): QueryEndAtConstraint;
export function endAt(...fieldValues: unknown[]): QueryEndAtConstraint;
export function endAt(...args: unknown[]): QueryEndAtConstraint {
  return new QueryEndAtConstraint('endAt', ...args);
}

export function endBefore<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(snapshot: DocumentSnapshot<AppModelType, DbModelType>): QueryEndAtConstraint;
export function endBefore(...fieldValues: unknown[]): QueryEndAtConstraint;
export function endBefore(...fieldValues: unknown[]): QueryEndAtConstraint {
  return new QueryEndAtConstraint('endBefore', ...fieldValues);
}

export function limit(limitValue: number): QueryLimitConstraint {
  return new QueryLimitConstraint('limit', limitValue);
}

export function limitToLast(limitValue: number): QueryLimitConstraint {
  return new QueryLimitConstraint('limitToLast', limitValue);
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
