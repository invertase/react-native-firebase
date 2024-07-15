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
const { wipe } = require('./helpers');
const COLLECTION = 'firestore';

describe('firestore.SnapshotMetadata', function () {
  before(function () {
    return wipe();
  });

  describe('v8 compatibility', function () {
    it('.fromCache -> returns a boolean', async function () {
      const ref1 = firebase.firestore().collection(COLLECTION);
      const ref2 = firebase.firestore().doc(`${COLLECTION}/idonotexist`);
      const colRef = await ref1.get();
      const docRef = await ref2.get();
      colRef.metadata.fromCache.should.be.Boolean();
      docRef.metadata.fromCache.should.be.Boolean();
    });

    it('.hasPendingWrites -> returns a boolean', async function () {
      const ref1 = firebase.firestore().collection(COLLECTION);
      const ref2 = firebase.firestore().doc(`${COLLECTION}/idonotexist`);
      const colRef = await ref1.get();
      const docRef = await ref2.get();
      colRef.metadata.hasPendingWrites.should.be.Boolean();
      docRef.metadata.hasPendingWrites.should.be.Boolean();
    });

    describe('isEqual()', function () {
      it('throws if other is not a valid type', async function () {
        try {
          const snapshot = await firebase.firestore().collection(COLLECTION).get();
          snapshot.metadata.isEqual();
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'other' expected instance of SnapshotMetadata");
          return Promise.resolve();
        }
      });

      it('returns true if is equal', async function () {
        if (Platform.other) {
          return;
        }

        const snapshot1 = await firebase
          .firestore()
          .collection(COLLECTION)
          .get({ source: 'cache' });
        const snapshot2 = await firebase
          .firestore()
          .collection(COLLECTION)
          .get({ source: 'cache' });
        snapshot1.metadata.isEqual(snapshot2.metadata).should.eql(true);
      });

      it('returns false if not equal', async function () {
        if (Platform.other) {
          return;
        }

        const snapshot1 = await firebase
          .firestore()
          .collection(COLLECTION)
          .get({ source: 'cache' });
        const snapshot2 = await firebase
          .firestore()
          .collection(COLLECTION)
          .get({ source: 'server' });
        snapshot1.metadata.isEqual(snapshot2.metadata).should.eql(false);
      });
    });
  });

  describe('modular', function () {
    it('.fromCache -> returns a boolean', async function () {
      const { getFirestore, collection, doc, getDocs, getDoc } = firestoreModular;
      const db = getFirestore();

      const ref1 = collection(db, COLLECTION);
      const ref2 = doc(db, `${COLLECTION}/idonotexist`);
      const colRef = await getDocs(ref1);
      const docRef = await getDoc(ref2);
      colRef.metadata.fromCache.should.be.Boolean();
      docRef.metadata.fromCache.should.be.Boolean();
    });

    it('.hasPendingWrites -> returns a boolean', async function () {
      const { getFirestore, collection, doc, getDocs, getDoc } = firestoreModular;
      const db = getFirestore();

      const ref1 = collection(db, COLLECTION);
      const ref2 = doc(db, `${COLLECTION}/idonotexist`);
      const colRef = await getDocs(ref1);
      const docRef = await getDoc(ref2);
      colRef.metadata.hasPendingWrites.should.be.Boolean();
      docRef.metadata.hasPendingWrites.should.be.Boolean();
    });

    describe('isEqual()', function () {
      it('throws if other is not a valid type', async function () {
        const { getFirestore, collection, getDocs } = firestoreModular;

        try {
          const snapshot = await getDocs(collection(getFirestore(), COLLECTION));
          snapshot.metadata.isEqual();
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'other' expected instance of SnapshotMetadata");
          return Promise.resolve();
        }
      });

      it('returns true if is equal', async function () {
        if (Platform.other) {
          return;
        }

        const { getFirestore, collection, getDocsFromCache } = firestoreModular;
        const db = getFirestore();

        const snapshot1 = await getDocsFromCache(collection(db, COLLECTION));
        const snapshot2 = await getDocsFromCache(collection(db, COLLECTION));
        snapshot1.metadata.isEqual(snapshot2.metadata).should.eql(true);
      });

      it('returns false if not equal', async function () {
        if (Platform.other) {
          return;
        }

        const { getFirestore, collection, getDocsFromCache, getDocsFromServer } = firestoreModular;
        const db = getFirestore();

        const snapshot1 = await getDocsFromCache(collection(db, COLLECTION));
        const snapshot2 = await getDocsFromServer(collection(db, COLLECTION));
        snapshot1.metadata.isEqual(snapshot2.metadata).should.eql(false);
      });
    });
  });
});
