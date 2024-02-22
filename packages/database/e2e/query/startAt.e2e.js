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

const { PATH, seed, wipe } = require('../helpers');

const TEST_PATH = `${PATH}/startAt`;

describe('database().ref().startAt()', function () {
  before(async function () {
    await seed(TEST_PATH);
  });

  after(async function () {
    await wipe(TEST_PATH);
  });

  describe('v8 compatibility', function () {
    it('throws if an value is undefined', async function () {
      try {
        await firebase.database().ref().startAt();
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'value' must be a number, string, boolean or null value");
        return Promise.resolve();
      }
    });

    it('throws if an key is not a string', async function () {
      try {
        await firebase.database().ref().startAt('foo', 1234);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'key' must be a string value if defined");
        return Promise.resolve();
      }
    });

    it('throws if a starting point has already been set', async function () {
      try {
        await firebase.database().ref().equalTo('foo').startAt('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'Starting point was already set (by another call to startAt or equalTo)',
        );
        return Promise.resolve();
      }
    });

    it('throws if ordering by key and the key param is set', async function () {
      try {
        await firebase.database().ref().orderByKey('foo').startAt('foo', 'bar');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'When ordering by key, you may only pass a value argument to startAt(), endAt(), or equalTo()',
        );
        return Promise.resolve();
      }
    });

    it('throws if ordering by key and the value param is not a string', async function () {
      try {
        await firebase.database().ref().orderByKey('foo').startAt(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'When ordering by key, the value of startAt(), endAt(), or equalTo() must be a string',
        );
        return Promise.resolve();
      }
    });

    it('throws if ordering by priority and the value param is not priority type', async function () {
      try {
        await firebase.database().ref().orderByPriority().startAt(true);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'When ordering by priority, the first value of startAt(), endAt(), or equalTo() must be a valid priority value (null, a number, or a string)',
        );
        return Promise.resolve();
      }
    });

    it('snapshot value is null when no ordering modifier is applied', async function () {
      const ref = firebase.database().ref(TEST_PATH);

      await ref.set({
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      });

      const snapshot = await ref.startAt(2).once('value');
      should.equal(snapshot.val(), null);
    });

    it('starts at the correct value', async function () {
      const ref = firebase.database().ref(TEST_PATH);

      await ref.set({
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      });

      const snapshot = await ref.orderByValue().startAt(2).once('value');

      const expected = ['b', 'c', 'd'];

      snapshot.forEach((childSnapshot, i) => {
        childSnapshot.key.should.eql(expected[i]);
      });
    });
  });

  describe('modular', function () {
    it('throws if an value is undefined', async function () {
      const { getDatabase, ref, startAt, query } = databaseModular;

      try {
        query(ref(getDatabase()), startAt());
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'value' must be a number, string, boolean or null value");
        return Promise.resolve();
      }
    });

    it('throws if an key is not a string', async function () {
      const { getDatabase, ref, startAt, query } = databaseModular;

      try {
        query(ref(getDatabase()), startAt('foo', 1234));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'key' must be a string value if defined");
        return Promise.resolve();
      }
    });

    it('throws if a starting point has already been set', async function () {
      const { getDatabase, ref, equalTo, startAt, query } = databaseModular;

      try {
        query(ref(getDatabase()), equalTo('foo'), startAt('foo'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'Starting point was already set (by another call to startAt or equalTo)',
        );
        return Promise.resolve();
      }
    });

    it('throws if ordering by key and the key param is set', async function () {
      const { getDatabase, ref, orderByKey, startAt, query } = databaseModular;

      try {
        query(ref(getDatabase()), orderByKey('foo'), startAt('foo', 'bar'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'When ordering by key, you may only pass a value argument to startAt(), endAt(), or equalTo()',
        );
        return Promise.resolve();
      }
    });

    it('throws if ordering by key and the value param is not a string', async function () {
      const { getDatabase, ref, orderByKey, startAt, query } = databaseModular;

      try {
        query(ref(getDatabase()), orderByKey('foo'), startAt(123));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'When ordering by key, the value of startAt(), endAt(), or equalTo() must be a string',
        );
        return Promise.resolve();
      }
    });

    it('throws if ordering by priority and the value param is not priority type', async function () {
      const { getDatabase, ref, orderByPriority, startAt, query } = databaseModular;

      try {
        query(ref(getDatabase()), orderByPriority(), startAt(true));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'When ordering by priority, the first value of startAt(), endAt(), or equalTo() must be a valid priority value (null, a number, or a string)',
        );
        return Promise.resolve();
      }
    });

    it('snapshot value is null when no ordering modifier is applied', async function () {
      const { getDatabase, ref, set, startAt, get, query } = databaseModular;

      const dbRef = ref(getDatabase(), TEST_PATH);

      await set(dbRef, {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      });

      const snapshot = await get(query(dbRef, startAt(2)));
      should.equal(snapshot.val(), null);
    });

    it('starts at the correct value', async function () {
      const { getDatabase, ref, set, startAt, get, query, orderByValue } = databaseModular;

      const dbRef = ref(getDatabase(), TEST_PATH);

      await set(dbRef, {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      });

      const snapshot = await get(query(dbRef, orderByValue(), startAt(2)));

      const expected = ['b', 'c', 'd'];

      snapshot.forEach((childSnapshot, i) => {
        childSnapshot.key.should.eql(expected[i]);
      });
    });
  });
});
