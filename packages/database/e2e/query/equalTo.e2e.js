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

const TEST_PATH = `${PATH}/equalTo`;

describe('database().ref().equalTo()', function () {
  before(async function () {
    await seed(TEST_PATH);
  });

  after(async function () {
    await wipe(TEST_PATH);
  });

  describe('v8 compatibility', function () {
    it('throws if value is not a valid type', async function () {
      try {
        await firebase.database().ref().equalTo({ foo: 'bar' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'value' must be a number, string, boolean or null value");
        return Promise.resolve();
      }
    });

    it('throws if key is not a string', async function () {
      try {
        await firebase.database().ref().equalTo('bar', 123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'key' must be a string value if defined");
        return Promise.resolve();
      }
    });

    it('throws if a starting point has already been set', async function () {
      try {
        await firebase.database().ref().startAt('foo').equalTo('bar');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'Starting point was already set (by another call to startAt or equalTo)',
        );
        return Promise.resolve();
      }
    });

    it('throws if a ending point has already been set', async function () {
      try {
        await firebase.database().ref().endAt('foo').equalTo('bar');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'Ending point was already set (by another call to endAt or equalTo)',
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

      const snapshot = await ref.equalTo(2).once('value');
      should.equal(snapshot.val(), null);
    });

    it('returns the correct equal to values', async function () {
      const ref = firebase.database().ref(TEST_PATH);

      await ref.set({
        a: 1,
        b: 2,
        c: 3,
        d: 4,
        e: 2,
      });

      const snapshot = await ref.orderByValue().equalTo(2).once('value');

      const expected = ['b', 'e'];

      snapshot.forEach((childSnapshot, i) => {
        childSnapshot.key.should.eql(expected[i]);
      });
    });
  });

  describe('modular', function () {
    it('throws if value is not a valid type', async function () {
      const { getDatabase, ref, equalTo, query } = databaseModular;

      try {
        query(ref(getDatabase()), equalTo({ foo: 'bar' }));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'value' must be a number, string, boolean or null value");
        return Promise.resolve();
      }
    });

    it('throws if key is not a string', async function () {
      const { getDatabase, ref, equalTo, query } = databaseModular;

      try {
        query(ref(getDatabase()), equalTo('bar', 123));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'key' must be a string value if defined");
        return Promise.resolve();
      }
    });

    it('throws if a starting point has already been set', async function () {
      const { getDatabase, ref, startAt, equalTo, query } = databaseModular;

      try {
        query(ref(getDatabase()), startAt('foo'), equalTo('bar'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'Starting point was already set (by another call to startAt or equalTo)',
        );
        return Promise.resolve();
      }
    });

    it('throws if a ending point has already been set', async function () {
      const { getDatabase, ref, endAt, equalTo, query } = databaseModular;

      try {
        query(ref(getDatabase()), endAt('foo'), equalTo('bar'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'Ending point was already set (by another call to endAt or equalTo)',
        );
        return Promise.resolve();
      }
    });

    it('snapshot value is null when no ordering modifier is applied', async function () {
      const { getDatabase, ref, set, equalTo, get, query } = databaseModular;

      const dbRef = ref(getDatabase(), TEST_PATH);

      await set(dbRef, {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      });

      const snapshot = await get(query(dbRef, equalTo(2)));
      should.equal(snapshot.val(), null);
    });

    it('returns the correct equal to values', async function () {
      const { getDatabase, ref, set, orderByValue, equalTo, get, query } = databaseModular;

      const dbRef = ref(getDatabase(), TEST_PATH);

      await set(dbRef, {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
        e: 2,
      });

      const snapshot = await get(query(dbRef, orderByValue(), equalTo(2)));

      const expected = ['b', 'e'];

      snapshot.forEach((childSnapshot, i) => {
        childSnapshot.key.should.eql(expected[i]);
      });
    });
  });
});
