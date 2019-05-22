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

const CONSTANTS = {
  VIEW_FROM_LEFT: 'left',
  VIEW_FROM_RIGHT: 'right',
};

export default class DatabaseQueryParams {
  static DEFAULT = new DatabaseQueryParams();

  constructor() {
    this._index = '';
    this._limit = undefined;
    this._startAt = undefined;
    this._endAt = undefined;
    this._viewFrom = '';
  }

  getIndex() {
    return this._index;
  }

  hasStartAt() {
    return this._startAt !== undefined;
  }

  getIndexStartAtValue() {
    return this._startAt.value;
  }

  hasEndAt() {
    return this._endAt !== undefined;
  }

  getIndexEndAtValue() {
    return this._endAt.value;
  }

  hasLimit() {
    return this._limit !== undefined;
  }

  hasAnchoredLimit() {
    return this.hasLimit() && this._viewFrom !== '';
  }

  limitToFirst(newLimit) {
    const newParams = this._copy();
    newParams._limit = newLimit;
    newParams._viewFrom = CONSTANTS.VIEW_FROM_LEFT;
    return newParams;
  }

  limitToLast(newLimit) {
    const newParams = this._copy();
    newParams._limit = newLimit;
    newParams._viewFrom = CONSTANTS.VIEW_FROM_RIGHT;
    return newParams;
  }

  startAt(value, key = '') {
    const newParams = this._copy();
    newParams._startAt = {
      value,
      key,
    };
    return newParams;
  }

  endAt(value, key) {
    const newParams = this._copy();
    newParams._endAt = {
      value,
      key: key || '',
    };
    return newParams;
  }

  _copy() {
    const copy = new DatabaseQueryParams();
    copy._limit = this._limit;
    copy._startAt = this._startAt;
    copy._endAt = this._endAt;
    copy._viewFrom = this._viewFrom;
    return copy;
  }
}
