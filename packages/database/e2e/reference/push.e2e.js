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

const TEST_PATH = `${PATH}/push`;

describe.only('database().ref().push()', () => {
  // before(() => seed(TEST_PATH));
  // after(() => wipe(TEST_PATH));
  // TODO

  it('wraps Firebase.push when no value is passed', () => {
    const ref = firebase.database().ref(`${TEST_PATH}/boop`);
    const pushed = ref.push();
    return pushed
      .then(childRef => {
        pushed.ref.parent.toString().should.eql(ref.toString());
        pushed.toString().should.eql(childRef.toString());
        return pushed.once('value');
      })
      .then(snap => {
        should.equal(snap.val(), null);
        snap.ref.toString().should.eql(pushed.toString());
      });
  });
});
