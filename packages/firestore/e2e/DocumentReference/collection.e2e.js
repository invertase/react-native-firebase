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
  describe('modular', function () {
    it('throws if path is not a string', function () {
      const { getFirestore, doc, collection } = firestoreModular;
      try {
        collection(doc(getFirestore(), 'bar/baz'), 123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'collectionPath' must be a string value");
        return Promise.resolve();
      }
    });

    it('throws if path empty', function () {
      const { getFirestore, doc, collection } = firestoreModular;
      try {
        collection(doc(getFirestore(), 'bar/baz'), '');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'collectionPath' must be a non-empty string");
        return Promise.resolve();
      }
    });

    it('throws if path does not point to a collection', function () {
      const { getFirestore, doc, collection } = firestoreModular;
      try {
        collection(doc(getFirestore(), 'bar/baz'), `${COLLECTION}/bar`);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'collectionPath' must point to a collection");
        return Promise.resolve();
      }
    });

    it('returns a collection instance', function () {
      const { getFirestore, doc, collection } = firestoreModular;
      const db = getFirestore();
      const instance1 = collection(doc(db, `${COLLECTION}/bar`), COLLECTION);
      const instance2 = collection(doc(collection(db, COLLECTION), 'bar'), COLLECTION);
      should.equal(instance1.constructor.name, 'CollectionReference');
      should.equal(instance2.constructor.name, 'CollectionReference');
      instance1.id.should.equal(COLLECTION);
      instance2.id.should.equal(COLLECTION);
    });
  });
});
