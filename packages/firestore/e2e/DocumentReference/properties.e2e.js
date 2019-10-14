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

describe('firestore.doc()', () => {
  it('returns a Firestore instance', () => {
    const instance = firebase.firestore().doc('foo/bar');
    should.equal(instance.firestore.constructor.name, 'FirebaseFirestoreModule');
  });

  it('returns the document id', () => {
    const instance = firebase.firestore().doc('foo/bar');
    instance.id.should.equal('bar');
  });

  it('returns the parent collection reference', () => {
    const instance = firebase.firestore().doc('foo/bar');
    instance.parent.id.should.equal('foo');
  });

  it('returns the path', () => {
    const instance1 = firebase.firestore().doc('foo/bar');
    const instance2 = firebase
      .firestore()
      .collection('foo')
      .doc('bar');
    instance1.path.should.equal('foo/bar');
    instance2.path.should.equal('foo/bar');
  });
});
