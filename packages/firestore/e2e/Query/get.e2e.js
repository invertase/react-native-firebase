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

describe('firestore().collection().get()', function () {
  before(function () {
    return wipe();
  });

  describe('modular', function () {
    it('returns a QuerySnapshot', async function () {
      const { getFirestore, collection, doc, getDocs } = firestoreModular;

      const docRef = doc(collection(getFirestore(), COLLECTION), 'nestedcollection');
      const colRef = collection(docRef, 'get');
      const snapshot = await getDocs(colRef);

      snapshot.constructor.name.should.eql('QuerySnapshot');
    });

    it('returns a correct cache setting (true)', async function () {
      if (Platform.other) {
        return;
      }

      const { getFirestore, collection, doc, getDocsFromCache } = firestoreModular;
      const docRef = doc(collection(getFirestore(), COLLECTION), 'nestedcollection');
      const colRef = collection(docRef, 'get');
      const snapshot = await getDocsFromCache(colRef);

      snapshot.constructor.name.should.eql('QuerySnapshot');
      snapshot.metadata.fromCache.should.be.True();
    });

    it('returns a correct cache setting (false)', async function () {
      const { getFirestore, collection, doc, getDocs, getDocsFromServer } = firestoreModular;
      const docRef = doc(collection(getFirestore(), COLLECTION), 'nestedcollection');
      const colRef = collection(docRef, 'get');
      await getDocs(colRef); // Puts it in cache
      const snapshot = await getDocsFromServer(colRef);

      snapshot.constructor.name.should.eql('QuerySnapshot');
      snapshot.metadata.fromCache.should.be.False();
    });
  });
});
