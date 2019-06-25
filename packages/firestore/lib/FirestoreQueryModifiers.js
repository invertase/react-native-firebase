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

import { isNumber } from '@react-native-firebase/common';
import FirestoreFieldPath from './FirestoreFieldPath';
import { buildTypeMap, buildNativeArray } from './utils/serialize';

const OPERATORS = {
  '=': 'EQUAL',
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

  get filters() {
    return this._filters;
  }

  get orders() {
    return this._orders;
  }

  get options() {
    const options = {};

    if (this._limit) options.limit = this._limit;
    if (this._endAt) options.endAt = this._endAt;
    // todo other options
    return options;
  }

  get type() {
    return this._type;
  }

  // TODO how to do this?
  setDocumentSnapshotCursor(cursor, documentSnapshot) {
    this[`_${cursor}`] = buildNativeArray([documentSnapshot.ref.path]);
    return this;
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
      fieldPath: this._buildNativeFieldPath(fieldPath),
      operator: OPERATORS[opStr],
      value: buildTypeMap(value),
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
        let masterInequalityValue;
        if (hasInequality.fieldPath.type === 'string') {
          masterInequalityValue = hasInequality.fieldPath.string;
        } else {
          masterInequalityValue = hasInequality.fieldPath.elements.join('.');
        }

        let currentInequalityValue;
        if (filter.fieldPath.type === 'string') {
          currentInequalityValue = filter.fieldPath.string;
        } else {
          currentInequalityValue = filter.fieldPath.elements.join('.');
        }

        if (masterInequalityValue !== currentInequalityValue) {
          throw new Error(
            `Invalid query. All where filters with an inequality (<, <=, >, or >=) must be on the same field. But you have inequality filters on '${masterInequalityValue}' and '${currentInequalityValue}'`,
          );
        }
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
      fieldPath: this._buildNativeFieldPath(fieldPath),
      direction: directionStr ? DIRECTIONS[directionStr.toLowerCase()] : DIRECTIONS.asc,
    };

    this._orders = this._orders.concat(order);
    return this;
  }

  validateOrderBy(field) {
    // Skip if no where filters or already validated
    if (!this._filters.length || this._orders.length > 0) {
      return;
    }

    // TODO validate
    // FirebaseError: Invalid query. You have a where filter with an inequality (<, <=, >, or >=) on field 'foo' and so you must also use 'foo' as your first Query.orderBy(), but your first Query.orderBy() is on field 'food' instead.
    for (let i = 0; i < this._filters.length; i++) {
      const filter = this._filters[i];
      if (INEQUALITY[filter.operator]) {
        if (filter.fieldPath.type === 'string') {
        }
      }
    }
  }

  _buildNativeFieldPath(fieldPath) {
    if (fieldPath instanceof FirestoreFieldPath) {
      return {
        elements: fieldPath._segments,
        type: 'fieldpath',
      };
    }

    return {
      string: fieldPath,
      type: 'string',
    };
  }
}
