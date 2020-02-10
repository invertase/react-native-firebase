/**
 * @flow
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 * ----
 *
 * Some snippets taken from: https://github.com/firebase/firebase-js-sdk/blob/master/packages/firestore/src/api/timestamp.ts
 * and adapted to work for React Native Firebase
 */

/**
 * Timestamp representation wrapper
 */
export default class Timestamp {
  seconds: number;

  nanoseconds: number;

  static now(): Timestamp {
    return Timestamp.fromMillis(Date.now());
  }

  static fromDate(date: Date): Timestamp {
    return Timestamp.fromMillis(date.getTime());
  }

  static fromMillis(milliseconds: number): Timestamp {
    const seconds = Math.floor(milliseconds / 1000);
    const nanoseconds = (milliseconds - seconds * 1000) * 1e6;
    return new Timestamp(seconds, nanoseconds);
  }

  constructor(seconds: number, nanoseconds: number) {
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

    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  toDate(): Date {
    return new Date(this.toMillis());
  }

  toMillis(): number {
    return this.seconds * 1000 + this.nanoseconds / 1e6;
  }

  isEqual(other: Timestamp): boolean {
    return (
      other.seconds === this.seconds && other.nanoseconds === this.nanoseconds
    );
  }

  toString(): string {
    return `Timestamp(seconds=${this.seconds}, nanoseconds=${this.nanoseconds})`;
  }
}
