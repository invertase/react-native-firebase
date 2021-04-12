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

const TEST_PATH = `${PATH}/priority`;

describe('database().ref().setPriority()', function () {
  before(function () {
    return seed(TEST_PATH);
  });
  after(function () {
    return wipe(TEST_PATH);
  });

  it('throws if priority is not a valid type', async function () {
    try {
      await firebase.database().ref().setPriority({});
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'priority' must be a number, string or null value");
      return Promise.resolve();
    }
  });

  it('throws if onComplete is not a function', async function () {
    try {
      await firebase.database().ref().setPriority(null, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'onComplete' must be a function if provided");
      return Promise.resolve();
    }
  });

  it('should correctly set a priority for all non-null values', async function () {
    await Promise.all(
      Object.keys(CONTENT.TYPES).map(async dataRef => {
        const ref = firebase.database().ref(`${TEST_PATH}/types/${dataRef}`);
        await ref.setPriority(1);
        const snapshot = await ref.once('value');
        if (snapshot.val() !== null) {
          snapshot.getPriority().should.eql(1);
        }
      }),
    );
  });

  it('callback if function is passed', async function () {
    const value = Date.now();
    return new Promise(async resolve => {
      await firebase.database().ref(`${TEST_PATH}/types/string`).set(value, resolve);
    });
  });

  it('throws if setting priority on non-existent node', async function () {
    try {
      await firebase.database().ref('tests/siudfhsuidfj').setPriority(1);
      return Promise.reject(new Error('Did not throw error.'));
    } catch (error) {
      // WEB SDK: INVALID_PARAMETERS: could not set priority on non-existent node
      // TODO Get this error? Native code = -999 Unknown
      return Promise.resolve();
    }
  });

  it('throws if permission defined', async function () {
    try {
      await firebase.database().ref('nope/foo').setPriority(1);
      return Promise.reject(new Error('Did not throw error.'));
    } catch (error) {
      error.code.includes('database/permission-denied').should.be.true();
      return Promise.resolve();
    }
  });
});
