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
const COLLECTION = 'firestore';

describe('firestore().collection().endAt()', function () {
  before(function () {
    return wipe();
  });

  describe('v8 compatibility', function () {
    it('throws if no argument provided', function () {
      try {
        firebase.firestore().collection(COLLECTION).endAt();
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
        firebase.firestore().collection(COLLECTION).orderBy('foo').endAt('bar', 'baz');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('The number of arguments must be less than or equal');
        return Promise.resolve();
      }
    });

    it('throws if providing snapshot and field values', async function () {
      try {
        const doc = await firebase.firestore().collection(COLLECTION).doc('foo').get();
        firebase.firestore().collection(COLLECTION).endAt(doc, 'baz');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('Expected DocumentSnapshot or list of field values');
        return Promise.resolve();
      }
    });

    it('throws if provided snapshot does not exist', async function () {
      try {
        const doc = await firebase.firestore().doc(`${COLLECTION}/idonotexist`).get();
        firebase.firestore().collection(COLLECTION).endAt(doc);
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

        firebase.firestore().collection(COLLECTION).orderBy('foo.baz').endAt(snap);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'You are trying to start or end a query using a document for which the field',
        );
        return Promise.resolve();
      }
    });

    it('ends at field values', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/endsAt/collection`);
      const doc1 = colRef.doc('doc1');
      const doc2 = colRef.doc('doc2');
      const doc3 = colRef.doc('doc3');

      await Promise.all([
        doc1.set({ foo: 1, bar: { value: 1 } }),
        doc2.set({ foo: 2, bar: { value: 2 } }),
        doc3.set({ foo: 3, bar: { value: 3 } }),
      ]);

      const qs = await colRef.orderBy('bar.value', 'desc').endAt(2).get();

      qs.docs.length.should.eql(2);
      qs.docs[0].id.should.eql('doc3');
      qs.docs[1].id.should.eql('doc2');
    });

    it('ends at snapshot field values', async function () {
      // await Utils.sleep(3000);
      const colRef = firebase.firestore().collection(`${COLLECTION}/endsAt/snapshotFields`);
      const doc1 = colRef.doc('doc1');
      const doc2 = colRef.doc('doc2');
      const doc3 = colRef.doc('doc3');

      await Promise.all([
        doc1.set({ foo: 1, bar: { value: 3 } }),
        doc2.set({ foo: 2, bar: { value: 2 } }),
        doc3.set({ foo: 3, bar: { value: 1 } }),
      ]);

      const endAt = await doc2.get();

      const qs = await colRef.orderBy('bar.value').endAt(endAt).get();

      qs.docs.length.should.eql(2);
      qs.docs[0].id.should.eql('doc3');
      qs.docs[1].id.should.eql('doc2');
    });

    it('ends at snapshot', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/endsAt/snapshot`);
      const doc1 = colRef.doc('doc1');
      const doc2 = colRef.doc('doc2');
      const doc3 = colRef.doc('doc3');

      await Promise.all([doc1.set({ foo: 1 }), doc2.set({ foo: 1 }), doc3.set({ foo: 1 })]);

      const endAt = await doc2.get();

      const qs = await colRef.endAt(endAt).get();

      qs.docs.length.should.eql(2);
      qs.docs[0].id.should.eql('doc1');
      qs.docs[1].id.should.eql('doc2');
    });
  });

  describe('modular', function () {
    it('throws if no argument provided', function () {
      const { getFirestore, collection, endAt, query } = firestoreModular;
      try {
        query(collection(getFirestore(), COLLECTION), endAt());
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'Expected a DocumentSnapshot or list of field values but got undefined',
        );
        return Promise.resolve();
      }
    });

    it('throws if a inconsistent order number', function () {
      const { getFirestore, collection, orderBy, endAt, query } = firestoreModular;
      try {
        query(collection(getFirestore(), COLLECTION), orderBy('foo'), endAt('bar', 'baz'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('The number of arguments must be less than or equal');
        return Promise.resolve();
      }
    });

    it('throws if providing snapshot and field values', async function () {
      const { getFirestore, collection, doc, endAt, query, getDoc } = firestoreModular;
      const db = getFirestore();
      try {
        const docRef = await getDoc(doc(collection(db, COLLECTION), 'foo'));
        query(collection(db, COLLECTION), endAt(docRef, 'baz'));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('Expected DocumentSnapshot or list of field values');
        return Promise.resolve();
      }
    });

    it('throws if provided snapshot does not exist', async function () {
      const { getFirestore, collection, doc, endAt, query, getDoc } = firestoreModular;
      const db = getFirestore();
      try {
        const docSnapshot = await getDoc(doc(db, `${COLLECTION}/idonotexist`));
        query(collection(db, COLLECTION), endAt(docSnapshot));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("Can't use a DocumentSnapshot that doesn't exist");
        return Promise.resolve();
      }
    });

    it('throws if order used with snapshot but fields do not exist', async function () {
      const { getFirestore, collection, doc, setDoc, getDoc, endAt, orderBy, query } =
        firestoreModular;
      const db = getFirestore();
      try {
        const docRef = doc(db, `${COLLECTION}/iexist`);
        await setDoc(docRef, { foo: { bar: 'baz' } });
        const snap = await getDoc(docRef);

        query(collection(db, COLLECTION), orderBy('foo.baz'), endAt(snap));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'You are trying to start or end a query using a document for which the field',
        );
        return Promise.resolve();
      }
    });

    it('ends at field values', async function () {
      const { getFirestore, collection, doc, setDoc, getDocs, endAt, orderBy, query } =
        firestoreModular;
      const db = getFirestore();

      const colRef = collection(db, `${COLLECTION}/endsAt/collection`);
      const doc1 = doc(colRef, 'doc1');
      const doc2 = doc(colRef, 'doc2');
      const doc3 = doc(colRef, 'doc3');

      await Promise.all([
        setDoc(doc1, { foo: 1, bar: { value: 1 } }),
        setDoc(doc2, { foo: 2, bar: { value: 2 } }),
        setDoc(doc3, { foo: 3, bar: { value: 3 } }),
      ]);

      const qs = await getDocs(query(colRef, orderBy('bar.value', 'desc'), endAt(2)));

      qs.docs.length.should.eql(2);
      qs.docs[0].id.should.eql('doc3');
      qs.docs[1].id.should.eql('doc2');
    });

    it('ends at snapshot field values', async function () {
      const { getFirestore, collection, doc, setDoc, getDocs, getDoc, endAt, orderBy, query } =
        firestoreModular;
      // await Utils.sleep(3000);
      const colRef = collection(getFirestore(), `${COLLECTION}/endsAt/snapshotFields`);
      const doc1 = doc(colRef, 'doc1');
      const doc2 = doc(colRef, 'doc2');
      const doc3 = doc(colRef, 'doc3');

      await Promise.all([
        setDoc(doc1, { foo: 1, bar: { value: 3 } }),
        setDoc(doc2, { foo: 2, bar: { value: 2 } }),
        setDoc(doc3, { foo: 3, bar: { value: 1 } }),
      ]);

      const endAtSnapshot = await getDoc(doc2);

      const qs = await getDocs(query(colRef, orderBy('bar.value'), endAt(endAtSnapshot)));

      qs.docs.length.should.eql(2);
      qs.docs[0].id.should.eql('doc3');
      qs.docs[1].id.should.eql('doc2');
    });

    it('ends at snapshot', async function () {
      const { getFirestore, collection, doc, setDoc, getDocs, getDoc, endAt, query } =
        firestoreModular;

      const colRef = collection(getFirestore(), `${COLLECTION}/endsAt/snapshot`);
      const doc1 = doc(colRef, 'doc1');
      const doc2 = doc(colRef, 'doc2');
      const doc3 = doc(colRef, 'doc3');

      await Promise.all([
        setDoc(doc1, { foo: 1 }),
        setDoc(doc2, { foo: 1 }),
        setDoc(doc3, { foo: 1 }),
      ]);

      const endAtSnapshot = await getDoc(doc2);

      const qs = await getDocs(query(colRef, endAt(endAtSnapshot)));

      qs.docs.length.should.eql(2);
      qs.docs[0].id.should.eql('doc1');
      qs.docs[1].id.should.eql('doc2');
    });
  });
});
