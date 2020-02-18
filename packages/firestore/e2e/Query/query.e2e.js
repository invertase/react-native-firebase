/*
 *  Copyright (c) 2016-present Invertase Limited & Contributors
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this library except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

describe('FirestoreQuery/FirestoreQueryModifiers', () => {
  it('should not mutate previous queries (#2691)', async () => {
    const queryBefore = firebase
      .firestore()
      .collection('users')
      .where('age', '>', 30);
    const queryAfter = queryBefore.orderBy('age');
    queryBefore._modifiers._orders.length.should.equal(0);
    queryBefore._modifiers._filters.length.should.equal(1);

    queryAfter._modifiers._orders.length.should.equal(1);
    queryAfter._modifiers._filters.length.should.equal(1);
  });

  it('throws if where equality operator is invoked, and the where fieldPath parameter matches any orderBy parameter', async () => {
    try {
      firebase
        .firestore()
        .collection('v6')
        .where('foo', '==', 'bar')
        .orderBy('foo')
        .limit(1)
        .endAt(2);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('Invalid query');
    }

    try {
      firebase
        .firestore()
        .collection('v6')
        .where('foo', '==', 'bar')
        .orderBy('bar')
        .orderBy('foo')
        .limit(1)
        .endAt(2);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('Invalid query');
    }
  });

  it('throws if where inequality operator is invoked, and the where fieldPath does not match initial orderBy parameter', async () => {
    try {
      firebase
        .firestore()
        .collection('v6')
        .where('foo', '>', 'bar')
        .orderBy('bar')
        .orderBy('foo')
        .limit(1)
        .endAt(2);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('Invalid query');
    }
  });
});
