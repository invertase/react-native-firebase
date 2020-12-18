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

const TEST_PATH = `${PATH}/remove`;

describe('database().ref().remove()', function() {
  it('throws if onComplete is not a function', async function() {
    try {
      await firebase
        .database()
        .ref(TEST_PATH)
        .remove('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'onComplete' must be a function if provided");
      return Promise.resolve();
    }
  });

  it('removes a value at the path', async function() {
    const ref = firebase.database().ref(TEST_PATH);
    await ref.set('foo');
    await ref.remove();
    const snapshot = await ref.once('value');
    snapshot.exists().should.equal(false);
  });
});
