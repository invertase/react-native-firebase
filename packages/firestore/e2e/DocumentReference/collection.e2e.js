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

describe('firestore.doc().collection()', function () {
  it('throws if path is not a string', function () {
    try {
      firebase.firestore().doc('bar/baz').collection(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'collectionPath' must be a string value");
      return Promise.resolve();
    }
  });

  it('throws if path empty', function () {
    try {
      firebase.firestore().doc('bar/baz').collection('');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'collectionPath' must be a non-empty string");
      return Promise.resolve();
    }
  });

  it('throws if path does not point to a collection', function () {
    try {
      firebase.firestore().doc('bar/baz').collection(`${COLLECTION}/bar`);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'collectionPath' must point to a collection");
      return Promise.resolve();
    }
  });

  it('returns a collection instance', function () {
    const instance1 = firebase.firestore().doc(`${COLLECTION}/bar`).collection(COLLECTION);
    const instance2 = firebase.firestore().collection(COLLECTION).doc('bar').collection(COLLECTION);
    should.equal(instance1.constructor.name, 'FirestoreCollectionReference');
    should.equal(instance2.constructor.name, 'FirestoreCollectionReference');
    instance1.id.should.equal(COLLECTION);
    instance2.id.should.equal(COLLECTION);
  });
});
