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

describe('firestore().collection().where()', () => {
  before(() => wipe());

  it('throws if fieldPath is invalid', () => {
    try {
      firebase
        .firestore()
        .collection('v6')
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
        .collection('v6')
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
        .collection('v6')
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
        .collection('v6')
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
        .collection('v6')
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
        .collection('v6')
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
      .collection('v6')
      .where('foo.bar', '==', null);
  });

  it('throws if multiple inequalities on different paths is provided', () => {
    try {
      firebase
        .firestore()
        .collection('v6')
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
      .collection('v6')
      .where('foo.bar', '>', 123)
      .where(new firebase.firestore.FieldPath('foo', 'bar'), '>', 1234);
  });

  it('returns with where equal filter', async () => {
    const colRef = firebase.firestore().collection('v6/filter/equal');

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
    const colRef = firebase.firestore().collection('v6/filter/greater');

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
    const colRef = firebase.firestore().collection('v6/filter/greaterequal');

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
    const colRef = firebase.firestore().collection('v6/filter/less');

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
    const colRef = firebase.firestore().collection('v6/filter/lessequal');

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
    const colRef = firebase.firestore().collection('v6/filter/arraycontains');

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
});
