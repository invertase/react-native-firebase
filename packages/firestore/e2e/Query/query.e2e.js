/*
 *  Copyright (c) 2016-present Invertase Limited & Contributors
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this library except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
const COLLECTION = 'firestore';

describe('FirestoreQuery/FirestoreQueryModifiers', function () {
  describe('v8 compatibility', function () {
    beforeEach(async function beforeEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterEach(async function afterEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    it('should not mutate previous queries (#2691)', async function () {
      const queryBefore = firebase.firestore().collection(COLLECTION).where('age', '>', 30);
      const queryAfter = queryBefore.orderBy('age');
      queryBefore._modifiers._orders.length.should.equal(0);
      queryBefore._modifiers._filters.length.should.equal(1);

      queryAfter._modifiers._orders.length.should.equal(1);
      queryAfter._modifiers._filters.length.should.equal(1);
    });

    it('throws if where equality operator is invoked, and the where fieldPath parameter matches any orderBy parameter', async function () {
      try {
        firebase
          .firestore()
          .collection(COLLECTION)
          .where('foo', '==', 'bar')
          .orderBy('foo')
          .limit(1)
          .endAt(2);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('Invalid query');
      }

      try {
        firebase
          .firestore()
          .collection(COLLECTION)
          .where('foo', '==', 'bar')
          .orderBy('bar')
          .orderBy('foo')
          .limit(1)
          .endAt(2);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('Invalid query');
      }
    });

    it('should allow inequality where fieldPath that does not match initial orderBy parameter', async function () {
      const colRef = firebase
        .firestore()
        // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
        // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
        .collection(`${COLLECTION}/${Utils.randString(12, '#aA')}/order-asc`);

      await colRef.add({ value: 1, foo: 'baz' });
      await colRef.add({ value: 2, foo: 'bar' });
      await colRef.add({ value: 3, foo: 'baz' });
      await colRef.add({ value: 4, foo: 'bar' });
      await colRef.add({ value: 5, foo: 'baz' });

      const snapshot = await colRef.where('foo', '!=', 'bar').orderBy('value', 'desc').get();
      const expected = [5, 3, 1];

      snapshot.forEach((docSnap, i) => {
        docSnap.data().value.should.eql(expected[i]);
      });
    });

    it('should allow inequality where fieldPath that does not match initial orderBy parameter - multiple where filters', async function () {
      const colRef = firebase
        .firestore()
        // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
        // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
        .collection(`${COLLECTION}/${Utils.randString(12, '#aA')}/order-asc`);

      await colRef.add({ value: 1, foo: 'baz' });
      await colRef.add({ value: 2, foo: 'bar' });
      await colRef.add({ value: 3, foo: 'baz' });
      await colRef.add({ value: 4, foo: 'bar' });
      await colRef.add({ value: 5, foo: 'baz' });

      let snapshot = await colRef
        .where('foo', '!=', 'bar')
        .where('value', '>', 2)
        .orderBy('value', 'desc')
        .get();
      let expected = [5, 3];

      snapshot.forEach((docSnap, i) => {
        docSnap.data().value.should.eql(expected[i]);
      });

      // flipped where order
      snapshot = await colRef
        .where('value', '>', 2)
        .where('foo', '!=', 'bar')
        .orderBy('value', 'desc')
        .get();
      const expected2 = [5, 3];

      snapshot.forEach((docSnap, i) => {
        docSnap.data().value.should.eql(expected2[i]);
      });
    });

    it('should allow multiple inequality where fieldPath with orderBy filters', async function () {
      const colRef = firebase
        .firestore()
        // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
        // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
        .collection(`${COLLECTION}/${Utils.randString(12, '#aA')}/order-asc`);

      await colRef.add({ value: 1, value2: 4 });
      await colRef.add({ value: 2, value2: 3 });
      await colRef.add({ value: 3, value2: 2 });
      await colRef.add({ value: 3, value2: 1 });

      const snapshot = await colRef
        .where('value', '>', 1)
        .where('value2', '<', 4)
        .orderBy('value', 'desc')
        .orderBy('value2', 'desc')
        .get();

      const expected = [2, 1, 3];

      snapshot.forEach((docSnap, i) => {
        docSnap.data().value2.should.eql(expected[i]);
      });
    });
  });

  describe('modular', function () {
    it('should not mutate previous queries (#2691)', async function () {
      const { getFirestore, collection, query, where, orderBy } = firestoreModular;
      const queryBefore = query(collection(getFirestore(), COLLECTION), where('age', '>', 30));
      const queryAfter = query(queryBefore, orderBy('age'));
      queryBefore._modifiers._orders.length.should.equal(0);
      queryBefore._modifiers._filters.length.should.equal(1);

      queryAfter._modifiers._orders.length.should.equal(1);
      queryAfter._modifiers._filters.length.should.equal(1);
    });

    it('throws if where equality operator is invoked, and the where fieldPath parameter matches any orderBy parameter', async function () {
      const { getFirestore, collection, query, where, orderBy, limit, endAt } = firestoreModular;
      const db = getFirestore();
      try {
        query(
          collection(db, COLLECTION),
          where('foo', '==', 'bar'),
          orderBy('foo'),
          limit(1),
          endAt(2),
        );
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('Invalid query');
      }

      try {
        query(
          collection(db, COLLECTION),
          where('foo', '==', 'bar'),
          orderBy('bar'),
          orderBy('foo'),
          limit(1),
          endAt(2),
        );
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('Invalid query');
      }
    });

    it('should allow inequality where fieldPath that does not match initial orderBy parameter', async function () {
      const { getFirestore, collection, addDoc, query, where, orderBy, getDocs } = firestoreModular;
      // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
      // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
      const colRef = collection(
        getFirestore(),
        `${COLLECTION}/${Utils.randString(12, '#aA')}/order-asc`,
      );

      await addDoc(colRef, { value: 1, foo: 'baz' });
      await addDoc(colRef, { value: 2, foo: 'bar' });
      await addDoc(colRef, { value: 3, foo: 'baz' });
      await addDoc(colRef, { value: 4, foo: 'bar' });
      await addDoc(colRef, { value: 5, foo: 'baz' });

      const q = query(colRef, where('foo', '!=', 'bar'), orderBy('value', 'desc'));
      const snapshot = await getDocs(q);
      const expected = [5, 3, 1];

      snapshot.forEach((docSnap, i) => {
        docSnap.data().value.should.eql(expected[i]);
      });
    });

    it('should allow inequality where fieldPath that does not match initial orderBy parameter - multiple where filters', async function () {
      const { getFirestore, collection, addDoc, query, where, orderBy, getDocs } = firestoreModular;
      // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
      // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
      const colRef = collection(
        getFirestore(),
        `${COLLECTION}/${Utils.randString(12, '#aA')}/order-asc`,
      );

      await addDoc(colRef, { value: 1, foo: 'baz' });
      await addDoc(colRef, { value: 2, foo: 'bar' });
      await addDoc(colRef, { value: 3, foo: 'baz' });
      await addDoc(colRef, { value: 4, foo: 'bar' });
      await addDoc(colRef, { value: 5, foo: 'baz' });

      const q = query(
        colRef,
        where('foo', '!=', 'bar'),
        where('value', '>', 2),
        orderBy('value', 'desc'),
      );
      const snapshot = await getDocs(q);
      const expected = [5, 3];

      snapshot.forEach((docSnap, i) => {
        docSnap.data().value.should.eql(expected[i]);
      });

      // flipped where order
      const q2 = query(
        colRef,
        where('value', '>', 2),
        where('foo', '!=', 'bar'),
        orderBy('value', 'desc'),
      );
      const snapshot2 = await getDocs(q2);
      const expected2 = [5, 3];

      snapshot2.forEach((docSnap, i) => {
        docSnap.data().value.should.eql(expected2[i]);
      });
    });

    it('should allow multiple inequality where fieldPath with orderBy filters', async function () {
      const { getFirestore, collection, addDoc, query, where, orderBy, getDocs } = firestoreModular;
      // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
      // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
      const colRef = collection(
        getFirestore(),
        `${COLLECTION}/${Utils.randString(12, '#aA')}/order-asc`,
      );

      await addDoc(colRef, { value: 1, value2: 4 });
      await addDoc(colRef, { value: 2, value2: 3 });
      await addDoc(colRef, { value: 3, value2: 2 });
      await addDoc(colRef, { value: 3, value2: 1 });

      const q = query(
        colRef,
        where('value', '>', 1),
        where('value2', '<', 4),
        orderBy('value', 'desc'),
        orderBy('value2', 'desc'),
      );
      const snapshot = await getDocs(q);
      const expected = [2, 1, 3];

      snapshot.forEach((docSnap, i) => {
        docSnap.data().value2.should.eql(expected[i]);
      });
    });
  });
});
