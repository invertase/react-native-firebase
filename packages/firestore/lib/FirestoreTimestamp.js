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

export default class FirestoreTimestamp {
  static now() {
    return FirestoreTimestamp.fromMillis(Date.now());
  }

  static fromDate(date) {
    // todo validate date
    return FirestoreTimestamp.fromMillis(date.getTime());
  }

  static fromMillis(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const nanoseconds = (milliseconds - seconds * 1000) * 1e6;
    return new FirestoreTimestamp(seconds, nanoseconds);
  }

  constructor(seconds, nanoseconds) {
    if (nanoseconds < 0) {
      throw new Error(`Timestamp nanoseconds out of range: ${nanoseconds}`);
    }

    if (nanoseconds >= 1e9) {
      throw new Error(`Timestamp nanoseconds out of range: ${nanoseconds}`);
    }

    // Midnight at the beginning of 1/1/1 is the earliest Firestore supports.
    if (seconds < -62135596800) {
      throw new Error(`Timestamp seconds out of range: ${seconds}`);
    }

    // This will break in the year 10,000.
    if (seconds >= 253402300800) {
      throw new Error(`Timestamp seconds out of range: ${seconds}`);
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
      throw Error('TODO');
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
}
