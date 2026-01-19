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

describe('firestore.VectorValue', function () {
  describe('modular', function () {
    function ref(id) {
      const { doc, getFirestore } = firestoreModular;
      return doc(getFirestore(), `${COLLECTION}/vector_${id}`);
    }

    it('writes and reads a vector', async function () {
      const { setDoc, getDoc, vector } = firestoreModular;

      const r = ref('basic');
      await setDoc(r, { embedding: vector([0.12, 0.34, 0.56]) });

      const snap = await getDoc(r);
      const v = snap.get('embedding');
      should.exist(v);
      v.toArray().should.eql([0.12, 0.34, 0.56]);
    });

    it('supports vectors in nested structures', async function () {
      const { setDoc, getDoc, vector } = firestoreModular;

      const r = ref('nested');
      await setDoc(r, {
        a: { b: vector([1, 2, 3]) },
      });

      const snap = await getDoc(r);
      snap.get('a').b.toArray().should.eql([1, 2, 3]);
    });

    it('updates a vector field', async function () {
      const { setDoc, getDoc, updateDoc, vector } = firestoreModular;

      const r = ref('update');
      await setDoc(r, { x: 1 });
      await updateDoc(r, { embedding: vector([9, 8, 7]) });

      const snap = await getDoc(r);
      snap.get('embedding').toArray().should.eql([9, 8, 7]);
    });

    it('batch writes a vector', async function () {
      const { getFirestore, writeBatch, getDoc, vector } = firestoreModular;
      const r = ref('batch');
      const b = writeBatch(getFirestore());
      b.set(r, { embedding: vector([0.1, 0.2]) });
      await b.commit();

      const snap = await getDoc(r);
      snap.get('embedding').toArray().should.eql([0.1, 0.2]);
    });

    it('transaction writes a vector', async function () {
      const { getFirestore, runTransaction, getDoc, vector } = firestoreModular;
      const r = ref('transaction');
      await runTransaction(getFirestore(), async tx => {
        tx.set(r, { embedding: vector([3.14, 2.72]) });
      });

      const snap = await getDoc(r);
      snap.get('embedding').toArray().should.eql([3.14, 2.72]);
    });
  });
});
