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

describe('database().ref().equalTo()', () => {
  before(() => seed(TEST_PATH));
  after(() => wipe(TEST_PATH));

  it('throws if value is not a valid type', async () => {
    try {
      await firebase
        .database()
        .ref()
        .equalTo({ foo: 'bar' });
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'value' must be a number, string, boolean or null value");
      return Promise.resolve();
    }
  });

  it('throws if key is not a string', async () => {
    try {
      await firebase
        .database()
        .ref()
        .equalTo('bar', 123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'key' must be a string value if defined");
      return Promise.resolve();
    }
  });

  it('throws if a starting point has already been set', async () => {
    try {
      await firebase
        .database()
        .ref()
        .startAt('foo')
        .equalTo('bar');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        'Starting point was already set (by another call to startAt or equalTo)',
      );
      return Promise.resolve();
    }
  });

  it('throws if a ending point has already been set', async () => {
    try {
      await firebase
        .database()
        .ref()
        .endAt('foo')
        .equalTo('bar');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        'Ending point was already set (by another call to endAt or equalTo)',
      );
      return Promise.resolve();
    }
  });

  it('snapshot value is null when no ordering modifier is applied', async () => {
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

  it('returns the correct equal to values', async () => {
    const ref = firebase.database().ref(TEST_PATH);

    await ref.set({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 2,
    });

    const snapshot = await ref
      .orderByValue()
      .equalTo(2)
      .once('value');

    const expected = ['b', 'e'];

    snapshot.forEach((childSnapshot, i) => {
      childSnapshot.key.should.eql(expected[i]);
    });
  });
});
