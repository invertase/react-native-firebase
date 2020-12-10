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
describe('firestore().collection().where()', () => {
  beforeEach(async () => await wipe());
  it('throws if fieldPath is invalid', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'fieldPath' must be a string or instance of FieldPath");
      return Promise.resolve();
    }
  });

  it('throws if fieldPath string is invalid', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where('.foo.bar');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'fieldPath' Invalid field path");
      return Promise.resolve();
    }
  });

  it('throws if operator string is invalid', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where('foo.bar', '!');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'opStr' is invalid");
      return Promise.resolve();
    }
  });

  it('throws if query contains multiple array-contains', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where('foo.bar', 'array-contains', 123)
        .where('foo.bar', 'array-contains', 123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('Queries only support a single array-contains filter');
      return Promise.resolve();
    }
  });

  it('throws if value is not defined', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where('foo.bar', 'array-contains');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'value' argument expected");
      return Promise.resolve();
    }
  });

  it('throws if null value and no equal operator', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where('foo.bar', 'array-contains', null);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('You can only perform equals comparisons on null');
      return Promise.resolve();
    }
  });

  it('allows null to be used with equal operator', () => {
    firebase
      .firestore()
      .collection(COLLECTION)
      .where('foo.bar', '==', null);
  });

  it('throws if multiple inequalities on different paths is provided', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where('foo.bar', '>', 123)
        .where('bar', '>', 123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('All where filters with an inequality');
      return Promise.resolve();
    }
  });

  it('allows inequality on the same path', () => {
    firebase
      .firestore()
      .collection(COLLECTION)
      .where('foo.bar', '>', 123)
      .where(new firebase.firestore.FieldPath('foo', 'bar'), '>', 1234);
  });

  it('throws if in query with no array value', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where('foo.bar', 'in', '123');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('A non-empty array is required');
      return Promise.resolve();
    }
  });

  it('throws if array-contains-any query with no array value', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where('foo.bar', 'array-contains-any', '123');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('A non-empty array is required');
      return Promise.resolve();
    }
  });

  it('throws if in query array length is greater than 10', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where('foo.bar', 'in', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('maximum of 10 elements in the value');
      return Promise.resolve();
    }
  });

  it('throws if query has multiple array-contains-any filter', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where('foo.bar', 'array-contains-any', [1])
        .where('foo.bar', 'array-contains-any', [2]);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("You cannot use more than one 'array-contains-any' filter");
      return Promise.resolve();
    }
  });

  it('throws if query has array-contains-any & in filter', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where('foo.bar', 'array-contains-any', [1])
        .where('foo.bar', 'in', [2]);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        "You cannot use 'in' filters with 'array-contains-any' filters",
      );
      return Promise.resolve();
    }
  });

  it('throws if query has multiple in filter', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where('foo.bar', 'in', [1])
        .where('foo.bar', 'in', [2]);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("You cannot use more than one 'in' filter");
      return Promise.resolve();
    }
  });

  it('throws if query has in & array-contains-any filter', () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where('foo.bar', 'in', [1])
        .where('foo.bar', 'array-contains-any', [2]);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        "You cannot use 'array-contains-any' filters with 'in' filters",
      );
      return Promise.resolve();
    }
  });

  /* Queries */

  it('returns with where equal filter', async () => {
    const colRef = firebase.firestore().collection(`${COLLECTION}/filter/equal`);

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

  it('returns with where greater than filter', async () => {
    const colRef = firebase.firestore().collection(`${COLLECTION}/filter/greater`);

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

  it('returns with where greater than or equal filter', async () => {
    const colRef = firebase.firestore().collection(`${COLLECTION}/filter/greaterequal`);

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

  it('returns with where less than filter', async () => {
    const colRef = firebase.firestore().collection(`${COLLECTION}/filter/less`);

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

  it('returns with where less than or equal filter', async () => {
    const colRef = firebase.firestore().collection(`${COLLECTION}/filter/lessequal`);

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

  it('returns with where array-contains filter', async () => {
    const colRef = firebase.firestore().collection(`${COLLECTION}/filter/array-contains`);

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

  it('returns with in filter', async () => {
    const colRef = firebase.firestore().collection(`${COLLECTION}/filter/in${Date.now() + ''}`);

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

  it('returns with array-contains-any filter', async () => {
    const colRef = firebase
      .firestore()
      .collection(`${COLLECTION}/filter/array-contains-any${Date.now() + ''}`);

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

  it('returns with a FieldPath', async () => {
    const colRef = firebase
      .firestore()
      .collection(`${COLLECTION}/filter/where-fieldpath${Date.now() + ''}`);
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

  it('should throw an error if you use a FieldPath on a filter in conjunction with an orderBy() parameter that is not FieldPath', async () => {
    try {
      firebase
        .firestore()
        .collection(COLLECTION)
        .where(firebase.firestore.FieldPath.documentId(), 'in', ['document-id'])
        .orderBy('differentOrderBy', 'desc');

      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'FirestoreFieldPath' cannot be used in conjunction");
      return Promise.resolve();
    }
  });

  it('should correctly query integer values with in operator', async () => {
    const ref = firebase.firestore().collection(`${COLLECTION}/filter/int-in${Date.now() + ''}`);

    await ref.add({ status: 1 });

    const items = [];
    await ref
      .where('status', 'in', [1, 2])
      .get()
      .then($ => $.forEach(doc => items.push(doc.data())));

    items.length.should.equal(1);
  });

  it('should correctly query integer values with array-contains operator', async () => {
    const ref = firebase
      .firestore()
      .collection(`${COLLECTION}/filter/int-array-contains${Date.now() + ''}`);

    await ref.add({ status: [1, 2, 3] });

    const items = [];
    await ref
      .where('status', 'array-contains', 2)
      .get()
      .then($ => $.forEach(doc => items.push(doc.data())));

    items.length.should.equal(1);
  });

  it("should correctly retrieve data when using 'not-in' operator", async () => {
    const ref = firebase.firestore().collection(`${COLLECTION}/filter/not-in${Date.now() + ''}`);

    await Promise.all([ref.add({ notIn: 'here' }), ref.add({ notIn: 'now' })]);

    const result = await ref.where('notIn', 'not-in', ['here', 'there', 'everywhere']).get();
    should(result.docs.length).equal(1);
    should(result.docs[0].data().notIn).equal('now');
  });

  it("should throw error when using 'not-in' operator twice", async () => {
    const ref = firebase.firestore().collection(COLLECTION);

    try {
      ref.where('test', 'not-in', [1]).where('test', 'not-in', [2]);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("You cannot use more than one 'not-in' filter.");
      return Promise.resolve();
    }
  });

  it("should throw error when combining 'not-in' operator with '!=' operator", async () => {
    const ref = firebase.firestore().collection(COLLECTION);

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

  it("should throw error when combining 'not-in' operator with 'in' operator", async () => {
    const ref = firebase.firestore().collection(COLLECTION);

    try {
      ref.where('test', 'in', [2]).where('test', 'not-in', [1]);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("You cannot use 'not-in' filters with 'in' filters.");
      return Promise.resolve();
    }
  });

  it("should throw error when combining 'not-in' operator with 'array-contains-any' operator", async () => {
    const ref = firebase.firestore().collection(COLLECTION);

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

  it("should throw error when 'not-in' filter has a list of more than 10 items", async () => {
    const ref = firebase.firestore().collection(COLLECTION);

    try {
      ref.where('test', 'not-in', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        'filters support a maximum of 10 elements in the value array.',
      );
      return Promise.resolve();
    }
  });

  it("should correctly retrieve data when using '!=' operator", async () => {
    const ref = firebase
      .firestore()
      .collection(`${COLLECTION}/filter/bang-equals${Date.now() + ''}`);

    await Promise.all([ref.add({ notEqual: 'here' }), ref.add({ notEqual: 'now' })]);

    const result = await ref.where('notEqual', '!=', 'here').get();

    should(result.docs.length).equal(1);
    should(result.docs[0].data().notEqual).equal('now');
  });

  it("should throw error when using '!=' operator twice ", async () => {
    const ref = firebase.firestore().collection(COLLECTION);

    try {
      ref.where('test', '!=', 1).where('test', '!=', 2);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("You cannot use more than one '!=' inequality filter.");
      return Promise.resolve();
    }
  });

  it("should throw error when combining '!=' operator with any other inequality operator on a different field", async () => {
    const ref = firebase.firestore().collection(COLLECTION);

    try {
      ref.where('test', '!=', 1).where('differentField', '>', 1);
      return Promise.reject(new Error('Did not throw an Error on >.'));
    } catch (error) {
      error.message.should.containEql('must be on the same field.');
    }

    try {
      ref.where('test', '!=', 1).where('differentField', '<', 1);
      return Promise.reject(new Error('Did not throw an Error on <.'));
    } catch (error) {
      error.message.should.containEql('must be on the same field.');
    }

    try {
      ref.where('test', '!=', 1).where('differentField', '<=', 1);
      return Promise.reject(new Error('Did not throw an Error <=.'));
    } catch (error) {
      error.message.should.containEql('must be on the same field.');
    }

    try {
      ref.where('test', '!=', 1).where('differentField', '>=', 1);
      return Promise.reject(new Error('Did not throw an Error >=.'));
    } catch (error) {
      error.message.should.containEql('must be on the same field.');
    }

    return Promise.resolve();
  });

  it('should handle where clause after sort by', async () => {
    const ref = firebase
      .firestore()
      .collection(`${COLLECTION}/filter/sort-by-where${Date.now() + ''}`);

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
