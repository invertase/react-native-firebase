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

const TEST_PATH = `${PATH}/setWithPriority`;

describe('database().ref().setWithPriority()', function () {
  before(async function () {
    await seed(TEST_PATH);
  });

  after(async function () {
    await wipe(TEST_PATH);
  });

  describe('modular', function () {
    it('throws if newVal is not defined', async function () {
      const { getDatabase, ref, setWithPriority } = databaseModular;
      const db = getDatabase();
      const dbRef = ref(db);

      try {
        await setWithPriority(dbRef);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'newVal' must be defined");
        return Promise.resolve();
      }
    });

    it('throws if newPriority is incorrect type', async function () {
      const { getDatabase, ref, setWithPriority } = databaseModular;
      const db = getDatabase();
      const dbRef = ref(db);

      try {
        await setWithPriority(dbRef, null, { foo: 'bar' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'newPriority' must be a number, string or null value");
        return Promise.resolve();
      }
    });

    it('sets with a new value and priority', async function () {
      const { getDatabase, ref, setWithPriority, get } = databaseModular;
      const db = getDatabase();
      const dbRef = ref(db, `${TEST_PATH}/setValue`);

      const value = Date.now();
      await setWithPriority(dbRef, value, 2);
      const snapshot = await get(dbRef);
      snapshot.val().should.eql(value);
      snapshot.getPriority().should.eql(2);
    });
  });
});
