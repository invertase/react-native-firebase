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

setInterval(() => {}, 200);
describe('firestore().collection().where(OR Filters)', function () {
  beforeEach(async function () {
    Filter = firebase.firestore.Filter;
    return await wipe();
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

  it('throws if multiple inequalities on different paths is provided', function () {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(
          Filter.or(
            Filter.and(Filter('foo.bar', '>', 123), Filter('bar', '>', 123)),
            Filter.and(Filter('foo.bar', '>', 123), Filter('bar', '>', 123)),
          ),
        );

      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('All where filters with an inequality');
      return Promise.resolve();
    }
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

  it('throws if in query array length is greater than 10', function () {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(
          Filter.or(
            Filter.and(
              Filter('foo.bar', 'in', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
              Filter('foo.bar', 'in', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
            ),
            Filter.and(
              Filter('foo.bar', 'in', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
              Filter('foo.bar', 'in', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
            ),
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

  it('throws if query has array-contains-any & in filter', function () {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(
          Filter.or(
            Filter.and(Filter('foo.bar', 'array-contains-any', [1]), Filter('foo.bar', 'in', [2])),
            Filter.and(Filter('foo.bar', 'array-contains-any', [1]), Filter('foo.bar', 'in', [2])),
          ),
        );

      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        "You cannot use 'in' filters with 'array-contains-any' filters",
      );
      return Promise.resolve();
    }
  });

  it('throws if query has multiple in filter', function () {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(
          Filter.or(
            Filter.and(Filter('foo.bar', 'in', [1]), Filter('foo.bar', 'in', [2])),
            Filter.and(Filter('foo.bar', 'in', [1]), Filter('foo.bar', 'in', [2])),
          ),
        );

      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("You cannot use more than one 'in' filter");
      return Promise.resolve();
    }
  });

  it('throws if query has in & array-contains-any filter', function () {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(
          Filter.or(
            Filter.and(Filter('foo.bar', 'in', [1]), Filter('foo.bar', 'array-contains-any', [2])),
            Filter.and(Filter('foo.bar', 'in', [1]), Filter('foo.bar', 'array-contains-any', [2])),
          ),
        );

      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        "You cannot use 'array-contains-any' filters with 'in' filters",
      );
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

  it("should throw error when combining '!=' operator with any other inequality operator on a different field", async function () {
    const ref = firebase.firestore().collection(COLLECTION);

    try {
      ref.where(
        Filter.or(
          Filter.and(Filter('foo.bar', '!=', 1), Filter('differentField', '>', 2)),
          Filter.and(Filter('foo.bar', '!=', 1), Filter('differentField', '>', 2)),
        ),
      );
      return Promise.reject(new Error('Did not throw an Error on >.'));
    } catch (error) {
      error.message.should.containEql('must be on the same field.');
    }

    try {
      ref.where(
        Filter.or(
          Filter.and(Filter('foo.bar', '!=', 1), Filter('differentField', '<', 2)),
          Filter.and(Filter('foo.bar', '!=', 1), Filter('differentField', '<', 2)),
        ),
      );
      return Promise.reject(new Error('Did not throw an Error on <.'));
    } catch (error) {
      error.message.should.containEql('must be on the same field.');
    }

    try {
      ref.where(
        Filter.or(
          Filter.and(Filter('foo.bar', '!=', 1), Filter('differentField', '<=', 2)),
          Filter.and(Filter('foo.bar', '!=', 1), Filter('differentField', '<=', 2)),
        ),
      );
      return Promise.reject(new Error('Did not throw an Error <=.'));
    } catch (error) {
      error.message.should.containEql('must be on the same field.');
    }

    try {
      ref.where(
        Filter.or(
          Filter.and(Filter('foo.bar', '!=', 1), Filter('differentField', '>=', 2)),
          Filter.and(Filter('foo.bar', '!=', 1), Filter('differentField', '>=', 2)),
        ),
      );
      return Promise.reject(new Error('Did not throw an Error >=.'));
    } catch (error) {
      error.message.should.containEql('must be on the same field.');
    }

    return Promise.resolve();
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

    const snapshot = await colRef
      .where(Filter.or(Filter('foo', 'not-in', ['not', 'this']), Filter('foo', '==', 'not-this')))
      .get();

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
          Filter.and(Filter('foo', 'array-contains', match.toString()), Filter('bar', '==', 'baz')),
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
      .where(
        Filter.or(
          Filter.and(Filter('foo', 'not-in', ['yolo', 'thing']), Filter('bar', '==', 'baz')),
          Filter.and(Filter('foo', '==', 'not-this'), Filter('bar', '==', 'baz')),
        ),
      )
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
          Filter.and(Filter('foo', 'array-contains', match.toString()), Filter('bar', '==', 'baz')),
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
          Filter.and(Filter('foo', 'array-contains', match.toString()), Filter('bar', '==', 'baz')),
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
          Filter.and(Filter('foo', 'array-contains', match.toString()), Filter('bar', '==', 'baz')),
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
