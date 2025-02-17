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

describe('firestore.doc() -> snapshot.isEqual()', function () {
  describe('v8 compatibility', function () {
    beforeEach(async function beforeEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterEach(async function afterEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    it('throws if other is not a DocumentSnapshot', async function () {
      try {
        const docRef = firebase.firestore().doc(`${COLLECTION}/baz`);

        const docSnapshot = await docRef.get();
        docSnapshot.isEqual(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'other' expected a DocumentSnapshot instance");
        return Promise.resolve();
      }
    });

    it('returns false when not equal', async function () {
      const docRef = firebase.firestore().doc(`${COLLECTION}/isEqual-false-exists`);
      await docRef.set({ foo: 'bar' });

      const docSnapshot1 = await docRef.get();
      const docSnapshot2 = await firebase.firestore().doc(`${COLLECTION}/idonotexist`).get();
      await docRef.set({ foo: 'baz' });
      const docSnapshot3 = await docRef.get();

      const eql1 = docSnapshot1.isEqual(docSnapshot2);
      const eql2 = docSnapshot1.isEqual(docSnapshot3);

      eql1.should.be.False();
      eql2.should.be.False();
    });

    it('returns true when equal', async function () {
      const docRef = firebase.firestore().doc(`${COLLECTION}/isEqual-true-exists`);
      await docRef.set({ foo: 'bar' });

      const docSnapshot = await docRef.get();

      const eql1 = docSnapshot.isEqual(docSnapshot);

      eql1.should.be.True();
    });
  });

  describe('modular', function () {
    it('throws if other is not a DocumentSnapshot', async function () {
      const { getFirestore, doc, getDoc, snapshotEqual } = firestoreModular;
      try {
        const docRef = doc(getFirestore(), `${COLLECTION}/baz`);

        const docSnapshot = await getDoc(docRef);
        snapshotEqual(docSnapshot, 123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'other' expected a DocumentSnapshot instance");
        return Promise.resolve();
      }
    });

    it('returns false when not equal', async function () {
      const { getFirestore, doc, setDoc, getDoc, snapshotEqual } = firestoreModular;
      const db = getFirestore();
      const docRef = doc(db, `${COLLECTION}/isEqual-false-exists`);
      await setDoc(docRef, { foo: 'bar' });

      const docSnapshot1 = await getDoc(docRef);
      const docSnapshot2 = await getDoc(doc(db, `${COLLECTION}/idonotexist`));
      await setDoc(docRef, { foo: 'baz' });
      const docSnapshot3 = await getDoc(docRef);

      const eql1 = snapshotEqual(docSnapshot1, docSnapshot2);
      const eql2 = snapshotEqual(docSnapshot1, docSnapshot3);

      eql1.should.be.False();
      eql2.should.be.False();
    });

    it('returns true when equal', async function () {
      const { getFirestore, doc, setDoc, getDoc, snapshotEqual } = firestoreModular;
      const docRef = doc(getFirestore(), `${COLLECTION}/isEqual-true-exists`);
      await setDoc(docRef, { foo: 'bar' });

      const docSnapshot = await getDoc(docRef);

      const eql1 = snapshotEqual(docSnapshot, docSnapshot);

      eql1.should.be.True();
    });
  });
});
