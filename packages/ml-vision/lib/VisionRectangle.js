// TODO introduce in a later release if required
// /* eslint-disable no-bitwise */
//
// /*
//  * Copyright (c) 2016-present Invertase Limited & Contributors
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this library except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *   http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  *
//  */
//
// export default class VisionRectangle {
//   /**
//    *
//    * @param left
//    * @param top
//    * @param right
//    * @param bottom
//    */
//   constructor(left, top, right, bottom) {
//     this._left = left || 0;
//     this._top = top || 0;
//     this._right = right || 0;
//     this._bottom = bottom || 0;
//   }
//
//   /**
//    * Set the rectangle's coordinates to the specified values.
//    *
//    * @param left
//    * @param top
//    * @param right
//    * @param bottom
//    */
//   set(left, top, right, bottom) {
//     // todo arg validate number for all args
//     // todo arg validate left <= right
//     // todo arg validate top <= bottom
//     this._left = left;
//     this._top = top;
//     this._right = right;
//     this._bottom = bottom;
//   }
//
//   /**
//    * Copy the coordinates from the source rectangle into this rectangle.
//    *
//    * @param otherRect VisionRectangle
//    */
//   setFromRectangle(otherRect) {
//     // todo arg instance of VisionRectangle check
//     this.set(otherRect.left, otherRect.top, otherRect.right, otherRect.bottom);
//   }
//
//   get top() {
//     return this._top;
//   }
//
//   get left() {
//     return this._left;
//   }
//
//   get bottom() {
//     return this._bottom;
//   }
//
//   get right() {
//     return this._right;
//   }
//
//   get width() {
//     return this._right - this._left;
//   }
//
//   get height() {
//     return this._bottom - this._top;
//   }
//
//   /**
//    * Returns whether the first rectangle contains the second rectangle.
//    * @param otherRect VisionRectangle
//    * @returns {boolean}
//    */
//   containsRectangle(otherRect) {
//     // todo arg instance of VisionRectangle check
//     return (
//       !this.isEmpty() &&
//       this.left <= otherRect.left &&
//       this.top <= otherRect.top &&
//       this.right >= otherRect.right &&
//       this.bottom >= otherRect.bottom
//     );
//   }
//
//   /**
//    * Returns whether a rectangle contains a specified point.
//    *
//    * @param x
//    * @param y
//    * @returns {boolean}
//    */
//   containsPoint(x, y) {
//     return !this.isEmpty() && x >= this.left && x < this.right && y >= this.top && y < this.bottom;
//   }
//
//   /**
//    * Returns whether two rectangles intersect.
//    *
//    * @param otherRect VisionRectangle
//    * @returns {boolean}
//    */
//   intersectsRectangle(otherRect) {
//     // todo arg instance of VisionRectangle check
//     return (
//       this.left < otherRect.right &&
//       otherRect.left < this.right &&
//       this.top < otherRect.bottom &&
//       otherRect.top < this.bottom
//     );
//   }
//
//   /**
//    * If the rectangle specified intersects this
//    * rectangle, return true and set this rectangle to that intersection,
//    * otherwise return false and do not change this rectangle. No check is
//    * performed to see if either rectangle is empty. Note: To just test for
//    * intersection, use {@link #intersectsRectangle(otherRect: VisionRectangle)}.
//    *
//    * @param otherRect
//    * @returns {boolean}
//    */
//   intersectRectangle(otherRect) {
//     // todo arg instance of VisionRectangle check
//     if (
//       this.left < otherRect.right &&
//       otherRect.left < this.right &&
//       this.top < otherRect.bottom &&
//       otherRect.top < this.bottom
//     ) {
//       if (this.left < otherRect.left) this._left = otherRect.left;
//       if (this.top < otherRect.top) this._top = otherRect.top;
//       if (this.right > otherRect.right) this._right = otherRect.right;
//       if (this.bottom > otherRect.bottom) this._bottom = otherRect.bottom;
//       return true;
//     }
//     return false;
//   }
//
//   /**
//    * Returns the horizontal center of the rectangle.
//    */
//   centerX() {
//     return (this.left + this.right) >> 1;
//   }
//
//   /**
//    * Returns the vertical center of the rectangle.
//    */
//   centerY() {
//     return (this.top + this.bottom) >> 1;
//   }
//
//   /**
//    * Returns whether a rectangle has zero width or height
//    * @returns {boolean}
//    */
//   isEmpty() {
//     return this.left >= this.right || this.top >= this.bottom;
//   }
//
//   /**
//    * Returns true if this VisionRectangle has the same bounding box as the specified VisionRectangle.
//    *
//    * @param otherRect
//    * @returns {boolean}
//    */
//   isEqual(otherRect) {
//     // todo arg instance of VisionPoint check
//     return this.toString() === otherRect.toString();
//   }
//
//   /**
//    * Returns this rectangle as an array of [left, top, right, bottom]
//    * @returns {*[]}
//    */
//   toArray() {
//     return [this.left, this.top, this.right, this.bottom];
//   }
//
//   /**
//    * Returns this rectangle as an string, e.g VisionRectangle[left, top, right, bottom]
//    * @returns {string}
//    */
//   toString() {
//     return `Rectangle[${this.left}, ${this.top}, ${this.right}, ${this.bottom}]`;
//   }
// }
