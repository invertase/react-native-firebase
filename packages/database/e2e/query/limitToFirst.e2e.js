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

const TEST_PATH = `${PATH}/limitToFirst`;

describe('database().ref().limitToFirst()', () => {
  before(() => seed(TEST_PATH));
  after(() => wipe(TEST_PATH));

  it('throws if limit is invalid', async () => {
    try {
      await firebase
        .database()
        .ref()
        .limitToFirst('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'limit' must be a positive integer value`);
      return Promise.resolve();
    }
  });

  it('throws if limit has already been set', async () => {
    try {
      await firebase
        .database()
        .ref()
        .limitToLast(2)
        .limitToFirst(3);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        `Limit was already set (by another call to limitToFirst, or limitToLast)`,
      );
      return Promise.resolve();
    }
  });

  it('returns a limited array data set', async () => {
    const ref = firebase.database().ref(`${TEST_PATH}`);

    const initial = {
      0: 'foo',
      1: 'bar',
      2: 'baz',
    };

    await ref.set(initial);

    return ref
      .limitToFirst(2)
      .once('value')
      .then(snapshot => {
        snapshot.val().should.eql(jet.contextify(['foo', 'bar']));
        return Promise.resolve();
      });
  });

  it('returns a limited object data set', async () => {
    const ref = firebase.database().ref(`${TEST_PATH}`);

    const initial = {
      a: 'foo',
      b: 'bar',
      c: 'baz',
    };

    await ref.set(initial);

    return ref
      .limitToFirst(2)
      .once('value')
      .then(snapshot => {
        snapshot.val().should.eql(
          jet.contextify({
            a: 'foo',
            b: 'bar',
          }),
        );
        return Promise.resolve();
      });
  });

  it('returns a null value when not possible to limit', async () => {
    const ref = firebase.database().ref(`${TEST_PATH}`);

    const initial = 'foo';

    await ref.set(initial);

    return ref
      .limitToFirst(2)
      .once('value')
      .then(snapshot => {
        should.equal(snapshot.val(), null);
        return Promise.resolve();
      });
  });
});
