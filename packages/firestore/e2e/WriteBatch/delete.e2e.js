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

describe('firestore.WriteBatch.delete()', () => {
  it('throws if a DocumentReference instance is not provided', () => {
    try {
      firebase
        .firestore()
        .batch()
        .delete(123);
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
        .delete(docRef);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        "'documentRef' provided DocumentReference is from a different Firestore instance",
      );
      return Promise.resolve();
    }
  });

  it('adds the DocumentReference to the internal writes', () => {
    const docRef = firebase.firestore().doc('v6/foo');
    const wb = firebase
      .firestore()
      .batch()
      .delete(docRef);
    wb._writes.length.should.eql(1);
    const expected = {
      path: 'v6/foo',
      type: 'DELETE',
    };
    wb._writes[0].should.eql(jet.contextify(expected));
  });
});
