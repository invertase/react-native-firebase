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

describe('firestore.doc().isEqual()', function () {
  it('throws if other is not a DocumentReference', function () {
    try {
      firebase.firestore().doc('bar/baz').isEqual(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'other' expected a DocumentReference instance");
      return Promise.resolve();
    }
  });

  it('returns false when not equal', function () {
    const docRef = firebase.firestore().doc(`${COLLECTION}/baz`);

    const eql1 = docRef.isEqual(firebase.firestore().doc(`${COLLECTION}/foo`));
    const eql2 = docRef.isEqual(
      firebase.firestore(firebase.app('secondaryFromNative')).doc(`${COLLECTION}/baz`),
    );

    eql1.should.be.False();
    eql2.should.be.False();
  });

  it('returns true when equal', function () {
    const docRef = firebase.firestore().doc(`${COLLECTION}/baz`);

    const eql1 = docRef.isEqual(docRef);
    const eql2 = docRef.isEqual(firebase.firestore().doc(`${COLLECTION}/baz`));

    eql1.should.be.True();
    eql2.should.be.True();
  });
});
