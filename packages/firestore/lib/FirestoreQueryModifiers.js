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

import { isNumber } from '@react-native-firebase/app/lib/common';
import FirestoreFieldPath, { DOCUMENT_ID } from './FirestoreFieldPath';
import { buildNativeArray, generateNativeData } from './utils/serialize';

export const OPERATORS = {
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

const INEQUALITY = {
  LESS_THAN: true,
  LESS_THAN_OR_EQUAL: true,
  GREATER_THAN: true,
  GREATER_THAN_OR_EQUAL: true,
  NOT_EQUAL: true,
};

const DIRECTIONS = {
  asc: 'ASCENDING',
  desc: 'DESCENDING',
};

export default class FirestoreQueryModifiers {
  constructor() {
    this._limit = undefined;
    this._limitToLast = undefined;
    this._filters = [];
    this._orders = [];
    this._type = 'collection';
    // Cursors
    this._startAt = undefined;
    this._startAfter = undefined;
    this._endAt = undefined;
    this._endBefore = undefined;

    // Pulled out of function to preserve their state
    this.hasInequality = false;
    this.hasNotEqual = false;
    this.hasArrayContains = false;
    this.hasArrayContainsAny = false;
    this.hasIn = false;
    this.hasNotIn = false;
  }

  _copy() {
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

  get filters() {
    return this._filters.map(f => ({
      ...f,
      fieldPath: f.fieldPath instanceof FirestoreFieldPath ? f.fieldPath._toArray() : f.fieldPath,
    }));
  }

  get orders() {
    return this._orders.map(f => ({
      ...f,
      fieldPath: f.fieldPath instanceof FirestoreFieldPath ? f.fieldPath._toArray() : f.fieldPath,
    }));
  }

  get options() {
    const options = {};

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

  get type() {
    return this._type;
  }

  setFieldsCursor(cursor, fields) {
    this[`_${cursor}`] = buildNativeArray(fields);
    return this;
  }

  /**
   * Options
   */

  hasStart() {
    return !!(this._startAt || this._startAfter);
  }

  hasEnd() {
    return !!(this._endAt || this._endBefore);
  }

  /**
   * Collection Group Query
   */

  asCollectionGroupQuery() {
    this._type = 'collectionGroup';
    return this;
  }

  isCollectionGroupQuery() {
    return this._type === 'collectionGroup';
  }

  /**
   * Limit
   */

  isValidLimit(limit) {
    return !isNumber(limit) || Math.floor(limit) !== limit || limit <= 0;
  }

  limit(limit) {
    this._limitToLast = undefined;
    this._limit = limit;
    return this;
  }

  /**
   * limitToLast
   */

  isValidLimitToLast(limit) {
    return !isNumber(limit) || Math.floor(limit) !== limit || limit <= 0;
  }

  validatelimitToLast() {
    if (this._limitToLast) {
      if (!this._orders.length) {
        throw new Error(
          'firebase.firestore().collection().limitToLast() queries require specifying at least one firebase.firestore().collection().orderBy() clause',
        );
      }
    }
  }

  limitToLast(limitToLast) {
    this._limit = undefined;
    this._limitToLast = limitToLast;
    return this;
  }

  /**
   * Filters
   */

  isValidOperator(operator) {
    return !!OPERATORS[operator];
  }

  isEqualOperator(operator) {
    return OPERATORS[operator] === 'EQUAL';
  }

  isNotEqualOperator(operator) {
    return OPERATORS[operator] === 'NOT_EQUAL';
  }

  isInOperator(operator) {
    return (
      OPERATORS[operator] === 'IN' ||
      OPERATORS[operator] === 'ARRAY_CONTAINS_ANY' ||
      OPERATORS[operator] === 'NOT_IN'
    );
  }

  where(fieldPath, opStr, value) {
    const filter = {
      fieldPath,
      operator: OPERATORS[opStr],
      value: generateNativeData(value, true),
    };

    this._filters = this._filters.concat(filter);
    return this;
  }

  filterWhere(filter) {
    this._filters = this._filters.concat(filter);
    return this;
  }

  validateWhere() {
    if (this._filters.length > 0) {
      this._filterCheck(this._filters);
    }
  }

  _filterCheck(filters) {
    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];

      if (filter.queries) {
        // Recursively check sub-queries for Filters
        this._filterCheck(filter.queries);
        // If it is a Filter query, skip the rest of the loop
        continue;
      }

      // Skip if no inequality
      if (!INEQUALITY[filter.operator]) {
        continue;
      }

      if (filter.operator === OPERATORS['!=']) {
        if (this.hasNotEqual) {
          throw new Error("Invalid query. You cannot use more than one '!=' inequality filter.");
        }
        //needs to set hasNotEqual = true  before setting first hasInequality = filter. It is used in a condition check later
        this.hasNotEqual = true;
      }

      // Set the first inequality
      if (!this.hasInequality) {
        this.hasInequality = filter;
        continue;
      }

      // Check the set value is the same as the new one
      if (INEQUALITY[filter.operator] && this.hasInequality) {
        if (this.hasInequality.fieldPath._toPath() !== filter.fieldPath._toPath()) {
          throw new Error(
            `Invalid query. All where filters with an inequality (<, <=, >, != or >=) must be on the same field. But you have inequality filters on '${this.hasInequality.fieldPath._toPath()}' and '${filter.fieldPath._toPath()}'`,
          );
        }
      }
    }

    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];

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

  /**
   * Orders
   */

  isValidDirection(directionStr) {
    return !!DIRECTIONS[directionStr.toLowerCase()];
  }

  orderBy(fieldPath, directionStr) {
    const order = {
      fieldPath: fieldPath,
      direction: directionStr ? DIRECTIONS[directionStr.toLowerCase()] : DIRECTIONS.asc,
    };

    this._orders = this._orders.concat(order);
    return this;
  }

  validateOrderBy() {
    this._validateOrderByCheck(this._filters);
  }

  _validateOrderByCheck(filters) {
    // Ensure order hasn't been called on the same field
    if (this._orders.length > 1) {
      const orders = this._orders.map($ => $.fieldPath._toPath());
      const set = new Set(orders);

      if (set.size !== orders.length) {
        throw new Error('Invalid query. Order by clause cannot contain duplicate fields.');
      }
    }

    // Skip if no where filters
    if (filters.length === 0) {
      return;
    }

    // Ensure the first order field path is equal to the inequality filter field path
    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];

      if (filter.queries) {
        // Recursively check sub-queries for Filters
        this._validateOrderByCheck(filter.queries);
        // If it is a Filter query, skip the rest of the loop
        continue;
      }
      const filterFieldPath = filter.fieldPath._toPath();

      for (let k = 0; k < this._orders.length; k++) {
        const order = this._orders[k];
        const orderFieldPath = order.fieldPath;
        if (filter.operator === OPERATORS['==']) {
          // Any where() fieldPath parameter cannot match any orderBy() parameter when '==' operand is invoked
          if (filterFieldPath === orderFieldPath._toPath()) {
            throw new Error(
              `Invalid query. Query.orderBy() parameter: ${orderFieldPath} cannot be the same as your Query.where() fieldPath parameter: ${filterFieldPath}`,
            );
          }
        }

        if (filterFieldPath === DOCUMENT_ID._toPath() && orderFieldPath !== DOCUMENT_ID._toPath()) {
          throw new Error(
            "Invalid query. Query.where() fieldPath parameter: 'FirestoreFieldPath' cannot be used in conjunction with a different Query.orderBy() parameter",
          );
        }

        if (INEQUALITY[filter.operator]) {
          // Initial orderBy() parameter has to match every where() fieldPath parameter when inequality operator is invoked
          if (filterFieldPath !== this._orders[0].fieldPath._toPath()) {
            throw new Error(
              `Invalid query. Initial Query.orderBy() parameter: ${orderFieldPath} has to be the same as the Query.where() fieldPath parameter(s): ${filterFieldPath} when an inequality operator is invoked `,
            );
          }
        }
      }
    }
  }
}
