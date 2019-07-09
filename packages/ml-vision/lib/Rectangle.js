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

class Rectangle {
  constructor(nativeRectArray) {
    this._left = nativeRectArray[0] || 0;
    this._top = nativeRectArray[1] || 0;
    this._right = nativeRectArray[2] || 0;
    this._bottom = nativeRectArray[3] || 0;
  }

  get top() {
    return this._top;
  }

  get left() {
    return this._left;
  }

  get bottom() {
    return this._bottom;
  }

  get right() {
    return this._right;
  }

  get width() {
    return this._right - this._left;
  }

  get height() {
    return this._bottom - this._top;
  }

  /**
   * Returns whether the first rectangle contains the second rectangle.
   * @param otherRect Rectangle
   * @returns {boolean}
   */
  containsRectangle(otherRect) {
    // todo arg instance of Rectangle check
    return (
      !this.isEmpty() &&
      this.left <= otherRect.left &&
      this.top <= otherRect.top &&
      this.right >= otherRect.right &&
      this.bottom >= otherRect.bottom
    );
  }

  /**
   * Returns whether a rectangle contains a specified point.
   *
   * @param x
   * @param y
   * @returns {boolean}
   */
  containsPoint(x, y) {
    return !this.isEmpty() && x >= this.left && x < this.right && y >= this.top && y < this.bottom;
  }

  /**
   * Returns whether two rectangles intersect.
   * @param otherRect Rectangle
   * @returns {boolean}
   */
  intersectsRectangle(otherRect) {
    // todo arg instance of Rectangle check
    return (
      this.left < otherRect.right &&
      otherRect.left < this.right &&
      this.top < otherRect.bottom &&
      otherRect.top < this.bottom
    );
  }

  /**
   * Returns the horizontal center of the rectangle.
   */
  centerX() {
    return (this.left + this.right) >> 1;
  }

  /**
   * Returns the vertical center of the rectangle.
   */
  centerY() {
    return (this.top + this.bottom) >> 1;
  }

  /**
   * Returns whether a rectangle has zero width or height
   * @returns {boolean}
   */
  isEmpty() {
    return this.left >= this.right || this.top >= this.bottom;
  }

  /**
   * Returns this rectangle as an array of [left, top, right, bottom]
   * @returns {*[]}
   */
  toArray() {
    return [this.left, this.top, this.right, this.bottom];
  }
}
