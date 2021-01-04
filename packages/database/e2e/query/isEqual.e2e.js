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
  it('throws if limit other param is not a query instance', async function () {
    try {
      await firebase.database().ref().isEqual('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'other' must be an instance of Query.");
      return Promise.resolve();
    }
  });

  it('returns true if the query is the same instance', async function () {
    const query = await firebase.database().ref();
    const same = query.isEqual(query);
    same.should.eql(true);
  });

  it('returns false if the query is different', async function () {
    const query = await firebase.database().ref();
    const other = await firebase.database().ref().limitToLast(2);
    const same = query.isEqual(other);
    same.should.eql(false);
  });

  it('returns true if the query is created differently', async function () {
    const query = await firebase.database().ref().limitToFirst(1).orderByChild('foo');
    const other = await firebase.database().ref().orderByChild('foo').limitToFirst(1);
    const same = query.isEqual(other);
    same.should.eql(true);
  });
});
