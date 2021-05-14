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
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      should.exist(app.firestore);
      app.firestore().app.should.equal(app);
    });

    // removing as pending if module.options.hasMultiAppSupport = true
    it('supports multiple apps', async function () {
      firebase.firestore().app.name.should.equal('[DEFAULT]');

      firebase
        .firestore(firebase.app('secondaryFromNative'))
        .app.name.should.equal('secondaryFromNative');

      firebase.app('secondaryFromNative').firestore().app.name.should.equal('secondaryFromNative');
    });
  });

  describe('batch()', function () {
    it('returns a new WriteBatch instance', function () {
      const instance = firebase.firestore().batch();
      instance.constructor.name.should.eql('FirestoreWriteBatch');
    });
  });

  describe('clearPersistence()', function () {});

  describe('collection()', function () {
    it('throws if path is not a string', function () {
      try {
        firebase.firestore().collection(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'collectionPath' must be a string value");
        return Promise.resolve();
      }
    });

    it('throws if path is empty string', function () {
      try {
        firebase.firestore().collection('');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'collectionPath' must be a non-empty string");
        return Promise.resolve();
      }
    });

    it('throws if path does not point to a collection', function () {
      try {
        firebase.firestore().collection(`${COLLECTION}/bar`);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'collectionPath' must point to a collection");
        return Promise.resolve();
      }
    });

    it('returns a new CollectionReference', function () {
      const collectionReference = firebase.firestore().collection(COLLECTION);
      should.equal(collectionReference.constructor.name, 'FirestoreCollectionReference');
      collectionReference.path.should.eql(COLLECTION);
    });
  });

  describe('doc()', function () {
    it('throws if path is not a string', function () {
      try {
        firebase.firestore().doc(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'documentPath' must be a string value");
        return Promise.resolve();
      }
    });

    it('throws if path is empty string', function () {
      try {
        firebase.firestore().doc('');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'documentPath' must be a non-empty string");
        return Promise.resolve();
      }
    });

    it('throws if path does not point to a document', function () {
      try {
        firebase.firestore().doc(`${COLLECTION}/bar/baz`);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'documentPath' must point to a document");
        return Promise.resolve();
      }
    });

    it('returns a new DocumentReference', function () {
      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      should.equal(docRef.constructor.name, 'FirestoreDocumentReference');
      docRef.path.should.eql(`${COLLECTION}/bar`);
    });

    it('filters out undefined properties when setting enabled', async function () {
      await firebase.firestore().settings({ ignoreUndefinedProperties: true });

      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      await docRef.set({
        field1: 1,
        field2: undefined,
      });

      const snap = await docRef.get();
      const snapData = snap.data();
      if (!snapData) {
        return Promise.reject(new Error('Snapshot not saved'));
      }

      snapData.field1.should.eql(1);
      snapData.hasOwnProperty('field2').should.eql(false);
    });

    it('filters out nested undefined properties when setting enabled', async function () {
      await firebase.firestore().settings({ ignoreUndefinedProperties: true });

      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      await docRef.set({
        field1: 1,
        field2: {
          shouldBeMissing: undefined,
        },
      });

      const snap = await docRef.get();
      const snapData = snap.data();
      if (!snapData) {
        return Promise.reject(new Error('Snapshot not saved'));
      }

      snapData.field1.should.eql(1);
      snapData.hasOwnProperty('field2').should.eql(true);

      snapData.field2.hasOwnProperty('shouldBeMissing').should.eql(false);
    });

    it('throws when undefined value provided and ignored undefined is false', async function () {
      await firebase.firestore().settings({ ignoreUndefinedProperties: false });

      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);

      try {
        await docRef.set({
          field1: 1,
          field2: undefined,
        });

        return Promise.reject(new Error('Expected set() to throw'));
      } catch (e) {
        return Promise.resolve();
      }
    });

    it('throws when nested undefined value provided and ignored undefined is false', async function () {
      await firebase.firestore().settings({ ignoreUndefinedProperties: false });

      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);

      try {
        await docRef.set({
          field1: 1,
          field2: {
            shouldNotWork: undefined,
          },
        });

        return Promise.reject(new Error('Expected set() to throw'));
      } catch (e) {
        return Promise.resolve();
      }
    });
  });

  describe('collectionGroup()', function () {
    it('throws if id is not a string', function () {
      try {
        firebase.firestore().collectionGroup(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'collectionId' must be a string value");
        return Promise.resolve();
      }
    });

    it('throws if id is empty', function () {
      try {
        firebase.firestore().collectionGroup('');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'collectionId' must be a non-empty string");
        return Promise.resolve();
      }
    });

    it('throws if id contains forward-slash', function () {
      try {
        firebase.firestore().collectionGroup(`${COLLECTION}/bar`);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'collectionId' must not contain '/'");
        return Promise.resolve();
      }
    });

    it('returns a new query instance', function () {
      const query = firebase.firestore().collectionGroup(COLLECTION);
      should.equal(query.constructor.name, 'FirestoreQuery');
    });

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

  describe('runTransaction()', function () {
    it('throws if updateFunction is not a function', function () {
      try {
        firebase.firestore().runTransaction('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'updateFunction' must be a function");
        return Promise.resolve();
      }
    });
  });

  describe('settings()', function () {
    it('throws if settings is not an object', function () {
      try {
        firebase.firestore().settings('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'settings' must be an object");
        return Promise.resolve();
      }
    });

    it('throws if passing an incorrect setting key', function () {
      try {
        firebase.firestore().settings({ foo: 'bar' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'settings.foo' is not a valid settings field");
        return Promise.resolve();
      }
    });

    it('throws if cacheSizeBytes is not a number', function () {
      try {
        firebase.firestore().settings({ cacheSizeBytes: 'foo' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'settings.cacheSizeBytes' must be a number value");
        return Promise.resolve();
      }
    });

    it('throws if cacheSizeBytes is less than 1MB', function () {
      try {
        firebase.firestore().settings({ cacheSizeBytes: 123 });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'settings.cacheSizeBytes' the minimum cache size");
        return Promise.resolve();
      }
    });
    // NOTE: removed as it breaks emulator tests along with 'should clear any cached data' test below
    xit('accepts an unlimited cache size', function () {
      firebase.firestore().settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });
    });

    it('throws if host is not a string', function () {
      try {
        firebase.firestore().settings({ host: 123 });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'settings.host' must be a string value");
        return Promise.resolve();
      }
    });

    it('throws if host is an empty string', function () {
      try {
        firebase.firestore().settings({ host: '' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'settings.host' must not be an empty string");
        return Promise.resolve();
      }
    });

    it('throws if persistence is not a boolean', function () {
      try {
        firebase.firestore().settings({ persistence: 'true' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'settings.persistence' must be a boolean value");
        return Promise.resolve();
      }
    });

    it('throws if ignoreUndefinedProperties is not a boolean', function () {
      try {
        firebase.firestore().settings({ ignoreUndefinedProperties: 'true' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          "'settings.ignoreUndefinedProperties' must be a boolean value",
        );
        return Promise.resolve();
      }
    });

    it('throws if ssl is not a boolean', function () {
      try {
        firebase.firestore().settings({ ssl: 'true' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'settings.ssl' must be a boolean value");
        return Promise.resolve();
      }
    });
  });

  describe('Clear cached data persistence', function () {
    // NOTE: removed as it breaks emulator tests along with 'accepts an unlimited cache size' test above
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
});
