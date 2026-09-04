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

describe('firestore.doc().get()', function () {
  before(function () {
    return wipe();
  });

  describe('modular', function () {
    it('gets data from default source', async function () {
      const { getFirestore, doc, setDoc, getDoc, deleteDoc } = firestoreModular;

      const ref = doc(getFirestore(), `${COLLECTION}/get`);
      const data = { foo: 'bar', bar: 123 };
      await setDoc(ref, data);
      const snapshot = await getDoc(ref);
      snapshot.data().should.eql(jet.contextify(data));
      await deleteDoc(ref);
    });

    it('gets data from the server', async function () {
      const { getFirestore, doc, setDoc, getDocFromServer, deleteDoc } = firestoreModular;

      const ref = doc(getFirestore(), `${COLLECTION}/get`);
      const data = { foo: 'bar', bar: 123 };
      await setDoc(ref, data);
      const snapshot = await getDocFromServer(ref);
      snapshot.data().should.eql(jet.contextify(data));
      snapshot.metadata.fromCache.should.equal(false);
      await deleteDoc(ref);
    });

    it('gets data from cache', async function () {
      if (Platform.other) {
        return;
      }
      const { getFirestore, doc, setDoc, getDocFromCache, deleteDoc } = firestoreModular;

      const ref = doc(getFirestore(), `${COLLECTION}/get`);
      const data = { foo: 'bar', bar: 123 };
      await setDoc(ref, data);
      const snapshot = await getDocFromCache(ref);
      snapshot.data().should.eql(jet.contextify(data));
      snapshot.metadata.fromCache.should.equal(true);
      await deleteDoc(ref);
    });

    // Android documentGet: getOptions null / missing "source" → Source.DEFAULT (L125).
    // Modular getDoc always passes { source: 'default' }; DocumentReference.get() does not.
    it('gets data when DocumentReference.get omits options', async function () {
      const { getFirestore, doc, setDoc, deleteDoc } = firestoreModular;

      const ref = doc(getFirestore(), `${COLLECTION}/get-omit-options`);
      const data = { foo: 'omit', bar: 1 };
      await setDoc(ref, data);
      const snapshot = await ref.get();
      snapshot.data().should.eql(jet.contextify(data));
      await deleteDoc(ref);
    });

    it('gets data when DocumentReference.get passes empty options', async function () {
      const { getFirestore, doc, setDoc, deleteDoc } = firestoreModular;

      const ref = doc(getFirestore(), `${COLLECTION}/get-empty-options`);
      const data = { foo: 'empty', bar: 2 };
      await setDoc(ref, data);
      const snapshot = await ref.get({});
      snapshot.data().should.eql(jet.contextify(data));
      await deleteDoc(ref);
    });

    // Android documentGet failure arm → rejectPromiseFirestoreException (L142).
    it('rejects when getting a missing document from cache', async function () {
      if (Platform.other) {
        return;
      }
      const { getFirestore, doc, getDocFromCache } = firestoreModular;

      const ref = doc(getFirestore(), `${COLLECTION}/never-cached-${Date.now()}`);
      try {
        await getDocFromCache(ref);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.code.should.equal('firestore/unavailable');
      }
    });
  });
});
