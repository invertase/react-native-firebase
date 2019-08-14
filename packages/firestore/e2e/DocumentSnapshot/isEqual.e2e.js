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

describe('firestore.doc() -> snapshot.isEqual()', () => {
  it('throws if other is not a DocumentSnapshot', async () => {
    try {
      const docRef = firebase.firestore().doc('v6/baz');

      const docSnapshot = await docRef.get();
      docSnapshot.isEqual(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'other' expected a DocumentSnapshot instance");
      return Promise.resolve();
    }
  });

  it('returns false when not equal', async () => {
    const docRef = firebase.firestore().doc('v6/isEqual-false-exists');
    await docRef.set({ foo: 'bar' });

    const docSnapshot1 = await docRef.get();
    const docSnapshot2 = await firebase
      .firestore()
      .doc('v6/idonotexist')
      .get();
    await docRef.set({ foo: 'baz' });
    const docSnapshot3 = await docRef.get();

    const eql1 = docSnapshot1.isEqual(docSnapshot2);
    const eql2 = docSnapshot1.isEqual(docSnapshot3);

    eql1.should.be.False();
    eql2.should.be.False();
  });

  it('returns true when equal', async () => {
    const docRef = firebase.firestore().doc('v6/isEqual-true-exists');
    await docRef.set({ foo: 'bar' });

    const docSnapshot = await docRef.get();

    const eql1 = docSnapshot.isEqual(docSnapshot);

    eql1.should.be.True();
  });
});
