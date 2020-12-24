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
    await firebase.database().ref(TEST_PATH).remove();
  });

  it('throws if values is not an object', async function () {
    try {
      await firebase.database().ref(TEST_PATH).update('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'values' must be an object");
      return Promise.resolve();
    }
  });

  it('throws if values does not contain any values', async function () {
    try {
      await firebase.database().ref(TEST_PATH).update({});
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'values' must be an object containing multiple values");
      return Promise.resolve();
    }
  });

  it('throws if update paths are not valid', async function () {
    try {
      await firebase.database().ref(TEST_PATH).update({
        $$$$: 'foo',
      });
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'values' contains an invalid path.");
      return Promise.resolve();
    }
  });

  it('throws if onComplete is not a function', async function () {
    try {
      await firebase.database().ref(TEST_PATH).update(
        {
          foo: 'bar',
        },
        'foo',
      );
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'onComplete' must be a function if provided");
      return Promise.resolve();
    }
  });

  it('updates values', async function () {
    const value = Date.now();
    const ref = firebase.database().ref(TEST_PATH);
    await ref.update({
      foo: value,
    });
    const snapshot = await ref.once('value');
    snapshot.val().should.eql(
      jet.contextify({
        foo: value,
      }),
    );
  });

  it('callback if function is passed', async function () {
    const value = Date.now();
    return new Promise(async resolve => {
      await firebase.database().ref(TEST_PATH).update(
        {
          foo: value,
        },
        resolve,
      );
    });
  });
});
