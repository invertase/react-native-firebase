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

describe.only('firestore.VectorValue', function () {
  describe('v8 compatibility', function () {
    beforeEach(async function beforeEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterEach(async function afterEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    function ref(id) {
      return firebase.firestore().doc(`${COLLECTION}/vector_${id}`);
    }

    it('writes and reads a vector', async function () {
      const r = ref('basic');
      await r.set({ embedding: firebase.firestore.vector([0.12, 0.34, 0.56]) });

      const snap = await r.get();
      const v = snap.get('embedding');
      should.exist(v);
      v.values.should.eql([0.12, 0.34, 0.56]);
    });

    it('supports vectors in nested structures', async function () {
      const r = ref('nested');
      await r.set({
        a: { b: firebase.firestore.vector([1, 2, 3]) },
      });

      const snap = await r.get();
      snap.get('a').b.values.should.eql([1, 2, 3]);
    });

    it('updates a vector field', async function () {
      const r = ref('update');
      await r.set({ x: 1 });
      await r.update({ embedding: firebase.firestore.vector([9, 8, 7]) });

      const snap = await r.get();
      snap.get('embedding').values.should.eql([9, 8, 7]);
    });

    it('batch writes a vector', async function () {
      const r = ref('batch');
      const batch = firebase.firestore().batch();
      batch.set(r, { embedding: firebase.firestore.vector([0.1, 0.2]) });
      await batch.commit();

      const snap = await r.get();
      snap.get('embedding').values.should.eql([0.1, 0.2]);
    });

    it('transaction writes a vector', async function () {
      const r = ref('transaction');
      await firebase.firestore().runTransaction(async tx => {
        tx.set(r, { embedding: firebase.firestore.vector([3.14, 2.72]) });
      });

      const snap = await r.get();
      snap.get('embedding').values.should.eql([3.14, 2.72]);
    });
  });

  describe('modular', function () {
    function ref(id) {
      const { doc, getFirestore } = firestoreModular;
      return doc(getFirestore(), `${COLLECTION}/vector_${id}`);
    }

    it('writes and reads using modular vector()', async function () {
      // @ts-ignore test env provides firestoreModular
      const { setDoc, getDoc, vector } = firestoreModular;
      const r = ref('modular-basic');
      await setDoc(r, { embedding: vector([0.5, 0.25]) });
      const snap = await getDoc(r);
      const v = snap.get('embedding');
      should.exist(v);
      v.values.should.eql([0.5, 0.25]);
    });
  });
});
