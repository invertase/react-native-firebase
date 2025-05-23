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

describe('firestore.doc().delete()', function () {
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

    it('deletes a document', async function () {
      const ref = firebase.firestore().doc(`${COLLECTION}/deleteme`);
      await ref.set({ foo: 'bar' });
      const snapshot1 = await ref.get();
      snapshot1.id.should.equal('deleteme');
      snapshot1.exists().should.equal(true);
      await ref.delete();
      const snapshot2 = await ref.get();
      snapshot2.id.should.equal('deleteme');
      snapshot2.exists().should.equal(false);
    });
  });

  describe('modular', function () {
    it('deletes a document', async function () {
      const { getFirestore, doc, setDoc, getDoc, deleteDoc } = firestoreModular;

      const ref = doc(getFirestore(), `${COLLECTION}/deleteme`);
      await setDoc(ref, { foo: 'bar' });
      const snapshot1 = await getDoc(ref);
      snapshot1.id.should.equal('deleteme');
      snapshot1.exists().should.equal(true);
      await deleteDoc(ref);
      const snapshot2 = await getDoc(ref);
      snapshot2.id.should.equal('deleteme');
      snapshot2.exists().should.equal(false);
    });
  });
});
