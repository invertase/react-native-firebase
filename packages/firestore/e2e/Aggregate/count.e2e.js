/*
 * Copyright (c) 2022-present Invertase Limited & Contributors
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
const COLLECTION = 'firestore';
const { wipe } = require('../helpers');
describe('firestore().collection().count()', function () {
  before(function () {
    return wipe();
  });

  it('throws if no argument provided', function () {
    try {
      firebase.firestore().collection(COLLECTION).startAt();
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        'Expected a DocumentSnapshot or list of field values but got undefined',
      );
      return Promise.resolve();
    }
  });

  it('gets count of collection reference - unfiltered', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/count/collection`);

    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');
    await Promise.all([
      doc1.set({ foo: 1, bar: { value: 1 } }),
      doc2.set({ foo: 2, bar: { value: 2 } }),
      doc3.set({ foo: 3, bar: { value: 3 } }),
    ]);

    const qs = await colRef.count().get();
    qs.data().count.should.eql(3);
  });
  it('gets countFromServer of collection reference - unfiltered', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/count/collection`);

    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');
    await Promise.all([
      doc1.set({ foo: 1, bar: { value: 1 } }),
      doc2.set({ foo: 2, bar: { value: 2 } }),
      doc3.set({ foo: 3, bar: { value: 3 } }),
    ]);

    const qs = await colRef.countFromServer().get();
    qs.data().count.should.eql(3);
  });
  it('gets correct count of collection reference - where equal', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/count/collection`);

    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');
    await Promise.all([
      doc1.set({ foo: 1, bar: { value: 1 } }),
      doc2.set({ foo: 2, bar: { value: 2 } }),
      doc3.set({ foo: 3, bar: { value: 3 } }),
    ]);

    const qs = await colRef.where('foo', '==', 3).count().get();
    qs.data().count.should.eql(1);
  });

  // TODO
  // - test behavior when firestore is offline (network disconnected or actually offline?)
  // - test AggregateQuery.query()
});
