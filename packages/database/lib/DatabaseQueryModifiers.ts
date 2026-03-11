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

import { isNull, isNumber, isString } from '@react-native-firebase/app/dist/module/common';

const CONSTANTS = {
  VIEW_FROM_LEFT: 'left',
  VIEW_FROM_RIGHT: 'right',
} as const;

interface LimitModifier {
  id: string;
  name: 'limitToFirst' | 'limitToLast';
  type: 'limit';
  value: number;
  viewFrom: typeof CONSTANTS.VIEW_FROM_LEFT | typeof CONSTANTS.VIEW_FROM_RIGHT;
}

interface OrderModifier {
  id: string;
  type: 'orderBy';
  name: 'orderByChild' | 'orderByKey' | 'orderByPriority' | 'orderByValue';
  key?: string;
}

interface FilterModifier {
  id: string;
  type: 'filter';
  name: 'startAt' | 'endAt';
  value: number | string | boolean | null;
  valueType: 'null' | 'string' | 'number' | 'boolean';
  key?: string;
}

type Modifier = LimitModifier | OrderModifier | FilterModifier;

export default class DatabaseQueryModifiers {
  private _limit: LimitModifier | undefined;
  private _orderBy: OrderModifier | undefined;
  private _startAt: FilterModifier | undefined;
  private _endAt: FilterModifier | undefined;
  private _modifiers: Modifier[];

  constructor() {
    this._limit = undefined;
    this._orderBy = undefined;
    this._startAt = undefined;
    this._endAt = undefined;
    this._modifiers = [];
  }

  _copy(): DatabaseQueryModifiers {
    const newInstance = new DatabaseQueryModifiers();
    newInstance._limit = this._limit;
    newInstance._orderBy = this._orderBy;
    newInstance._startAt = this._startAt;
    newInstance._endAt = this._endAt;
    newInstance._modifiers = [...this._modifiers];
    return newInstance;
  }

  /**
   *
   * LIMIT
   *
   */

  hasLimit(): boolean {
    return this._limit !== undefined;
  }

  isValidLimit(limit: unknown): boolean {
    return !isNumber(limit) || Math.floor(limit) !== limit || limit <= 0;
  }

  limitToFirst(limit: number): this {
    const newLimit: LimitModifier = {
      id: `limit-limitToFirst:${limit}`,
      name: 'limitToFirst',
      type: 'limit',
      value: limit,
      viewFrom: CONSTANTS.VIEW_FROM_LEFT,
    };

    this._limit = newLimit;
    this._modifiers.push(newLimit);
    return this;
  }

  limitToLast(limit: number): this {
    const newLimit: LimitModifier = {
      id: `limit-limitToLast:${limit}`,
      name: 'limitToLast',
      type: 'limit',
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

  hasOrderBy(): boolean {
    return this._orderBy !== undefined;
  }

  orderByChild(path: string): this {
    const newOrder: OrderModifier = {
      id: `order-orderByChild:${path}`,
      type: 'orderBy',
      name: 'orderByChild',
      key: path,
    };

    this._orderBy = newOrder;
    this._modifiers.push(newOrder);
    return this;
  }

  orderByKey(): this {
    const newOrder: OrderModifier = {
      id: 'order-orderByKey',
      type: 'orderBy',
      name: 'orderByKey',
    };

    this._orderBy = newOrder;
    this._modifiers.push(newOrder);
    return this;
  }

  isValidPriority(priority: unknown): boolean {
    return isNumber(priority) || isString(priority) || isNull(priority);
  }

  orderByPriority(): this {
    const newOrder: OrderModifier = {
      id: 'order-orderByPriority',
      type: 'orderBy',
      name: 'orderByPriority',
    };

    this._orderBy = newOrder;
    this._modifiers.push(newOrder);
    return this;
  }

  orderByValue(): this {
    const newOrder: OrderModifier = {
      id: 'order-orderByValue',
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

  hasStartAt(): boolean {
    return this._startAt !== undefined;
  }

  hasEndAt(): boolean {
    return this._endAt !== undefined;
  }

  startAt(value: number | string | boolean | null, key?: string): this {
    const newStart: FilterModifier = {
      id: `filter-startAt:${value}:${key || ''}`,
      type: 'filter',
      name: 'startAt',
      value,
      valueType: value === null ? 'null' : (typeof value as 'string' | 'number' | 'boolean'),
      key,
    };

    this._startAt = newStart;
    this._modifiers.push(newStart);
    return this;
  }

  endAt(value: number | string | boolean | null, key?: string): this {
    const newEnd: FilterModifier = {
      id: `filter-endAt:${value}:${key || ''}`,
      type: 'filter',
      name: 'endAt',
      value,
      valueType: value === null ? 'null' : (typeof value as 'string' | 'number' | 'boolean'),
      key,
    };

    this._endAt = newEnd;
    this._modifiers.push(newEnd);
    return this;
  }

  // Returns a modifier array
  toArray(): Modifier[] {
    return this._modifiers;
  }

  // Converts the modifier list to a string representation
  toString(): string {
    const sorted = [...this._modifiers].sort((a, b) => {
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    });

    let key = '{';
    for (let i = 0; i < sorted.length; i++) {
      if (i !== 0) {
        key += ',';
      }
      key += sorted[i]!.id;
    }
    key += '}';
    return key;
  }

  validateModifiers(prefix: string): void {
    if (this._orderBy && this._orderBy.name === 'orderByKey') {
      if ((this._startAt && !!this._startAt.key) || (this._endAt && !!this._endAt.key)) {
        throw new Error(
          `${prefix} When ordering by key, you may only pass a value argument to startAt(), endAt(), or equalTo().`,
        );
      }
    }

    if (this._orderBy && this._orderBy.name === 'orderByKey') {
      if (
        (this._startAt && this._startAt.valueType !== 'string') ||
        (this._endAt && this._endAt.valueType !== 'string')
      ) {
        throw new Error(
          `${prefix} When ordering by key, the value of startAt(), endAt(), or equalTo() must be a string.`,
        );
      }
    }

    if (this._orderBy && this._orderBy.name === 'orderByPriority') {
      if (
        (this._startAt && !this.isValidPriority(this._startAt.value)) ||
        (this._endAt && !this.isValidPriority(this._endAt.value))
      ) {
        throw new Error(
          `${prefix} When ordering by priority, the first value of startAt(), endAt(), or equalTo() must be a valid priority value (null, a number, or a string).`,
        );
      }
    }
  }
}
