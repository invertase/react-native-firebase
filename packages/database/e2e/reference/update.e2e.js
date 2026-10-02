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

const { PATH } = require('../helpers');

const TEST_PATH = `${PATH}/update`;

describe('database().ref().update()', function () {
  after(async function () {
    const { getDatabase, ref, remove } = databaseModular;
    await remove(ref(getDatabase(), TEST_PATH));
  });

  describe('modular', function () {
    it('throws if values is not an object', async function () {
      const { getDatabase, ref, update } = databaseModular;

      try {
        await update(ref(getDatabase(), TEST_PATH), 'foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'values' must be an object");
        return Promise.resolve();
      }
    });

    it('throws if update paths are not valid', async function () {
      const { getDatabase, ref, update } = databaseModular;

      try {
        await update(ref(getDatabase(), TEST_PATH), {
          $$$$: 'foo',
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'values' contains an invalid path.");
        return Promise.resolve();
      }
    });

    it('updates values', async function () {
      const { getDatabase, ref, update, get } = databaseModular;

      const value = Date.now();
      const dbRef = ref(getDatabase(), TEST_PATH);
      await update(dbRef, {
        foo: value,
      });
      const snapshot = await get(dbRef);
      snapshot.val().should.eql(
        jet.contextify({
          foo: value,
        }),
      );

      await update(dbRef, {}); // empty update should pass, but no side effects
      const snapshot2 = await get(dbRef);
      snapshot2.val().should.eql(
        jet.contextify({
          foo: value,
        }),
      );
    });

    // Upstream #9339: native must decode the iOS null sentinel { __rnfbNull: true }.
    it('removes a child when its value is updated to null (#9339)', async function () {
      const { getDatabase, ref, set, update, get } = databaseModular;
      const dbRef = ref(getDatabase(), `${TEST_PATH}/nullChild`);

      await set(dbRef, { a: 1, b: 2 });
      await update(dbRef, { b: null });

      const snapshot = await get(dbRef);
      snapshot.val().should.eql(jet.contextify({ a: 1 }));
      JSON.stringify(snapshot.val()).should.not.containEql('__rnfbNull');
    });

    it('removes a nested child when a multi-path update sets it to null (#9339)', async function () {
      const { getDatabase, ref, set, update, get } = databaseModular;
      const dbRef = ref(getDatabase(), `${TEST_PATH}/nullMultiPath`);

      await set(dbRef, { a: 1, nested: { c: 2, d: 3 } });
      await update(dbRef, { a: 4, 'nested/c': null });

      const snapshot = await get(dbRef);
      snapshot.val().should.eql(jet.contextify({ a: 4, nested: { d: 3 } }));
      JSON.stringify(snapshot.val()).should.not.containEql('__rnfbNull');
    });
  });
});
