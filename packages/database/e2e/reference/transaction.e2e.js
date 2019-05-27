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

const TEST_PATH = `${PATH}/transaction`;
const NOOP = () => {};

describe('database().ref().transaction()', () => {

  before(() => seed(TEST_PATH));
  after(() => wipe(TEST_PATH));

  it('throws if no transactionUpdate is provided', async () => {
    try {
      await firebase.database().ref(TEST_PATH).transaction();
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'transactionUpdate' must be a function`);
      return Promise.resolve();
    }
  });

  it('throws if onComplete is not a function', async () => {
    try {
      await firebase.database().ref().transaction(NOOP, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'onComplete' must be a function if provided`);
      return Promise.resolve();
    }
  });

  it('throws if applyLocally is not a boolean', async () => {
    try {
      await firebase.database().ref().transaction(NOOP, NOOP, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'applyLocally' must be a boolean value if provided`);
      return Promise.resolve();
    }
  });

  // TODO test transaction
});
