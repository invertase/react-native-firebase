/* eslint-disable no-console */
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

const CONSTANTS = {
  VIEW_FROM_LEFT: 'left',
  VIEW_FROM_RIGHT: 'right',
};

export default class DatabaseQueryModifiers {
  static DEFAULT = new DatabaseQueryModifiers();

  constructor() {
    this._limit = undefined;
    this._orderBy = undefined;
    this._startAt = undefined;
    this._endAt = undefined;
    this._modifiers = [];
  }


  /**
   *
   * LIMIT
   *
   */

  hasLimit() {
    return this._limit !== undefined;
  }

  isValidLimit(limit) {
    return !isNumber(limit) || Math.floor(limit) !== limit || limit <= 0;
  }

  limitToFirst(limit) {
    const newLimit = {
      id: `limit-limitToFirst:${limit}`,
      value: limit,
      viewFrom: CONSTANTS.VIEW_FROM_LEFT,
    };

    this._limit = newLimit;
    this._modifiers.push(newLimit);
    return this;
  }

  limitToLast(limit) {
    const newLimit = {
      id: `limit-limitToLast:${limit}`,
      value: limit,
      viewFrom: CONSTANTS.VIEW_FROM_RIGHT,
    };

    this._limit = newLimit;
    this._modifiers.push(newLimit);
    return this;
  }

  /**
   *
   * ORDER
   *
   */

  hasOrderBy() {
    return this._orderBy !== undefined;
  }

  orderByChild(path) {
    const newOrder = {
      id: `order-orderByChild:${path}`,
      type: 'orderBy',
      name: 'orderByChild',
      key: path,
    };

    this._orderBy = newOrder;
    this._modifiers.push(newOrder);
    return this;
  }

  orderByKey() {
    const newOrder = {
      id: `order-orderByKey`,
      type: 'orderBy',
      name: 'orderByKey',
    };

    this._orderBy = newOrder;
    this._modifiers.push(newOrder);
    return this;
  }

  orderByPriority() {
    const newOrder = {
      id: `order-orderByPriority`,
      type: 'orderBy',
      name: 'orderByPriority',
    };

    this._orderBy = newOrder;
    this._modifiers.push(newOrder);
    return this;
  }

  orderByValue() {
    const newOrder = {
      id: `order-orderByValue`,
      type: 'orderBy',
      name: 'orderByValue',
    };

    this._orderBy = newOrder;
    this._modifiers.push(newOrder);
    return this;
  }

  /**
   *
   * FILTER
   *
   */

  // Returns a modifier array
  toArray() {
    return this._modifiers;
  }

  // Converts the modifier list to a string representation
  toString() {
    const sorted = this._modifiers.sort((a, b) => {
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    });

    let key = '{';
    for (let i = 0; i < sorted.length; i++) {
      if (i !== 0) key += ',';
      key += sorted[i].id;
    }
    key += '}';
    return key;
  }
}
