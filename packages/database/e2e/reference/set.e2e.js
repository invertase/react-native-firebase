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

const TEST_PATH = `${PATH}/set`;

describe('database().ref().set()', () => {
  before(() => seed(TEST_PATH));
  after(() => wipe(TEST_PATH));

  it('throws if no value is provided', async () => {
    try {
      await firebase
        .database()
        .ref(TEST_PATH)
        .set();
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'value' must be defined`);
      return Promise.resolve();
    }
  });

  it('throws if onComplete is not a function', async () => {
    try {
      await firebase
        .database()
        .ref(TEST_PATH)
        .set(null, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'onComplete' must be a function if provided`);
      return Promise.resolve();
    }
  });

  it('sets a new value', async () => {
    const value = Date.now();
    const ref = firebase.database().ref(TEST_PATH);
    await ref.set(value);
    const snapshot = await ref.once('value');
    snapshot.val().should.eql(value);
  });

  it('callback if function is passed', async () => {
    const value = Date.now();
    return new Promise(async resolve => {
      await firebase
        .database()
        .ref(TEST_PATH)
        .set(value, resolve);
    });
  });

  it('throws if permission defined', async () => {
    const value = Date.now();
    try {
      await firebase
        .database()
        .ref('nope/foo')
        .set(value);
      return Promise.reject(new Error('Did not throw error.'));
    } catch (error) {
      error.code.includes('database/permission-denied').should.be.true();
      return Promise.resolve();
    }
  });
});
