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
const COLLECTION = 'firestore';
const { wipe } = require('../helpers');

describe('firestore().collection().limitToLast()', function () {
  before(function () {
    return wipe();
  });
  it('throws if limitToLast is invalid', function () {
    try {
      firebase.firestore().collection(COLLECTION).limitToLast(-1);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'limitToLast' must be a positive integer value");
      return Promise.resolve();
    }
  });

  it('sets limitToLast on internals', async function () {
    const colRef = firebase.firestore().collection(COLLECTION).limitToLast(123);

    should(colRef._modifiers.options.limitToLast).equal(123);
  });

  it('removes limit query if limitToLast is set afterwards', function () {
    const colRef = firebase.firestore().collection(COLLECTION).limit(2).limitToLast(123);

    should(colRef._modifiers.options.limit).equal(undefined);
  });

  it('removes limitToLast query if limit is set afterwards', function () {
    const colRef = firebase
      .firestore()
      // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
      // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
      .collection(`${COLLECTION}/${Utils.randString(12, '#aA')}/limitToLast-limit-after`);
    const colRef2 = colRef.limitToLast(123).limit(2);

    should(colRef2._modifiers.options.limitToLast).equal(undefined);
  });

  it('limitToLast the number of documents', async function () {
    // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
    // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
    const subCol = `${COLLECTION}/${Utils.randString(12, '#aA')}/limitToLast-count`;
    const colRef = firebase.firestore().collection(subCol);

    // Add 3
    await colRef.add({ count: 1 });
    await colRef.add({ count: 2 });
    await colRef.add({ count: 3 });

    const docs = await firebase
      .firestore()
      .collection(subCol)
      .limitToLast(2)
      .orderBy('count', 'desc')
      .get();

    const results = [];
    docs.forEach(doc => {
      results.push(doc.data());
    });

    should(results.length).equal(2);

    should(results[0].count).equal(2);
    should(results[1].count).equal(1);
  });

  it("throws error if no 'orderBy' is set on the query", function () {
    try {
      firebase.firestore().collection(COLLECTION).limitToLast(3).get();
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        'limitToLast() queries require specifying at least one firebase.firestore().collection().orderBy() clause',
      );
      return Promise.resolve();
    }
  });
});
