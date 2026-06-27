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

describe('database().ref().isEqual()', function () {
  describe('modular', function () {
    it('throws if limit other param is not a query instance', async function () {
      const { getDatabase, ref } = databaseModular;

      try {
        ref(getDatabase()).isEqual('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'other' must be an instance of Query.");
        return Promise.resolve();
      }
    });

    it('returns true if the query is the same instance', async function () {
      const { getDatabase, ref } = databaseModular;

      const dbRef = ref(getDatabase());
      const same = dbRef.isEqual(dbRef);
      same.should.eql(true);
    });

    it('returns false if the query is different', async function () {
      const { getDatabase, ref, limitToLast, query } = databaseModular;

      const dbRef = ref(getDatabase());
      const other = query(dbRef, limitToLast(2));
      const same = dbRef.isEqual(other);
      same.should.eql(false);
    });

    it('returns true if the query is created differently', async function () {
      const { getDatabase, ref, limitToFirst, orderByChild, query } = databaseModular;

      const dbRef = ref(getDatabase());
      const dbQuery = query(dbRef, limitToFirst(1), orderByChild('foo'));
      const other = query(dbRef, orderByChild('foo'), limitToFirst(1));
      const same = dbQuery.isEqual(other);
      same.should.eql(true);
    });
  });
});
