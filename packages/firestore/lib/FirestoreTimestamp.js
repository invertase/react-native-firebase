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

import { isDate, isNumber } from '@react-native-firebase/app/lib/common';

// The earlist date supported by Firestore timestamps (0001-01-01T00:00:00Z).
const MIN_SECONDS = -62135596800;

export default class FirestoreTimestamp {
  static now() {
    return FirestoreTimestamp.fromMillis(Date.now());
  }

  static fromDate(date) {
    if (!isDate(date)) {
      throw new Error(
        "firebase.firestore.Timestamp.fromDate(*) 'date' expected a valid Date object.",
      );
    }

    return FirestoreTimestamp.fromMillis(date.getTime());
  }

  static fromMillis(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const nanoseconds = (milliseconds - seconds * 1000) * 1e6;
    return new FirestoreTimestamp(seconds, nanoseconds);
  }

  constructor(seconds, nanoseconds) {
    if (!isNumber(seconds)) {
      throw new Error("firebase.firestore.Timestamp 'seconds' expected a number value.");
    }

    if (!isNumber(nanoseconds)) {
      throw new Error("firebase.firestore.Timestamp 'nanoseconds' expected a number value.");
    }

    if (nanoseconds < 0) {
      throw new Error(`firebase.firestore.Timestamp 'nanoseconds' out of range: ${nanoseconds}`);
    }

    if (nanoseconds >= 1e9) {
      throw new Error(`firebase.firestore.Timestamp 'nanoseconds' out of range: ${nanoseconds}`);
    }

    // Midnight at the beginning of 1/1/1 is the earliest Firestore supports.
    if (seconds < MIN_SECONDS) {
      throw new Error(`firebase.firestore.Timestamp 'seconds' out of range: ${seconds}`);
    }

    // This will break in the year 10,000.
    if (seconds >= 253402300800) {
      throw new Error(`firebase.firestore.Timestamp 'seconds' out of range: ${seconds}`);
    }

    this._seconds = seconds;
    this._nanoseconds = nanoseconds;
  }

  get seconds() {
    return this._seconds;
  }

  get nanoseconds() {
    return this._nanoseconds;
  }

  isEqual(other) {
    if (!(other instanceof FirestoreTimestamp)) {
      throw Error(
        "firebase.firestore.Timestamp.isEqual(*) 'other' expected an instance of Timestamp.",
      );
    }

    return other.seconds === this._seconds && other.nanoseconds === this._nanoseconds;
  }

  toDate() {
    return new Date(this.toMillis());
  }

  toMillis() {
    return this._seconds * 1000 + this._nanoseconds / 1e6;
  }

  toString() {
    return `FirestoreTimestamp(seconds=${this.seconds}, nanoseconds=${this.nanoseconds})`;
  }

  toJSON() {
    return { seconds: this.seconds, nanoseconds: this.nanoseconds };
  }

  /**
   * Converts this object to a primitive string, which allows Timestamp objects to be compared
   * using the `>`, `<=`, `>=` and `>` operators.
   */
  valueOf() {
    // This method returns a string of the form <seconds>.<nanoseconds> where <seconds> is
    // translated to have a non-negative value and both <seconds> and <nanoseconds> are left-padded
    // with zeroes to be a consistent length. Strings with this format then have a lexiographical
    // ordering that matches the expected ordering. The <seconds> translation is done to avoid
    // having a leading negative sign (i.e. a leading '-' character) in its string representation,
    // which would affect its lexiographical ordering.
    const adjustedSeconds = this.seconds - MIN_SECONDS;
    // Note: Up to 12 decimal digits are required to represent all valid 'seconds' values.
    const formattedSeconds = String(adjustedSeconds).padStart(12, '0');
    const formattedNanoseconds = String(this.nanoseconds).padStart(9, '0');
    return formattedSeconds + '.' + formattedNanoseconds;
  }
}
