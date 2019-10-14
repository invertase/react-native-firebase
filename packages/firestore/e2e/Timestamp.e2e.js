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

describe('firestore.Timestamp', () => {
  it('throws if seconds is not a number', () => {
    try {
      new firebase.firestore.Timestamp('1234');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'seconds' expected a number value");
      return Promise.resolve();
    }
  });

  it('throws if nanoseconds is not a number', () => {
    try {
      new firebase.firestore.Timestamp(123, '456');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'nanoseconds' expected a number value");
      return Promise.resolve();
    }
  });

  it('throws if nanoseconds less than 0', () => {
    try {
      new firebase.firestore.Timestamp(123, -1);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'nanoseconds' out of range");
      return Promise.resolve();
    }
  });

  it('throws if nanoseconds greater than 1e9', () => {
    try {
      new firebase.firestore.Timestamp(123, 10000000000);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'nanoseconds' out of range");
      return Promise.resolve();
    }
  });

  it('throws if seconds less than -62135596800', () => {
    try {
      new firebase.firestore.Timestamp(-63135596800, 123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'seconds' out of range");
      return Promise.resolve();
    }
  });

  it('throws if seconds greater-equal than 253402300800', () => {
    try {
      new firebase.firestore.Timestamp(253402300800, 123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'seconds' out of range");
      return Promise.resolve();
    }
  });

  it('returns number of seconds', () => {
    const ts = new firebase.firestore.Timestamp(123, 123);
    ts.seconds.should.equal(123);
  });

  it('returns number of nanoseconds', () => {
    const ts = new firebase.firestore.Timestamp(123, 123456);
    ts.nanoseconds.should.equal(123456);
  });

  describe('isEqual()', () => {
    it('throws if invalid other is procided', () => {
      try {
        const ts = new firebase.firestore.Timestamp(123, 1234);
        ts.isEqual(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'other' expected an instance of Timestamp");
        return Promise.resolve();
      }
    });

    it('returns false if not equal', () => {
      const ts1 = new firebase.firestore.Timestamp(123, 123456);
      const ts2 = new firebase.firestore.Timestamp(1234, 123456);
      ts1.isEqual(ts2).should.equal(false);
    });

    it('returns true if equal', () => {
      const ts1 = new firebase.firestore.Timestamp(123, 123456);
      const ts2 = new firebase.firestore.Timestamp(123, 123456);
      ts1.isEqual(ts2).should.equal(true);
    });
  });

  describe('toDate()', () => {
    it('returns a valid Date object', () => {
      const ts = new firebase.firestore.Timestamp(123, 123456);
      const date = ts.toDate();
      should.equal(date.constructor.name, 'Date');
    });
  });

  describe('toMillis()', () => {
    it('returns the number of milliseconds', () => {
      const ts = new firebase.firestore.Timestamp(123, 123456);
      const ms = ts.toMillis();
      should.equal(typeof ms, 'number');
    });
  });

  describe('toString()', () => {
    it('returns a string representation of the class', () => {
      const ts = new firebase.firestore.Timestamp(123, 123456);
      const str = ts.toString();
      str.should.equal(`FirestoreTimestamp(seconds=${123}, nanoseconds=${123456})`);
    });
  });

  describe('Timestamp.now()', () => {
    it('returns a new instance', () => {
      const ts = firebase.firestore.Timestamp.now();
      should.equal(ts.constructor.name, 'FirestoreTimestamp');
    });
  });

  describe('Timestamp.fromDate()', () => {
    it('throws if date is not a valid Date', () => {
      try {
        firebase.firestore.Timestamp.fromDate(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'date' expected a valid Date object");
        return Promise.resolve();
      }
    });

    it('returns a new instance', () => {
      const ts = firebase.firestore.Timestamp.fromDate(new Date());
      should.equal(ts.constructor.name, 'FirestoreTimestamp');
    });
  });

  describe('Timestamp.fromMillis()', () => {
    it('returns a new instance', () => {
      const ts = firebase.firestore.Timestamp.fromMillis(123);
      should.equal(ts.constructor.name, 'FirestoreTimestamp');
    });
  });
});
