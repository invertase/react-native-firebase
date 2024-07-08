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
const { wipe } = require('../helpers');
let Filter;

describe('firestore().collection().where(OR Filters)', function () {
  beforeEach(async function () {
    Filter = firebase.firestore.Filter;
    return await wipe();
  });

  describe('v8 compatibility', function () {
    it('throws if using nested Filter.or() queries', async function () {
      try {
        firebase
          .firestore()
          .collection(COLLECTION)
          .where(
            Filter.or(
              Filter.or(Filter('foo', '==', 'bar'), Filter('bar', '==', 'foo')),
              Filter.or(Filter('foo', '==', 'baz'), Filter('bar', '==', 'baz')),
            ),
          );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('OR Filters with nested OR Filters are not supported');
      }

      try {
        firebase
          .firestore()
          .collection(COLLECTION)
          .where(
            Filter.or(
              Filter.and(
                Filter.or(Filter('foo', '==', 'bar'), Filter('bar', '==', 'baz')),
                Filter('more', '==', 'stuff'),
              ),
              Filter.and(
                Filter.or(Filter('foo', '==', 'bar'), Filter('bar', '==', 'baz')),
                Filter('baz', '==', 'foo'),
              ),
            ),
          );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('OR Filters with nested OR Filters are not supported');
      }
      return Promise.resolve();
    });

    it('throws if fieldPath string is invalid', function () {
      try {
        firebase
          .firestore()
          .collection(COLLECTION)
          .where(
            Filter.or(
              Filter.and(Filter('.foo.bar', '!=', 1), Filter('.foo.bar', '==', 1)),
              Filter.and(Filter('.foo.bar', '!=', 1), Filter('foo.bar', '==', 1)),
            ),
          );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'fieldPath' Invalid field path");
        return Promise.resolve();
      }
    });

    it('throws if operator string is invalid', function () {
      try {
        firebase
          .firestore()
          .collection(COLLECTION)
          .where(
            Filter.or(
              Filter.and(Filter('foo.bar', '!', 1), Filter('foo.bar', '!', 1)),
              Filter.and(Filter('foo.bar', '!', 1), Filter('foo.bar', '!', 1)),
            ),
          );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'opStr' is invalid");
        return Promise.resolve();
      }
    });

    it('throws if query contains multiple array-contains', function () {
      try {
        firebase
          .firestore()
          .collection(COLLECTION)
          .where(
            Filter.or(
              Filter.and(
                Filter('foo.bar', 'array-contains', 1),
                Filter('foo.bar', 'array-contains', 1),
              ),
              Filter.and(Filter('foo.bar', '==', 1), Filter('foo.bar', '==', 2)),
            ),
          );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('Queries only support a single array-contains filter');
        return Promise.resolve();
      }
    });

    it('throws if value is not defined', function () {
      try {
        firebase
          .firestore()
          .collection(COLLECTION)
          .where(
            Filter.or(
              Filter.and(Filter('foo.bar', 'array-contains'), Filter('foo.bar', 'array-contains')),
              Filter.and(Filter('foo.bar', '!', 1), Filter('foo.bar', '!', 1)),
            ),
          );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'value' argument expected");
        return Promise.resolve();
      }
    });

    it('throws if null value and no equal operator', function () {
      try {
        firebase
          .firestore()
          .collection(COLLECTION)
          .where(
            Filter.or(
              Filter.and(Filter('foo.bar', '==', null), Filter('foo.bar', 'array-contains', null)),
              Filter.and(Filter('foo.bar', '!', 1), Filter('foo.bar', '!', 1)),
            ),
          );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('You can only perform equals comparisons on null');
        return Promise.resolve();
      }
    });

    it('allows null to be used with equal operator', function () {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(
          Filter.or(
            Filter.and(Filter('foo.bar', '==', null), Filter('foo.bar', '==', null)),
            Filter.and(Filter('foo.bar', '==', null), Filter('foo.bar', '==', null)),
          ),
        );
    });

    it('allows null to be used with not equal operator', function () {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(
          Filter.or(
            Filter.and(Filter('foo.bar', '==', null), Filter('foo.bar', '!=', null)),
            Filter.and(Filter('foo.bar', '==', null), Filter('foo.bar', '==', 'something')),
          ),
        );
    });

    it('allows multiple inequalities (excluding `!=`) on different paths provided', async function () {
      const colRef = firebase
        .firestore()
        .collection(`${COLLECTION}/filter/different-path-inequality`);
      const expected = { foo: { bar: 300 }, bar: 200 };
      await Promise.all([
        colRef.add({ foo: { bar: 1 }, bar: 1 }),
        colRef.add(expected),
        colRef.add(expected),
      ]);
      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(Filter('foo.bar', '>', 123), Filter('bar', '>', 123)),
            Filter.and(Filter('foo.bar', '>', 123), Filter('bar', '>', 123)),
          ),
        )
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('allows inequality on the same path', function () {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(
          Filter.or(
            Filter.and(
              Filter('foo.bar', '>', 123),
              Filter(new firebase.firestore.FieldPath('foo', 'bar'), '>', 1234),
            ),
            Filter.and(
              Filter('foo.bar', '>', 123),
              Filter(new firebase.firestore.FieldPath('foo', 'bar'), '>', 1234),
            ),
          ),
        );
    });

    it('throws if in query with no array value', function () {
      try {
        firebase
          .firestore()
          .collection(COLLECTION)
          .where(
            Filter.or(
              Filter.and(Filter('foo.bar', 'in', '123'), Filter('foo.bar', 'in', '123')),
              Filter.and(Filter('foo.bar', 'in', '123'), Filter('foo.bar', 'in', '123')),
            ),
          );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('A non-empty array is required');
        return Promise.resolve();
      }
    });

    it('throws if array-contains-any query with no array value', function () {
      try {
        firebase
          .firestore()
          .collection(COLLECTION)
          .where(
            Filter.or(
              Filter.and(
                Filter('foo.bar', 'array-contains-any', '123'),
                Filter('foo.bar', 'array-contains-any', '123'),
              ),
              Filter.and(
                Filter('foo.bar', 'array-contains-any', '123'),
                Filter('foo.bar', 'array-contains-any', '123'),
              ),
            ),
          );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('A non-empty array is required');
        return Promise.resolve();
      }
    });

    it('throws if in query array length is greater than 30', function () {
      try {
        const queryArray = Array.from({ length: 31 }, (_, i) => i + 1);

        firebase
          .firestore()
          .collection(COLLECTION)
          .where(
            Filter.or(
              Filter.and(Filter('foo.bar', 'in', queryArray), Filter('foo.bar', 'in', queryArray)),
              Filter.and(Filter('foo.bar', 'in', queryArray), Filter('foo.bar', 'in', queryArray)),
            ),
          );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('maximum of 10 elements in the value');
        return Promise.resolve();
      }
    });

    it('throws if query has multiple array-contains-any filter', function () {
      try {
        firebase
          .firestore()
          .collection(COLLECTION)
          .where(
            Filter.or(
              Filter.and(
                Filter('foo.bar', 'array-contains-any', [1]),
                Filter('foo.bar', 'array-contains-any', [1]),
              ),
              Filter.and(
                Filter('foo.bar', 'array-contains-any', [1]),
                Filter('foo.bar', 'array-contains-any', [1]),
              ),
            ),
          );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("You cannot use more than one 'array-contains-any' filter");
        return Promise.resolve();
      }
    });

    it("should throw error when using 'not-in' operator twice", async function () {
      const ref = firebase.firestore().collection(COLLECTION);

      try {
        ref.where(
          Filter.or(
            Filter.and(Filter('foo.bar', 'not-in', [1]), Filter('foo.bar', 'not-in', [2])),
            Filter.and(Filter('foo.bar', 'not-in', [1]), Filter('foo.bar', 'not-in', [2])),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("You cannot use more than one 'not-in' filter.");
        return Promise.resolve();
      }
    });

    it("should throw error when combining 'not-in' operator with '!=' operator", async function () {
      const ref = firebase.firestore().collection(COLLECTION);

      try {
        ref.where(
          Filter.or(
            Filter.and(Filter('foo.bar', '!=', [1]), Filter('foo.bar', 'not-in', [2])),
            Filter.and(Filter('foo.bar', '!=', [1]), Filter('foo.bar', 'not-in', [2])),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          "You cannot use 'not-in' filters with '!=' inequality filters",
        );
        return Promise.resolve();
      }
    });

    it("should throw error when combining 'not-in' operator with 'in' operator", async function () {
      const ref = firebase.firestore().collection(COLLECTION);

      try {
        ref.where(
          Filter.or(
            Filter.and(Filter('foo.bar', 'in', [1]), Filter('foo.bar', 'not-in', [2])),
            Filter.and(Filter('foo.bar', 'in', [1]), Filter('foo.bar', 'not-in', [2])),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("You cannot use 'not-in' filters with 'in' filters.");
        return Promise.resolve();
      }
    });

    it("should throw error when combining 'not-in' operator with 'array-contains-any' operator", async function () {
      const ref = firebase.firestore().collection(COLLECTION);

      try {
        ref.where(
          Filter.or(
            Filter.and(
              Filter('foo.bar', 'array-contains-any', [1]),
              Filter('foo.bar', 'not-in', [2]),
            ),
            Filter.and(
              Filter('foo.bar', 'array-contains-any', [1]),
              Filter('foo.bar', 'not-in', [2]),
            ),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          "You cannot use 'not-in' filters with 'array-contains-any' filters.",
        );
        return Promise.resolve();
      }
    });

    it("should throw error when 'not-in' filter has a list of more than 10 items", async function () {
      const ref = firebase.firestore().collection(COLLECTION);

      try {
        ref.where(
          Filter.or(
            Filter.and(
              Filter('foo.bar', '==', 1),
              Filter('foo.bar', 'not-in', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
            ),
            Filter.and(
              Filter('foo.bar', '==', 1),
              Filter('foo.bar', 'not-in', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
            ),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'filters support a maximum of 10 elements in the value array.',
        );
        return Promise.resolve();
      }
    });

    it('should throw an error if you use a FieldPath on a filter in conjunction with an orderBy() parameter that is not FieldPath', async function () {
      try {
        firebase
          .firestore()
          .collection(COLLECTION)
          .where(
            Filter.or(
              Filter.and(
                Filter(firebase.firestore.FieldPath.documentId(), '==', ['document-id']),
                Filter('foo.bar', 'not-in', [1, 2, 3, 4]),
              ),
              Filter.and(
                Filter(firebase.firestore.FieldPath.documentId(), '==', ['document-id']),
                Filter('foo.bar', '==', 'something'),
              ),
            ),
          )
          .orderBy('differentOrderBy', 'desc');

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'FirestoreFieldPath' cannot be used in conjunction");
        return Promise.resolve();
      }
    });

    it("should throw error when using '!=' operator twice ", async function () {
      const ref = firebase.firestore().collection(COLLECTION);

      try {
        ref.where(
          Filter.or(
            Filter.and(Filter('foo.bar', '!=', 1), Filter('foo.baz', '!=', 2)),
            Filter.and(Filter('foo.bar', '!=', 1), Filter('foo.baz', '!=', 2)),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("You cannot use more than one '!=' inequality filter.");
        return Promise.resolve();
      }
    });

    it("should allow query when combining '!=' operator with any other inequality operator on a different field", async function () {
      const colRef = firebase
        .firestore()
        .collection(`${COLLECTION}/filter/inequality-combine-not-equal`);
      const expected = { foo: { bar: 300 }, bar: 200 };
      await Promise.all([
        colRef.add({ foo: { bar: 1 }, bar: 1 }),
        colRef.add(expected),
        colRef.add(expected),
      ]);
      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(Filter('foo.bar', '>', 123), Filter('bar', '>', 123)),
            Filter.and(Filter('foo.bar', '!=', 1), Filter('bar', '>', 2)),
          ),
        )
        .get();
      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    /* Queries */

    // OR queries without ANDs

    // Equals OR another filter that works: '==', '>', '>=', '<', '<=', '!='

    it('returns with where "==" Filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals`);

      const expected = { foo: 'bar' };
      const expected2 = { foo: 'farm' };

      await Promise.all([
        colRef.add({ foo: 'something' }),
        colRef.add(expected),
        colRef.add(expected2),
      ]);

      const snapshot = await colRef
        .where(Filter.or(Filter('foo', '==', 'bar'), Filter('foo', '==', 'farm')))
        .get();

      snapshot.size.should.eql(2);
      const results = snapshot.docs.map(doc => doc.data().foo);
      results.should.containEql('bar');
      results.should.containEql('farm');
    });

    it('returns with where ">" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/greater-than`);

      const expected = { foo: 100 };

      await Promise.all([colRef.add({ foo: 2 }), colRef.add(expected), colRef.add(expected)]);

      const snapshot = await colRef
        .where(Filter.or(Filter('foo', '>', 2), Filter('foo', '==', 30)))
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "<" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/less-than`);

      const expected = { foo: 2 };

      await Promise.all([colRef.add({ foo: 100 }), colRef.add(expected), colRef.add(expected)]);

      const snapshot = await colRef
        .where(Filter.or(Filter('foo', '<', 3), Filter('foo', '==', 22)))
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where ">=" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/greater-than-or-equal`);

      const expected = { foo: 100 };

      await Promise.all([colRef.add({ foo: 2 }), colRef.add(expected), colRef.add(expected)]);

      const snapshot = await colRef
        .where(Filter.or(Filter('foo', '>=', 100), Filter('foo', '==', 45)))
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "<=" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/less-than-or-equal`);

      const expected = { foo: 100 };

      await Promise.all([colRef.add({ foo: 101 }), colRef.add(expected), colRef.add(expected)]);

      const snapshot = await colRef
        .where(Filter.or(Filter('foo', '<=', 100), Filter('foo', '==', 90)))
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    // // Equals OR another filter that works: "array-contains", "in", "array-contains-any", "not-in"

    it('returns "array-contains" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/array-contains`);

      const expected = { foo: 'bar', something: [1, 2, 3] };

      await Promise.all([
        colRef.add({ foo: 'something' }),
        colRef.add(expected),
        colRef.add(expected),
      ]);

      const snapshot = await colRef
        .where(Filter.or(Filter('foo', '==', 'not-this'), Filter('something', 'array-contains', 2)))
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        const data = s.data();
        data.foo.should.eql('bar');
        data.something[0].should.eql(1);
        data.something[1].should.eql(2);
        data.something[2].should.eql(3);
      });
    });

    it('returns "array-contains-any" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/array-contains-any`);

      const expected = { foo: 'bar', something: [1, 2, 3] };

      await Promise.all([
        colRef.add({ foo: 'something' }),
        colRef.add(expected),
        colRef.add(expected),
      ]);

      const snapshot = await colRef
        .where(
          Filter.or(
            Filter('foo', '==', 'not-this'),
            Filter('something', 'array-contains-any', [2, 45]),
          ),
        )
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        const data = s.data();
        data.foo.should.eql('bar');
        data.something[0].should.eql(1);
        data.something[1].should.eql(2);
        data.something[2].should.eql(3);
      });
    });

    it('returns with where "not-in" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/not-in`);
      const expected = 'bar';
      const data = { foo: expected };

      await Promise.all([
        colRef.add({ foo: 'not' }),
        colRef.add({ foo: 'this' }),
        colRef.add(data),
        colRef.add(data),
      ]);

      const snapshot = await colRef.where(Filter('foo', 'not-in', ['not', 'this'])).get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().foo.should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "in" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/in`);
      const expected1 = 'bar';
      const expected2 = 'baz';
      const data1 = { foo: expected1 };
      const data2 = { foo: expected2 };

      await Promise.all([
        colRef.add({ foo: 'not' }),
        colRef.add({ foo: 'this' }),
        colRef.add(data1),
        colRef.add(data2),
      ]);

      const snapshot = await colRef
        .where(
          Filter.or(Filter('foo', 'in', [expected1, expected2]), Filter('foo', '==', 'not-this')),
        )
        .get();

      snapshot.size.should.eql(2);
      const results = snapshot.docs.map(d => d.data().foo);
      results.should.containEql(expected1);
      results.should.containEql(expected2);
    });

    // OR queries with ANDs. Equals and: '==', '>', '>=', '<', '<=', '!='
    it('returns with where "==" && "==" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals`);

      const expected = { foo: 'bar', bar: 'baz' };
      await Promise.all([
        colRef.add({ foo: [1, '1', 'something'] }),
        colRef.add(expected),
        colRef.add(expected),
      ]);

      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(Filter('foo', '==', 'bar'), Filter('bar', '==', 'baz')),
            Filter.and(Filter('blah', '==', 'blah'), Filter('not', '==', 'this')),
          ),
        )
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "==" & "!=" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals`);

      const expected = { foo: 'bar', baz: 'baz' };
      const notExpected = { foo: 'bar', baz: 'something' };
      await Promise.all([colRef.add(notExpected), colRef.add(expected), colRef.add(expected)]);

      const snapshot = await colRef
        .where(Filter.and(Filter('foo', '==', 'bar'), Filter('baz', '!=', 'something')))
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "==" & ">" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals-not-equals`);

      const expected = { foo: 'bar', population: 200 };
      const notExpected = { foo: 'bar', population: 1 };
      await Promise.all([colRef.add(notExpected), colRef.add(expected), colRef.add(expected)]);

      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(Filter('foo', '==', 'bar'), Filter('population', '>', 2)),
            Filter.and(Filter('foo', '==', 'not-this'), Filter('population', '>', 199)),
          ),
        )
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "==" & "<" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals`);

      const expected = { foo: 'bar', population: 200 };
      const notExpected = { foo: 'bar', population: 1000 };
      await Promise.all([colRef.add(notExpected), colRef.add(expected), colRef.add(expected)]);

      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(Filter('foo', '==', 'bar'), Filter('population', '<', 201)),
            Filter.and(Filter('foo', '==', 'not-this'), Filter('population', '<', 201)),
          ),
        )
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "==" & "<=" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals`);

      const expected = { foo: 'bar', population: 200 };
      const notExpected = { foo: 'bar', population: 1000 };
      await Promise.all([colRef.add(notExpected), colRef.add(expected), colRef.add(expected)]);

      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(Filter('foo', '==', 'bar'), Filter('population', '<=', 200)),
            Filter.and(Filter('foo', '==', 'not-this'), Filter('population', '<=', 200)),
          ),
        )
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "==" & ">=" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals`);

      const expected = { foo: 'bar', population: 200 };
      const notExpected = { foo: 'bar', population: 100 };
      await Promise.all([colRef.add(notExpected), colRef.add(expected), colRef.add(expected)]);

      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(Filter('foo', '==', 'bar'), Filter('population', '>=', 200)),
            Filter.and(Filter('foo', '==', 'not-this'), Filter('population', '>=', 200)),
          ),
        )
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    // Using OR and AND query combinations with Equals && "array-contains", "array-contains-any", "not-in" and "in" filters

    it('returns with where "==" & "array-contains" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals`);

      const match = Date.now();
      await Promise.all([
        colRef.add({ foo: [1, '1', match] }),
        colRef.add({ foo: [1, '2', match.toString()], bar: 'baz' }),
        colRef.add({ foo: [1, '2', match.toString()], bar: 'baz' }),
      ]);

      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(
              Filter('foo', 'array-contains', match.toString()),
              Filter('bar', '==', 'baz'),
            ),
            Filter.and(Filter('foo', '==', 'not-this'), Filter('bar', '==', 'baz')),
          ),
        )
        .get();
      const expected = [1, '2', match.toString()];

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().foo.should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "==" & "array-contains-any" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals`);

      const match = Date.now();
      await Promise.all([
        colRef.add({ foo: [1, '1', match] }),
        colRef.add({ foo: [1, '2'], bar: 'baz' }),
        colRef.add({ foo: ['2', match.toString()], bar: 'baz' }),
      ]);

      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(
              Filter('foo', 'array-contains-any', [match.toString(), 1]),
              Filter('bar', '==', 'baz'),
            ),
            Filter.and(Filter('foo', '==', 'not-this'), Filter('bar', '==', 'baz')),
          ),
        )
        .get();

      snapshot.size.should.eql(2);
      snapshot.docs[0].data().bar.should.equal('baz');
      snapshot.docs[1].data().bar.should.equal('baz');
    });

    it('returns with where "==" & "not-in" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/not-in`);

      await Promise.all([
        colRef.add({ foo: 'bar', bar: 'baz' }),
        colRef.add({ foo: 'thing', bar: 'baz' }),
        colRef.add({ foo: 'bar', bar: 'baz' }),
        colRef.add({ foo: 'yolo', bar: 'baz' }),
      ]);

      const snapshot = await colRef
        .where(Filter.and(Filter('foo', 'not-in', ['yolo', 'thing']), Filter('bar', '==', 'baz')))
        .get();

      snapshot.size.should.eql(2);
      snapshot.docs[0].data().foo.should.equal('bar');
      snapshot.docs[1].data().foo.should.equal('bar');
    });

    it('returns with where "==" & "in" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/in`);

      await Promise.all([
        colRef.add({ foo: 'bar', bar: 'baz' }),
        colRef.add({ foo: 'thing', bar: 'baz' }),
        colRef.add({ foo: 'yolo', bar: 'baz' }),
      ]);

      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(Filter('foo', 'in', ['bar', 'yolo']), Filter('bar', '==', 'baz')),
            Filter.and(Filter('foo', '==', 'not-this'), Filter('bar', '==', 'baz')),
          ),
        )
        .get();

      snapshot.size.should.eql(2);
      const result = snapshot.docs.map(d => d.data().foo);
      result.should.containEql('bar');
      result.should.containEql('yolo');
    });

    // Backwards compatibility Filter queries. Add where() queries and also use multiple where() queries with Filters to check it works

    it('backwards compatible with existing where() "==" && "==" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals`);

      const expected = { foo: 'bar', bar: 'baz', existing: 'where' };
      await Promise.all([
        colRef.add({ foo: [1, '1', 'something'] }),
        colRef.add(expected),
        colRef.add(expected),
      ]);

      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(Filter('foo', '==', 'bar'), Filter('bar', '==', 'baz')),
            Filter.and(Filter('blah', '==', 'blah'), Filter('not', '==', 'this')),
          ),
        )
        .where('existing', '==', 'where')
        .get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('backwards compatible with existing where() query, returns with where "==" & "array-contains" filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals`);

      const match = Date.now();
      await Promise.all([
        colRef.add({ foo: [1, '1', match] }),
        colRef.add({ foo: [1, '2', match.toString()], bar: 'baz', existing: 'where' }),
        colRef.add({ foo: [1, '2', match.toString()], bar: 'baz', existing: 'where' }),
      ]);

      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(
              Filter('foo', 'array-contains', match.toString()),
              Filter('bar', '==', 'baz'),
            ),
            Filter.and(Filter('foo', '==', 'not-this'), Filter('bar', '==', 'baz')),
          ),
        )
        .where('existing', '==', 'where')
        .get();
      const expected = [1, '2', match.toString()];

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().foo.should.eql(jet.contextify(expected));
      });
    });

    it('backwards compatible whilst chaining Filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals`);

      const match = Date.now();
      await Promise.all([
        colRef.add({ foo: [1, '1', match] }),
        colRef.add({
          foo: [1, '2', match.toString()],
          bar: 'baz',
          existing: 'where',
          another: 'filter',
        }),
        colRef.add({
          foo: [1, '2', match.toString()],
          bar: 'baz',
          existing: 'where',
          another: 'filter',
        }),
      ]);

      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(
              Filter('foo', 'array-contains', match.toString()),
              Filter('bar', '==', 'baz'),
            ),
            Filter.and(Filter('foo', '==', 'not-this'), Filter('bar', '==', 'baz')),
          ),
        )
        .where('existing', '==', 'where')
        .where(Filter('another', '==', 'filter'))
        .get();
      const expected = [1, '2', match.toString()];

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().foo.should.eql(jet.contextify(expected));
      });
    });

    it('backwards compatible whilst chaining AND Filter', async function () {
      const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals`);

      const match = Date.now();
      await Promise.all([
        colRef.add({ foo: [1, '1', match] }),
        colRef.add({
          foo: [1, '2', match.toString()],
          bar: 'baz',
          existing: 'where',
          another: 'filter',
          chain: 'and',
        }),
        colRef.add({
          foo: [1, '2', match.toString()],
          bar: 'baz',
          existing: 'where',
          another: 'filter',
          chain: 'and',
        }),
      ]);

      const snapshot = await colRef
        .where(
          Filter.or(
            Filter.and(
              Filter('foo', 'array-contains', match.toString()),
              Filter('bar', '==', 'baz'),
            ),
            Filter.and(Filter('foo', '==', 'not-this'), Filter('bar', '==', 'baz')),
          ),
        )
        .where('existing', '==', 'where')
        .where(Filter.and(Filter('another', '==', 'filter'), Filter('chain', '==', 'and')))
        .get();
      const expected = [1, '2', match.toString()];

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().foo.should.eql(jet.contextify(expected));
      });
    });
  });

  describe('modular', function () {
    it('throws if using nested or() queries', async function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      const firestore = getFirestore();
      try {
        query(
          collection(firestore, COLLECTION),
          where(
            or(
              or(where('foo', '==', 'bar'), where('bar', '==', 'foo')),
              or(where('foo', '==', 'baz'), where('bar', '==', 'baz')),
            ),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('OR Filters with nested OR Filters are not supported');
      }

      try {
        query(
          collection(firestore, COLLECTION),
          where(
            or(
              and(
                or(where('foo', '==', 'bar'), where('bar', '==', 'baz')),
                where('more', '==', 'stuff'),
              ),
              and(
                or(where('foo', '==', 'bar'), where('bar', '==', 'baz')),
                where('baz', '==', 'foo'),
              ),
            ),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('OR Filters with nested OR Filters are not supported');
      }
      return Promise.resolve();
    });

    it('throws if fieldPath string is invalid', function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      try {
        query(
          collection(getFirestore(), COLLECTION),
          or(
            and(where('.foo.bar', '!=', 1), where('.foo.bar', '==', 1)),
            and(where('.foo.bar', '!=', 1), where('foo.bar', '==', 1)),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'fieldPath' Invalid field path");
        return Promise.resolve();
      }
    });

    it('throws if operator string is invalid', function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      try {
        query(
          collection(getFirestore(), COLLECTION),
          or(
            and(where('foo.bar', '!', 1), where('foo.bar', '!', 1)),
            and(where('foo.bar', '!', 1), where('foo.bar', '!', 1)),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'opStr' is invalid");
        return Promise.resolve();
      }
    });

    it('throws if query contains multiple array-contains', function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      try {
        query(
          collection(getFirestore(), COLLECTION),
          or(
            and(where('foo.bar', 'array-contains', 1), where('foo.bar', 'array-contains', 1)),
            and(where('foo.bar', '==', 1), where('foo.bar', '==', 2)),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('Queries only support a single array-contains filter');
        return Promise.resolve();
      }
    });

    it('throws if value is not defined', function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      try {
        query(
          collection(getFirestore(), COLLECTION),
          or(
            and(where('foo.bar', 'array-contains'), where('foo.bar', 'array-contains')),
            and(where('foo.bar', '!', 1), where('foo.bar', '!', 1)),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'value' argument expected");
        return Promise.resolve();
      }
    });

    it('throws if null value and no equal operator', function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      try {
        query(
          collection(getFirestore(), COLLECTION),
          or(
            and(where('foo.bar', '==', null), where('foo.bar', 'array-contains', null)),
            and(where('foo.bar', '!', 1), where('foo.bar', '!', 1)),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('You can only perform equals comparisons on null');
        return Promise.resolve();
      }
    });

    it('allows null to be used with equal operator', function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      query(
        collection(getFirestore(), COLLECTION),
        or(
          and(where('foo.bar', '==', null), where('foo.bar', '==', null)),
          and(where('foo.bar', '==', null), where('foo.bar', '==', null)),
        ),
      );
    });

    it('allows null to be used with not equal operator', function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      query(
        collection(getFirestore(), COLLECTION),
        or(
          and(where('foo.bar', '==', null), where('foo.bar', '!=', null)),
          and(where('foo.bar', '==', null), where('foo.bar', '==', 'something')),
        ),
      );
    });

    it('allows multiple inequalities (excluding `!=`) on different paths provided', async function () {
      const { where, or, and, query } = firestoreModular;

      const colRef = firebase
        .firestore()
        .collection(`${COLLECTION}/filter/different-path-inequality`);
      const expected = { foo: { bar: 300 }, bar: 200 };
      await Promise.all([
        colRef.add({ foo: { bar: 1 }, bar: 1 }),
        colRef.add(expected),
        colRef.add(expected),
      ]);

      const snapshot = await query(
        colRef,
        or(
          and(where('foo.bar', '>', 123), where('bar', '>', 123)),
          and(where('foo.bar', '>', 123), where('bar', '!=', 1)),
        ),
      ).get();
      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('allows inequality on the same path', function () {
      const { getFirestore, collection, where, or, and, query, FieldPath } = firestoreModular;
      query(
        collection(getFirestore(), COLLECTION),
        or(
          and(where('foo.bar', '>', 123), where(new FieldPath('foo', 'bar'), '>', 1234)),
          and(where('foo.bar', '>', 123), where(new FieldPath('foo', 'bar'), '>', 1234)),
        ),
      );
    });

    it('throws if in query with no array value', function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      try {
        query(
          collection(getFirestore(), COLLECTION),
          or(
            and(where('foo.bar', 'in', '123'), where('foo.bar', 'in', '123')),
            and(where('foo.bar', 'in', '123'), where('foo.bar', 'in', '123')),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('A non-empty array is required');
        return Promise.resolve();
      }
    });

    it('throws if array-contains-any query with no array value', function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      try {
        query(
          collection(getFirestore(), COLLECTION),
          or(
            and(
              where('foo.bar', 'array-contains-any', '123'),
              where('foo.bar', 'array-contains-any', '123'),
            ),
            and(
              where('foo.bar', 'array-contains-any', '123'),
              where('foo.bar', 'array-contains-any', '123'),
            ),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('A non-empty array is required');
        return Promise.resolve();
      }
    });

    it('throws if in query array length is greater than 30', function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      const queryArray = Array.from({ length: 31 }, (_, i) => i + 1);

      try {
        query(
          collection(getFirestore(), COLLECTION),
          or(
            and(where('foo.bar', 'in', queryArray), where('foo.bar', 'in', queryArray)),
            and(where('foo.bar', 'in', queryArray), where('foo.bar', 'in', queryArray)),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('maximum of 10 elements in the value');
        return Promise.resolve();
      }
    });

    it('throws if query has multiple array-contains-any filter', function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      try {
        query(
          collection(getFirestore(), COLLECTION),
          or(
            and(
              where('foo.bar', 'array-contains-any', [1]),
              where('foo.bar', 'array-contains-any', [1]),
            ),
            and(
              where('foo.bar', 'array-contains-any', [1]),
              where('foo.bar', 'array-contains-any', [1]),
            ),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("You cannot use more than one 'array-contains-any' filter");
        return Promise.resolve();
      }
    });

    it("should throw error when using 'not-in' operator twice", async function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      const ref = collection(getFirestore(), COLLECTION);

      try {
        query(
          ref,
          or(
            and(where('foo.bar', 'not-in', [1]), where('foo.bar', 'not-in', [2])),
            and(where('foo.bar', 'not-in', [1]), where('foo.bar', 'not-in', [2])),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("You cannot use more than one 'not-in' filter.");
        return Promise.resolve();
      }
    });

    it("should throw error when combining 'not-in' operator with '!=' operator", async function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      const ref = collection(getFirestore(), COLLECTION);

      try {
        query(
          ref,
          or(
            and(where('foo.bar', '!=', [1]), where('foo.bar', 'not-in', [2])),
            and(where('foo.bar', '!=', [1]), where('foo.bar', 'not-in', [2])),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          "You cannot use 'not-in' filters with '!=' inequality filters",
        );
        return Promise.resolve();
      }
    });

    it("should throw error when combining 'not-in' operator with 'in' operator", async function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      const ref = collection(getFirestore(), COLLECTION);

      try {
        query(
          ref,
          or(
            and(where('foo.bar', 'in', [1]), where('foo.bar', 'not-in', [2])),
            and(where('foo.bar', 'in', [1]), where('foo.bar', 'not-in', [2])),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("You cannot use 'not-in' filters with 'in' filters.");
        return Promise.resolve();
      }
    });

    it("should throw error when combining 'not-in' operator with 'array-contains-any' operator", async function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      const ref = collection(getFirestore(), COLLECTION);

      try {
        query(
          ref,
          or(
            and(where('foo.bar', 'array-contains-any', [1]), where('foo.bar', 'not-in', [2])),
            and(where('foo.bar', 'array-contains-any', [1]), where('foo.bar', 'not-in', [2])),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          "You cannot use 'not-in' filters with 'array-contains-any' filters.",
        );
        return Promise.resolve();
      }
    });

    it("should throw error when 'not-in' filter has a list of more than 10 items", async function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      const ref = collection(getFirestore(), COLLECTION);

      try {
        query(
          ref,
          or(
            and(
              where('foo.bar', '==', 1),
              where('foo.bar', 'not-in', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
            ),
            and(
              where('foo.bar', '==', 1),
              where('foo.bar', 'not-in', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
            ),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'filters support a maximum of 10 elements in the value array.',
        );
        return Promise.resolve();
      }
    });

    it('should throw an error if you use a FieldPath on a filter in conjunction with an orderBy() parameter that is not FieldPath', async function () {
      const { getFirestore, collection, where, orderBy, or, and, query, FieldPath } =
        firestoreModular;
      try {
        query(
          collection(getFirestore(), COLLECTION),
          or(
            and(
              where(FieldPath.documentId(), '==', ['document-id']),
              where('foo.bar', 'not-in', [1, 2, 3, 4]),
            ),
            and(
              where(FieldPath.documentId(), '==', ['document-id']),
              where('foo.bar', '==', 'something'),
            ),
          ),
          orderBy('differentOrderBy', 'desc'),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'FirestoreFieldPath' cannot be used in conjunction");
        return Promise.resolve();
      }
    });

    it("should throw error when using '!=' operator twice ", async function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      const ref = collection(getFirestore(), COLLECTION);

      try {
        query(
          ref,
          or(
            and(where('foo.bar', '!=', 1), where('foo.baz', '!=', 2)),
            and(where('foo.bar', '!=', 1), where('foo.baz', '!=', 2)),
          ),
        );

        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("You cannot use more than one '!=' inequality filter.");
        return Promise.resolve();
      }
    });

    it("should allow query when combining '!=' operator with any other inequality operator on a different field", async function () {
      const { getFirestore, collection, where, or, and, query } = firestoreModular;
      const colRef = collection(
        getFirestore(),
        `${COLLECTION}/filter/inequality-combine-not-equal`,
      );
      const expected = { foo: { bar: 300 }, bar: 200 };
      await Promise.all([
        colRef.add({ foo: { bar: 1 }, bar: 1 }),
        colRef.add(expected),
        colRef.add(expected),
      ]);

      const snapshot = await query(
        colRef,
        or(
          and(where('foo.bar', '>', 123), where('bar', '>', 123)),
          and(where('foo.bar', '!=', 1), where('bar', '<', 2)),
        ),
      ).get();

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    /* Queries */

    // OR queries without ANDs

    // Equals OR another filter that works: '==', '>', '>=', '<', '<=', '!='

    it('returns with where "==" Filter', async function () {
      const { getFirestore, collection, where, or, query, addDoc, getDocs } = firestoreModular;

      const colRef = collection(getFirestore(), `${COLLECTION}/filter/equals-modular`);

      const expected = { foo: 'bar' };
      const expected2 = { foo: 'farm' };

      await Promise.all([
        addDoc(colRef, { foo: 'something' }),
        addDoc(colRef, expected),
        addDoc(colRef, expected2),
      ]);

      const snapshot = await getDocs(
        query(colRef, or(where('foo', '==', 'bar'), where('foo', '==', 'farm'))),
      );

      snapshot.size.should.eql(2);
      const results = snapshot.docs.map(doc => doc.data().foo);
      results.should.containEql('bar');
      results.should.containEql('farm');
    });

    it('returns with where ">" filter', async function () {
      const { getFirestore, collection, where, or, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/greater-than-modular`);

      const expected = { foo: 100 };

      await Promise.all([
        addDoc(colRef, { foo: 2 }),
        addDoc(colRef, expected),
        addDoc(colRef, expected),
      ]);

      const snapshot = await getDocs(
        query(colRef, or(where('foo', '>', 2), where('foo', '==', 30))),
      );

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "<" filter', async function () {
      const { getFirestore, collection, where, or, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/less-than-modular`);

      const expected = { foo: 2 };

      await Promise.all([
        addDoc(colRef, { foo: 100 }),
        addDoc(colRef, expected),
        addDoc(colRef, expected),
      ]);

      const snapshot = await getDocs(
        query(colRef, or(where('foo', '<', 3), where('foo', '==', 22))),
      );

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where ">=" filter', async function () {
      const { getFirestore, collection, where, or, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(
        getFirestore(),
        `${COLLECTION}/filter/greater-than-or-equal-modular`,
      );

      const expected = { foo: 100 };

      await Promise.all([
        addDoc(colRef, { foo: 2 }),
        addDoc(colRef, expected),
        addDoc(colRef, expected),
      ]);

      const snapshot = await getDocs(
        query(colRef, or(where('foo', '>=', 100), where('foo', '==', 45))),
      );

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "<=" filter', async function () {
      const { getFirestore, collection, where, or, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/less-than-or-equal-modular`);

      const expected = { foo: 100 };

      await Promise.all([
        addDoc(colRef, { foo: 101 }),
        addDoc(colRef, expected),
        addDoc(colRef, expected),
      ]);

      const snapshot = await getDocs(
        query(colRef, or(where('foo', '<=', 100), where('foo', '==', 90))),
      );

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    // // Equals OR another filter that works: "array-contains", "in", "array-contains-any", "not-in"

    it('returns "array-contains" filter', async function () {
      const { getFirestore, collection, where, or, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/array-contains-modular`);

      const expected = { foo: 'bar', something: [1, 2, 3] };

      await Promise.all([
        addDoc(colRef, { foo: 'something' }),
        addDoc(colRef, expected),
        addDoc(colRef, expected),
      ]);

      const snapshot = await getDocs(
        query(colRef, or(where('foo', '==', 'not-this'), where('something', 'array-contains', 2))),
      );

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        const data = s.data();
        data.foo.should.eql('bar');
        data.something[0].should.eql(1);
        data.something[1].should.eql(2);
        data.something[2].should.eql(3);
      });
    });

    it('returns "array-contains-any" filter', async function () {
      const { getFirestore, collection, where, or, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/array-contains-any-modular`);

      const expected = { foo: 'bar', something: [1, 2, 3] };

      await Promise.all([
        addDoc(colRef, { foo: 'something' }),
        addDoc(colRef, expected),
        addDoc(colRef, expected),
      ]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(where('foo', '==', 'not-this'), where('something', 'array-contains-any', [2, 45])),
        ),
      );

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        const data = s.data();
        data.foo.should.eql('bar');
        data.something[0].should.eql(1);
        data.something[1].should.eql(2);
        data.something[2].should.eql(3);
      });
    });

    it('returns with where "not-in" filter', async function () {
      const { getFirestore, collection, where, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/not-in-modular`);
      const expected = 'bar';
      const data = { foo: expected };

      await Promise.all([
        addDoc(colRef, { foo: 'not' }),
        addDoc(colRef, { foo: 'this' }),
        addDoc(colRef, data),
        addDoc(colRef, data),
      ]);

      const snapshot = await getDocs(query(colRef, where('foo', 'not-in', ['not', 'this'])));

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().foo.should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "in" filter', async function () {
      const { getFirestore, collection, where, or, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/in-modular`);
      const expected1 = 'bar';
      const expected2 = 'baz';
      const data1 = { foo: expected1 };
      const data2 = { foo: expected2 };

      await Promise.all([
        addDoc(colRef, { foo: 'not' }),
        addDoc(colRef, { foo: 'this' }),
        addDoc(colRef, data1),
        addDoc(colRef, data2),
      ]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(where('foo', 'in', [expected1, expected2]), where('foo', '==', 'not-this')),
        ),
      );

      snapshot.size.should.eql(2);
      const results = snapshot.docs.map(d => d.data().foo);
      results.should.containEql(expected1);
      results.should.containEql(expected2);
    });

    // OR queries with ANDs. Equals and: '==', '>', '>=', '<', '<=', '!='
    it('returns with where "==" && "==" filter', async function () {
      const { getFirestore, collection, where, or, and, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/equals-modular`);

      const expected = { foo: 'bar', bar: 'baz' };
      await Promise.all([
        addDoc(colRef, { foo: [1, '1', 'something'] }),
        addDoc(colRef, expected),
        addDoc(colRef, expected),
      ]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(
            and(where('foo', '==', 'bar'), where('bar', '==', 'baz')),
            and(where('blah', '==', 'blah'), where('not', '==', 'this')),
          ),
        ),
      );

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "==" & "!=" filter', async function () {
      const { getFirestore, collection, where, and, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/equals-modular`);

      const expected = { foo: 'bar', baz: 'baz' };
      const notExpected = { foo: 'bar', baz: 'something' };
      await Promise.all([
        addDoc(colRef, notExpected),
        addDoc(colRef, expected),
        addDoc(colRef, expected),
      ]);

      const snapshot = await getDocs(
        query(colRef, and(where('foo', '==', 'bar'), where('baz', '!=', 'something'))),
      );

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "==" & ">" filter', async function () {
      const { getFirestore, collection, where, or, and, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/equals-not-equals-modular`);

      const expected = { foo: 'bar', population: 200 };
      const notExpected = { foo: 'bar', population: 1 };
      await Promise.all([
        addDoc(colRef, notExpected),
        addDoc(colRef, expected),
        addDoc(colRef, expected),
      ]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(
            and(where('foo', '==', 'bar'), where('population', '>', 2)),
            and(where('foo', '==', 'not-this'), where('population', '>', 199)),
          ),
        ),
      );

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "==" & "<" filter', async function () {
      const { getFirestore, collection, where, or, and, query, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/equals-modular`);

      const expected = { foo: 'bar', population: 200 };
      const notExpected = { foo: 'bar', population: 1000 };
      await Promise.all([colRef.add(notExpected), colRef.add(expected), colRef.add(expected)]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(
            and(where('foo', '==', 'bar'), where('population', '<', 201)),
            and(where('foo', '==', 'not-this'), where('population', '<', 201)),
          ),
        ),
      );

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "==" & "<=" filter', async function () {
      const { getFirestore, collection, where, or, and, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/equals-modular`);

      const expected = { foo: 'bar', population: 200 };
      const notExpected = { foo: 'bar', population: 1000 };
      await Promise.all([
        addDoc(colRef, notExpected),
        addDoc(colRef, expected),
        addDoc(colRef, expected),
      ]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(
            and(where('foo', '==', 'bar'), where('population', '<=', 200)),
            and(where('foo', '==', 'not-this'), where('population', '<=', 200)),
          ),
        ),
      );

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "==" & ">=" filter', async function () {
      const { getFirestore, collection, where, or, and, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/equals-modular`);

      const expected = { foo: 'bar', population: 200 };
      const notExpected = { foo: 'bar', population: 100 };
      await Promise.all([
        addDoc(colRef, notExpected),
        addDoc(colRef, expected),
        addDoc(colRef, expected),
      ]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(
            and(where('foo', '==', 'bar'), where('population', '>=', 200)),
            and(where('foo', '==', 'not-this'), where('population', '>=', 200)),
          ),
        ),
      );

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    // Using OR and AND query combinations with Equals && "array-contains", "array-contains-any", "not-in" and "in" filters

    it('returns with where "==" & "array-contains" filter', async function () {
      const { getFirestore, collection, where, or, and, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/equals-modular`);

      const match = Date.now();
      await Promise.all([
        addDoc(colRef, { foo: [1, '1', match] }),
        addDoc(colRef, { foo: [1, '2', match.toString()], bar: 'baz' }),
        addDoc(colRef, { foo: [1, '2', match.toString()], bar: 'baz' }),
      ]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(
            and(where('foo', 'array-contains', match.toString()), where('bar', '==', 'baz')),
            and(where('foo', '==', 'not-this'), where('bar', '==', 'baz')),
          ),
        ),
      );
      const expected = [1, '2', match.toString()];

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().foo.should.eql(jet.contextify(expected));
      });
    });

    it('returns with where "==" & "array-contains-any" filter', async function () {
      const { getFirestore, collection, where, or, and, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/equals-modular`);

      const match = Date.now();
      await Promise.all([
        addDoc(colRef, { foo: [1, '1', match] }),
        addDoc(colRef, { foo: [1, '2'], bar: 'baz' }),
        addDoc(colRef, { foo: ['2', match.toString()], bar: 'baz' }),
      ]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(
            and(
              where('foo', 'array-contains-any', [match.toString(), 1]),
              where('bar', '==', 'baz'),
            ),
            and(where('foo', '==', 'not-this'), where('bar', '==', 'baz')),
          ),
        ),
      );

      snapshot.size.should.eql(2);
      snapshot.docs[0].data().bar.should.equal('baz');
      snapshot.docs[1].data().bar.should.equal('baz');
    });

    it('returns with where "==" & "not-in" filter', async function () {
      const { getFirestore, collection, where, and, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/not-in-modular`);

      await Promise.all([
        addDoc(colRef, { foo: 'bar', bar: 'baz' }),
        addDoc(colRef, { foo: 'thing', bar: 'baz' }),
        addDoc(colRef, { foo: 'bar', bar: 'baz' }),
        addDoc(colRef, { foo: 'yolo', bar: 'baz' }),
      ]);

      const snapshot = await getDocs(
        query(colRef, and(where('foo', 'not-in', ['yolo', 'thing']), where('bar', '==', 'baz'))),
      );

      snapshot.size.should.eql(2);
      snapshot.docs[0].data().foo.should.equal('bar');
      snapshot.docs[1].data().foo.should.equal('bar');
    });

    it('returns with where "==" & "in" filter', async function () {
      const { getFirestore, collection, where, or, and, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/in-modular`);

      await Promise.all([
        addDoc(colRef, { foo: 'bar', bar: 'baz' }),
        addDoc(colRef, { foo: 'thing', bar: 'baz' }),
        addDoc(colRef, { foo: 'yolo', bar: 'baz' }),
      ]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(
            and(where('foo', 'in', ['bar', 'yolo']), where('bar', '==', 'baz')),
            and(where('foo', '==', 'not-this'), where('bar', '==', 'baz')),
          ),
        ),
      );

      snapshot.size.should.eql(2);
      const result = snapshot.docs.map(d => d.data().foo);
      result.should.containEql('bar');
      result.should.containEql('yolo');
    });

    // Backwards compatibility Filter queries. Add where() queries and also use multiple where() queries with Filters to check it works

    it('backwards compatible with existing where() "==" && "==" filter', async function () {
      const { getFirestore, collection, where, or, and, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/equals-modular`);

      const expected = { foo: 'bar', bar: 'baz', existing: 'where' };
      await Promise.all([
        addDoc(colRef, { foo: [1, '1', 'something'] }),
        addDoc(colRef, expected),
        addDoc(colRef, expected),
      ]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(
            and(where('foo', '==', 'bar'), where('bar', '==', 'baz')),
            and(where('blah', '==', 'blah'), where('not', '==', 'this')),
          ),
          where('existing', '==', 'where'),
        ),
      );

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().should.eql(jet.contextify(expected));
      });
    });

    it('backwards compatible with existing where() query, returns with where "==" & "array-contains" filter', async function () {
      const { getFirestore, collection, where, or, and, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/equals-modular`);

      const match = Date.now();
      await Promise.all([
        addDoc(colRef, { foo: [1, '1', match] }),
        addDoc(colRef, { foo: [1, '2', match.toString()], bar: 'baz', existing: 'where' }),
        addDoc(colRef, { foo: [1, '2', match.toString()], bar: 'baz', existing: 'where' }),
      ]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(
            and(where('foo', 'array-contains', match.toString()), where('bar', '==', 'baz')),
            and(where('foo', '==', 'not-this'), where('bar', '==', 'baz')),
          ),
          where('existing', '==', 'where'),
        ),
      );
      const expected = [1, '2', match.toString()];

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().foo.should.eql(jet.contextify(expected));
      });
    });

    it('backwards compatible whilst chaining Filter', async function () {
      const { getFirestore, collection, where, or, and, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/equals-modular`);

      const match = Date.now();
      await Promise.all([
        addDoc(colRef, { foo: [1, '1', match] }),
        addDoc(colRef, {
          foo: [1, '2', match.toString()],
          bar: 'baz',
          existing: 'where',
          another: 'filter',
        }),
        addDoc(colRef, {
          foo: [1, '2', match.toString()],
          bar: 'baz',
          existing: 'where',
          another: 'filter',
        }),
      ]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(
            and(where('foo', 'array-contains', match.toString()), where('bar', '==', 'baz')),
            and(where('foo', '==', 'not-this'), where('bar', '==', 'baz')),
          ),
          where('existing', '==', 'where'),
          where('another', '==', 'filter'),
        ),
      );
      const expected = [1, '2', match.toString()];

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().foo.should.eql(jet.contextify(expected));
      });
    });

    it('backwards compatible whilst chaining AND Filter', async function () {
      const { getFirestore, collection, where, or, and, query, addDoc, getDocs } = firestoreModular;
      const colRef = collection(getFirestore(), `${COLLECTION}/filter/equals-modular`);

      const match = Date.now();
      await Promise.all([
        addDoc(colRef, { foo: [1, '1', match] }),
        addDoc(colRef, {
          foo: [1, '2', match.toString()],
          bar: 'baz',
          existing: 'where',
          another: 'filter',
          chain: 'and',
        }),
        addDoc(colRef, {
          foo: [1, '2', match.toString()],
          bar: 'baz',
          existing: 'where',
          another: 'filter',
          chain: 'and',
        }),
      ]);

      const snapshot = await getDocs(
        query(
          colRef,
          or(
            and(where('foo', 'array-contains', match.toString()), where('bar', '==', 'baz')),
            and(where('foo', '==', 'not-this'), where('bar', '==', 'baz')),
          ),
          where('existing', '==', 'where'),
          and(where('another', '==', 'filter'), where('chain', '==', 'and')),
        ),
      );
      const expected = [1, '2', match.toString()];

      snapshot.size.should.eql(2);
      snapshot.forEach(s => {
        s.data().foo.should.eql(jet.contextify(expected));
      });
    });
  });
});
