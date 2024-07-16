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

describe('firestore().collection().where(Filters)', function () {
  beforeEach(async function () {
    Filter = firebase.firestore.Filter;
    return await wipe();
  });

  it('throws if fieldPath string is invalid', function () {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(Filter('.foo.bar', '==', 1));

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
        .where(Filter('foo.bar', '!', 1));

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
        .where(Filter('foo.bar', 'array-contains', 1))
        .where(Filter('foo.bar', 'array-contains', 1));

      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('Queries only support a single array-contains filter');
      return Promise.resolve();
    }
  });

  it('throws if value is not defined', function () {
    try {
      firebase.firestore().collection(COLLECTION).where(Filter('foo', '=='));
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
        .where(Filter('foo.bar', '==', null))
        .where(Filter('foo.bar', 'array-contains', null));

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
      .where(Filter('foo.bar', '==', null));
  });

  it('allows null to be used with not equal operator', function () {
    firebase
      .firestore()
      .collection(COLLECTION)
      .where(Filter('foo.bar', '!=', null));
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
      .where(Filter('foo.bar', '>', 123))
      .where(Filter('bar', '>', 123))
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
      .where(Filter('foo.bar', '>', 123))
      .where(Filter(new firebase.firestore.FieldPath('foo', 'bar'), '>', 1234));
  });

  it('throws if in query with no array value', function () {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(Filter('foo.bar', 'in', '123'));

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
        .where(Filter('foo.bar', 'array-contains-any', '123'));

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
        .where(Filter('foo.bar', 'in', queryArray));

      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('maximum of 30 elements in the value');
      return Promise.resolve();
    }
  });

  it('throws if query has multiple array-contains-any filter', function () {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(Filter('foo.bar', 'array-contains-any', [1]))
        .where(Filter('foo.bar', 'array-contains-any', [1]));

      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("You cannot use more than one 'array-contains-any' filter");
      return Promise.resolve();
    }
  });

  it("should throw error when using 'not-in' operator twice", async function () {
    const ref = firebase.firestore().collection(COLLECTION);

    try {
      ref.where(Filter('foo.bar', 'not-in', [1])).where(Filter('foo.bar', 'not-in', [2]));
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("You cannot use more than one 'not-in' filter.");
      return Promise.resolve();
    }
  });

  it("should throw error when combining 'not-in' operator with '!=' operator", async function () {
    const ref = firebase.firestore().collection(COLLECTION);

    try {
      ref.where(Filter('foo.bar', '!=', [1])).where(Filter('foo.bar', 'not-in', [2]));
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
      ref.where(Filter('foo.bar', 'in', [1])).where(Filter('foo.bar', 'not-in', [2]));
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("You cannot use 'not-in' filters with 'in' filters.");
      return Promise.resolve();
    }
  });

  it("should throw error when combining 'not-in' operator with 'array-contains-any' operator", async function () {
    const ref = firebase.firestore().collection(COLLECTION);

    try {
      ref
        .where(Filter('foo.bar', 'array-contains-any', [1]))
        .where(Filter('foo.bar', 'not-in', [2]));

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
    const queryArray = Array.from({ length: 31 }, (_, i) => i + 1);

    try {
      ref.where(Filter('foo.bar', '==', 1)).where(Filter('foo.bar', 'not-in', queryArray));

      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        'filters support a maximum of 30 elements in the value array.',
      );
      return Promise.resolve();
    }
  });

  it('should throw an error if you use a FieldPath on a filter in conjunction with an orderBy() parameter that is not FieldPath', async function () {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(Filter(firebase.firestore.FieldPath.documentId(), '==', ['document-id']))
        .where(Filter('foo.bar', 'not-in', [1, 2, 3, 4]))
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
      ref.where(Filter('foo.bar', '!=', 1)).where(Filter('foo.baz', '!=', 2));
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
      .where(Filter('foo.bar', '>', 123))
      .where(Filter('bar', '!=', 123))
      .get();

    snapshot.size.should.eql(2);
    snapshot.forEach(s => {
      s.data().should.eql(jet.contextify(expected));
    });
  });

  /* Queries */

  // Single Filters using '==', '>', '>=', '<', '<=', '!='

  it('returns with where "==" filter', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equals`);

    const expected = { foo: 'bar' };

    await Promise.all([
      colRef.add({ foo: [1, '1', 'something'] }),
      colRef.add(expected),
      colRef.add(expected),
    ]);

    const snapshot = await colRef.where(Filter('foo', '==', 'bar')).get();

    snapshot.size.should.eql(2);
    snapshot.forEach(s => {
      s.data().should.eql(jet.contextify(expected));
    });
  });

  it('returns with where "!=" filter', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/filter/not-equals`);

    const expected = { foo: 'bar' };

    await Promise.all([
      colRef.add({ foo: 'something' }),
      colRef.add(expected),
      colRef.add(expected),
    ]);

    const snapshot = await colRef.where(Filter('foo', '!=', 'something')).get();

    snapshot.size.should.eql(2);
    snapshot.forEach(s => {
      s.data().should.eql(jet.contextify(expected));
    });
  });

  it('returns with where ">" filter', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/filter/greater-than`);

    const expected = { foo: 100 };

    await Promise.all([colRef.add({ foo: 2 }), colRef.add(expected), colRef.add(expected)]);

    const snapshot = await colRef.where(Filter('foo', '>', 2)).get();

    snapshot.size.should.eql(2);
    snapshot.forEach(s => {
      s.data().should.eql(jet.contextify(expected));
    });
  });

  it('returns with where "<" filter', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/filter/less-than`);

    const expected = { foo: 2 };

    await Promise.all([colRef.add({ foo: 100 }), colRef.add(expected), colRef.add(expected)]);

    const snapshot = await colRef.where(Filter('foo', '<', 3)).get();

    snapshot.size.should.eql(2);
    snapshot.forEach(s => {
      s.data().should.eql(jet.contextify(expected));
    });
  });

  it('returns with where ">=" filter', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/filter/greater-than-or-equal`);

    const expected = { foo: 100 };

    await Promise.all([colRef.add({ foo: 2 }), colRef.add(expected), colRef.add(expected)]);

    const snapshot = await colRef.where(Filter('foo', '>=', 100)).get();

    snapshot.size.should.eql(2);
    snapshot.forEach(s => {
      s.data().should.eql(jet.contextify(expected));
    });
  });

  it('returns with where "<=" filter', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/filter/less-than-or-equal`);

    const expected = { foo: 100 };

    await Promise.all([colRef.add({ foo: 101 }), colRef.add(expected), colRef.add(expected)]);

    const snapshot = await colRef.where(Filter('foo', '<=', 100)).get();

    snapshot.size.should.eql(2);
    snapshot.forEach(s => {
      s.data().should.eql(jet.contextify(expected));
    });
  });
});
