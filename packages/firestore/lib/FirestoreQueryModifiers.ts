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

import { isNumber } from '@react-native-firebase/app/dist/module/common';
import FirestoreFieldPath, { DOCUMENT_ID } from './FirestoreFieldPath';
import { buildNativeArray, generateNativeData } from './utils/serialize';

export const OPERATORS: Record<string, string> = {
  '==': 'EQUAL',
  '>': 'GREATER_THAN',
  '>=': 'GREATER_THAN_OR_EQUAL',
  '<': 'LESS_THAN',
  '<=': 'LESS_THAN_OR_EQUAL',
  '!=': 'NOT_EQUAL',
  'array-contains': 'ARRAY_CONTAINS',
  'array-contains-any': 'ARRAY_CONTAINS_ANY',
  'not-in': 'NOT_IN',
  in: 'IN',
};

const INEQUALITY: Record<string, boolean> = {
  LESS_THAN: true,
  LESS_THAN_OR_EQUAL: true,
  GREATER_THAN: true,
  GREATER_THAN_OR_EQUAL: true,
  NOT_EQUAL: true,
};

const DIRECTIONS: Record<string, string> = {
  asc: 'ASCENDING',
  desc: 'DESCENDING',
};

export interface FilterDef {
  fieldPath?: FirestoreFieldPath | string[];
  operator: string;
  value?: unknown;
  queries?: FilterDef[] | Array<{ operator: unknown; queries?: unknown[] }>;
}

export interface OrderDef {
  fieldPath: FirestoreFieldPath;
  direction: string;
}

export default class FirestoreQueryModifiers {
  _limit: number | undefined;
  _limitToLast: number | undefined;
  _filters: FilterDef[];
  _orders: OrderDef[];
  _type: 'collection' | 'collectionGroup';
  _startAt: unknown;
  _startAfter: unknown;
  _endAt: unknown;
  _endBefore: unknown;

  hasInequality: false | FilterDef;
  hasNotEqual: boolean;
  hasArrayContains: boolean;
  hasArrayContainsAny: boolean;
  hasIn: boolean;
  hasNotIn: boolean;

  constructor() {
    this._limit = undefined;
    this._limitToLast = undefined;
    this._filters = [];
    this._orders = [];
    this._type = 'collection';
    this._startAt = undefined;
    this._startAfter = undefined;
    this._endAt = undefined;
    this._endBefore = undefined;

    this.hasInequality = false;
    this.hasNotEqual = false;
    this.hasArrayContains = false;
    this.hasArrayContainsAny = false;
    this.hasIn = false;
    this.hasNotIn = false;
  }

  _copy(): FirestoreQueryModifiers {
    const newInstance = new FirestoreQueryModifiers();
    newInstance._limit = this._limit;
    newInstance._limitToLast = this._limitToLast;
    newInstance._filters = [...this._filters];
    newInstance._orders = [...this._orders];
    newInstance._type = this._type;
    newInstance._startAt = this._startAt;
    newInstance._startAfter = this._startAfter;
    newInstance._endAt = this._endAt;
    newInstance._endBefore = this._endBefore;
    return newInstance;
  }

  get filters(): Array<{
    fieldPath?: FirestoreFieldPath | string[];
    operator: string;
    value?: unknown;
    queries?: unknown[];
  }> {
    return this._filters.map(f => ({
      ...f,
      fieldPath: f.fieldPath instanceof FirestoreFieldPath ? f.fieldPath._toArray() : f.fieldPath,
    }));
  }

  get orders(): Array<{ fieldPath: FirestoreFieldPath | string[]; direction: string }> {
    return this._orders.map(f => ({
      ...f,
      fieldPath: f.fieldPath instanceof FirestoreFieldPath ? f.fieldPath._toArray() : f.fieldPath,
    }));
  }

  get options(): Record<string, unknown> {
    const options: Record<string, unknown> = {};

    if (this._limit) {
      options.limit = this._limit;
    }

    if (this._limitToLast) {
      options.limitToLast = this._limitToLast;
    }

    if (this._startAt) {
      options.startAt = this._startAt;
    }
    if (this._startAfter) {
      options.startAfter = this._startAfter;
    }
    if (this._endAt) {
      options.endAt = this._endAt;
    }
    if (this._endBefore) {
      options.endBefore = this._endBefore;
    }

    return options;
  }

  get type(): string {
    return this._type;
  }

  setFieldsCursor(
    cursor: 'startAt' | 'startAfter' | 'endAt' | 'endBefore',
    fields: unknown[],
  ): this {
    (this as Record<string, unknown>)[`_${cursor}`] = buildNativeArray(fields);
    return this;
  }

  hasStart(): boolean {
    return !!(this._startAt || this._startAfter);
  }

  hasEnd(): boolean {
    return !!(this._endAt || this._endBefore);
  }

  asCollectionGroupQuery(): this {
    this._type = 'collectionGroup';
    return this;
  }

  isCollectionGroupQuery(): boolean {
    return this._type === 'collectionGroup';
  }

  isValidLimit(limit: unknown): boolean {
    return !isNumber(limit) || Math.floor(limit as number) !== limit || (limit as number) <= 0;
  }

  limit(limit: number): this {
    this._limitToLast = undefined;
    this._limit = limit;
    return this;
  }

  isValidLimitToLast(limit: unknown): boolean {
    return !isNumber(limit) || Math.floor(limit as number) !== limit || (limit as number) <= 0;
  }

  validatelimitToLast(): void {
    if (this._limitToLast) {
      if (!this._orders.length) {
        throw new Error(
          'firebase.firestore().collection().limitToLast() queries require specifying at least one firebase.firestore().collection().orderBy() clause',
        );
      }
    }
  }

  limitToLast(limitToLast: number): this {
    this._limit = undefined;
    this._limitToLast = limitToLast;
    return this;
  }

  isValidOperator(operator: string): boolean {
    return !!OPERATORS[operator];
  }

  isEqualOperator(operator: string): boolean {
    return OPERATORS[operator] === 'EQUAL';
  }

  isNotEqualOperator(operator: string): boolean {
    return OPERATORS[operator] === 'NOT_EQUAL';
  }

  isInOperator(operator: string): boolean {
    return (
      OPERATORS[operator] === 'IN' ||
      OPERATORS[operator] === 'ARRAY_CONTAINS_ANY' ||
      OPERATORS[operator] === 'NOT_IN'
    );
  }

  where(fieldPath: FirestoreFieldPath, opStr: string, value: unknown): this {
    const filter: FilterDef = {
      fieldPath,
      operator: OPERATORS[opStr] ?? opStr,
      value: generateNativeData(value, true),
    };

    this._filters = this._filters.concat(filter);
    return this;
  }

  filterWhere(filter: FilterDef | { operator: string; queries: unknown[] }): this {
    this._filters = this._filters.concat(filter as FilterDef);
    return this;
  }

  validateWhere(): void {
    if (this._filters.length > 0) {
      this._filterCheck(this._filters);
    }
  }

  _filterCheck(filters: FilterDef[]): void {
    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i]!;

      if (filter.queries) {
        this._filterCheck(filter.queries as FilterDef[]);
        continue;
      }

      if (!INEQUALITY[filter.operator]) {
        continue;
      }

      if (filter.operator === OPERATORS['!=']) {
        if (this.hasNotEqual) {
          throw new Error("Invalid query. You cannot use more than one '!=' inequality filter.");
        }
        this.hasNotEqual = true;
      }

      if (!this.hasInequality) {
        this.hasInequality = filter;
        continue;
      }
    }

    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i]!;

      if (filter.operator === OPERATORS['array-contains']) {
        if (this.hasArrayContains) {
          throw new Error('Invalid query. Queries only support a single array-contains filter.');
        }
        this.hasArrayContains = true;
      }

      if (filter.operator === OPERATORS['array-contains-any']) {
        if (this.hasArrayContainsAny) {
          throw new Error(
            "Invalid query. You cannot use more than one 'array-contains-any' filter.",
          );
        }

        if (this.hasNotIn) {
          throw new Error(
            "Invalid query. You cannot use 'array-contains-any' filters with 'not-in' filters.",
          );
        }

        this.hasArrayContainsAny = true;
      }

      if (filter.operator === OPERATORS.in) {
        if (this.hasNotIn) {
          throw new Error("Invalid query. You cannot use 'in' filters with 'not-in' filters.");
        }

        this.hasIn = true;
      }

      if (filter.operator === OPERATORS['not-in']) {
        if (this.hasNotIn) {
          throw new Error("Invalid query. You cannot use more than one 'not-in' filter.");
        }

        if (this.hasNotEqual) {
          throw new Error(
            "Invalid query. You cannot use 'not-in' filters with '!=' inequality filters",
          );
        }

        if (this.hasIn) {
          throw new Error("Invalid query. You cannot use 'not-in' filters with 'in' filters.");
        }

        if (this.hasArrayContainsAny) {
          throw new Error(
            "Invalid query. You cannot use 'not-in' filters with 'array-contains-any' filters.",
          );
        }

        this.hasNotIn = true;
      }
    }
  }

  isValidDirection(directionStr: string): boolean {
    return !!DIRECTIONS[directionStr.toLowerCase()];
  }

  orderBy(fieldPath: FirestoreFieldPath, directionStr?: string): this {
    const dir = directionStr ? DIRECTIONS[directionStr.toLowerCase()] : DIRECTIONS.asc;
    const order: OrderDef = {
      fieldPath: fieldPath,
      direction: dir ?? 'ASCENDING',
    };

    this._orders = this._orders.concat(order);
    return this;
  }

  validateOrderBy(): void {
    this._validateOrderByCheck(this._filters);
  }

  _validateOrderByCheck(filters: FilterDef[]): void {
    if (this._orders.length > 1) {
      const orders = this._orders.map($ => $.fieldPath._toPath());
      const set = new Set(orders);

      if (set.size !== orders.length) {
        throw new Error('Invalid query. Order by clause cannot contain duplicate fields.');
      }
    }

    if (filters.length === 0) {
      return;
    }

    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i]!;

      if (filter.queries) {
        this._validateOrderByCheck(filter.queries as FilterDef[]);
        continue;
      }
      const filterFieldPath = (filter.fieldPath as FirestoreFieldPath)._toPath();

      for (let k = 0; k < this._orders.length; k++) {
        const order = this._orders[k]!;
        const orderFieldPath = order.fieldPath;
        if (filter.operator === OPERATORS['==']) {
          if (filterFieldPath === orderFieldPath._toPath()) {
            throw new Error(
              `Invalid query. Query.orderBy() parameter: ${orderFieldPath} cannot be the same as your Query.where() fieldPath parameter: ${filterFieldPath}`,
            );
          }
        }

        if (
          filterFieldPath === DOCUMENT_ID._toPath() &&
          orderFieldPath._toPath() !== DOCUMENT_ID._toPath()
        ) {
          throw new Error(
            "Invalid query. Query.where() fieldPath parameter: 'FirestoreFieldPath' cannot be used in conjunction with a different Query.orderBy() parameter",
          );
        }
      }
    }
  }
}
