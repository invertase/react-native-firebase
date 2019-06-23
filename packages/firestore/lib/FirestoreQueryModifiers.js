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

const OPERATORS = {
  '=': 'EQUAL',
  '==': 'EQUAL',
  '>': 'GREATER_THAN',
  '>=': 'GREATER_THAN_OR_EQUAL',
  '<': 'LESS_THAN',
  '<=': 'LESS_THAN_OR_EQUAL',
  'array-contains': 'ARRAY_CONTAINS',
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
    // todo other options
    return options;
  }

  get type() {
    return this._type;
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

  where(fieldPath, opStr, value) {
    const filter = {
      fieldPath: this._buildNativeFieldPath(fieldPath),
      operator: OPERATORS[opStr],
      value: {}, // buildTypeMap(value);
    };

    this._filters.concat(filter);
    return this;
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
      direction: DIRECTIONS[directionStr.toLowerCase()] || DIRECTIONS.asc,
    };

    this._orders.concat(order);
    return this;
  }

  _buildNativeFieldPath(fieldPath) {
    // if (fieldPath instanceof FirestoreFieldPath) {
    //   return {
    //     elements: fieldPath._segments,
    //     type: 'fieldpath',
    //   };
    // }

    return {
      string: fieldPath,
      type: 'string',
    };
  }
}
