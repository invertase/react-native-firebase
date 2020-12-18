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

describe('firestore.WriteBatch.set()', function() {
  it('throws if a DocumentReference instance is not provided', function() {
    try {
      firebase
        .firestore()
        .batch()
        .set(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'documentRef' expected instance of a DocumentReference");
      return Promise.resolve();
    }
  });

  it('throws if a DocumentReference firestore instance is different', function() {
    try {
      const app2 = firebase.app('secondaryFromNative');
      const docRef = firebase.firestore(app2).doc(`${COLLECTION}/foo`);

      firebase
        .firestore()
        .batch()
        .set(docRef);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        "'documentRef' provided DocumentReference is from a different Firestore instance",
      );
      return Promise.resolve();
    }
  });

  it('throws if a data is not an object', function() {
    try {
      const docRef = firebase.firestore().doc(`${COLLECTION}/foo`);

      firebase
        .firestore()
        .batch()
        .set(docRef, 123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'data' must be an object");
      return Promise.resolve();
    }
  });

  it('throws if a options is not an object', function() {
    try {
      const docRef = firebase.firestore().doc(`${COLLECTION}/foo`);

      firebase
        .firestore()
        .batch()
        .set(docRef, {}, 123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'options' must be an object");
      return Promise.resolve();
    }
  });

  it('throws if merge and mergeFields is provided', function() {
    try {
      const docRef = firebase.firestore().doc(`${COLLECTION}/foo`);
      firebase
        .firestore()
        .batch()
        .set(
          docRef,
          {},
          {
            merge: true,
            mergeFields: ['123'],
          },
        );
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'options' must not contain both 'merge' & 'mergeFields'");
      return Promise.resolve();
    }
  });

  it('throws if merge is not a boolean', function() {
    try {
      const docRef = firebase.firestore().doc(`${COLLECTION}/foo`);
      firebase
        .firestore()
        .batch()
        .set(
          docRef,
          {},
          {
            merge: 'true',
          },
        );
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'options.merge' must be a boolean value");
      return Promise.resolve();
    }
  });

  it('throws if mergeFields is not an array', function() {
    try {
      const docRef = firebase.firestore().doc(`${COLLECTION}/foo`);
      firebase
        .firestore()
        .batch()
        .set(
          docRef,
          {},
          {
            mergeFields: '[]',
          },
        );
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'options.mergeFields' must be an array");
      return Promise.resolve();
    }
  });

  it('throws if mergeFields item is not valid', function() {
    try {
      const docRef = firebase.firestore().doc(`${COLLECTION}/foo`);

      firebase
        .firestore()
        .batch()
        .set(
          docRef,
          {},
          {
            mergeFields: [123],
          },
        );
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        "'options.mergeFields' all fields must be of type string or FieldPath",
      );
      return Promise.resolve();
    }
  });

  it('throws if string fieldpath is invalid', function() {
    try {
      const docRef = firebase.firestore().doc(`${COLLECTION}/foo`);

      firebase
        .firestore()
        .batch()
        .set(
          docRef,
          {},
          {
            mergeFields: ['.foo.bar'],
          },
        );
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'options.mergeFields' Invalid field path");
      return Promise.resolve();
    }
  });

  it('accepts string fieldpath & FieldPath', function() {
    const docRef = firebase.firestore().doc(`${COLLECTION}/foo`);

    firebase
      .firestore()
      .batch()
      .set(
        docRef,
        {},
        {
          mergeFields: ['foo.bar', new firebase.firestore.FieldPath('foo', 'bar')],
        },
      );
  });

  it('adds the DocumentReference to the internal writes', function() {
    const docRef = firebase.firestore().doc(`${COLLECTION}/foo`);

    const wb = firebase
      .firestore()
      .batch()
      .set(
        docRef,
        { foo: 'bar' },
        { mergeFields: [new firebase.firestore.FieldPath('foo', 'bar')] },
      );
    wb._writes.length.should.eql(1);
    const expected = {
      path: `${COLLECTION}/foo`,
      type: 'SET',
      options: jet.contextify({
        mergeFields: jet.contextify(['foo.bar']),
      }),
    };
    wb._writes[0].should.containEql(jet.contextify(expected));
  });
});
