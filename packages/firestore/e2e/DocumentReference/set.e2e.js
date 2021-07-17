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
const COLLECTION = 'firestore';

describe('firestore.doc().set()', function () {
  before(function () {
    return wipe();
  });
  it('throws if data is not an object', function () {
    try {
      firebase.firestore().doc(`${COLLECTION}/baz`).set('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'data' must be an object");
      return Promise.resolve();
    }
  });

  it('throws if options is not an object', function () {
    try {
      firebase.firestore().doc(`${COLLECTION}/baz`).set({}, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'options' must be an object");
      return Promise.resolve();
    }
  });

  it('throws if options contains both merge types', function () {
    try {
      firebase.firestore().doc(`${COLLECTION}/baz`).set(
        {},
        {
          merge: true,
          mergeFields: [],
        },
      );
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'options' must not contain both 'merge' & 'mergeFields'");
      return Promise.resolve();
    }
  });

  it('throws if merge is not a boolean', function () {
    try {
      firebase.firestore().doc(`${COLLECTION}/baz`).set(
        {},
        {
          merge: 'foo',
        },
      );
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'options.merge' must be a boolean value");
      return Promise.resolve();
    }
  });

  it('throws if mergeFields is not an array', function () {
    try {
      firebase.firestore().doc(`${COLLECTION}/baz`).set(
        {},
        {
          mergeFields: 'foo',
        },
      );
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'options.mergeFields' must be an array");
      return Promise.resolve();
    }
  });

  it('throws if mergeFields contains invalid data', function () {
    try {
      firebase
        .firestore()
        .doc(`${COLLECTION}/baz`)
        .set(
          {},
          {
            mergeFields: [
              'foo',
              'foo.bar',
              new firebase.firestore.FieldPath(COLLECTION, 'baz'),
              123,
            ],
          },
        );
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        "'options.mergeFields' all fields must be of type string or FieldPath, but the value at index 3 was number",
      );
      return Promise.resolve();
    }
  });

  it('sets new data', async function () {
    const ref = firebase.firestore().doc(`${COLLECTION}/set`);
    const data1 = { foo: 'bar' };
    const data2 = { foo: 'baz', bar: 123 };
    await ref.set(data1);
    const snapshot1 = await ref.get();
    snapshot1.data().should.eql(jet.contextify(data1));
    await ref.set(data2);
    const snapshot2 = await ref.get();
    snapshot2.data().should.eql(jet.contextify(data2));
    await ref.delete();
  });

  it('merges all fields', async function () {
    const ref = firebase.firestore().doc(`${COLLECTION}/merge`);
    const data1 = { foo: 'bar' };
    const data2 = { bar: 'baz' };
    const merged = { ...data1, ...data2 };
    await ref.set(data1);
    const snapshot1 = await ref.get();
    snapshot1.data().should.eql(jet.contextify(data1));
    await ref.set(data2, {
      merge: true,
    });
    const snapshot2 = await ref.get();
    snapshot2.data().should.eql(jet.contextify(merged));
    await ref.delete();
  });

  it('merges specific fields', async function () {
    const ref = firebase.firestore().doc(`${COLLECTION}/merge`);
    const data1 = { foo: '123', bar: 123, baz: '456' };
    const data2 = { foo: '234', bar: 234, baz: '678' };
    const merged = { foo: data1.foo, bar: data2.bar, baz: data2.baz };
    await ref.set(data1);
    const snapshot1 = await ref.get();
    snapshot1.data().should.eql(jet.contextify(data1));
    await ref.set(data2, {
      mergeFields: ['bar', new firebase.firestore.FieldPath('baz')],
    });
    const snapshot2 = await ref.get();
    snapshot2.data().should.eql(jet.contextify(merged));
    await ref.delete();
  });

  it('throws when nested undefined array value provided and ignored undefined is false', async function () {
    await firebase.firestore().settings({ ignoreUndefinedProperties: false });
    const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
    try {
      await docRef.set({
        myArray: [{ name: 'Tim', location: { state: undefined, country: 'United Kingdom' } }],
      });
      return Promise.reject(new Error('Expected set() to throw'));
    } catch (error) {
      error.message.should.containEql('Unsupported field value: undefined');
    }
  });

  it('accepts undefined nested array values if ignoreUndefined is true', async function () {
    await firebase.firestore().settings({ ignoreUndefinedProperties: true });
    const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
    await docRef.set({
      myArray: [{ name: 'Tim', location: { state: undefined, country: 'United Kingdom' } }],
    });
  });

  it('does not throw when nested undefined object value provided and ignore undefined is true', async function () {
    await firebase.firestore().settings({ ignoreUndefinedProperties: true });
    const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
    await docRef.set({
      field1: 1,
      field2: {
        shouldNotWork: undefined,
      },
    });
  });

  it('filters out undefined properties when setting enabled', async function () {
    await firebase.firestore().settings({ ignoreUndefinedProperties: true });

    const docRef = firebase.firestore().doc(`${COLLECTION}/ignoreUndefinedTrueProp`);
    await docRef.set({
      field1: 1,
      field2: undefined,
    });

    const snap = await docRef.get();
    const snapData = snap.data();
    if (!snapData) {
      return Promise.reject(new Error('Snapshot not saved'));
    }

    snapData.field1.should.eql(1);
    snapData.hasOwnProperty('field2').should.eql(false);
  });

  it('filters out nested undefined properties when setting enabled', async function () {
    await firebase.firestore().settings({ ignoreUndefinedProperties: true });

    const docRef = firebase.firestore().doc(`${COLLECTION}/ignoreUndefinedTrueNestedProp`);
    await docRef.set({
      field1: 1,
      field2: {
        shouldBeMissing: undefined,
      },
      field3: [
        {
          shouldBeHere: 'Here',
          shouldBeMissing: undefined,
        },
      ],
    });

    const snap = await docRef.get();
    const snapData = snap.data();
    if (!snapData) {
      return Promise.reject(new Error('Snapshot not saved'));
    }

    snapData.field1.should.eql(1);
    snapData.hasOwnProperty('field2').should.eql(true);
    snapData.field2.hasOwnProperty('shouldBeMissing').should.eql(false);
    snapData.hasOwnProperty('field3').should.eql(true);
    snapData.field3[0].shouldBeHere.should.eql('Here');
    snapData.field3[0].hasOwnProperty('shouldBeMissing').should.eql(false);
  });
});
