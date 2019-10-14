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

describe('firestore.doc().set()', () => {
  before(() => wipe());

  it('throws if data is not an object', () => {
    try {
      firebase
        .firestore()
        .doc('bar/baz')
        .set('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'data' must be an object");
      return Promise.resolve();
    }
  });

  it('throws if options is not an object', () => {
    try {
      firebase
        .firestore()
        .doc('bar/baz')
        .set({}, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'options' must be an object");
      return Promise.resolve();
    }
  });

  it('throws if options contains both merge types', () => {
    try {
      firebase
        .firestore()
        .doc('bar/baz')
        .set(
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

  it('throws if merge is not a boolean', () => {
    try {
      firebase
        .firestore()
        .doc('bar/baz')
        .set(
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

  it('throws if mergeFields is not an array', () => {
    try {
      firebase
        .firestore()
        .doc('bar/baz')
        .set(
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

  it('throws if mergeFields contains invalid data', () => {
    try {
      firebase
        .firestore()
        .doc('bar/baz')
        .set(
          {},
          {
            mergeFields: ['foo', 'foo.bar', new firebase.firestore.FieldPath('bar', 'baz'), 123],
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

  it('sets new data', async () => {
    const ref = firebase.firestore().doc('v6/set');
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

  it('merges all fields', async () => {
    const ref = firebase.firestore().doc('v6/merge');
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

  it('merges specific fields', async () => {
    const ref = firebase.firestore().doc('v6/merge');
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
});
