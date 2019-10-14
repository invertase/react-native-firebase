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

describe('firestore.WriteBatch.update()', () => {
  it('throws if a DocumentReference instance is not provided', () => {
    try {
      firebase
        .firestore()
        .batch()
        .update(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'documentRef' expected instance of a DocumentReference");
      return Promise.resolve();
    }
  });

  it('throws if a DocumentReference firestore instance is different', () => {
    try {
      const app2 = firebase.app('secondaryFromNative');
      const docRef = firebase.firestore(app2).doc('v6/foo');
      firebase
        .firestore()
        .batch()
        .update(docRef);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        "'documentRef' provided DocumentReference is from a different Firestore instance",
      );
      return Promise.resolve();
    }
  });

  it('throws if update args are not provided', () => {
    try {
      const docRef = firebase.firestore().doc('v6/foo');
      firebase
        .firestore()
        .batch()
        .update(docRef);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('Expected update object or list of key/value pairs');
      return Promise.resolve();
    }
  });

  it('throws if update arg is not an object', () => {
    try {
      const docRef = firebase.firestore().doc('v6/foo');
      firebase
        .firestore()
        .batch()
        .update(docRef, 123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('if using a single update argument, it must be an object');
      return Promise.resolve();
    }
  });

  it('throws if update key/values are invalid', () => {
    try {
      const docRef = firebase.firestore().doc('v6/foo');
      firebase
        .firestore()
        .batch()
        .update(docRef, 'foo', 'bar', 'baz');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('equal numbers of key/value pairs');
      return Promise.resolve();
    }
  });

  it('throws if update keys are invalid', () => {
    try {
      const docRef = firebase.firestore().doc('v6/foo');
      firebase
        .firestore()
        .batch()
        .update(docRef, 'foo', 'bar', 123, 'ben');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('argument at index 2 must be a string or FieldPath');
      return Promise.resolve();
    }
  });

  it('adds the DocumentReference to the internal writes', () => {
    const docRef = firebase.firestore().doc('v6/foo');
    const wb = firebase
      .firestore()
      .batch()
      .update(docRef, { foo: 'bar' });
    wb._writes.length.should.eql(1);
    const expected = {
      path: 'v6/foo',
      type: 'UPDATE',
    };
    wb._writes[0].should.containEql(jet.contextify(expected));
  });
});
