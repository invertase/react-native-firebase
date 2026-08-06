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
  });
});
