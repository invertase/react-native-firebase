/* eslint-disable no-bitwise */

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

class Point {
  constructor(x, y) {
    this._x = x || 0;
    this._y = y || 0;
  }

  /**
   * Set the point's x and y coordinates
   *
   * @param x
   * @param y
   */
  set(x, y) {
    // todo arg validate number for all args
    this._x = x;
    this._y = y;
  }

  /**
   * Copy the coordinates from the source point into this point.
   *
   * @param otherPoint Point
   */
  setFromPoint(otherPoint) {
    // todo arg instance of Point check
    this.set(otherPoint.x, otherPoint.y);
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  /**
   * Returns true if this Point has the same coordinates as the specified Point.
   *
   * @param otherPoint
   * @returns {boolean}
   */
  isEqual(otherPoint) {
    // todo arg instance of Point check
    return this.toString() === otherPoint.toString();
  }

  /**
   * Returns this point as an array of [x, y]
   * @returns {*[]}
   */
  toArray() {
    return [this.x, this.y];
  }

  /**
   * Returns this point as an string, e.g Point[x, y]
   * @returns {string}
   */
  toString() {
    return `Point[${this.x}, ${this.y}]`;
  }
}
