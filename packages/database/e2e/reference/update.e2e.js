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

describe('database().ref().update()', () => {
  after(async () => {
    await firebase
      .database()
      .ref(`${PATH}/update`)
      .remove();
  });

  it('throws if values is not an object', async () => {
    try {
      await firebase
        .database()
        .ref(`${PATH}/update`)
        .update('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'values' must be an object`);
      return Promise.resolve();
    }
  });

  it('throws if values does not contain any values', async () => {
    try {
      await firebase
        .database()
        .ref(`${PATH}/update`)
        .update({});
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'values' must be an object containing multiple values`);
      return Promise.resolve();
    }
  });

  it('throws if onComplete is not a function', async () => {
    try {
      await firebase
        .database()
        .ref(`${PATH}/update`)
        .update({
          foo: 'bar',
        }, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'onComplete' must be a function if provided`);
      return Promise.resolve();
    }
  });

  it('updates values', async () => {
    const value = Date.now();
    const ref = firebase.database().ref(`${PATH}/update`);
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

  it('callback if function is passed', async () => {
    const value = Date.now();
    return new Promise(async resolve => {
      await firebase
        .database()
        .ref(`${PATH}/update`)
        .update(
          {
            foo: value,
          },
          resolve,
        );
    });
  });
});
