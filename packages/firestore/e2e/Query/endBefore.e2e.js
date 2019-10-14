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

describe('firestore().collection().endBefore()', () => {
  before(() => wipe());

  it('throws if no argument provided', () => {
    try {
      firebase
        .firestore()
        .collection('v6')
        .endBefore();
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        'Expected a DocumentSnapshot or list of field values but got undefined',
      );
      return Promise.resolve();
    }
  });

  it('throws if a inconsistent order number', () => {
    try {
      firebase
        .firestore()
        .collection('v6')
        .orderBy('foo')
        .endBefore('bar', 'baz');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('The number of arguments must be less than or equal');
      return Promise.resolve();
    }
  });

  it('throws if providing snapshot and field values', async () => {
    try {
      const doc = await firebase
        .firestore()
        .doc('v6/foo')
        .get();
      firebase
        .firestore()
        .collection('v6')
        .endBefore(doc, 'baz');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('Expected DocumentSnapshot or list of field values');
      return Promise.resolve();
    }
  });

  it('throws if provided snapshot does not exist', async () => {
    try {
      const doc = await firebase
        .firestore()
        .doc('v6/idonotexist')
        .get();
      firebase
        .firestore()
        .collection('v6')
        .endBefore(doc);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("Can't use a DocumentSnapshot that doesn't exist");
      return Promise.resolve();
    }
  });

  it('throws if order used with snapshot but fields do not exist', async () => {
    try {
      const doc = firebase.firestore().doc('v6/iexist');
      await doc.set({ foo: { bar: 'baz' } });
      const snap = await doc.get();

      firebase
        .firestore()
        .collection('v6')
        .orderBy('foo.baz')
        .endBefore(snap);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        'You are trying to start or end a query using a document for which the field',
      );
      return Promise.resolve();
    }
  });

  it('ends before field values', async () => {
    const colRef = firebase.firestore().collection('v6/endBefore/collection');
    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');

    await Promise.all([
      doc1.set({ foo: 1, bar: { value: 1 } }),
      doc2.set({ foo: 2, bar: { value: 2 } }),
      doc3.set({ foo: 3, bar: { value: 3 } }),
    ]);

    const qs = await colRef
      .orderBy('bar.value', 'desc')
      .endBefore(2)
      .get();

    qs.docs.length.should.eql(1);
    qs.docs[0].id.should.eql('doc3');
  });

  it('ends before snapshot field values', async () => {
    const colRef = firebase.firestore().collection('v6/endBefore/snapshotFields');
    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');

    await Promise.all([
      doc1.set({ foo: 1, bar: { value: 3 } }),
      doc2.set({ foo: 2, bar: { value: 2 } }),
      doc3.set({ foo: 3, bar: { value: 1 } }),
    ]);

    const endBefore = await doc2.get();

    const qs = await colRef
      .orderBy('bar.value')
      .endBefore(endBefore)
      .get();

    qs.docs.length.should.eql(1);
    qs.docs[0].id.should.eql('doc3');
  });

  it('ends before snapshot', async () => {
    const colRef = firebase.firestore().collection('v6/endBefore/snapshot');
    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');

    await Promise.all([doc1.set({ foo: 1 }), doc2.set({ foo: 1 }), doc3.set({ foo: 1 })]);

    const endBefore = await doc2.get();

    const qs = await colRef.endBefore(endBefore).get();

    qs.docs.length.should.eql(1);
    qs.docs[0].id.should.eql('doc1');
  });
});
