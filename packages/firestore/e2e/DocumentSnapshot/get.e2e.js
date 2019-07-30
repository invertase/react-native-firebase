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

describe('firestore().doc() -> snapshot.get()', () => {
  before(() => wipe());

  it('throws if invalid fieldPath argument', async () => {
    const ref = firebase.firestore().doc('v6/foo');
    const snapshot = await ref.get();

    try {
      snapshot.get(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'fieldPath' expected type string or FieldPath");
      return Promise.resolve();
    }
  });

  it('throws if fieldPath is an empty string', async () => {
    const ref = firebase.firestore().doc('v6/foo');
    const snapshot = await ref.get();

    try {
      snapshot.get('');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'fieldPath' Invalid field path");
      return Promise.resolve();
    }
  });

  it('throws if fieldPath starts with a period (.)', async () => {
    const ref = firebase.firestore().doc('v6/foo');
    const snapshot = await ref.get();

    try {
      snapshot.get('.foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'fieldPath' Invalid field path");
      return Promise.resolve();
    }
  });

  it('throws if fieldPath ends with a period (.)', async () => {
    const ref = firebase.firestore().doc('v6/foo');
    const snapshot = await ref.get();

    try {
      snapshot.get('foo.');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'fieldPath' Invalid field path");
      return Promise.resolve();
    }
  });

  it('throws if fieldPath contains ..', async () => {
    const ref = firebase.firestore().doc('v6/foo');
    const snapshot = await ref.get();

    try {
      snapshot.get('foo..bar');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'fieldPath' Invalid field path");
      return Promise.resolve();
    }
  });

  it('returns undefined if the data does not exist', async () => {
    const ref = firebase.firestore().doc('v6/foo');
    const snapshot = await ref.get();

    const val1 = snapshot.get('foo');
    const val2 = snapshot.get('foo.bar');
    const val3 = snapshot.get(new firebase.firestore.FieldPath('.'));
    const val4 = snapshot.get(new firebase.firestore.FieldPath('foo'));
    const val5 = snapshot.get(new firebase.firestore.FieldPath('foo.bar'));

    should.equal(val1, undefined);
    should.equal(val2, undefined);
    should.equal(val3, undefined);
    should.equal(val4, undefined);
    should.equal(val5, undefined);
  });

  it('returns the correct data with string fieldPath', async () => {
    const ref = firebase.firestore().doc('v6/foo');
    const types = {
      string: '12345',
      number: 1234,
      map: {
        string: '12345',
        number: 1234,
      },
      array: [1, '2', null],
      timestamp: new Date(),
    };

    await ref.set(types);
    const snapshot = await ref.get();

    const string1 = snapshot.get('string');
    const string2 = snapshot.get('map.string');
    const number1 = snapshot.get('number');
    const number2 = snapshot.get('map.number');
    const array = snapshot.get('array');

    should.equal(string1, types.string);
    should.equal(string2, types.string);
    should.equal(number1, types.number);
    should.equal(number2, types.number);
    array.should.eql(jet.contextify(types.array));
    await ref.delete();
  });

  it('returns the correct data with FieldPath', async () => {
    const ref = firebase.firestore().doc('v6/foo');
    const types = {
      string: '12345',
      number: 1234,
      map: {
        string: '12345',
        number: 1234,
      },
      array: [1, '2', null],
      timestamp: new Date(),
    };

    await ref.set(types);
    const snapshot = await ref.get();

    const string1 = snapshot.get(new firebase.firestore.FieldPath('string'));
    const string2 = snapshot.get(new firebase.firestore.FieldPath('map', 'string'));
    const number1 = snapshot.get(new firebase.firestore.FieldPath('number'));
    const number2 = snapshot.get(new firebase.firestore.FieldPath('map', 'number'));
    const array = snapshot.get(new firebase.firestore.FieldPath('array'));

    should.equal(string1, types.string);
    should.equal(string2, types.string);
    should.equal(number1, types.number);
    should.equal(number2, types.number);
    array.should.eql(jet.contextify(types.array));
    await ref.delete();
  });
});
