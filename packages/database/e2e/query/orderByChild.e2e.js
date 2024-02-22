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

const TEST_PATH = `${PATH}/orderByChild`;

describe('database().ref().orderByChild()', function () {
  before(async function () {
    await seed(TEST_PATH);
  });

  after(async function () {
    await wipe(TEST_PATH);
  });

  describe('v8 compatibility', function () {
    it('throws if path is not a string value', async function () {
      try {
        await firebase.database().ref().orderByChild({ foo: 'bar' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'path' must be a string value");
        return Promise.resolve();
      }
    });

    it('throws if path is an empty path', async function () {
      try {
        await firebase.database().ref().orderByChild('/');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'path' cannot be empty. Use orderByValue instead");
        return Promise.resolve();
      }
    });

    it('throws if an orderBy call has already been set', async function () {
      try {
        await firebase.database().ref().orderByKey().orderByChild('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("You can't combine multiple orderBy calls");
        return Promise.resolve();
      }
    });

    it('order by a child value', async function () {
      const ref = firebase.database().ref(TEST_PATH);

      try {
        const snapshot = await ref.child('query').orderByChild('number').once('value');

        const expected = ['b', 'c', 'a'];

        snapshot.forEach((childSnapshot, i) => {
          childSnapshot.key.should.eql(expected[i]);
        });

        return Promise.resolve();
      } catch (error) {
        throw error;
      }
    });
  });

  describe('modular', function () {
    it('throws if path is not a string value', async function () {
      const { getDatabase, ref, orderByChild, query } = databaseModular;

      try {
        query(ref(getDatabase()), orderByChild({ foo: 'bar' }));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'path' must be a string value");
        return Promise.resolve();
      }
    });

    it('throws if path is an empty path', async function () {
      const { getDatabase, ref, orderByChild, query } = databaseModular;

      try {
        query(ref(getDatabase()), orderByChild('/'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'path' cannot be empty. Use orderByValue instead");
        return Promise.resolve();
      }
    });

    it('throws if an orderBy call has already been set', async function () {
      const { getDatabase, ref, orderByKey, orderByChild, query } = databaseModular;

      try {
        query(ref(getDatabase()), orderByKey(), orderByChild('foo'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("You can't combine multiple orderBy calls");
        return Promise.resolve();
      }
    });

    it('order by a child value', async function () {
      const { getDatabase, ref, get, child, orderByChild, query } = databaseModular;

      const dbRef = ref(getDatabase(), TEST_PATH);

      try {
        const snapshot = await get(query(child(dbRef, 'query'), orderByChild('number')));

        const expected = ['b', 'c', 'a'];

        snapshot.forEach((childSnapshot, i) => {
          childSnapshot.key.should.eql(expected[i]);
        });

        return Promise.resolve();
      } catch (error) {
        throw error;
      }
    });
  });
});
