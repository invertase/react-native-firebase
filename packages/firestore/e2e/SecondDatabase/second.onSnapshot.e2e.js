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

const NO_RULE_COLLECTION = 'no_rules';

// This collection is only allowed on the second database
const COLLECTION = 'second-database';
const SECOND_DATABASE_ID = 'second-rnfb';

describe('Second Database', function () {
  describe('firestore().collection().onSnapshot()', function () {
    describe('v8 compatibility', function () {
      let firestore;

      before(function () {
        firestore = firebase.app().firestore(SECOND_DATABASE_ID);
      });

      beforeEach(async function () {
        return await wipe(false, SECOND_DATABASE_ID);
      });

      it('throws if no arguments are provided', function () {
        try {
          firestore.collection(COLLECTION).onSnapshot();
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('expected at least one argument');
          return Promise.resolve();
        }
      });

      it('returns an unsubscribe function', function () {
        const unsub = firestore.collection(`${COLLECTION}/foo/bar1`).onSnapshot(() => {});

        unsub.should.be.a.Function();
        unsub();
      });

      it('accepts a single callback function with snapshot', async function () {
        if (Platform.other) {
          return;
        }
        const callback = sinon.spy();
        const unsub = firestore.collection(`${COLLECTION}/foo/bar2`).onSnapshot(callback);

        await Utils.spyToBeCalledOnceAsync(callback);

        callback.should.be.calledOnce();
        callback.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
        should.equal(callback.args[0][1], null);
        unsub();
      });

      it('accepts a single callback function with Error', async function () {
        if (Platform.other) {
          return;
        }
        const callback = sinon.spy();
        const unsub = firestore.collection(NO_RULE_COLLECTION).onSnapshot(callback);

        await Utils.spyToBeCalledOnceAsync(callback);

        callback.should.be.calledOnce();

        callback.args[0][1].code.should.containEql('firestore/permission-denied');
        should.equal(callback.args[0][0], null);
        unsub();
      });

      describe('multiple callbacks', function () {
        if (Platform.other) {
          return;
        }

        it('calls onNext when successful', async function () {
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = firestore.collection(`${COLLECTION}/foo/bar3`).onSnapshot(onNext, onError);

          await Utils.spyToBeCalledOnceAsync(onNext);

          onNext.should.be.calledOnce();
          onError.should.be.callCount(0);
          onNext.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
          should.equal(onNext.args[0][1], undefined);
          unsub();
        });

        it('calls onError with Error', async function () {
          if (Platform.other) {
            return;
          }
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = firestore.collection(NO_RULE_COLLECTION).onSnapshot(onNext, onError);

          await Utils.spyToBeCalledOnceAsync(onError);

          onError.should.be.calledOnce();
          onNext.should.be.callCount(0);
          onError.args[0][0].code.should.containEql('firestore/permission-denied');
          should.equal(onError.args[0][1], undefined);
          unsub();
        });
      });

      describe('objects of callbacks', function () {
        if (Platform.other) {
          return;
        }

        it('calls next when successful', async function () {
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = firestore.collection(`${COLLECTION}/foo/bar4`).onSnapshot({
            next: onNext,
            error: onError,
          });

          await Utils.spyToBeCalledOnceAsync(onNext);

          onNext.should.be.calledOnce();
          onError.should.be.callCount(0);
          onNext.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
          should.equal(onNext.args[0][1], undefined);
          unsub();
        });

        it('calls error with Error', async function () {
          if (Platform.other) {
            return;
          }
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = firestore.collection(NO_RULE_COLLECTION).onSnapshot({
            next: onNext,
            error: onError,
          });

          await Utils.spyToBeCalledOnceAsync(onError);

          onError.should.be.calledOnce();
          onNext.should.be.callCount(0);
          onError.args[0][0].code.should.containEql('firestore/permission-denied');
          should.equal(onError.args[0][1], undefined);
          unsub();
        });
      });

      describe('SnapshotListenerOptions + callbacks', function () {
        if (Platform.other) {
          return;
        }

        it('calls callback with snapshot when successful', async function () {
          const callback = sinon.spy();
          const unsub = firestore.collection(`${COLLECTION}/foo/bar5`).onSnapshot(
            {
              includeMetadataChanges: false,
            },
            callback,
          );

          await Utils.spyToBeCalledOnceAsync(callback);

          callback.should.be.calledOnce();
          callback.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
          should.equal(callback.args[0][1], null);
          unsub();
        });

        it('calls callback with Error', async function () {
          const callback = sinon.spy();
          const unsub = firestore.collection(NO_RULE_COLLECTION).onSnapshot(
            {
              includeMetadataChanges: false,
            },
            callback,
          );

          await Utils.spyToBeCalledOnceAsync(callback);

          callback.should.be.calledOnce();
          callback.args[0][1].code.should.containEql('firestore/permission-denied');
          should.equal(callback.args[0][0], null);
          unsub();
        });

        it('calls next with snapshot when successful', async function () {
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const colRef = firestore
            // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
            // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
            .collection(`${COLLECTION}/${Utils.randString(12, '#aA')}/next-with-snapshot`);
          const unsub = colRef.onSnapshot(
            {
              includeMetadataChanges: false,
            },
            onNext,
            onError,
          );

          await Utils.spyToBeCalledOnceAsync(onNext);

          onNext.should.be.calledOnce();
          onError.should.be.callCount(0);
          onNext.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
          should.equal(onNext.args[0][1], undefined);
          unsub();
        });

        it('calls error with Error', async function () {
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = firestore.collection(NO_RULE_COLLECTION).onSnapshot(
            {
              includeMetadataChanges: false,
            },
            onNext,
            onError,
          );

          await Utils.spyToBeCalledOnceAsync(onError);

          onError.should.be.calledOnce();
          onNext.should.be.callCount(0);
          onError.args[0][0].code.should.containEql('firestore/permission-denied');
          should.equal(onError.args[0][1], undefined);
          unsub();
        });
      });

      describe('SnapshotListenerOptions + object of callbacks', function () {
        if (Platform.other) {
          return;
        }

        it('calls next with snapshot when successful', async function () {
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = firestore.collection(`${COLLECTION}/foo/bar7`).onSnapshot(
            {
              includeMetadataChanges: false,
            },
            {
              next: onNext,
              error: onError,
            },
          );

          await Utils.spyToBeCalledOnceAsync(onNext);

          onNext.should.be.calledOnce();
          onError.should.be.callCount(0);
          onNext.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
          should.equal(onNext.args[0][1], undefined);
          unsub();
        });

        it('calls error with Error', async function () {
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = firestore.collection(NO_RULE_COLLECTION).onSnapshot(
            {
              includeMetadataChanges: false,
            },
            {
              next: onNext,
              error: onError,
            },
          );

          await Utils.spyToBeCalledOnceAsync(onError);

          onError.should.be.calledOnce();
          onNext.should.be.callCount(0);
          onError.args[0][0].code.should.containEql('firestore/permission-denied');
          should.equal(onError.args[0][1], undefined);
          unsub();
        });
      });

      it('throws if SnapshotListenerOptions is invalid', function () {
        try {
          firestore.collection(NO_RULE_COLLECTION).onSnapshot({
            includeMetadataChanges: 123,
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'options' SnapshotOptions.includeMetadataChanges must be a boolean value",
          );
          return Promise.resolve();
        }
      });

      it('throws if next callback is invalid', function () {
        try {
          firestore.collection(NO_RULE_COLLECTION).onSnapshot({
            next: 'foo',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'observer.next' or 'onNext' expected a function");
          return Promise.resolve();
        }
      });

      it('throws if error callback is invalid', function () {
        try {
          firestore.collection(NO_RULE_COLLECTION).onSnapshot({
            error: 'foo',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'observer.error' or 'onError' expected a function");
          return Promise.resolve();
        }
      });

      // FIXME test disabled due to flakiness in CI E2E tests.
      // Registered 4 of 3 expected calls once (!?), 3 of 2 expected calls once.
      it('unsubscribes from further updates', async function () {
        if (Platform.other) {
          return;
        }
        const callback = sinon.spy();

        const collection = firestore
          // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
          // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
          .collection(`${COLLECTION}/${Utils.randString(12, '#aA')}/unsubscribe-updates`);

        const unsub = collection.onSnapshot(callback);
        await Utils.sleep(2000);
        await collection.add({});
        await collection.add({});
        unsub();
        await Utils.sleep(2000);
        await collection.add({});
        await Utils.sleep(2000);
        callback.should.be.callCount(3);
      });
    });

    describe('modular', function () {
      let firestore;

      before(function () {
        const { getFirestore } = firestoreModular;
        firestore = getFirestore(null, SECOND_DATABASE_ID);
      });

      beforeEach(async function () {
        return await wipe(false, SECOND_DATABASE_ID);
      });

      it('throws if no arguments are provided', function () {
        const { collection, onSnapshot } = firestoreModular;
        try {
          onSnapshot(collection(firestore, COLLECTION));
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql('expected at least one argument');
          return Promise.resolve();
        }
      });

      it('returns an unsubscribe function', function () {
        const { collection, onSnapshot } = firestoreModular;
        const unsub = onSnapshot(collection(firestore, `${COLLECTION}/foo/bar1`), () => {});

        unsub.should.be.a.Function();
        unsub();
      });

      it('accepts a single callback function with snapshot', async function () {
        if (Platform.other) {
          return;
        }
        const { collection, onSnapshot } = firestoreModular;
        const callback = sinon.spy();
        const unsub = onSnapshot(collection(firestore, `${COLLECTION}/foo/bar2`), callback);

        await Utils.spyToBeCalledOnceAsync(callback);

        callback.should.be.calledOnce();
        callback.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
        should.equal(callback.args[0][1], null);
        unsub();
      });

      describe('multiple callbacks', function () {
        if (Platform.other) {
          return;
        }

        it('calls onNext when successful', async function () {
          const { collection, onSnapshot } = firestoreModular;
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = onSnapshot(
            collection(firestore, `${COLLECTION}/foo/bar3`),
            onNext,
            onError,
          );

          await Utils.spyToBeCalledOnceAsync(onNext);

          onNext.should.be.calledOnce();
          onError.should.be.callCount(0);
          onNext.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
          should.equal(onNext.args[0][1], undefined);
          unsub();
        });

        it('calls onError with Error', async function () {
          const { collection, onSnapshot } = firestoreModular;
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = onSnapshot(collection(firestore, NO_RULE_COLLECTION), onNext, onError);

          await Utils.spyToBeCalledOnceAsync(onError);

          onError.should.be.calledOnce();
          onNext.should.be.callCount(0);
          onError.args[0][0].code.should.containEql('firestore/permission-denied');
          should.equal(onError.args[0][1], undefined);
          unsub();
        });
      });

      describe('objects of callbacks', function () {
        if (Platform.other) {
          return;
        }

        it('calls next when successful', async function () {
          const { collection, onSnapshot } = firestoreModular;
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = onSnapshot(collection(firestore, `${COLLECTION}/foo/bar4`), {
            next: onNext,
            error: onError,
          });

          await Utils.spyToBeCalledOnceAsync(onNext);

          onNext.should.be.calledOnce();
          onError.should.be.callCount(0);
          onNext.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
          should.equal(onNext.args[0][1], undefined);
          unsub();
        });

        it('calls error with Error', async function () {
          const { collection, onSnapshot } = firestoreModular;
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = onSnapshot(collection(firestore, NO_RULE_COLLECTION), {
            next: onNext,
            error: onError,
          });

          await Utils.spyToBeCalledOnceAsync(onError);

          onError.should.be.calledOnce();
          onNext.should.be.callCount(0);
          onError.args[0][0].code.should.containEql('firestore/permission-denied');
          should.equal(onError.args[0][1], undefined);
          unsub();
        });
      });

      describe('SnapshotListenerOptions + callbacks', function () {
        if (Platform.other) {
          return;
        }

        it('calls callback with snapshot when successful', async function () {
          const { collection, onSnapshot } = firestoreModular;
          const callback = sinon.spy();
          const unsub = onSnapshot(
            collection(firestore, `${COLLECTION}/foo/bar5`),
            {
              includeMetadataChanges: false,
            },
            callback,
          );

          await Utils.spyToBeCalledOnceAsync(callback);

          callback.should.be.calledOnce();
          callback.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
          should.equal(callback.args[0][1], null);
          unsub();
        });

        it('calls next with snapshot when successful', async function () {
          if (Platform.other) {
            return;
          }
          const { collection, onSnapshot } = firestoreModular;
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const colRef = collection(
            firestore,
            // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
            // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
            `${COLLECTION}/${Utils.randString(12, '#aA')}/next-with-snapshot`,
          );
          const unsub = onSnapshot(
            colRef,
            {
              includeMetadataChanges: false,
            },
            onNext,
            onError,
          );

          await Utils.spyToBeCalledOnceAsync(onNext);

          onNext.should.be.calledOnce();
          onError.should.be.callCount(0);
          onNext.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
          should.equal(onNext.args[0][1], undefined);
          unsub();
        });

        it('calls error with Error', async function () {
          if (Platform.other) {
            return;
          }
          const { collection, onSnapshot } = firestoreModular;
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = onSnapshot(
            collection(firestore, NO_RULE_COLLECTION),
            {
              includeMetadataChanges: false,
            },
            onNext,
            onError,
          );

          await Utils.spyToBeCalledOnceAsync(onError);

          onError.should.be.calledOnce();
          onNext.should.be.callCount(0);
          onError.args[0][0].code.should.containEql('firestore/permission-denied');
          should.equal(onError.args[0][1], undefined);
          unsub();
        });
      });

      describe('SnapshotListenerOptions + object of callbacks', function () {
        if (Platform.other) {
          return;
        }

        it('calls next with snapshot when successful', async function () {
          const { collection, onSnapshot } = firestoreModular;
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = onSnapshot(
            collection(firestore, `${COLLECTION}/foo/bar7`),
            {
              includeMetadataChanges: false,
            },
            {
              next: onNext,
              error: onError,
            },
          );

          await Utils.spyToBeCalledOnceAsync(onNext);

          onNext.should.be.calledOnce();
          onError.should.be.callCount(0);
          onNext.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
          should.equal(onNext.args[0][1], undefined);
          unsub();
        });

        it('calls error with Error', async function () {
          const { collection, onSnapshot } = firestoreModular;
          const onNext = sinon.spy();
          const onError = sinon.spy();
          const unsub = onSnapshot(
            collection(firestore, NO_RULE_COLLECTION),
            {
              includeMetadataChanges: false,
            },
            {
              next: onNext,
              error: onError,
            },
          );

          await Utils.spyToBeCalledOnceAsync(onError);

          onError.should.be.calledOnce();
          onNext.should.be.callCount(0);
          onError.args[0][0].code.should.containEql('firestore/permission-denied');
          should.equal(onError.args[0][1], undefined);
          unsub();
        });
      });

      it('throws if SnapshotListenerOptions is invalid', function () {
        const { collection, onSnapshot } = firestoreModular;
        try {
          onSnapshot(collection(firestore, NO_RULE_COLLECTION), {
            includeMetadataChanges: 123,
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'options' SnapshotOptions.includeMetadataChanges must be a boolean value",
          );
          return Promise.resolve();
        }
      });

      it('throws if next callback is invalid', function () {
        const { collection, onSnapshot } = firestoreModular;
        try {
          onSnapshot(collection(firestore, NO_RULE_COLLECTION), {
            next: 'foo',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'observer.next' or 'onNext' expected a function");
          return Promise.resolve();
        }
      });

      it('throws if error callback is invalid', function () {
        const { collection, onSnapshot } = firestoreModular;
        try {
          onSnapshot(collection(firestore, NO_RULE_COLLECTION), {
            error: 'foo',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'observer.error' or 'onError' expected a function");
          return Promise.resolve();
        }
      });

      // FIXME test disabled due to flakiness in CI E2E tests.
      // Registered 4 of 3 expected calls once (!?), 3 of 2 expected calls once.
      it('unsubscribes from further updates', async function () {
        if (Platform.other) {
          return;
        }
        const { collection, onSnapshot, addDoc } = firestoreModular;
        const callback = sinon.spy();

        const collectionRef = collection(
          firestore,
          // Firestore caches aggressively, even if you wipe the emulator, local documents are cached
          // between runs, so use random collections to make sure `tests:*:test-reuse` works while iterating
          `${COLLECTION}/${Utils.randString(12, '#aA')}/unsubscribe-updates`,
        );

        const unsub = onSnapshot(collectionRef, callback);
        await Utils.sleep(2000);
        await addDoc(collectionRef, {});
        await addDoc(collectionRef, {});
        unsub();
        await Utils.sleep(2000);
        await addDoc(collectionRef, {});
        await Utils.sleep(2000);
        callback.should.be.callCount(3);
      });
    });
  });
});
