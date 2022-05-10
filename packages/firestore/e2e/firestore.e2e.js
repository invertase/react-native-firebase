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
const COLLECTION_GROUP = 'collectionGroup';

describe('firestore()', function () {
  describe('namespace', function () {
    // removing as pending if module.options.hasMultiAppSupport = true
    it('supports multiple apps', async function () {
      firebase.firestore().app.name.should.equal('[DEFAULT]');

      firebase
        .firestore(firebase.app('secondaryFromNative'))
        .app.name.should.equal('secondaryFromNative');

      firebase.app('secondaryFromNative').firestore().app.name.should.equal('secondaryFromNative');
    });
  });

  describe('batch()', function () {});

  describe('clearPersistence()', function () {});

  describe('collection()', function () {});

  describe('collectionGroup()', function () {
    it('performs a collection group query', async function () {
      const docRef1 = firebase.firestore().doc(`${COLLECTION}/collectionGroup1`);
      const docRef2 = firebase.firestore().doc(`${COLLECTION}/collectionGroup2`);
      const docRef3 = firebase.firestore().doc(`${COLLECTION}/collectionGroup3`);
      const subRef1 = docRef1.collection(COLLECTION_GROUP).doc('ref');
      const subRef2 = docRef1.collection(COLLECTION_GROUP).doc('ref2');
      const subRef3 = docRef2.collection(COLLECTION_GROUP).doc('ref');
      const subRef4 = docRef2.collection(COLLECTION_GROUP).doc('ref2');
      const subRef5 = docRef3.collection(COLLECTION_GROUP).doc('ref');
      const subRef6 = docRef3.collection(COLLECTION_GROUP).doc('ref2');

      await Promise.all([
        subRef1.set({ value: 1 }),
        subRef2.set({ value: 2 }),

        subRef3.set({ value: 1 }),
        subRef4.set({ value: 2 }),

        subRef5.set({ value: 1 }),
        subRef6.set({ value: 2 }),
      ]);

      const querySnapshot = await firebase
        .firestore()
        .collectionGroup(COLLECTION_GROUP)
        .where('value', '==', 2)
        .get();

      querySnapshot.forEach(ds => {
        ds.data().value.should.eql(2);
      });

      querySnapshot.size.should.eql(3);

      await Promise.all([
        subRef1.delete(),
        subRef2.delete(),

        subRef3.delete(),
        subRef4.delete(),

        subRef5.delete(),
        subRef6.delete(),
      ]);
    });

    it('performs a collection group query with cursor queries', async function () {
      const docRef = firebase.firestore().doc(`${COLLECTION}/collectionGroupCursor`);

      const ref1 = await docRef.collection(COLLECTION_GROUP).add({ number: 1 });
      const startAt = await docRef.collection(COLLECTION_GROUP).add({ number: 2 });
      const ref3 = await docRef.collection(COLLECTION_GROUP).add({ number: 3 });

      const ds = await startAt.get();

      const querySnapshot = await firebase
        .firestore()
        .collectionGroup(COLLECTION_GROUP)
        .orderBy('number')
        .startAt(ds)
        .get();

      querySnapshot.size.should.eql(2);
      querySnapshot.forEach((d, i) => {
        d.data().number.should.eql(i + 2);
      });
      await Promise.all([ref1.delete(), ref3.delete(), startAt.delete()]);
    });
  });

  describe('disableNetwork() & enableNetwork()', function () {
    it('disables and enables with no errors', async function () {
      await firebase.firestore().disableNetwork();
      await firebase.firestore().enableNetwork();
    });
  });

  describe('Clear cached data persistence', function () {
    // NOTE: removed as it breaks emulator tests
    xit('should clear any cached data', async function () {
      const db = firebase.firestore();
      const id = 'foobar';
      const ref = db.doc(`${COLLECTION}/${id}`);
      await ref.set({ foo: 'bar' });
      try {
        await db.clearPersistence();
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.code.should.equal('firestore/failed-precondition');
      }
      const doc = await ref.get({ source: 'cache' });
      should(doc.id).equal(id);
      await db.terminate();
      await db.clearPersistence();
      try {
        await ref.get({ source: 'cache' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.code.should.equal('firestore/unavailable');
        return Promise.resolve();
      }
    });
  });

  describe('wait for pending writes', function () {
    xit('waits for pending writes', async function () {
      const waitForPromiseMs = 500;
      const testTimeoutMs = 10000;

      await firebase.firestore().disableNetwork();

      //set up a pending write

      const db = firebase.firestore();
      const id = 'foobar';
      const ref = db.doc(`v6/${id}`);
      ref.set({ foo: 'bar' });

      //waitForPendingWrites should never resolve, but unfortunately we can only
      //test that this is not returning within X ms

      let rejected = false;
      const timedOutWithNetworkDisabled = await Promise.race([
        firebase
          .firestore()
          .waitForPendingWrites()
          .then(
            () => false,
            () => {
              rejected = true;
            },
          ),
        Utils.sleep(waitForPromiseMs).then(() => true),
      ]);

      should(timedOutWithNetworkDisabled).equal(true);
      should(rejected).equal(false);

      //if we sign in as a different user then it should reject the promise
      try {
        await firebase.auth().signOut();
      } catch (e) {}
      await firebase.auth().signInAnonymously();
      should(rejected).equal(true);

      //now if we enable the network then waitForPendingWrites should return immediately
      await firebase.firestore().enableNetwork();

      const timedOutWithNetworkEnabled = await Promise.race([
        firebase
          .firestore()
          .waitForPendingWrites()
          .then(() => false),
        Utils.sleep(testTimeoutMs).then(() => true),
      ]);

      should(timedOutWithNetworkEnabled).equal(false);
    });
  });

  describe('settings', function () {
    describe('serverTimestampBehavior', function () {
      it("handles 'estimate'", async function () {
        firebase.firestore().settings({ serverTimestampBehavior: 'estimate' });
        const ref = firebase.firestore().doc(`${COLLECTION}/getData`);

        const promise = new Promise((resolve, reject) => {
          const subscription = ref.onSnapshot(snapshot => {
            should(snapshot.get('timestamp')).be.an.instanceOf(firebase.firestore.Timestamp);
            subscription();
            resolve();
          }, reject);
        });

        await ref.set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        await promise;
        await ref.delete();
      });
      it("handles 'previous'", async function () {
        firebase.firestore().settings({ serverTimestampBehavior: 'previous' });
        const ref = firebase.firestore().doc(`${COLLECTION}/getData`);

        const promise = new Promise((resolve, reject) => {
          let counter = 0;
          let previous = null;
          const subscription = ref.onSnapshot(snapshot => {
            switch (counter++) {
              case 0:
                break;
              case 1:
                should(snapshot.get('timestamp')).be.an.instanceOf(firebase.firestore.Timestamp);
                break;
              case 2:
                should(snapshot.get('timestamp')).be.an.instanceOf(firebase.firestore.Timestamp);
                should(snapshot.get('timestamp').isEqual(previous.get('timestamp'))).equal(true);
                break;
              case 3:
                should(snapshot.get('timestamp')).be.an.instanceOf(firebase.firestore.Timestamp);
                should(snapshot.get('timestamp').isEqual(previous.get('timestamp'))).equal(false);
                subscription();
                resolve();
                break;
            }
            previous = snapshot;
          }, reject);
        });

        await ref.set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        await new Promise(resolve => setTimeout(resolve, 100));
        await ref.set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        await promise;
        await ref.delete();
      });
      it("handles 'none'", async function () {
        firebase.firestore().settings({ serverTimestampBehavior: 'none' });
        const ref = firebase.firestore().doc(`${COLLECTION}/getData`);

        const promise = new Promise((resolve, reject) => {
          const subscription = ref.onSnapshot(snapshot => {
            should(snapshot.get('timestamp')).equal(null);
            subscription();
            resolve();
          }, reject);
        });

        await ref.set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        await promise;
        await ref.delete();
      });
    });
  });
});
