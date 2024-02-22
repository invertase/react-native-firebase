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

const { PATH, CONTENT, seed, wipe } = require('../helpers');

const TEST_PATH = `${PATH}/once`;

describe('get()', function () {
  before(function () {
    return seed(TEST_PATH);
  });

  after(function () {
    return wipe(TEST_PATH);
  });

  it('returns a promise', async function () {
    const { getDatabase, ref, get } = databaseModular;

    const dbRef = ref(getDatabase(), 'tests/types/number');
    const returnValue = get(dbRef);
    returnValue.should.be.Promise();
  });

  it('resolves with the correct values', async function () {
    const { getDatabase, ref, child, get } = databaseModular;

    const dbRef = ref(getDatabase(), `${TEST_PATH}/types`);

    await Promise.all(
      Object.keys(CONTENT.TYPES).map(async key => {
        const value = CONTENT.TYPES[key];
        const snapsnot = await get(child(dbRef, key));
        snapsnot.val().should.eql(jet.contextify(value));
      }),
    );
  });

  it('errors if permission denied', async function () {
    const { getDatabase, ref, get } = databaseModular;

    const dbRef = ref(getDatabase(), 'nope');
    try {
      await get(dbRef);
      return Promise.reject(new Error('No permission denied error'));
    } catch (error) {
      error.code.includes('database/permission-denied').should.be.true();
      return Promise.resolve();
    }
  });
});
