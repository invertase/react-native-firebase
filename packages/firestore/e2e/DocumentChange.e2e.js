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
const { wipe } = require('./helpers');
const COLLECTION = 'firestore';

describe('firestore.DocumentChange', function () {
  before(function () {
    return wipe();
  });

  describe('v8 compatibility', function () {
    beforeEach(async function beforeEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterEach(async function afterEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    it('.doc -> returns a DocumentSnapshot', async function () {
      if (Platform.other) {
        return;
      }

      const colRef = firebase.firestore().collection(COLLECTION);
      await colRef.add({});
      const snapshot = await colRef.limit(1).get();
      const changes = snapshot.docChanges();

      const docChange = changes[0];

      docChange.doc.constructor.name.should.eql('FirestoreDocumentSnapshot');
    });

    it('returns the correct metadata when adding and removing', async function () {
      if (Platform.other) {
        return;
      }
      const colRef = firebase
        .firestore()
        .collection(`${COLLECTION}/docChanges/docChangesCollection`);
      const doc1 = firebase.firestore().doc(`${COLLECTION}/docChanges/docChangesCollection/doc1`);

      // Set something in the database
      await doc1.set({ name: 'doc1' });

      // Subscribe to changes
      const callback = sinon.spy();
      const unsub = colRef.onSnapshot(callback);
      await Utils.spyToBeCalledOnceAsync(callback);

      // Validate docChange item exists
      callback.should.be.calledOnce();
      const changes1 = callback.args[0][0].docChanges();
      changes1.length.should.eql(1);
      changes1[0].newIndex.should.eql(0);
      changes1[0].oldIndex.should.eql(-1);
      changes1[0].type.should.eql('added');
      changes1[0].doc.data().name.should.eql('doc1');

      // Delete the document
      await doc1.delete();
      await Utils.sleep(800);

      // The QuerySnapshot should be empty
      callback.args[1][0].size.should.eql(0);

      // The docChanges should keep removed doc
      const changes2 = callback.args[1][0].docChanges();
      changes2.length.should.eql(1);

      changes2[0].doc.data().name.should.eql('doc1');
      changes2[0].type.should.eql('removed');
      changes2[0].newIndex.should.eql(-1);
      changes2[0].oldIndex.should.eql(0);

      unsub();
    });

    it('returns the correct metadata when modifying documents', async function () {
      if (Platform.other) {
        return;
      }
      const colRef = firebase.firestore().collection(`${COLLECTION}/docChanges/docMovedCollection`);

      const doc1 = firebase.firestore().doc(`${COLLECTION}/docChanges/docMovedCollection/doc1`);
      const doc2 = firebase.firestore().doc(`${COLLECTION}/docChanges/docMovedCollection/doc2`);
      const doc3 = firebase.firestore().doc(`${COLLECTION}/docChanges/docMovedCollection/doc3`);

      await Promise.all([doc1.set({ value: 1 }), doc2.set({ value: 2 }), doc3.set({ value: 3 })]);

      // Subscribe to changes
      const callback = sinon.spy();
      const unsub = colRef.orderBy('value').onSnapshot(callback);
      await Utils.spyToBeCalledOnceAsync(callback);

      // Validate docChange item exists
      callback.should.be.calledOnce();
      const changes1 = callback.args[0][0].docChanges();
      changes1.length.should.eql(3);

      changes1.forEach((dc, i) => {
        dc.oldIndex.should.eql(-1);
        dc.newIndex.should.eql(i);
        dc.doc.data().value.should.eql(i + 1);
      });

      // Update a document
      await doc1.update({ value: 4 });

      await Utils.sleep(800);

      const changes2 = callback.args[1][0].docChanges();
      changes2.length.should.eql(1);

      const dc = changes2[0];
      dc.type.should.eql('modified');
      dc.oldIndex.should.eql(0);
      dc.newIndex.should.eql(2);

      unsub();
    });
  });

  describe('modular', function () {
    it('.doc -> returns a DocumentSnapshot', async function () {
      if (Platform.other) {
        return;
      }

      const { getFirestore, collection, addDoc, limit, getDocs, query } = firestoreModular;
      const db = getFirestore();

      const colRef = collection(db, COLLECTION);
      await addDoc(colRef, {});
      const snapshot = await getDocs(query(colRef, limit(1)));
      const changes = snapshot.docChanges();

      const docChange = changes[0];

      docChange.doc.constructor.name.should.eql('FirestoreDocumentSnapshot');
    });

    it('returns the correct metadata when adding and removing', async function () {
      if (Platform.other) {
        return;
      }
      const { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc } = firestoreModular;
      const db = getFirestore();

      const colRef = collection(db, `${COLLECTION}/docChanges/docChangesCollection`);
      const doc1 = doc(db, `${COLLECTION}/docChanges/docChangesCollection/doc1`);

      // Set something in the database
      await setDoc(doc1, { name: 'doc1' });

      // Subscribe to changes
      const callback = sinon.spy();
      const unsub = onSnapshot(colRef, callback);
      await Utils.spyToBeCalledOnceAsync(callback);

      // Validate docChange item exists
      callback.should.be.calledOnce();
      const changes1 = callback.args[0][0].docChanges();
      changes1.length.should.eql(1);
      changes1[0].newIndex.should.eql(0);
      changes1[0].oldIndex.should.eql(-1);
      changes1[0].type.should.eql('added');
      changes1[0].doc.data().name.should.eql('doc1');

      // Delete the document
      await deleteDoc(doc1);
      await Utils.sleep(800);

      // The QuerySnapshot should be empty
      callback.args[1][0].size.should.eql(0);

      // The docChanges should keep removed doc
      const changes2 = callback.args[1][0].docChanges();
      changes2.length.should.eql(1);

      changes2[0].doc.data().name.should.eql('doc1');
      changes2[0].type.should.eql('removed');
      changes2[0].newIndex.should.eql(-1);
      changes2[0].oldIndex.should.eql(0);

      unsub();
    });

    it('returns the correct metadata when modifying documents', async function () {
      if (Platform.other) {
        return;
      }

      const { getFirestore, collection, doc, setDoc, orderBy, query, onSnapshot, updateDoc } =
        firestoreModular;
      const db = getFirestore();

      const colRef = collection(db, `${COLLECTION}/docChanges/docMovedCollection`);

      const doc1 = doc(db, `${COLLECTION}/docChanges/docMovedCollection/doc1`);
      const doc2 = doc(db, `${COLLECTION}/docChanges/docMovedCollection/doc2`);
      const doc3 = doc(db, `${COLLECTION}/docChanges/docMovedCollection/doc3`);

      await Promise.all([
        setDoc(doc1, { value: 1 }),
        setDoc(doc2, { value: 2 }),
        setDoc(doc3, { value: 3 }),
      ]);

      // Subscribe to changes
      const callback = sinon.spy();
      const unsub = onSnapshot(query(colRef, orderBy('value')), callback);
      await Utils.spyToBeCalledOnceAsync(callback);

      // Validate docChange item exists
      callback.should.be.calledOnce();
      const changes1 = callback.args[0][0].docChanges();
      changes1.length.should.eql(3);

      changes1.forEach((dc, i) => {
        dc.oldIndex.should.eql(-1);
        dc.newIndex.should.eql(i);
        dc.doc.data().value.should.eql(i + 1);
      });

      // Update a document
      await updateDoc(doc1, { value: 4 });

      await Utils.sleep(800);

      const changes2 = callback.args[1][0].docChanges();
      changes2.length.should.eql(1);

      const dc = changes2[0];
      dc.type.should.eql('modified');
      dc.oldIndex.should.eql(0);
      dc.newIndex.should.eql(2);

      unsub();
    });
  });
});
