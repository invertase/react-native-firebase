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

describe('firestore().doc() -> snapshot', function () {
  before(function () {
    return wipe();
  });

  describe('v8 compatibility', function () {
    it('.exists -> returns a boolean for exists', async function () {
      const ref1 = firebase.firestore().doc(`${COLLECTION}/exists`);
      const ref2 = firebase.firestore().doc(`${COLLECTION}/idonotexist`);
      await ref1.set({ foo: ' bar' });
      const snapshot1 = await ref1.get();
      const snapshot2 = await ref2.get();

      snapshot1.exists.should.equal(true);
      snapshot2.exists.should.equal(false);
      await ref1.delete();
    });

    it('.id -> returns the correct id', async function () {
      const ref1 = firebase.firestore().doc(`${COLLECTION}/exists`);
      const ref2 = firebase.firestore().doc(`${COLLECTION}/idonotexist`);
      await ref1.set({ foo: ' bar' });
      const snapshot1 = await ref1.get();
      const snapshot2 = await ref2.get();

      snapshot1.id.should.equal('exists');
      snapshot2.id.should.equal('idonotexist');
      await ref1.delete();
    });

    it('.metadata -> returns a SnapshotMetadata instance', async function () {
      const ref = firebase.firestore().doc(`${COLLECTION}/exists`);
      const snapshot = await ref.get();
      snapshot.metadata.constructor.name.should.eql('FirestoreSnapshotMetadata');
    });

    it('.ref -> returns the correct document ref', async function () {
      const ref1 = firebase.firestore().doc(`${COLLECTION}/exists`);
      const ref2 = firebase.firestore().doc(`${COLLECTION}/idonotexist`);
      await ref1.set({ foo: ' bar' });
      const snapshot1 = await ref1.get();
      const snapshot2 = await ref2.get();

      snapshot1.ref.path.should.equal(`${COLLECTION}/exists`);
      snapshot2.ref.path.should.equal(`${COLLECTION}/idonotexist`);
      await ref1.delete();
    });
  });

  describe('modular', function () {
    it('.exists -> returns a boolean for exists', async function () {
      const { getFirestore, doc, setDoc, getDoc, deleteDoc } = firestoreModular;
      const db = getFirestore(firebase.app());

      const ref1 = doc(db, `${COLLECTION}/exists`);
      const ref2 = doc(db, `${COLLECTION}/idonotexist`);
      await setDoc(ref1, { foo: ' bar' });
      const snapshot1 = await getDoc(ref1);
      const snapshot2 = await getDoc(ref2);

      snapshot1.exists.should.equal(true);
      snapshot2.exists.should.equal(false);
      await deleteDoc(ref1);
    });

    it('.id -> returns the correct id', async function () {
      const { getFirestore, doc, setDoc, getDoc, deleteDoc } = firestoreModular;
      const db = getFirestore(firebase.app());

      const ref1 = doc(db, `${COLLECTION}/exists`);
      const ref2 = doc(db, `${COLLECTION}/idonotexist`);
      await setDoc(ref1, { foo: ' bar' });
      const snapshot1 = await getDoc(ref1);
      const snapshot2 = await getDoc(ref2);

      snapshot1.id.should.equal('exists');
      snapshot2.id.should.equal('idonotexist');
      await deleteDoc(ref1);
    });

    it('.metadata -> returns a SnapshotMetadata instance', async function () {
      const { getFirestore, doc, getDoc } = firestoreModular;
      const ref = doc(getFirestore(), `${COLLECTION}/exists`);
      const snapshot = await getDoc(ref);
      snapshot.metadata.constructor.name.should.eql('FirestoreSnapshotMetadata');
    });

    it('.ref -> returns the correct document ref', async function () {
      const { getFirestore, doc, setDoc, getDoc, deleteDoc } = firestoreModular;
      const db = getFirestore(firebase.app());
      const ref1 = doc(db, `${COLLECTION}/exists`);
      const ref2 = doc(db, `${COLLECTION}/idonotexist`);
      await setDoc(ref1, { foo: ' bar' });
      const snapshot1 = await getDoc(ref1);
      const snapshot2 = await getDoc(ref2);

      snapshot1.ref.path.should.equal(`${COLLECTION}/exists`);
      snapshot2.ref.path.should.equal(`${COLLECTION}/idonotexist`);
      await deleteDoc(ref1);
    });
  });
});
