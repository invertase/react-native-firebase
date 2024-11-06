/*
 * Copyright (c) 2022-present Invertase Limited & Contributors
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
const { wipe } = require('../helpers');
describe('getAggregateFromServer()', function () {
  before(function () {
    return wipe();
  });

  describe('throws exceptions for incorrect inputs', function () {
    it('throws if incorrect `query` argument', function () {
      const { getAggregateFromServer, count } = firestoreModular;
      const aggregateSpec = {
        count: count(),
      };
      try {
        getAggregateFromServer(null, aggregateSpec);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'getAggregateFromServer(*, aggregateSpec)` `query` muse be an instance of `FirestoreQuery`',
        );
      }

      try {
        getAggregateFromServer(undefined, aggregateSpec);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'getAggregateFromServer(*, aggregateSpec)` `query` muse be an instance of `FirestoreQuery`',
        );
      }

      try {
        getAggregateFromServer('some-string', aggregateSpec);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'getAggregateFromServer(*, aggregateSpec)` `query` muse be an instance of `FirestoreQuery`',
        );
      }
      return Promise.resolve();
    });

    it('throws if incorrect `aggregateSpec` argument', function () {
      const { getAggregateFromServer, collection, getFirestore, count } = firestoreModular;

      const colRef = collection(getFirestore(), `firestore`);

      try {
        getAggregateFromServer(colRef, 'not an object');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          '`getAggregateFromServer(query, *)` `aggregateSpec` muse be an object',
        );
      }

      const aggregateSpec = {
        count: "doesn't contain an aggregate field",
      };

      try {
        getAggregateFromServer(colRef, aggregateSpec);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          '`getAggregateFromServer(query, *)` `aggregateSpec` must contain at least one `AggregateField`',
        );
      }

      try {
        getAggregateFromServer(colRef, aggregateSpec);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'getAggregateFromServer(*, aggregateSpec)` `query` muse be an instance of `FirestoreQuery`',
        );
      }
      const aggField = count();
      aggField.aggregateType = 'change underlying type';

      const aggregateSpec2 = {
        count: aggField,
      };

      try {
        getAggregateFromServer(colRef, aggregateSpec2);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'AggregateField' has an an unknown 'AggregateType'");
      }
      return Promise.resolve();
    });
  });

  describe('count(), average() & sum()', function () {
    it('no existing collection responses for average(), sum() & count()', async function () {
      const { getAggregateFromServer, collection, getFirestore, count, average, sum } =
        firestoreModular;
      const firestore = getFirestore();

      const colRefNoDocs = collection(firestore, `${COLLECTION}/aggregate-count/no-docs`);

      const aggregateSpecNoDocuments = {
        countCollection: count(),
        averageBar: average('bar'),
        sumBaz: sum('baz'),
      };

      const resultNoDocs = await getAggregateFromServer(colRefNoDocs, aggregateSpecNoDocuments);

      const dataNoDocs = resultNoDocs.data();

      // average returns null, whilst sum and count return 0
      dataNoDocs.countCollection.should.eql(0);
      dataNoDocs.averageBar.should.eql(null);
      dataNoDocs.sumBaz.should.eql(0);
    });

    it('single path using `string`', async function () {
      const { getAggregateFromServer, doc, setDoc, collection, getFirestore, count, average, sum } =
        firestoreModular;
      const firestore = getFirestore();

      const colRef = collection(firestore, `${COLLECTION}/aggregate-count/collection`);

      await Promise.all([
        setDoc(doc(colRef, 'one'), { bar: 5, baz: 4 }),
        setDoc(doc(colRef, 'two'), { bar: 5, baz: 4 }),
        setDoc(doc(colRef, 'three'), { bar: 5, baz: 4 }),
      ]);

      const aggregateSpec = {
        ignoreThisProperty: 'not aggregate field',
        countCollection: count(),
        averageBar: average('bar'),
        sumBaz: sum('baz'),
      };

      const result = await getAggregateFromServer(colRef, aggregateSpec);

      const data = result.data();

      data.countCollection.should.eql(3);
      data.averageBar.should.eql(5);
      data.sumBaz.should.eql(12);
      // should only return the aggregate field requests
      data.should.not.have.property('ignoreThisProperty');
    });

    it('single path using `FieldPath`', async function () {
      const {
        getAggregateFromServer,
        doc,
        setDoc,
        collection,
        getFirestore,
        count,
        average,
        sum,
        FieldPath,
      } = firestoreModular;
      const firestore = getFirestore();

      const colRef = collection(firestore, `${COLLECTION}/aggregate-count-field-path/collection`);

      await Promise.all([
        setDoc(doc(colRef, 'one'), { bar: 5, baz: 4 }),
        setDoc(doc(colRef, 'two'), { bar: 5, baz: 4 }),
        setDoc(doc(colRef, 'three'), { bar: 5, baz: 4 }),
      ]);

      const aggregateSpec = {
        ignoreThisProperty: 'not aggregate field',
        countCollection: count(),
        averageBar: average(new FieldPath('bar')),
        sumBaz: sum(new FieldPath('baz')),
      };

      const result = await getAggregateFromServer(colRef, aggregateSpec);

      const data = result.data();

      data.countCollection.should.eql(3);
      data.averageBar.should.eql(5);
      data.sumBaz.should.eql(12);
      // should only return the aggregate field requests
      data.should.not.have.property('ignoreThisProperty');
    });

    it('nested object using `string`', async function () {
      const { getAggregateFromServer, doc, setDoc, collection, getFirestore, count, average, sum } =
        firestoreModular;
      const firestore = getFirestore();

      const colRef = collection(firestore, `${COLLECTION}/aggregate-count-nested/collection`);

      await Promise.all([
        setDoc(doc(colRef, 'one'), { foo: { bar: 5, baz: 4 } }),
        setDoc(doc(colRef, 'two'), { foo: { bar: 5, baz: 4 } }),
        setDoc(doc(colRef, 'three'), { foo: { bar: 5, baz: 4 } }),
      ]);

      const aggregateSpec = {
        ignoreThisProperty: 'not aggregate field',
        countCollection: count(),
        averageBar: average('foo.bar'),
        sumBaz: sum('foo.baz'),
      };

      const result = await getAggregateFromServer(colRef, aggregateSpec);

      const data = result.data();

      data.countCollection.should.eql(3);
      data.averageBar.should.eql(5);
      data.sumBaz.should.eql(12);
      // should only return the aggregate field requests
      data.should.not.have.property('ignoreThisProperty');
    });

    it('nested object using `FieldPath`', async function () {
      const {
        getAggregateFromServer,
        doc,
        setDoc,
        collection,
        getFirestore,
        count,
        average,
        sum,
        FieldPath,
      } = firestoreModular;
      const firestore = getFirestore();

      const colRef = collection(
        firestore,
        `${COLLECTION}/aggregate-count-nested-field-path/collection`,
      );

      await Promise.all([
        setDoc(doc(colRef, 'one'), { foo: { bar: 5, baz: 4 } }),
        setDoc(doc(colRef, 'two'), { foo: { bar: 5, baz: 4 } }),
        setDoc(doc(colRef, 'three'), { foo: { bar: 5, baz: 4 } }),
      ]);

      const aggregateSpec = {
        ignoreThisProperty: 'not aggregate field',
        countCollection: count(),
        averageBar: average(new FieldPath('foo.bar')),
        sumBaz: sum(new FieldPath('foo.baz')),
      };

      const result = await getAggregateFromServer(colRef, aggregateSpec);

      const data = result.data();

      data.countCollection.should.eql(3);
      data.averageBar.should.eql(5);
      data.sumBaz.should.eql(12);
      // should only return the aggregate field requests
      data.should.not.have.property('ignoreThisProperty');
    });
  });
});
