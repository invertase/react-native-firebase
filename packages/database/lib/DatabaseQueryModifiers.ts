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

type QueryModifierValue = number | string | boolean | null;

export interface DatabaseQueryLimitModifier {
  id: string;
  name: 'limitToFirst' | 'limitToLast';
  type: 'limit';
  value: number;
  viewFrom: (typeof CONSTANTS)[keyof typeof CONSTANTS];
}

export interface DatabaseQueryOrderByModifier {
  id: string;
  type: 'orderBy';
  name: 'orderByChild' | 'orderByKey' | 'orderByPriority' | 'orderByValue';
  key?: string;
}

export interface DatabaseQueryFilterModifier {
  id: string;
  type: 'filter';
  name: 'startAt' | 'endAt';
  value: QueryModifierValue;
  valueType: 'number' | 'string' | 'boolean' | 'object' | 'null';
  key?: string;
}

export type DatabaseQueryModifier =
  | DatabaseQueryLimitModifier
  | DatabaseQueryOrderByModifier
  | DatabaseQueryFilterModifier;

function getFilterValueType(value: QueryModifierValue): DatabaseQueryFilterModifier['valueType'] {
  if (value === null) {
    return 'null';
  }

  switch (typeof value) {
    case 'number':
      return 'number';
    case 'string':
      return 'string';
    case 'boolean':
      return 'boolean';
    default:
      return 'object';
  }
}

export default class DatabaseQueryModifiers {
  private _limit: DatabaseQueryLimitModifier | undefined;
  private _orderBy: DatabaseQueryOrderByModifier | undefined;
  private _startAt: DatabaseQueryFilterModifier | undefined;
  private _endAt: DatabaseQueryFilterModifier | undefined;
  private _modifiers: DatabaseQueryModifier[];

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

  hasLimit(): boolean {
    return this._limit !== undefined;
  }

  isValidLimit(limit: number): boolean {
    return !isNumber(limit) || Math.floor(limit) !== limit || limit <= 0;
  }

  limitToFirst(limit: number): DatabaseQueryModifiers {
    const newLimit: DatabaseQueryLimitModifier = {
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

  limitToLast(limit: number): DatabaseQueryModifiers {
    const newLimit: DatabaseQueryLimitModifier = {
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

  hasOrderBy(): boolean {
    return this._orderBy !== undefined;
  }

  orderByChild(path: string): DatabaseQueryModifiers {
    const newOrder: DatabaseQueryOrderByModifier = {
      id: `order-orderByChild:${path}`,
      type: 'orderBy',
      name: 'orderByChild',
      key: path,
    };

    this._orderBy = newOrder;
    this._modifiers.push(newOrder);
    return this;
  }

  orderByKey(): DatabaseQueryModifiers {
    const newOrder: DatabaseQueryOrderByModifier = {
      id: 'order-orderByKey',
      type: 'orderBy',
      name: 'orderByKey',
    };

    this._orderBy = newOrder;
    this._modifiers.push(newOrder);
    return this;
  }

  isValidPriority(priority: QueryModifierValue): boolean {
    return isNumber(priority) || isString(priority) || isNull(priority);
  }

  orderByPriority(): DatabaseQueryModifiers {
    const newOrder: DatabaseQueryOrderByModifier = {
      id: 'order-orderByPriority',
      type: 'orderBy',
      name: 'orderByPriority',
    };

    this._orderBy = newOrder;
    this._modifiers.push(newOrder);
    return this;
  }

  orderByValue(): DatabaseQueryModifiers {
    const newOrder: DatabaseQueryOrderByModifier = {
      id: 'order-orderByValue',
      type: 'orderBy',
      name: 'orderByValue',
    };

    this._orderBy = newOrder;
    this._modifiers.push(newOrder);
    return this;
  }

  hasStartAt(): boolean {
    return this._startAt !== undefined;
  }

  hasEndAt(): boolean {
    return this._endAt !== undefined;
  }

  startAt(value: QueryModifierValue, key?: string): DatabaseQueryModifiers {
    const newStart: DatabaseQueryFilterModifier = {
      id: `filter-startAt:${value}:${key || ''}`,
      type: 'filter',
      name: 'startAt',
      value,
      valueType: getFilterValueType(value),
      key,
    };

    this._startAt = newStart;
    this._modifiers.push(newStart);
    return this;
  }

  endAt(value: QueryModifierValue, key?: string): DatabaseQueryModifiers {
    const newEnd: DatabaseQueryFilterModifier = {
      id: `filter-endAt:${value}:${key || ''}`,
      type: 'filter',
      name: 'endAt',
      value,
      valueType: getFilterValueType(value),
      key,
    };

    this._endAt = newEnd;
    this._modifiers.push(newEnd);
    return this;
  }

  toArray(): DatabaseQueryModifier[] {
    return this._modifiers;
  }

  toString(): string {
    const sorted = [...this._modifiers].sort((a, b) => a.id.localeCompare(b.id));
    let key = '{';

    for (let index = 0; index < sorted.length; index++) {
      const modifier = sorted[index];
      if (!modifier) {
        continue;
      }
      if (index !== 0) {
        key += ',';
      }
      key += modifier.id;
    }

    key += '}';
    return key;
  }

  validateModifiers(prefix: string): void {
    if (this._orderBy?.name === 'orderByKey') {
      if ((this._startAt && !!this._startAt.key) || (this._endAt && !!this._endAt.key)) {
        throw new Error(
          `${prefix} When ordering by key, you may only pass a value argument to startAt(), endAt(), or equalTo().`,
        );
      }
    }

    if (this._orderBy?.name === 'orderByKey') {
      if (
        (this._startAt && this._startAt.valueType !== 'string') ||
        (this._endAt && this._endAt.valueType !== 'string')
      ) {
        throw new Error(
          `${prefix} When ordering by key, the value of startAt(), endAt(), or equalTo() must be a string.`,
        );
      }
    }

    if (this._orderBy?.name === 'orderByPriority') {
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
