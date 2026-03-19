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
import type {
  DocumentReferenceDeleteInternal,
  DocumentReferenceGetInternal,
  QueryFilterConstraintWithFilterInternal,
  QueryInternal,
  QueryWithMethodInternal,
  QueryWithWhereInternal,
  ReferenceIsEqualInternal,
} from '../types/internal';
import type { FieldPath } from './FieldPath';

/**
 * Public interface for query constraints. Ensures generated .d.ts exposes _apply
 * so that QueryConstraint[] accepts instances from where(), orderBy(), etc.
 */
export interface QueryConstraint {
  readonly type: QueryConstraintType;
  _apply<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    query: Query<AppModelType, DbModelType>,
  ): Query<AppModelType, DbModelType>;
}

/** Base implementation for orderBy/limit/startAt/endAt/where constraints. */
export abstract class QueryConstraintBase implements QueryConstraint {
  abstract readonly type: QueryConstraintType;
  private readonly _args: unknown[];

  protected constructor(...args: unknown[]) {
    super();
    this._args = args;
  }

  _apply<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    query: Query<AppModelType, DbModelType>,
  ): Query<AppModelType, DbModelType> {
    const method = (query as unknown as QueryWithMethodInternal<AppModelType, DbModelType>)[
      this.type
    ];
    if (!method) {
      throw new Error(`Query method '${this.type}' is not available on query instance.`);
    }
    return method.call(query, ...this._args, MODULAR_DEPRECATION_ARG);
  }
}

export class QueryCompositeFilterConstraint implements QueryConstraint {
  readonly type: 'or' | 'and';
  readonly _filter: _Filter;

  static _create(
    type: 'or' | 'and',
    _queryConstraints: QueryFilterConstraint[],
  ): QueryCompositeFilterConstraint {
    // Validate nested OR filters when creating the constraint
    if (type === 'or') {
      const filters = _queryConstraints.map(constraint => {
        if (constraint instanceof QueryCompositeFilterConstraint) {
          return constraint._filter;
        }
        return (constraint as unknown as QueryFilterConstraintWithFilterInternal)._filter;
      });
      // This will throw if nested OR filters are detected
      Filter.or(...filters);
    }
    return new QueryCompositeFilterConstraint(type, _queryConstraints);
  }

  _apply<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(
    query: Query<AppModelType, DbModelType>,
  ): Query<AppModelType, DbModelType> {
    const filters = this._queryConstraints.map(constraint => {
      if (constraint instanceof QueryCompositeFilterConstraint) {
        return constraint._filter;
      }
      return (constraint as unknown as QueryFilterConstraintWithFilterInternal)._filter;
    });
    const _filter = this.type === 'or' ? Filter.or(...filters) : Filter.and(...filters);
    const where = (query as unknown as QueryWithWhereInternal<AppModelType, DbModelType>).where;
    return where.call(query, _filter, MODULAR_DEPRECATION_ARG);
  }

  get _filter(): _Filter {
    const filters = this._queryConstraints.map(constraint => {
      if (constraint instanceof QueryCompositeFilterConstraint) {
        return constraint._filter;
      }
      return (constraint as unknown as QueryFilterConstraintWithFilterInternal)._filter;
    });
    return this.type === 'or' ? Filter.or(...filters) : Filter.and(...filters);
  }
}

export class QueryOrderByConstraint extends QueryConstraintBase {
  readonly type = 'orderBy';

  constructor(fieldPath: string | FieldPath, directionStr?: OrderByDirection) {
    super(fieldPath, directionStr);
  }
}

export class QueryLimitConstraint extends QueryConstraintBase {
  readonly type: 'limit' | 'limitToLast';

  constructor(type: 'limit' | 'limitToLast', limitValue: number) {
    super(limitValue);
    this.type = type;
  }
}

export class QueryStartAtConstraint extends QueryConstraintBase {
  readonly type: 'startAt' | 'startAfter';

  constructor(type: 'startAt' | 'startAfter', ...docOrFields: Array<unknown | DocumentSnapshot>) {
    super(...docOrFields);
    this.type = type;
  }
}

export class QueryEndAtConstraint extends QueryConstraintBase {
  readonly type: 'endAt' | 'endBefore';

  constructor(type: 'endAt' | 'endBefore', ...fieldValues: unknown[]) {
    super(...fieldValues);
    this.type = type;
  }
}

export class QueryFieldFilterConstraint extends QueryConstraintBase {
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
  queryConstraint: QueryCompositeFilterConstraint | QueryConstraint | undefined,
  ...additionalQueryConstraints: Array<QueryConstraint | QueryNonFilterConstraint>
): Query<AppModelType, DbModelType> {
  let queryConstraints: AppliableConstraint[] = [];

  if (queryConstraint instanceof AppliableConstraint) {
    queryConstraints.push(queryConstraint);
  }

  queryConstraints = queryConstraints.concat(additionalQueryConstraints);

  let constrainedQuery = queryRef;
  for (const constraint of queryConstraints) {
    if (!constraint) {
      continue;
    }
    constrainedQuery = constraint._apply(constrainedQuery);
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

export function or(...queryConstraints: QueryFilterConstraint[]): QueryCompositeFilterConstraint {
  return QueryCompositeFilterConstraint._create('or', queryConstraints);
}

export function and(...queryConstraints: QueryFilterConstraint[]): QueryCompositeFilterConstraint {
  return QueryCompositeFilterConstraint._create('and', queryConstraints);
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
  const get = (reference as unknown as DocumentReferenceGetInternal<AppModelType, DbModelType>).get;
  return get.call(reference, { source: 'default' }, MODULAR_DEPRECATION_ARG);
}

export function getDocFromCache<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  reference: DocumentReference<AppModelType, DbModelType>,
): Promise<DocumentSnapshot<AppModelType, DbModelType>> {
  const get = (reference as unknown as DocumentReferenceGetInternal<AppModelType, DbModelType>).get;
  return get.call(reference, { source: 'cache' }, MODULAR_DEPRECATION_ARG);
}

export function getDocFromServer<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  reference: DocumentReference<AppModelType, DbModelType>,
): Promise<DocumentSnapshot<AppModelType, DbModelType>> {
  const get = (reference as unknown as DocumentReferenceGetInternal<AppModelType, DbModelType>).get;
  return get.call(reference, { source: 'server' }, MODULAR_DEPRECATION_ARG);
}

export function getDocs<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(queryRef: Query<AppModelType, DbModelType>): Promise<QuerySnapshot<AppModelType, DbModelType>> {
  const get = (queryRef as unknown as QueryInternal<AppModelType, DbModelType>).get;
  return get.call(queryRef, { source: 'default' }, MODULAR_DEPRECATION_ARG);
}

export function getDocsFromCache<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(queryRef: Query<AppModelType, DbModelType>): Promise<QuerySnapshot<AppModelType, DbModelType>> {
  const get = (queryRef as unknown as QueryInternal<AppModelType, DbModelType>).get;
  return get.call(queryRef, { source: 'cache' }, MODULAR_DEPRECATION_ARG);
}

export function getDocsFromServer<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(queryRef: Query<AppModelType, DbModelType>): Promise<QuerySnapshot<AppModelType, DbModelType>> {
  const get = (queryRef as unknown as QueryInternal<AppModelType, DbModelType>).get;
  return get.call(queryRef, { source: 'server' }, MODULAR_DEPRECATION_ARG);
}

export function deleteDoc<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(reference: DocumentReference<AppModelType, DbModelType>): Promise<void> {
  const remove = (reference as unknown as DocumentReferenceDeleteInternal).delete;
  return remove.call(reference, MODULAR_DEPRECATION_ARG);
}

export function queryEqual<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(left: Query<AppModelType, DbModelType>, right: Query<AppModelType, DbModelType>): boolean {
  const isEqual = (left as unknown as ReferenceIsEqualInternal).isEqual;
  return isEqual.call(left, right, MODULAR_DEPRECATION_ARG);
}
