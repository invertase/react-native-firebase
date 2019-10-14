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

const { wipe } = require('./helpers');

describe('firestore.FieldValue', () => {
  before(() => wipe());

  it('should throw if constructed manually', () => {
    try {
      new firebase.firestore.FieldValue();
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('constructor is private');
      return Promise.resolve();
    }
  });

  describe('isEqual()', () => {
    it('throws if other is not a FieldValue', () => {
      try {
        firebase.firestore.FieldValue.increment(1).isEqual(1);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'other' expected a FieldValue instance");
        return Promise.resolve();
      }
    });

    it('returns false if not equal', () => {
      const fv = firebase.firestore.FieldValue.increment(1);

      const fieldValue1 = firebase.firestore.FieldValue.increment(2);
      const fieldValue2 = firebase.firestore.FieldValue.arrayRemove('123');

      const eql1 = fv.isEqual(fieldValue1);
      const eql2 = fv.isEqual(fieldValue2);

      eql1.should.be.False();
      eql2.should.be.False();
    });

    it('returns true if equal', () => {
      const fv = firebase.firestore.FieldValue.arrayUnion(1, '123', 3);

      const fieldValue1 = firebase.firestore.FieldValue.arrayUnion(1, '123', 3);

      const eql1 = fv.isEqual(fieldValue1);

      eql1.should.be.True();
    });
  });

  describe('increment()', () => {
    it('throws if value is not a number', () => {
      try {
        firebase.firestore.FieldValue.increment('1');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'n' expected a number value");
        return Promise.resolve();
      }
    });

    it('increments a number if it exists', async () => {
      const ref = firebase.firestore().doc('v6/increment');
      await ref.set({ foo: 2 });
      await ref.update({ foo: firebase.firestore.FieldValue.increment(1) });
      const snapshot = await ref.get();
      snapshot.data().foo.should.equal(3);
      await ref.delete();
    });

    it('sets the value if it doesnt exist or being set', async () => {
      const ref = firebase.firestore().doc('v6/increment');
      await ref.set({ foo: firebase.firestore.FieldValue.increment(1) });
      const snapshot = await ref.get();
      snapshot.data().foo.should.equal(1);
      await ref.delete();
    });
  });

  describe('serverTime()', () => {
    it('sets a new server time value', async () => {
      const ref = firebase.firestore().doc('v6/servertime');
      await ref.set({ foo: firebase.firestore.FieldValue.serverTimestamp() });
      const snapshot = await ref.get();
      snapshot.data().foo.seconds.should.be.a.Number();
      await ref.delete();
    });

    it('updates a server time value', async () => {
      const ref = firebase.firestore().doc('v6/servertime');
      await ref.set({ foo: firebase.firestore.FieldValue.serverTimestamp() });
      const snapshot1 = await ref.get();
      snapshot1.data().foo.nanoseconds.should.be.a.Number();
      const current = snapshot1.data().foo.nanoseconds;
      await Utils.sleep(100);
      await ref.update({ foo: firebase.firestore.FieldValue.serverTimestamp() });
      const snapshot2 = await ref.get();
      snapshot2.data().foo.nanoseconds.should.be.a.Number();
      should.equal(current === snapshot2.data().foo.nanoseconds, false);
      await ref.delete();
    });
  });

  describe('delete()', () => {
    it('removes a value', async () => {
      const ref = firebase.firestore().doc('v6/valuedelete');
      await ref.set({ foo: 'bar', bar: 'baz' });
      await ref.update({ bar: firebase.firestore.FieldValue.delete() });
      const snapshot = await ref.get();
      snapshot.data().should.eql(jet.contextify({ foo: 'bar' }));
      await ref.delete();
    });
  });

  describe('arrayUnion()', () => {
    it('throws if attempting to use own class', () => {
      try {
        firebase.firestore.FieldValue.arrayUnion(firebase.firestore.FieldValue.serverTimestamp());
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'FieldValue instance cannot be used with other FieldValue methods',
        );
        return Promise.resolve();
      }
    });

    it('throws if using nested arrays', () => {
      try {
        firebase.firestore.FieldValue.arrayUnion([1]);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('Nested arrays are not supported');
        return Promise.resolve();
      }
    });

    it('updates an existing array', async () => {
      const ref = firebase.firestore().doc('v6/arrayunion');
      await ref.set({
        foo: [1, 2],
      });
      await ref.update({
        foo: firebase.firestore.FieldValue.arrayUnion(3, 4),
      });
      const snapshot = await ref.get();
      const expected = [1, 2, 3, 4];
      snapshot.data().foo.should.eql(jet.contextify(expected));
      await ref.delete();
    });

    it('sets an array if existing value isnt an array with update', async () => {
      const ref = firebase.firestore().doc('v6/arrayunion');
      await ref.set({
        foo: 123,
      });
      await ref.update({
        foo: firebase.firestore.FieldValue.arrayUnion(3, 4),
      });
      const snapshot = await ref.get();
      const expected = [3, 4];
      snapshot.data().foo.should.eql(jet.contextify(expected));
      await ref.delete();
    });

    it('sets an existing array to the new array with set', async () => {
      const ref = firebase.firestore().doc('v6/arrayunion');
      await ref.set({
        foo: [1, 2],
      });
      await ref.set({
        foo: firebase.firestore.FieldValue.arrayUnion(3, 4),
      });
      const snapshot = await ref.get();
      const expected = [3, 4];
      snapshot.data().foo.should.eql(jet.contextify(expected));
      await ref.delete();
    });
  });

  describe('arrayRemove()', () => {
    it('throws if attempting to use own class', () => {
      try {
        firebase.firestore.FieldValue.arrayRemove(firebase.firestore.FieldValue.serverTimestamp());
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'FieldValue instance cannot be used with other FieldValue methods',
        );
        return Promise.resolve();
      }
    });

    it('throws if using nested arrays', () => {
      try {
        firebase.firestore.FieldValue.arrayRemove([1]);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('Nested arrays are not supported');
        return Promise.resolve();
      }
    });

    it('removes items in an array', async () => {
      const ref = firebase.firestore().doc('v6/arrayremove');
      await ref.set({
        foo: [1, 2, 3, 4],
      });
      await ref.update({
        foo: firebase.firestore.FieldValue.arrayRemove(3, 4),
      });
      const snapshot = await ref.get();
      const expected = [1, 2];
      snapshot.data().foo.should.eql(jet.contextify(expected));
      await ref.delete();
    });

    it('removes all items in the array if existing value isnt array with update', async () => {
      const ref = firebase.firestore().doc('v6/arrayunion');
      await ref.set({
        foo: 123,
      });
      await ref.update({
        foo: firebase.firestore.FieldValue.arrayRemove(3, 4),
      });
      const snapshot = await ref.get();
      const expected = [];
      snapshot.data().foo.should.eql(jet.contextify(expected));
      await ref.delete();
    });

    it('removes all items in the array if existing value isnt array with set', async () => {
      const ref = firebase.firestore().doc('v6/arrayunion');
      await ref.set({
        foo: 123,
      });
      await ref.set({
        foo: firebase.firestore.FieldValue.arrayRemove(3, 4),
      });
      const snapshot = await ref.get();
      const expected = [];
      snapshot.data().foo.should.eql(jet.contextify(expected));
      await ref.delete();
    });
  });
});
