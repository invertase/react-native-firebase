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

const TEST_PATH = `${PATH}/orderByValue`;

describe('database().ref().orderByValue()', () => {
  before(() => seed(TEST_PATH));
  after(() => wipe(TEST_PATH));

  it('throws if an orderBy call has already been set', async () => {
    try {
      await firebase
        .database()
        .ref()
        .orderByChild('foo')
        .orderByValue();
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("You can't combine multiple orderBy calls");
      return Promise.resolve();
    }
  });

  it('order by value', async () => {
    const ref = firebase
      .database()
      .ref(TEST_PATH)
      .child('query');

    await ref.set({
      a: 2,
      b: 3,
      c: 1,
    });

    try {
      const snapshot = await ref.orderByValue().once('value');

      const expected = ['c', 'a', 'b'];

      snapshot.forEach((childSnapshot, i) => {
        childSnapshot.key.should.eql(expected[i]);
      });

      return Promise.resolve();
    } catch (error) {
      throw error;
    }
  });
});
