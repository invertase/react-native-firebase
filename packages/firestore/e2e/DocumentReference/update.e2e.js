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

describe('firestore.doc().update()', function () {
  before(function () {
    return wipe();
  });

  describe('v8 compatibility', function () {
    it('throws if no arguments are provided', function () {
      try {
        firebase.firestore().doc(`${COLLECTION}/baz`).update();
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'expected at least 1 argument but was called with 0 arguments',
        );
        return Promise.resolve();
      }
    });

    it('throws if document does not exist', async function () {
      try {
        await firebase.firestore().doc(`${COLLECTION}/idonotexistonthedatabase`).update({});
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.code.should.containEql('firestore/not-found');
        return Promise.resolve();
      }
    });

    it('throws if field/value sequence is invalid', function () {
      try {
        firebase.firestore().doc(`${COLLECTION}/baz`).update('foo', 'bar', 'baz');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('or equal numbers of key/value pairs');
        return Promise.resolve();
      }
    });

    it('updates data with an object value', async function () {
      const ref = firebase.firestore().doc(`${COLLECTION}/update-obj`);
      const value = Date.now();
      const data1 = { foo: value };
      const data2 = { foo: 'bar' };
      await ref.set(data1);
      const snapshot1 = await ref.get();
      snapshot1.data().should.eql(jet.contextify(data1));
      await ref.update(data2);
      const snapshot2 = await ref.get();
      snapshot2.data().should.eql(jet.contextify(data2));
      await ref.delete();
    });

    it('updates data with an key/value pairs', async function () {
      const ref = firebase.firestore().doc(`${COLLECTION}/update-obj`);
      const value = Date.now();
      const data1 = { foo: value, bar: value };
      await ref.set(data1);
      const snapshot1 = await ref.get();
      snapshot1.data().should.eql(jet.contextify(data1));

      await ref.update('foo', 'bar', 'bar', 'baz', 'foo1', 'bar1');
      const expected = {
        foo: 'bar',
        bar: 'baz',
        foo1: 'bar1',
      };
      const snapshot2 = await ref.get();
      snapshot2.data().should.eql(jet.contextify(expected));
      await ref.delete();
    });
  });

  describe('modular', function () {
    it('throws if no arguments are provided', function () {
      const { getFirestore, doc, updateDoc } = firestoreModular;

      try {
        updateDoc(doc(getFirestore(), `${COLLECTION}/baz`));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          'expected at least 1 argument but was called with 0 arguments',
        );
        return Promise.resolve();
      }
    });

    it('throws if document does not exist', async function () {
      const { getFirestore, doc, updateDoc } = firestoreModular;
      try {
        await updateDoc(doc(getFirestore(), `${COLLECTION}/idonotexistonthedatabase`), {});
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.code.should.containEql('firestore/not-found');
        return Promise.resolve();
      }
    });

    it('throws if field/value sequence is invalid', function () {
      const { getFirestore, doc, updateDoc } = firestoreModular;
      try {
        updateDoc(doc(getFirestore(), `${COLLECTION}/baz`), 'foo', 'bar', 'baz');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('or equal numbers of key/value pairs');
        return Promise.resolve();
      }
    });

    it('updates data with an object value', async function () {
      const { getFirestore, doc, setDoc, getDocs, updateDoc, deleteDoc } = firestoreModular;
      const ref = doc(getFirestore(), `${COLLECTION}/update-obj`);
      const value = Date.now();
      const data1 = { foo: value };
      const data2 = { foo: 'bar' };
      await setDoc(ref, data1);
      const snapshot1 = await getDocs(ref);
      snapshot1.data().should.eql(jet.contextify(data1));
      await updateDoc(ref, data2);
      const snapshot2 = await getDocs(ref);
      snapshot2.data().should.eql(jet.contextify(data2));
      await deleteDoc(ref);
    });

    it('updates data with an key/value pairs', async function () {
      const { getFirestore, doc, setDoc, getDocs, updateDoc, deleteDoc } = firestoreModular;
      const ref = doc(getFirestore(), `${COLLECTION}/update-obj`);
      const value = Date.now();
      const data1 = { foo: value, bar: value };
      await setDoc(ref, data1);
      const snapshot1 = await getDocs(ref);
      snapshot1.data().should.eql(jet.contextify(data1));

      await updateDoc(ref, 'foo', 'bar', 'bar', 'baz', 'foo1', 'bar1');
      const expected = {
        foo: 'bar',
        bar: 'baz',
        foo1: 'bar1',
      };
      const snapshot2 = await getDocs(ref);
      snapshot2.data().should.eql(jet.contextify(expected));
      await deleteDoc(ref);
    });
  });
});
