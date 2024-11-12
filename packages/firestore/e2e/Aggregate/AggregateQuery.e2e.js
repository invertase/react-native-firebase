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
  before(async function () {
    return await wipe();
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
          'getAggregateFromServer(*, aggregateSpec)` `query` must be an instance of `FirestoreQuery`',
        );
      }

      try {
        getAggregateFromServer(undefined, aggregateSpec);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'getAggregateFromServer(*, aggregateSpec)` `query` must be an instance of `FirestoreQuery`',
        );
      }

      try {
        getAggregateFromServer('some-string', aggregateSpec);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'getAggregateFromServer(*, aggregateSpec)` `query` must be an instance of `FirestoreQuery`',
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
          '`getAggregateFromServer(query, *)` `aggregateSpec` must be an object',
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
    it('single path using `string`', async function () {
      const { getAggregateFromServer, doc, setDoc, collection, getFirestore, count, average, sum } =
        firestoreModular;
      const firestore = getFirestore();

      const colRef = collection(firestore, `${COLLECTION}/aggregate-count/collection`);

      await Promise.all([
        setDoc(doc(colRef, 'one'), { bar: 0.4, baz: 3 }),
        setDoc(doc(colRef, 'two'), { bar: 0.5, baz: 3 }),
        setDoc(doc(colRef, 'three'), { bar: 0.6, baz: 3 }),
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
      data.averageBar.should.eql(0.5);
      data.sumBaz.should.eql(9);
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

    describe('edge cases for aggregate query', function () {
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
        should(dataNoDocs.averageBar).be.null();
        dataNoDocs.sumBaz.should.eql(0);
      });

      it('sum of `0.3`', async function () {
        const { getAggregateFromServer, doc, setDoc, collection, getFirestore, sum } =
          firestoreModular;
        const firestore = getFirestore();

        const colRef = collection(firestore, `${COLLECTION}/aggregate-count/sum-0-3`);

        await Promise.all([
          setDoc(doc(colRef, 'one'), { bar: 0.4, baz: 0.1 }),
          setDoc(doc(colRef, 'two'), { bar: 0.5, baz: 0.1 }),
          setDoc(doc(colRef, 'three'), { bar: 0.6, baz: 0.1 }),
        ]);

        const aggregateSpec = {
          sumBaz: sum('baz'),
        };

        const result = await getAggregateFromServer(colRef, aggregateSpec);

        const data = result.data();

        data.sumBaz.should.eql(0.30000000000000004);
      });

      it('return JavaScript single max safe integer for `sum()`', async function () {
        const { getAggregateFromServer, doc, setDoc, collection, getFirestore, sum } =
          firestoreModular;
        const MAX_INT = Number.MAX_SAFE_INTEGER;
        const firestore = getFirestore();

        const colRef = collection(firestore, `${COLLECTION}/aggregate-count/max-int`);

        await Promise.all([setDoc(doc(colRef, 'one'), { baz: MAX_INT })]);

        const aggregateSpec = {
          sumBaz: sum('baz'),
        };

        const result = await getAggregateFromServer(colRef, aggregateSpec);

        const data = result.data();

        data.sumBaz.should.eql(MAX_INT);
      });

      it('return JavaScript nine max safe integers for `sum()`', async function () {
        const { getAggregateFromServer, doc, setDoc, collection, getFirestore, sum } =
          firestoreModular;
        const MAX_INT = Number.MAX_SAFE_INTEGER;
        const firestore = getFirestore();

        const colRef = collection(firestore, `${COLLECTION}/aggregate-count/max-int-2`);

        await Promise.all([
          setDoc(doc(colRef, 'one'), { baz: MAX_INT }),
          setDoc(doc(colRef, 'two'), { baz: MAX_INT }),
          setDoc(doc(colRef, 'three'), { baz: MAX_INT }),
          setDoc(doc(colRef, 'four'), { baz: MAX_INT }),
          setDoc(doc(colRef, 'five'), { baz: MAX_INT }),
          setDoc(doc(colRef, 'six'), { baz: MAX_INT }),
          setDoc(doc(colRef, 'seven'), { baz: MAX_INT }),
          setDoc(doc(colRef, 'eight'), { baz: MAX_INT }),
          setDoc(doc(colRef, 'nine'), { baz: MAX_INT }),
        ]);

        const aggregateSpec = {
          sumBaz: sum('baz'),
        };

        const result = await getAggregateFromServer(colRef, aggregateSpec);

        const data = result.data();

        data.sumBaz.should.eql(MAX_INT * 9);
      });

      it('return JavaScript single max safe number for `sum()`', async function () {
        const { getAggregateFromServer, doc, setDoc, collection, getFirestore, sum } =
          firestoreModular;
        const MAX_NUMBER = Number.MAX_VALUE;
        const firestore = getFirestore();

        const colRef = collection(firestore, `${COLLECTION}/aggregate-count/max-number`);

        await Promise.all([setDoc(doc(colRef, 'one'), { baz: MAX_NUMBER })]);

        const aggregateSpec = {
          sumBaz: sum('baz'),
        };

        const result = await getAggregateFromServer(colRef, aggregateSpec);

        const data = result.data();

        data.sumBaz.should.eql(MAX_NUMBER);
      });

      it('returns `Infinity` for JavaScript max safe number + 1 for `sum()`', async function () {
        const { getAggregateFromServer, doc, setDoc, collection, getFirestore, sum } =
          firestoreModular;
        const MAX_NUMBER = Number.MAX_VALUE;
        const firestore = getFirestore();

        const colRef = collection(firestore, `${COLLECTION}/aggregate-count/max-number`);

        await Promise.all([
          setDoc(doc(colRef, 'one'), { baz: MAX_NUMBER }),
          setDoc(doc(colRef, 'two'), { baz: 1 }),
        ]);

        const aggregateSpec = {
          sumBaz: sum('baz'),
        };

        const result = await getAggregateFromServer(colRef, aggregateSpec);

        const data = result.data();
        // Doesn't add 1, just returns MAX_NUMBER
        data.sumBaz.should.eql(MAX_NUMBER);
      });

      it('returns `Infinity` for JavaScript max safe number + 100 for `sum()`', async function () {
        const { getAggregateFromServer, doc, setDoc, collection, getFirestore, sum } =
          firestoreModular;
        const MAX_NUMBER = Number.MAX_VALUE;
        const firestore = getFirestore();

        const colRef = collection(firestore, `${COLLECTION}/aggregate-count/max-number-2`);

        await Promise.all([
          setDoc(doc(colRef, 'one'), { baz: MAX_NUMBER }),
          setDoc(doc(colRef, 'two'), { baz: 100 }),
        ]);

        const aggregateSpec = {
          sumBaz: sum('baz'),
        };

        const result = await getAggregateFromServer(colRef, aggregateSpec);

        const data = result.data();
        // Doesn't add 100, just returns MAX_NUMBER
        data.sumBaz.should.eql(MAX_NUMBER);
      });

      it('returns `Infinity` for JavaScript two max safe numbers for `sum()`', async function () {
        const { getAggregateFromServer, doc, setDoc, collection, getFirestore, sum } =
          firestoreModular;
        const MAX_NUMBER = Number.MAX_VALUE;
        const firestore = getFirestore();

        const colRef = collection(firestore, `${COLLECTION}/aggregate-count/max-number-3`);

        await Promise.all([
          setDoc(doc(colRef, 'one'), { baz: MAX_NUMBER }),
          setDoc(doc(colRef, 'two'), { baz: MAX_NUMBER }),
        ]);

        const aggregateSpec = {
          sumBaz: sum('baz'),
        };

        const result = await getAggregateFromServer(colRef, aggregateSpec);

        const data = result.data();
        // Returns Infinity
        data.sumBaz.should.eql(Infinity);
      });

      it('returns `0` for properties with `0` for `average()`', async function () {
        const { getAggregateFromServer, doc, setDoc, collection, getFirestore, average } =
          firestoreModular;
        const firestore = getFirestore();

        const colRef = collection(firestore, `${COLLECTION}/aggregate-average/0-values`);

        await Promise.all([
          setDoc(doc(colRef, 'one'), { baz: 0 }),
          setDoc(doc(colRef, 'two'), { baz: 0 }),
        ]);

        const aggregateSpec = {
          averageBaz: average('baz'),
        };

        const result = await getAggregateFromServer(colRef, aggregateSpec);

        const data = result.data();

        data.averageBaz.should.eql(0);
      });

      it('returns `-1` for properties with `-1` for `average()`', async function () {
        const { getAggregateFromServer, doc, setDoc, collection, getFirestore, average } =
          firestoreModular;
        const firestore = getFirestore();

        const colRef = collection(firestore, `${COLLECTION}/aggregate-average/minus-one-values`);

        await Promise.all([
          setDoc(doc(colRef, 'one'), { baz: -1 }),
          setDoc(doc(colRef, 'two'), { baz: -1 }),
        ]);

        const aggregateSpec = {
          averageBaz: average('baz'),
        };

        const result = await getAggregateFromServer(colRef, aggregateSpec);

        const data = result.data();

        data.averageBaz.should.eql(-1);
      });

      it('returns `-3` for properties with `-3` for `average()`', async function () {
        const { getAggregateFromServer, doc, setDoc, collection, getFirestore, average } =
          firestoreModular;
        const firestore = getFirestore();

        const colRef = collection(firestore, `${COLLECTION}/aggregate-average/minus-three-values`);

        await Promise.all([
          setDoc(doc(colRef, 'one'), { baz: -3 }),
          setDoc(doc(colRef, 'two'), { baz: -3 }),
          setDoc(doc(colRef, 'three'), { baz: -3 }),
        ]);

        const aggregateSpec = {
          averageBaz: average('baz'),
        };

        const result = await getAggregateFromServer(colRef, aggregateSpec);

        const data = result.data();

        data.averageBaz.should.eql(-3);
      });

      it('returns `-2` for properties with `-1`, `-2`,`-3` for `average()`', async function () {
        const { getAggregateFromServer, doc, setDoc, collection, getFirestore, average } =
          firestoreModular;
        const firestore = getFirestore();

        const colRef = collection(
          firestore,
          `${COLLECTION}/aggregate-average/minus-various-values`,
        );

        await Promise.all([
          setDoc(doc(colRef, 'one'), { baz: -1 }),
          setDoc(doc(colRef, 'two'), { baz: -2 }),
          setDoc(doc(colRef, 'three'), { baz: -3 }),
        ]);

        const aggregateSpec = {
          averageBaz: average('baz'),
        };

        const result = await getAggregateFromServer(colRef, aggregateSpec);

        const data = result.data();

        data.averageBaz.should.eql(-2);
      });

      it.only('returns `WHAT` for properties with `-1`, `-2`,`-3` for `average()`', async function () {
        const { getAggregateFromServer, doc, setDoc, collection, getFirestore, average } =
          firestoreModular;
        const firestore = getFirestore();

        const colRef = collection(
          firestore,
          `${COLLECTION}/aggregate-average/minus-various-float-values`,
        );

        await Promise.all([
          setDoc(doc(colRef, 'one'), { baz: -0.1 }),
          setDoc(doc(colRef, 'two'), { baz: -0.2 }),
          setDoc(doc(colRef, 'three'), { baz: -0.3 }),
        ]);

        const aggregateSpec = {
          averageBaz: average('baz'),
        };

        const result = await getAggregateFromServer(colRef, aggregateSpec);

        const data = result.data();

        data.averageBaz.should.eql(-0.19999999999999998);
      });
    });
  });
});
