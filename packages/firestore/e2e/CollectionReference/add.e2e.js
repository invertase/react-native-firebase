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

const { wipe } = require('../helpers');

describe('firestore.collection().add()', () => {
  before(() => wipe());

  it('throws if data is not an object', () => {
    try {
      firebase
        .firestore()
        .collection('foo')
        .add(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'data' must be an object");
      return Promise.resolve();
    }
  });

  it('adds a new document', async () => {
    const data = { foo: 'bar' };
    const docRef = await firebase
      .firestore()
      .collection('v6')
      .add(data);
    should.equal(docRef.constructor.name, 'FirestoreDocumentReference');
    const docSnap = await docRef.get();
    docSnap.data().should.eql(jet.contextify(data));
    docSnap.exists.should.eql(true);
    await docRef.delete();
  });
});
