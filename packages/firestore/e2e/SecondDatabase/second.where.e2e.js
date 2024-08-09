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

// This collection is only allowed on the second database
const COLLECTION = 'second-database';
const SECOND_DATABASE_ID = 'second-rnfb';

describe('Second Database', function () {
  describe('firestore().collection().where()', function () {
    describe('v8 compatibility', function () {
      let firestore;

      before(function () {
        firestore = firebase.app().firestore(SECOND_DATABASE_ID);
      });

      beforeEach(async function () {
        return await wipe(false, SECOND_DATABASE_ID);
      });

      it('throws if fieldPath is invalid', function () {
        try {
          firestore.collection(COLLECTION).where(123);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            'must be a string, instance of FieldPath or instance of Filter',
          );
          return Promise.resolve();
        }
      });

      it('throws if fieldPath string is invalid', function () {
        try {
          firestore.collection(COLLECTION).where('.foo.bar');
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'fieldPath' Invalid field path");
          return Promise.resolve();
        }
      });

      it('throws if operator string is invalid', function () {
        try {
          firestore.collection(COLLECTION).where('foo.bar', '!');
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'opStr' is invalid");
          return Promise.resolve();
        }
      });

      it('throws if query contains multiple array-contains', function () {
        try {
          firestore
            .collection(COLLECTION)
            .where('foo.bar', 'array-contains', 123)
            .where('foo.bar', 'array-contains', 123);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('Queries only support a single array-contains filter');
          return Promise.resolve();
        }
      });

      it('throws if value is not defined', function () {
        try {
          firestore.collection(COLLECTION).where('foo.bar', 'array-contains');
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'value' argument expected");
          return Promise.resolve();
        }
      });

      it('throws if null value and no equal operator', function () {
        try {
          firestore.collection(COLLECTION).where('foo.bar', 'array-contains', null);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('You can only perform equals comparisons on null');
          return Promise.resolve();
        }
      });

      it('allows null to be used with equal operator', function () {
        firestore.collection(COLLECTION).where('foo.bar', '==', null);
      });

      it('allows null to be used with not equal operator', function () {
        firestore.collection(COLLECTION).where('foo.bar', '!=', null);
      });

      it('allows inequality on the same path', function () {
        firestore
          .collection(COLLECTION)
          .where('foo.bar', '>', 123)
          .where(new firebase.firestore.FieldPath('foo', 'bar'), '>', 1234);
      });

      it('throws if in query with no array value', function () {
        try {
          firestore.collection(COLLECTION).where('foo.bar', 'in', '123');
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('A non-empty array is required');
          return Promise.resolve();
        }
      });

      it('throws if array-contains-any query with no array value', function () {
        try {
          firestore.collection(COLLECTION).where('foo.bar', 'array-contains-any', '123');
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('A non-empty array is required');
          return Promise.resolve();
        }
      });

      it('throws if in query array length is greater than 30', function () {
        try {
          const queryArray = Array.from({ length: 31 }, (_, i) => i + 1);

          firestore.collection(COLLECTION).where('foo.bar', 'in', queryArray);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('maximum of 30 elements in the value');
          return Promise.resolve();
        }
      });

      it('throws if query has multiple array-contains-any filter', function () {
        try {
          firestore
            .collection(COLLECTION)
            .where('foo.bar', 'array-contains-any', [1])
            .where('foo.bar', 'array-contains-any', [2]);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "You cannot use more than one 'array-contains-any' filter",
          );
          return Promise.resolve();
        }
      });

      /* Queries */

      it('returns with where equal filter', async function () {
        const colRef = firestore.collection(`${COLLECTION}/filter/equal`);

        const search = Date.now();
        await Promise.all([
          colRef.add({ foo: search }),
          colRef.add({ foo: search }),
          colRef.add({ foo: search + 1234 }),
        ]);

        const snapshot = await colRef.where('foo', '==', search).get();

        snapshot.size.should.eql(2);
        snapshot.forEach(s => {
          s.data().foo.should.eql(search);
        });
      });

      it('returns with where greater than filter', async function () {
        const colRef = firestore.collection(`${COLLECTION}/filter/greater`);

        const search = Date.now();
        await Promise.all([
          colRef.add({ foo: search - 1234 }),
          colRef.add({ foo: search }),
          colRef.add({ foo: search + 1234 }),
          colRef.add({ foo: search + 1234 }),
        ]);

        const snapshot = await colRef.where('foo', '>', search).get();

        snapshot.size.should.eql(2);
        snapshot.forEach(s => {
          s.data().foo.should.eql(search + 1234);
        });
      });

      it('returns with where greater than or equal filter', async function () {
        const colRef = firestore.collection(`${COLLECTION}/filter/greaterequal`);

        const search = Date.now();
        await Promise.all([
          colRef.add({ foo: search - 1234 }),
          colRef.add({ foo: search }),
          colRef.add({ foo: search + 1234 }),
          colRef.add({ foo: search + 1234 }),
        ]);

        const snapshot = await colRef.where('foo', '>=', search).get();

        snapshot.size.should.eql(3);
        snapshot.forEach(s => {
          s.data().foo.should.be.aboveOrEqual(search);
        });
      });

      it('returns with where less than filter', async function () {
        const colRef = firestore.collection(`${COLLECTION}/filter/less`);

        const search = -Date.now();
        await Promise.all([
          colRef.add({ foo: search + -1234 }),
          colRef.add({ foo: search + -1234 }),
          colRef.add({ foo: search }),
        ]);

        const snapshot = await colRef.where('foo', '<', search).get();

        snapshot.size.should.eql(2);
        snapshot.forEach(s => {
          s.data().foo.should.be.below(search);
        });
      });

      it('returns with where less than or equal filter', async function () {
        const colRef = firestore.collection(`${COLLECTION}/filter/lessequal`);

        const search = -Date.now();
        await Promise.all([
          colRef.add({ foo: search + -1234 }),
          colRef.add({ foo: search + -1234 }),
          colRef.add({ foo: search }),
          colRef.add({ foo: search + 1234 }),
        ]);

        const snapshot = await colRef.where('foo', '<=', search).get();

        snapshot.size.should.eql(3);
        snapshot.forEach(s => {
          s.data().foo.should.be.belowOrEqual(search);
        });
      });

      it('returns when combining greater than and lesser than on the same nested field', async function () {
        const colRef = firestore.collection(`${COLLECTION}/filter/greaterandless`);

        await Promise.all([
          colRef.doc('doc1').set({ foo: { bar: 1 } }),
          colRef.doc('doc2').set({ foo: { bar: 2 } }),
          colRef.doc('doc3').set({ foo: { bar: 3 } }),
        ]);

        const snapshot = await colRef
          .where('foo.bar', '>', 1)
          .where('foo.bar', '<', 3)
          .orderBy('foo.bar')
          .get();

        snapshot.size.should.eql(1);
      });

      it('returns when combining greater than and lesser than on the same nested field using FieldPath', async function () {
        const colRef = firestore.collection(`${COLLECTION}/filter/greaterandless`);

        await Promise.all([
          colRef.doc('doc1').set({ foo: { bar: 1 } }),
          colRef.doc('doc2').set({ foo: { bar: 2 } }),
          colRef.doc('doc3').set({ foo: { bar: 3 } }),
        ]);

        const snapshot = await colRef
          .where(new firebase.firestore.FieldPath('foo', 'bar'), '>', 1)
          .where(new firebase.firestore.FieldPath('foo', 'bar'), '<', 3)
          .orderBy(new firebase.firestore.FieldPath('foo', 'bar'))
          .get();

        snapshot.size.should.eql(1);
      });

      it('returns with where array-contains filter', async function () {
        const colRef = firestore.collection(`${COLLECTION}/filter/array-contains`);

        const match = Date.now();
        await Promise.all([
          colRef.add({ foo: [1, '2', match] }),
          colRef.add({ foo: [1, '2', match.toString()] }),
          colRef.add({ foo: [1, '2', match.toString()] }),
        ]);

        const snapshot = await colRef.where('foo', 'array-contains', match.toString()).get();
        const expected = [1, '2', match.toString()];

        snapshot.size.should.eql(2);
        snapshot.forEach(s => {
          s.data().foo.should.eql(jet.contextify(expected));
        });
      });

      it('returns with in filter', async function () {
        const colRef = firestore.collection(`${COLLECTION}/filter/in${Date.now() + ''}`);

        await Promise.all([
          colRef.add({ status: 'Ordered' }),
          colRef.add({ status: 'Ready to Ship' }),
          colRef.add({ status: 'Ready to Ship' }),
          colRef.add({ status: 'Incomplete' }),
        ]);

        const expect = ['Ready to Ship', 'Ordered'];
        const snapshot = await colRef.where('status', 'in', expect).get();
        snapshot.size.should.eql(3);

        snapshot.forEach(s => {
          s.data().status.should.equalOneOf(...expect);
        });
      });

      it('returns with array-contains-any filter', async function () {
        const colRef = firestore.collection(
          `${COLLECTION}/filter/array-contains-any${Date.now() + ''}`,
        );

        await Promise.all([
          colRef.add({ category: ['Appliances', 'Housewares', 'Cooking'] }),
          colRef.add({ category: ['Appliances', 'Electronics', 'Nursery'] }),
          colRef.add({ category: ['Audio/Video', 'Electronics'] }),
          colRef.add({ category: ['Beauty'] }),
        ]);

        const expect = ['Appliances', 'Electronics'];
        const snapshot = await colRef.where('category', 'array-contains-any', expect).get();
        snapshot.size.should.eql(3); // 2nd record should only be returned once
      });

      it('returns with a FieldPath', async function () {
        const colRef = firestore.collection(
          `${COLLECTION}/filter/where-fieldpath${Date.now() + ''}`,
        );
        const fieldPath = new firebase.firestore.FieldPath('map', 'foo.bar@gmail.com');

        await colRef.add({
          map: {
            'foo.bar@gmail.com': true,
          },
        });
        await colRef.add({
          map: {
            'bar.foo@gmail.com': true,
          },
        });

        const snapshot = await colRef.where(fieldPath, '==', true).get();
        snapshot.size.should.eql(1); // 2nd record should only be returned once
        const data = snapshot.docs[0].data();
        should.equal(data.map['foo.bar@gmail.com'], true);
      });

      it('should throw an error if you use a FieldPath on a filter in conjunction with an orderBy() parameter that is not FieldPath', async function () {
        try {
          firestore
            .collection(COLLECTION)
            .where(firebase.firestore.FieldPath.documentId(), 'in', ['document-id'])
            .orderBy('differentOrderBy', 'desc');

          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'FirestoreFieldPath' cannot be used in conjunction");
          return Promise.resolve();
        }
      });

      it('should correctly query integer values with in operator', async function () {
        const ref = firestore.collection(`${COLLECTION}/filter/int-in${Date.now() + ''}`);

        await ref.add({ status: 1 });

        const items = [];
        await ref
          .where('status', 'in', [1, 2])
          .get()
          .then($ => $.forEach(doc => items.push(doc.data())));

        items.length.should.equal(1);
      });

      it('should correctly query integer values with array-contains operator', async function () {
        const ref = firestore.collection(
          `${COLLECTION}/filter/int-array-contains${Date.now() + ''}`,
        );

        await ref.add({ status: [1, 2, 3] });

        const items = [];
        await ref
          .where('status', 'array-contains', 2)
          .get()
          .then($ => $.forEach(doc => items.push(doc.data())));

        items.length.should.equal(1);
      });

      it("should correctly retrieve data when using 'not-in' operator", async function () {
        const ref = firestore.collection(`${COLLECTION}/filter/not-in${Date.now() + ''}`);

        await Promise.all([ref.add({ notIn: 'here' }), ref.add({ notIn: 'now' })]);

        const result = await ref.where('notIn', 'not-in', ['here', 'there', 'everywhere']).get();
        should(result.docs.length).equal(1);
        should(result.docs[0].data().notIn).equal('now');
      });

      it("should throw error when using 'not-in' operator twice", async function () {
        const ref = firestore.collection(COLLECTION);

        try {
          ref.where('test', 'not-in', [1]).where('test', 'not-in', [2]);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("You cannot use more than one 'not-in' filter.");
          return Promise.resolve();
        }
      });

      it("should throw error when combining 'not-in' operator with '!=' operator", async function () {
        const ref = firestore.collection(COLLECTION);

        try {
          ref.where('test', '!=', 1).where('test', 'not-in', [1]);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "You cannot use 'not-in' filters with '!=' inequality filters",
          );
          return Promise.resolve();
        }
      });

      it("should throw error when combining 'not-in' operator with 'in' operator", async function () {
        const ref = firestore.collection(COLLECTION);

        try {
          ref.where('test', 'in', [2]).where('test', 'not-in', [1]);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("You cannot use 'not-in' filters with 'in' filters.");
          return Promise.resolve();
        }
      });

      it("should throw error when combining 'not-in' operator with 'array-contains-any' operator", async function () {
        const ref = firestore.collection(COLLECTION);

        try {
          ref.where('test', 'array-contains-any', [2]).where('test', 'not-in', [1]);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "You cannot use 'not-in' filters with 'array-contains-any' filters.",
          );
          return Promise.resolve();
        }
      });

      it("should throw error when 'not-in' filter has a list of more than 10 items", async function () {
        const ref = firestore.collection(COLLECTION);
        const queryArray = Array.from({ length: 31 }, (_, i) => i + 1);

        try {
          ref.where('test', 'not-in', queryArray);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            'filters support a maximum of 30 elements in the value array.',
          );
          return Promise.resolve();
        }
      });

      it("should correctly retrieve data when using '!=' operator", async function () {
        const ref = firestore.collection(`${COLLECTION}/filter/bang-equals${Date.now() + ''}`);

        await Promise.all([ref.add({ notEqual: 'here' }), ref.add({ notEqual: 'now' })]);

        const result = await ref.where('notEqual', '!=', 'here').get();

        should(result.docs.length).equal(1);
        should(result.docs[0].data().notEqual).equal('now');
      });

      it("should throw error when using '!=' operator twice ", async function () {
        const ref = firestore.collection(COLLECTION);

        try {
          ref.where('test', '!=', 1).where('test', '!=', 2);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("You cannot use more than one '!=' inequality filter.");
          return Promise.resolve();
        }
      });

      it('should handle where clause after sort by', async function () {
        const ref = firestore.collection(`${COLLECTION}/filter/sort-by-where${Date.now() + ''}`);

        await ref.add({ status: 1 });
        await ref.add({ status: 2 });
        await ref.add({ status: 3 });

        const items = [];
        await ref
          .orderBy('status', 'desc')
          .where('status', '<=', 2)
          .get()
          .then($ => $.forEach(doc => items.push(doc.data())));

        items.length.should.equal(2);
        items[0].status.should.equal(2);
        items[1].status.should.equal(1);
      });
    });

    describe('modular', function () {
      let firestore;

      before(function () {
        const { getFirestore } = firestoreModular;
        firestore = getFirestore(null, SECOND_DATABASE_ID);
      });

      beforeEach(async function () {
        return await wipe(false, SECOND_DATABASE_ID);
      });

      it('throws if fieldPath is invalid', function () {
        const { collection, query, where } = firestoreModular;
        try {
          query(collection(firestore, COLLECTION), where(123));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            'must be a string, instance of FieldPath or instance of Filter',
          );
          return Promise.resolve();
        }
      });

      it('throws if fieldPath string is invalid', function () {
        const { collection, query, where } = firestoreModular;
        try {
          query(collection(firestore, COLLECTION), where('.foo.bar'));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'fieldPath' Invalid field path");
          return Promise.resolve();
        }
      });

      it('throws if operator string is invalid', function () {
        const { collection, query, where } = firestoreModular;
        try {
          query(collection(firestore, COLLECTION), where('foo.bar', '!'));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'opStr' is invalid");
          return Promise.resolve();
        }
      });

      it('throws if query contains multiple array-contains', function () {
        const { collection, query, where } = firestoreModular;
        try {
          query(
            collection(firestore, COLLECTION),
            where('foo.bar', 'array-contains', 123),
            where('foo.bar', 'array-contains', 123),
          );
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('Queries only support a single array-contains filter');
          return Promise.resolve();
        }
      });

      it('throws if value is not defined', function () {
        const { collection, query, where } = firestoreModular;
        try {
          query(collection(firestore, COLLECTION), where('foo.bar', 'array-contains'));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'value' argument expected");
          return Promise.resolve();
        }
      });

      it('throws if null value and no equal operator', function () {
        const { collection, query, where } = firestoreModular;
        try {
          query(collection(firestore, COLLECTION), where('foo.bar', 'array-contains', null));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('You can only perform equals comparisons on null');
          return Promise.resolve();
        }
      });

      it('allows null to be used with equal operator', function () {
        const { collection, query, where } = firestoreModular;
        query(collection(firestore, COLLECTION), where('foo.bar', '==', null));
      });

      it('allows null to be used with not equal operator', function () {
        const { collection, query, where } = firestoreModular;
        query(collection(firestore, COLLECTION), where('foo.bar', '!=', null));
      });

      it('allows inequality on the same path', function () {
        const { collection, query, where, FieldPath } = firestoreModular;
        query(
          collection(firestore, COLLECTION),
          where('foo.bar', '>', 123),
          where(new FieldPath('foo', 'bar'), '>', 1234),
        );
      });

      it('throws if in query with no array value', function () {
        const { collection, query, where } = firestoreModular;
        try {
          query(collection(firestore, COLLECTION), where('foo.bar', 'in', '123'));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('A non-empty array is required');
          return Promise.resolve();
        }
      });

      it('throws if array-contains-any query with no array value', function () {
        const { collection, query, where } = firestoreModular;
        try {
          query(collection(firestore, COLLECTION), where('foo.bar', 'array-contains-any', '123'));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('A non-empty array is required');
          return Promise.resolve();
        }
      });

      it('throws if in query array length is greater than 30', function () {
        const { collection, query, where } = firestoreModular;
        const queryArray = Array.from({ length: 31 }, (_, i) => i + 1);

        try {
          query(collection(firestore, COLLECTION), where('foo.bar', 'in', queryArray));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('maximum of 30 elements in the value');
          return Promise.resolve();
        }
      });

      it('throws if query has multiple array-contains-any filter', function () {
        const { collection, query, where } = firestoreModular;
        try {
          query(
            collection(firestore, COLLECTION),
            where('foo.bar', 'array-contains-any', [1]),
            where('foo.bar', 'array-contains-any', [2]),
          );
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "You cannot use more than one 'array-contains-any' filter",
          );
          return Promise.resolve();
        }
      });

      /* Queries */

      it('returns with where equal filter', async function () {
        const { collection, addDoc, query, where, getDocs } = firestoreModular;
        const colRef = collection(firestore, `${COLLECTION}/filter/equal`);

        const search = Date.now();
        await Promise.all([
          addDoc(colRef, { foo: search }),
          addDoc(colRef, { foo: search }),
          addDoc(colRef, { foo: search + 1234 }),
        ]);

        const snapshot = await getDocs(query(colRef, where('foo', '==', search)));

        snapshot.size.should.eql(2);
        snapshot.forEach(s => {
          s.data().foo.should.eql(search);
        });
      });

      it('returns with where greater than filter', async function () {
        const { collection, addDoc, query, where, getDocs } = firestoreModular;
        const colRef = collection(firestore, `${COLLECTION}/filter/greater`);

        const search = Date.now();
        await Promise.all([
          addDoc(colRef, { foo: search - 1234 }),
          addDoc(colRef, { foo: search }),
          addDoc(colRef, { foo: search + 1234 }),
          addDoc(colRef, { foo: search + 1234 }),
        ]);

        const snapshot = await getDocs(query(colRef, where('foo', '>', search)));

        snapshot.size.should.eql(2);
        snapshot.forEach(s => {
          s.data().foo.should.eql(search + 1234);
        });
      });

      it('returns with where greater than or equal filter', async function () {
        const { collection, addDoc, query, where, getDocs } = firestoreModular;
        const colRef = collection(firestore, `${COLLECTION}/filter/greaterequal`);

        const search = Date.now();
        await Promise.all([
          addDoc(colRef, { foo: search - 1234 }),
          addDoc(colRef, { foo: search }),
          addDoc(colRef, { foo: search + 1234 }),
          addDoc(colRef, { foo: search + 1234 }),
        ]);

        const snapshot = await getDocs(query(colRef, where('foo', '>=', search)));

        snapshot.size.should.eql(3);
        snapshot.forEach(s => {
          s.data().foo.should.be.aboveOrEqual(search);
        });
      });

      it('returns with where less than filter', async function () {
        const { collection, addDoc, query, where, getDocs } = firestoreModular;
        const colRef = collection(firestore, `${COLLECTION}/filter/less`);

        const search = -Date.now();
        await Promise.all([
          addDoc(colRef, { foo: search + -1234 }),
          addDoc(colRef, { foo: search + -1234 }),
          addDoc(colRef, { foo: search }),
        ]);

        const snapshot = await getDocs(query(colRef, where('foo', '<', search)));

        snapshot.size.should.eql(2);
        snapshot.forEach(s => {
          s.data().foo.should.be.below(search);
        });
      });

      it('returns with where less than or equal filter', async function () {
        const { collection, addDoc, query, where, getDocs } = firestoreModular;
        const colRef = collection(firestore, `${COLLECTION}/filter/lessequal`);

        const search = -Date.now();
        await Promise.all([
          addDoc(colRef, { foo: search + -1234 }),
          addDoc(colRef, { foo: search + -1234 }),
          addDoc(colRef, { foo: search }),
          addDoc(colRef, { foo: search + 1234 }),
        ]);

        const snapshot = await getDocs(query(colRef, where('foo', '<=', search)));

        snapshot.size.should.eql(3);
        snapshot.forEach(s => {
          s.data().foo.should.be.belowOrEqual(search);
        });
      });

      it('returns when combining greater than and lesser than on the same nested field', async function () {
        const { collection, doc, setDoc, query, where, orderBy, getDocs } = firestoreModular;
        const colRef = collection(firestore, `${COLLECTION}/filter/greaterandless`);

        await Promise.all([
          setDoc(doc(colRef, 'doc1'), { foo: { bar: 1 } }),
          setDoc(doc(colRef, 'doc2'), { foo: { bar: 2 } }),
          setDoc(doc(colRef, 'doc3'), { foo: { bar: 3 } }),
        ]);

        const snapshot = await getDocs(
          query(colRef, where('foo.bar', '>', 1), where('foo.bar', '<', 3), orderBy('foo.bar')),
        );

        snapshot.size.should.eql(1);
      });

      it('returns when combining greater than and lesser than on the same nested field using FieldPath', async function () {
        const { collection, doc, setDoc, query, where, getDocs, orderBy, FieldPath } =
          firestoreModular;
        const colRef = collection(firestore, `${COLLECTION}/filter/greaterandless`);

        await Promise.all([
          setDoc(doc(colRef, 'doc1'), { foo: { bar: 1 } }),
          setDoc(doc(colRef, 'doc2'), { foo: { bar: 2 } }),
          setDoc(doc(colRef, 'doc3'), { foo: { bar: 3 } }),
        ]);

        const snapshot = await getDocs(
          query(
            colRef,
            where(new FieldPath('foo', 'bar'), '>', 1),
            where(new FieldPath('foo', 'bar'), '<', 3),
            orderBy(new FieldPath('foo', 'bar')),
          ),
        );

        snapshot.size.should.eql(1);
      });

      it('returns with where array-contains filter', async function () {
        const { collection, addDoc, query, where, getDocs } = firestoreModular;
        const colRef = collection(firestore, `${COLLECTION}/filter/array-contains`);

        const match = Date.now();
        await Promise.all([
          addDoc(colRef, { foo: [1, '2', match] }),
          addDoc(colRef, { foo: [1, '2', match.toString()] }),
          addDoc(colRef, { foo: [1, '2', match.toString()] }),
        ]);

        const snapshot = await getDocs(
          query(colRef, where('foo', 'array-contains', match.toString())),
        );
        const expected = [1, '2', match.toString()];

        snapshot.size.should.eql(2);
        snapshot.forEach(s => {
          s.data().foo.should.eql(jet.contextify(expected));
        });
      });

      it('returns with in filter', async function () {
        const { collection, addDoc, query, where, getDocs } = firestoreModular;
        const colRef = collection(firestore, `${COLLECTION}/filter/in${Date.now() + ''}`);

        await Promise.all([
          addDoc(colRef, { status: 'Ordered' }),
          addDoc(colRef, { status: 'Ready to Ship' }),
          addDoc(colRef, { status: 'Ready to Ship' }),
          addDoc(colRef, { status: 'Incomplete' }),
        ]);

        const expect = ['Ready to Ship', 'Ordered'];
        const snapshot = await getDocs(query(colRef, where('status', 'in', expect)));
        snapshot.size.should.eql(3);

        snapshot.forEach(s => {
          s.data().status.should.equalOneOf(...expect);
        });
      });

      it('returns with array-contains-any filter', async function () {
        const { collection, addDoc, query, where, getDocs } = firestoreModular;
        const colRef = collection(
          firestore,
          `${COLLECTION}/filter/array-contains-any${Date.now() + ''}`,
        );

        await Promise.all([
          addDoc(colRef, { category: ['Appliances', 'Housewares', 'Cooking'] }),
          addDoc(colRef, { category: ['Appliances', 'Electronics', 'Nursery'] }),
          addDoc(colRef, { category: ['Audio/Video', 'Electronics'] }),
          addDoc(colRef, { category: ['Beauty'] }),
        ]);

        const expect = ['Appliances', 'Electronics'];
        const snapshot = await getDocs(
          query(colRef, where('category', 'array-contains-any', expect)),
        );
        snapshot.size.should.eql(3); // 2nd record should only be returned once
      });

      it('returns with a FieldPath', async function () {
        const { collection, addDoc, query, where, getDocs, FieldPath } = firestoreModular;
        const colRef = collection(
          firestore,
          `${COLLECTION}/filter/where-fieldpath${Date.now() + ''}`,
        );
        const fieldPath = new FieldPath('map', 'foo.bar@gmail.com');

        await addDoc(colRef, {
          map: {
            'foo.bar@gmail.com': true,
          },
        });
        await addDoc(colRef, {
          map: {
            'bar.foo@gmail.com': true,
          },
        });

        const snapshot = await getDocs(query(colRef, where(fieldPath, '==', true)));
        snapshot.size.should.eql(1); // 2nd record should only be returned once
        const data = snapshot.docs[0].data();
        should.equal(data.map['foo.bar@gmail.com'], true);
      });

      it('should throw an error if you use a FieldPath on a filter in conjunction with an orderBy() parameter that is not FieldPath', async function () {
        const { collection, query, where, orderBy, FieldPath } = firestoreModular;
        try {
          query(
            collection(firestore, COLLECTION),
            where(FieldPath.documentId(), 'in', ['document-id']),
            orderBy('differentOrderBy', 'desc'),
          );

          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'FirestoreFieldPath' cannot be used in conjunction");
          return Promise.resolve();
        }
      });

      it('should correctly query integer values with in operator', async function () {
        const { collection, addDoc, query, where, getDocs } = firestoreModular;
        const ref = collection(firestore, `${COLLECTION}/filter/int-in${Date.now() + ''}`);

        await addDoc(ref, { status: 1 });

        const items = [];
        await getDocs(query(ref, where('status', 'in', [1, 2]))).then($ =>
          $.forEach(doc => items.push(doc.data())),
        );

        items.length.should.equal(1);
      });

      it('should correctly query integer values with array-contains operator', async function () {
        const { collection, addDoc, query, where, getDocs } = firestoreModular;
        const ref = collection(
          firestore,
          `${COLLECTION}/filter/int-array-contains${Date.now() + ''}`,
        );

        await addDoc(ref, { status: [1, 2, 3] });

        const items = [];
        await getDocs(query(ref, where('status', 'array-contains', 2))).then($ =>
          $.forEach(doc => items.push(doc.data())),
        );

        items.length.should.equal(1);
      });

      it("should correctly retrieve data when using 'not-in' operator", async function () {
        const { collection, addDoc, query, where, getDocs } = firestoreModular;
        const ref = collection(firestore, `${COLLECTION}/filter/not-in${Date.now() + ''}`);

        await Promise.all([addDoc(ref, { notIn: 'here' }), addDoc(ref, { notIn: 'now' })]);

        const result = await getDocs(
          query(ref, where('notIn', 'not-in', ['here', 'there', 'everywhere'])),
        );
        should(result.docs.length).equal(1);
        should(result.docs[0].data().notIn).equal('now');
      });

      it("should throw error when using 'not-in' operator twice", async function () {
        const { collection, query, where } = firestoreModular;
        const ref = collection(firestore, COLLECTION);

        try {
          query(ref, where('test', 'not-in', [1]), where('test', 'not-in', [2]));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("You cannot use more than one 'not-in' filter.");
          return Promise.resolve();
        }
      });

      it("should throw error when combining 'not-in' operator with '!=' operator", async function () {
        const { collection, query, where } = firestoreModular;
        const ref = collection(firestore, COLLECTION);

        try {
          query(ref, where('test', 'not-in', [1]), where('test', '!=', 1));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "You cannot use 'not-in' filters with '!=' inequality filters",
          );
          return Promise.resolve();
        }
      });

      it("should throw error when combining 'not-in' operator with 'in' operator", async function () {
        const { collection, query, where } = firestoreModular;
        const ref = collection(firestore, COLLECTION);

        try {
          query(ref, where('test', 'in', [2]), where('test', 'not-in', [1]));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("You cannot use 'not-in' filters with 'in' filters.");
          return Promise.resolve();
        }
      });

      it("should throw error when combining 'not-in' operator with 'array-contains-any' operator", async function () {
        const { collection, query, where } = firestoreModular;
        const ref = collection(firestore, COLLECTION);

        try {
          query(ref, where('test', 'array-contains-any', [2]), where('test', 'not-in', [1]));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "You cannot use 'not-in' filters with 'array-contains-any' filters.",
          );
          return Promise.resolve();
        }
      });

      it("should throw error when 'not-in' filter has a list of more than 10 items", async function () {
        const { collection, query, where } = firestoreModular;
        const ref = collection(firestore, COLLECTION);
        const queryArray = Array.from({ length: 31 }, (_, i) => i + 1);

        try {
          query(ref, where('test', 'not-in', queryArray));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            'filters support a maximum of 30 elements in the value array.',
          );
          return Promise.resolve();
        }
      });

      it("should correctly retrieve data when using '!=' operator", async function () {
        const { collection, addDoc, query, where, getDocs } = firestoreModular;
        const ref = collection(firestore, `${COLLECTION}/filter/bang-equals${Date.now() + ''}`);

        await Promise.all([addDoc(ref, { notEqual: 'here' }), addDoc(ref, { notEqual: 'now' })]);

        const result = await getDocs(query(ref, where('notEqual', '!=', 'here')));

        should(result.docs.length).equal(1);
        should(result.docs[0].data().notEqual).equal('now');
      });

      it("should throw error when using '!=' operator twice ", async function () {
        const { collection, query, where } = firestoreModular;
        const ref = collection(firestore, COLLECTION);

        try {
          query(ref, where('test', '!=', 1), where('test', '!=', 2));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("You cannot use more than one '!=' inequality filter.");
          return Promise.resolve();
        }
      });

      it('should handle where clause after sort by', async function () {
        const { collection, addDoc, query, where, orderBy, getDocs } = firestoreModular;
        const ref = collection(firestore, `${COLLECTION}/filter/sort-by-where${Date.now() + ''}`);

        await addDoc(ref, { status: 1 });
        await addDoc(ref, { status: 2 });
        await addDoc(ref, { status: 3 });

        const items = [];
        await getDocs(query(ref, orderBy('status', 'desc'), where('status', '<=', 2))).then($ =>
          $.forEach(doc => items.push(doc.data())),
        );

        items.length.should.equal(2);
        items[0].status.should.equal(2);
        items[1].status.should.equal(1);
      });
    });
  });
});
