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

const TEST_PATH = `${PATH}/push`;

describe('database().ref().push()', function () {
  describe('modular', function () {
    it('returns a Promise when a value is passed', function () {
      const { getDatabase, ref, push, get } = databaseModular;

      const dbRef = ref(getDatabase(), `${TEST_PATH}/boop`);
      const pushed = push(dbRef, null);

      return pushed
        .then(childRef => {
          childRef.should.have.property('key').which.is.a.String();
          return get(childRef);
        })
        .then(snap => {
          should.equal(snap.val(), null);
          snap.ref.should.have.property('key').which.is.a.String();
        });
    });

    it('returns a promise and sets the provided value', async function () {
      const { getDatabase, ref, push, get } = databaseModular;

      const dbRef = ref(getDatabase(), `${TEST_PATH}/value`);
      const childRef = await push(dbRef, 6);

      childRef.should.have.property('key').which.is.a.String();

      const snap = await get(childRef);
      snap.val().should.equal(6);
      snap.ref.should.eql(childRef);
    });

    it('throws if push errors', async function () {
      const { getDatabase, ref, push } = databaseModular;

      const dbRef = ref(getDatabase(), 'nope');
      try {
        await push(dbRef, 'foo');
        return Promise.reject(new Error('Did not throw Error'));
      } catch (error) {
        error.code.should.equal('database/permission-denied');
        return Promise.resolve();
      }
    });
  });
});
