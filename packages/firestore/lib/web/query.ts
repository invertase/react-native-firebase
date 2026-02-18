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

import {
  FieldPath,
  query,
  where,
  orderBy,
  limit,
  limitToLast,
  startAt,
  startAfter,
  endAt,
  endBefore,
  and,
  or,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestore';
import { parseTypeMap, readableToArray } from './convert';

export interface FilterSpec {
  fieldPath?: string[] | { _segments: string[] };
  operator?: string;
  value?: unknown;
  queries?: FilterSpec[];
}

export interface OrderSpec {
  fieldPath: string[] | string;
  direction: string;
}

export interface QueryOptions {
  limit?: number;
  limitToLast?: number;
  startAt?: unknown[];
  startAfter?: unknown[];
  endAt?: unknown[];
  endBefore?: unknown[];
}

export function buildQuery(
  queryInstance: { firestore: any },
  filters: FilterSpec[],
  orders: OrderSpec[],
  options: QueryOptions,
): any {
  let current: any = queryInstance;

  for (const filter of filters) {
    current = query(current, getFilterConstraint(filter, queryInstance.firestore));
  }

  for (const order of orders) {
    const fieldPath =
      typeof order.fieldPath === 'string'
        ? order.fieldPath
        : new FieldPath(...(order.fieldPath as string[]));
    const direction = order.direction === 'ASCENDING' ? 'asc' : 'desc';
    current = query(current, orderBy(fieldPath, direction));
  }

  if ('limit' in options && options.limit !== undefined) {
    current = query(current, limit(options.limit));
  }
  if ('limitToLast' in options && options.limitToLast !== undefined) {
    current = query(current, limitToLast(options.limitToLast));
  }
  if ('startAt' in options && options.startAt !== undefined) {
    const fieldList = readableToArray(queryInstance.firestore, options.startAt as unknown[]);
    current = query(current, startAt(...fieldList));
  }
  if ('startAfter' in options && options.startAfter !== undefined) {
    const fieldList = readableToArray(queryInstance.firestore, options.startAfter as unknown[]);
    current = query(current, startAfter(...fieldList));
  }
  if ('endAt' in options && options.endAt !== undefined) {
    const fieldList = readableToArray(queryInstance.firestore, options.endAt as unknown[]);
    current = query(current, endAt(...fieldList));
  }
  if ('endBefore' in options && options.endBefore !== undefined) {
    const fieldList = readableToArray(queryInstance.firestore, options.endBefore as unknown[]);
    current = query(current, endBefore(...fieldList));
  }

  return current;
}

function getFilterConstraint(filter: FilterSpec, firestore: any): any {
  if ('fieldPath' in filter && filter.fieldPath) {
    const fieldPath = Array.isArray(filter.fieldPath)
      ? new FieldPath(...filter.fieldPath)
      : new FieldPath(...(filter.fieldPath as { _segments: string[] })._segments);
    const operator = filter.operator;
    const value = parseTypeMap(firestore, filter.value as [number, unknown?]);

    switch (operator) {
      case 'EQUAL':
        return where(fieldPath, '==', value);
      case 'NOT_EQUAL':
        return where(fieldPath, '!=', value);
      case 'GREATER_THAN':
        return where(fieldPath, '>', value);
      case 'GREATER_THAN_OR_EQUAL':
        return where(fieldPath, '>=', value);
      case 'LESS_THAN':
        return where(fieldPath, '<', value);
      case 'LESS_THAN_OR_EQUAL':
        return where(fieldPath, '<=', value);
      case 'ARRAY_CONTAINS':
        return where(fieldPath, 'array-contains', value);
      case 'ARRAY_CONTAINS_ANY':
        return where(fieldPath, 'array-contains-any', value);
      case 'IN':
        return where(fieldPath, 'in', value);
      case 'NOT_IN':
        return where(fieldPath, 'not-in', value);
    }
  } else if ('operator' in filter && 'queries' in filter && filter.queries) {
    const constraints = filter.queries.map(f => getFilterConstraint(f, firestore));

    if (filter.operator === 'AND') {
      return and(...constraints);
    }
    if (filter.operator === 'OR') {
      return or(...constraints);
    }
    throw new Error('Invalid filter operator');
  }

  throw new Error('Invalid filter.');
}
