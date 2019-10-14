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
import { buildNativeArray, generateNativeData } from './utils/serialize';

const OPERATORS = {
  '==': 'EQUAL',
  '>': 'GREATER_THAN',
  '>=': 'GREATER_THAN_OR_EQUAL',
  '<': 'LESS_THAN',
  '<=': 'LESS_THAN_OR_EQUAL',
  'array-contains': 'ARRAY_CONTAINS',
};

const INEQUALITY = {
  LESS_THAN: true,
  LESS_THAN_OR_EQUAL: true,
  GREATER_THAN: true,
  GREATER_THAN_OR_EQUAL: true,
};

const DIRECTIONS = {
  asc: 'ASCENDING',
  desc: 'DESCENDING',
};

export default class FirestoreQueryModifiers {
  constructor() {
    this._limit = undefined;
    this._filters = [];
    this._orders = [];
    this._type = 'collection';
    // Cursors
    this._startAt = undefined;
    this._startAfter = undefined;
    this._endAt = undefined;
    this._endBefore = undefined;
  }

  _copy() {
    const newInstance = new FirestoreQueryModifiers();
    newInstance._limit = this._limit;
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
    return this._filters;
  }

  get orders() {
    return this._orders;
  }

  get options() {
    const options = {};

    if (this._limit) {
      options.limit = this._limit;
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
   * Collection Group
   */

  asCollectionGroup() {
    this._type = 'collectionGroup';
    return this;
  }

  /**
   * Limit
   */

  isValidLimit(limit) {
    return !isNumber(limit) || Math.floor(limit) !== limit || limit <= 0;
  }

  limit(limit) {
    this._limit = limit;
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

  where(fieldPath, opStr, value) {
    const filter = {
      fieldPath: fieldPath._toPath(),
      operator: OPERATORS[opStr],
      value: generateNativeData(value),
    };

    this._filters = this._filters.concat(filter);
    return this;
  }

  validateWhere() {
    let hasInequality;

    for (let i = 0; i < this._filters.length; i++) {
      const filter = this._filters[i];
      // Skip if no inequality
      if (!INEQUALITY[filter.operator]) {
        continue;
      }

      // Set the first inequality
      if (!hasInequality) {
        hasInequality = filter;
        continue;
      }

      // Check the set value is the same as the new one
      if (INEQUALITY[filter.operator] && hasInequality) {
        if (hasInequality.fieldPath !== filter.fieldPath) {
          throw new Error(
            `Invalid query. All where filters with an inequality (<, <=, >, or >=) must be on the same field. But you have inequality filters on '${
              hasInequality.fieldPath
            }' and '${filter.fieldPath}'`,
          );
        }
      }
    }

    let hasArrayContains;

    for (let i = 0; i < this._filters.length; i++) {
      const filter = this._filters[i];
      // Skip if no array-contains
      if (filter.operator !== OPERATORS['array-contains']) {
        continue;
      }

      if (!hasArrayContains) {
        hasArrayContains = true;
        continue;
      }

      throw new Error('Invalid query. Queries only support a single array-contains filter.');
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
      fieldPath: fieldPath._toPath(),
      direction: directionStr ? DIRECTIONS[directionStr.toLowerCase()] : DIRECTIONS.asc,
    };

    this._orders = this._orders.concat(order);
    return this;
  }

  validateOrderBy() {
    // Ensure order hasn't been called on the same field
    if (this._orders.length > 1) {
      const orders = this._orders.map($ => $.fieldPath);
      const set = new Set(orders);

      if (set.size !== orders.length) {
        throw new Error('Invalid query. Order by clause cannot contain duplicate fields.');
      }
    }

    // Skip if no where filters or already validated
    if (this._filters.length === 0 || this._orders.length > 1) {
      return;
    }

    // Ensure the first order field path is equal to the inequality filter field path
    for (let i = 0; i < this._filters.length; i++) {
      const filter = this._filters[i];
      // Inequality filter
      if (INEQUALITY[filter.operator]) {
        if (filter.fieldPath !== this._orders[0].fieldPath) {
          throw new Error(
            `Invalid query. You have a where filter with an inequality (<, <=, >, or >=) on field '${
              filter.fieldPath
            }' and so you must also use '${
              filter.fieldPath
            }' as your first Query.orderBy(), but your first Query.orderBy() is on field '${
              this._orders[0].fieldPath
            }' instead`,
          );
        }
      }
    }
  }
}
