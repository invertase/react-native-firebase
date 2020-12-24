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
const COLLECTION = 'firestore';
const { wipe } = require('../helpers');
describe('firestore().collection().starAt()', function () {
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

  it('throws if a inconsistent order number', function () {
    try {
      firebase.firestore().collection(COLLECTION).orderBy('foo').startAt('bar', 'baz');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('The number of arguments must be less than or equal');
      return Promise.resolve();
    }
  });

  it('throws if providing snapshot and field values', async function () {
    try {
      const doc = await firebase.firestore().doc(`${COLLECTION}/foo`).get();
      firebase.firestore().collection(COLLECTION).startAt(doc, 'baz');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('Expected DocumentSnapshot or list of field values');
      return Promise.resolve();
    }
  });

  it('throws if provided snapshot does not exist', async function () {
    try {
      const doc = await firebase.firestore().doc(`${COLLECTION}/idonotexist`).get();
      firebase.firestore().collection(COLLECTION).startAt(doc);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("Can't use a DocumentSnapshot that doesn't exist");
      return Promise.resolve();
    }
  });

  it('throws if order used with snapshot but fields do not exist', async function () {
    try {
      const doc = firebase.firestore().doc(`${COLLECTION}/iexist`);

      await doc.set({ foo: { bar: 'baz' } });
      const snap = await doc.get();

      firebase.firestore().collection(COLLECTION).orderBy('foo.baz').startAt(snap);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        'You are trying to start or end a query using a document for which the field',
      );
      return Promise.resolve();
    }
  });

  it('starts at field values', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/startAt/collection`);
    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');

    await Promise.all([
      doc1.set({ foo: 1, bar: { value: 1 } }),
      doc2.set({ foo: 2, bar: { value: 2 } }),
      doc3.set({ foo: 3, bar: { value: 3 } }),
    ]);

    const qs = await colRef.orderBy('bar.value', 'desc').startAt(2).get();

    qs.docs.length.should.eql(2);
    qs.docs[0].id.should.eql('doc2');
    qs.docs[1].id.should.eql('doc1');
  });

  it('starts at snapshot field values', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/startAt/snapshotFields`);
    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');

    await Promise.all([
      doc1.set({ foo: 1, bar: { value: 'a' } }),
      doc2.set({ foo: 2, bar: { value: 'b' } }),
      doc3.set({ foo: 3, bar: { value: 'c' } }),
    ]);

    const startAt = await doc2.get();

    const qs = await colRef.orderBy('bar.value').startAt(startAt).get();

    qs.docs.length.should.eql(2);
    qs.docs[0].id.should.eql('doc2');
    qs.docs[1].id.should.eql('doc3');
  });

  it('startAt at snapshot', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/endsAt/snapshot`);
    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');

    await Promise.all([doc1.set({ foo: 1 }), doc2.set({ foo: 1 }), doc3.set({ foo: 1 })]);

    const startAt = await doc2.get();

    const qs = await colRef.startAt(startAt).get();

    qs.docs.length.should.eql(2);
    qs.docs[0].id.should.eql('doc2');
    qs.docs[1].id.should.eql('doc3');
  });
});
