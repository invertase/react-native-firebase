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
const NO_RULE_COLLECTION = 'no_rules';
const { wipe, setDocumentOutOfBand } = require('../helpers');

describe('firestore().doc().onSnapshot()', function () {
  before(function () {
    return wipe();
  });

  describe('v8 compatibility', function () {
    beforeEach(async function beforeEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterEach(async function afterEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    it('throws if no arguments are provided', function () {
      try {
        firebase.firestore().doc(`${COLLECTION}/foo`).onSnapshot();
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('expected at least one argument');
        return Promise.resolve();
      }
    });

    it('returns an unsubscribe function', function () {
      const unsub = firebase
        .firestore()
        .doc(`${COLLECTION}/foo`)
        .onSnapshot(() => {});

      unsub.should.be.a.Function();
      unsub();
    });

    it('accepts a single callback function with snapshot', async function () {
      if (Platform.other) {
        return;
      }
      const callback = sinon.spy();
      const unsub = firebase.firestore().doc(`${COLLECTION}/foo`).onSnapshot(callback);

      await Utils.spyToBeCalledOnceAsync(callback);

      callback.should.be.calledOnce();
      callback.args[0][0].constructor.name.should.eql('DocumentSnapshot');
      should.equal(callback.args[0][1], null);
      unsub();
    });

    it('accepts a single callback function with Error', async function () {
      if (Platform.other) {
        return;
      }
      const callback = sinon.spy();
      const unsub = firebase.firestore().doc(`${NO_RULE_COLLECTION}/nope`).onSnapshot(callback);

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
        const unsub = firebase.firestore().doc(`${COLLECTION}/foo`).onSnapshot(onNext, onError);

        await Utils.spyToBeCalledOnceAsync(onNext);

        onNext.should.be.calledOnce();
        onError.should.be.callCount(0);
        onNext.args[0][0].constructor.name.should.eql('DocumentSnapshot');
        should.equal(onNext.args[0][1], undefined);
        unsub();
      });

      it('calls onError with Error', async function () {
        const onNext = sinon.spy();
        const onError = sinon.spy();
        const unsub = firebase
          .firestore()
          .doc(`${NO_RULE_COLLECTION}/nope`)
          .onSnapshot(onNext, onError);

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
        const unsub = firebase.firestore().doc(`${COLLECTION}/foo`).onSnapshot({
          next: onNext,
          error: onError,
        });

        await Utils.spyToBeCalledOnceAsync(onNext);

        onNext.should.be.calledOnce();
        onError.should.be.callCount(0);
        onNext.args[0][0].constructor.name.should.eql('DocumentSnapshot');
        should.equal(onNext.args[0][1], undefined);
        unsub();
      });

      it('calls error with Error', async function () {
        const onNext = sinon.spy();
        const onError = sinon.spy();
        const unsub = firebase.firestore().doc(`${NO_RULE_COLLECTION}/nope`).onSnapshot({
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
        const unsub = firebase.firestore().doc(`${COLLECTION}/foo`).onSnapshot(
          {
            includeMetadataChanges: false,
          },
          callback,
        );

        await Utils.spyToBeCalledOnceAsync(callback);

        callback.should.be.calledOnce();
        callback.args[0][0].constructor.name.should.eql('DocumentSnapshot');
        should.equal(callback.args[0][1], null);
        unsub();
      });

      it('calls callback with Error', async function () {
        const callback = sinon.spy();
        const unsub = firebase.firestore().doc(`${NO_RULE_COLLECTION}/nope`).onSnapshot(
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
        const unsub = firebase.firestore().doc(`${COLLECTION}/foo`).onSnapshot(
          {
            includeMetadataChanges: false,
          },
          onNext,
          onError,
        );

        await Utils.spyToBeCalledOnceAsync(onNext);

        onNext.should.be.calledOnce();
        onError.should.be.callCount(0);
        onNext.args[0][0].constructor.name.should.eql('DocumentSnapshot');
        should.equal(onNext.args[0][1], undefined);
        unsub();
      });

      it('calls error with Error', async function () {
        const onNext = sinon.spy();
        const onError = sinon.spy();
        const unsub = firebase.firestore().doc(`${NO_RULE_COLLECTION}/nope`).onSnapshot(
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
        const unsub = firebase.firestore().doc(`${COLLECTION}/foo`).onSnapshot(
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
        onNext.args[0][0].constructor.name.should.eql('DocumentSnapshot');
        should.equal(onNext.args[0][1], undefined);
        unsub();
      });

      it('calls error with Error', async function () {
        const onNext = sinon.spy();
        const onError = sinon.spy();
        const unsub = firebase.firestore().doc(`${NO_RULE_COLLECTION}/nope`).onSnapshot(
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
        firebase.firestore().doc(`${NO_RULE_COLLECTION}/nope`).onSnapshot({
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

    it("throws if SnapshotListenerOptions.source is invalid ('server')", function () {
      try {
        firebase.firestore().doc(`${NO_RULE_COLLECTION}/nope`).onSnapshot({
          source: 'server',
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          "'options' SnapshotOptions.source must be one of 'default' or 'cache'",
        );
        return Promise.resolve();
      }
    });

    it('accepts source-only SnapshotListenerOptions', async function () {
      if (Platform.other) {
        return;
      }
      const callback = sinon.spy();
      const unsub = firebase.firestore().doc(`${COLLECTION}/source-only`).onSnapshot(
        {
          source: 'cache',
        },
        callback,
      );

      await Utils.spyToBeCalledOnceAsync(callback);
      unsub();
    });

    it('accepts source + includeMetadataChanges SnapshotListenerOptions', async function () {
      if (Platform.other) {
        return;
      }
      const callback = sinon.spy();
      const unsub = firebase.firestore().doc(`${COLLECTION}/source-with-metadata`).onSnapshot(
        {
          source: 'default',
          includeMetadataChanges: true,
        },
        callback,
      );

      await Utils.spyToBeCalledOnceAsync(callback);
      unsub();
    });

    it('cache source listeners ignore out-of-band server writes', async function () {
      if (Platform.other) {
        return;
      }

      const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;
      const docRef = firebase.firestore().doc(docPath);
      await docRef.set({ value: 1 });
      await docRef.get();

      const callback = sinon.spy();
      const unsub = docRef.onSnapshot({ source: 'cache' }, callback);
      try {
        await Utils.spyToBeCalledOnceAsync(callback);

        await setDocumentOutOfBand(docPath, { value: 2 });
        await Utils.sleep(1500);
        callback.should.be.callCount(1);

        await docRef.set({ value: 3 });
        await Utils.spyToBeCalledTimesAsync(callback, 2);
        callback.args[1][0].get('value').should.equal(3);
      } finally {
        unsub();
      }
    });

    it('default source listeners receive out-of-band server writes', async function () {
      if (Platform.other) {
        return;
      }

      const docPath = `${COLLECTION}/${Utils.randString(12, '#aA')}`;
      const docRef = firebase.firestore().doc(docPath);
      await docRef.set({ value: 1 });
      await docRef.get();

      const callback = sinon.spy();
      const unsub = docRef.onSnapshot(
        { source: 'default', includeMetadataChanges: true },
        callback,
      );
      try {
        await Utils.spyToBeCalledOnceAsync(callback);

        await setDocumentOutOfBand(docPath, { value: 2 });
        await Utils.spyToBeCalledTimesAsync(callback, 2, 8000);

        const latestSnapshot = callback.args[callback.callCount - 1][0];
        latestSnapshot.get('value').should.equal(2);
      } finally {
        unsub();
      }
    });

    it('throws if next callback is invalid', function () {
      try {
        firebase.firestore().doc(`${NO_RULE_COLLECTION}/nope`).onSnapshot({
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
        firebase.firestore().doc(`${NO_RULE_COLLECTION}/nope`).onSnapshot({
          error: 'foo',
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'observer.error' or 'onError' expected a function");
        return Promise.resolve();
      }
    });

    it('unsubscribes from further updates', async function () {
      if (Platform.other) {
        return;
      }
      const callback = sinon.spy();
      const doc = firebase.firestore().doc(`${COLLECTION}/unsub`);

      const unsub = doc.onSnapshot(callback);
      await Utils.spyToBeCalledOnceAsync(callback);
      await doc.set({ foo: 'bar' });
      unsub();
      await Utils.sleep(800);
      await doc.set({ foo: 'bar2' });
      await Utils.spyToBeCalledTimesAsync(callback, 2);
      callback.should.be.callCount(2);
    });
  });

  describe('modular', function () {
    it('throws if no arguments are provided', function () {
      const { getFirestore, doc, onSnapshot } = firestoreModular;
      try {
        onSnapshot(doc(getFirestore(), `${COLLECTION}/foo`));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('expected at least one argument');
        return Promise.resolve();
      }
    });

    it('returns an unsubscribe function', function () {
      const { getFirestore, doc, onSnapshot } = firestoreModular;

      const unsub = onSnapshot(doc(getFirestore(), `${COLLECTION}/foo`), () => {});

      unsub.should.be.a.Function();
      unsub();
    });

    it('accepts a single callback function with snapshot', async function () {
      if (Platform.other) {
        return;
      }
      const { getFirestore, doc, onSnapshot } = firestoreModular;

      const callback = sinon.spy();
      const unsub = onSnapshot(doc(getFirestore(), `${COLLECTION}/foo`), callback);

      await Utils.spyToBeCalledOnceAsync(callback);

      callback.should.be.calledOnce();
      callback.args[0][0].constructor.name.should.eql('DocumentSnapshot');
      should.equal(callback.args[0][1], null);
      unsub();
    });

    describe('multiple callbacks', function () {
      if (Platform.other) {
        return;
      }

      it('calls onNext when successful', async function () {
        if (Platform.other) {
          return;
        }
        const { getFirestore, doc, onSnapshot } = firestoreModular;

        const onNext = sinon.spy();
        const onError = sinon.spy();
        const unsub = onSnapshot(doc(getFirestore(), `${COLLECTION}/foo`), onNext, onError);

        await Utils.spyToBeCalledOnceAsync(onNext);

        onNext.should.be.calledOnce();
        onError.should.be.callCount(0);
        onNext.args[0][0].constructor.name.should.eql('DocumentSnapshot');
        should.equal(onNext.args[0][1], undefined);
        unsub();
      });

      it('calls onError with Error', async function () {
        const { getFirestore, doc, onSnapshot } = firestoreModular;
        const onNext = sinon.spy();
        const onError = sinon.spy();
        const unsub = onSnapshot(
          doc(getFirestore(), `${NO_RULE_COLLECTION}/nope`),
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

    describe('objects of callbacks', function () {
      if (Platform.other) {
        return;
      }

      it('calls next when successful', async function () {
        const { getFirestore, doc, onSnapshot } = firestoreModular;

        const onNext = sinon.spy();
        const onError = sinon.spy();
        const unsub = onSnapshot(doc(getFirestore(), `${COLLECTION}/foo`), {
          next: onNext,
          error: onError,
        });

        await Utils.spyToBeCalledOnceAsync(onNext);

        onNext.should.be.calledOnce();
        onError.should.be.callCount(0);
        onNext.args[0][0].constructor.name.should.eql('DocumentSnapshot');
        should.equal(onNext.args[0][1], undefined);
        unsub();
      });

      it('calls error with Error', async function () {
        const { getFirestore, doc, onSnapshot } = firestoreModular;

        const onNext = sinon.spy();
        const onError = sinon.spy();
        const unsub = onSnapshot(doc(getFirestore(), `${NO_RULE_COLLECTION}/nope`), {
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
        const { getFirestore, doc, onSnapshot } = firestoreModular;

        const callback = sinon.spy();
        const unsub = onSnapshot(
          doc(getFirestore(), `${COLLECTION}/foo`),
          {
            includeMetadataChanges: false,
          },
          callback,
        );

        await Utils.spyToBeCalledOnceAsync(callback);

        callback.should.be.calledOnce();
        callback.args[0][0].constructor.name.should.eql('DocumentSnapshot');
        should.equal(callback.args[0][1], null);
        unsub();
      });

      it('calls next with snapshot when successful', async function () {
        const { getFirestore, doc, onSnapshot } = firestoreModular;

        const onNext = sinon.spy();
        const onError = sinon.spy();
        const unsub = onSnapshot(
          doc(getFirestore(), `${COLLECTION}/foo`),
          {
            includeMetadataChanges: false,
          },
          onNext,
          onError,
        );

        await Utils.spyToBeCalledOnceAsync(onNext);

        onNext.should.be.calledOnce();
        onError.should.be.callCount(0);
        onNext.args[0][0].constructor.name.should.eql('DocumentSnapshot');
        should.equal(onNext.args[0][1], undefined);
        unsub();
      });

      it('calls error with Error', async function () {
        const { getFirestore, doc, onSnapshot } = firestoreModular;

        const onNext = sinon.spy();
        const onError = sinon.spy();
        const unsub = onSnapshot(
          doc(getFirestore(), `${NO_RULE_COLLECTION}/nope`),
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
        const { getFirestore, doc, onSnapshot } = firestoreModular;

        const onNext = sinon.spy();
        const onError = sinon.spy();
        const unsub = onSnapshot(
          doc(getFirestore(), `${COLLECTION}/foo`),
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
        onNext.args[0][0].constructor.name.should.eql('DocumentSnapshot');
        should.equal(onNext.args[0][1], undefined);
        unsub();
      });

      it('calls error with Error', async function () {
        const { getFirestore, doc, onSnapshot } = firestoreModular;

        const onNext = sinon.spy();
        const onError = sinon.spy();
        const unsub = onSnapshot(
          doc(getFirestore(), `${NO_RULE_COLLECTION}/nope`),
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
      const { getFirestore, doc, onSnapshot } = firestoreModular;
      try {
        onSnapshot(doc(getFirestore(), `${NO_RULE_COLLECTION}/nope`), {
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

    it("throws if SnapshotListenerOptions.source is invalid ('server')", function () {
      const { getFirestore, doc, onSnapshot } = firestoreModular;
      try {
        onSnapshot(doc(getFirestore(), `${NO_RULE_COLLECTION}/nope`), {
          source: 'server',
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          "'options' SnapshotOptions.source must be one of 'default' or 'cache'",
        );
        return Promise.resolve();
      }
    });

    it('accepts source-only SnapshotListenerOptions', async function () {
      if (Platform.other) {
        return;
      }
      const { getFirestore, doc, onSnapshot } = firestoreModular;
      const callback = sinon.spy();
      const unsub = onSnapshot(
        doc(getFirestore(), `${COLLECTION}/mod-source-only`),
        {
          source: 'cache',
        },
        callback,
      );

      await Utils.spyToBeCalledOnceAsync(callback);
      unsub();
    });

    it('accepts source + includeMetadataChanges SnapshotListenerOptions', async function () {
      if (Platform.other) {
        return;
      }
      const { getFirestore, doc, onSnapshot } = firestoreModular;
      const callback = sinon.spy();
      const unsub = onSnapshot(
        doc(getFirestore(), `${COLLECTION}/mod-source-with-metadata`),
        {
          source: 'default',
          includeMetadataChanges: true,
        },
        callback,
      );

      await Utils.spyToBeCalledOnceAsync(callback);
      unsub();
    });

    it('throws if next callback is invalid', function () {
      const { getFirestore, doc, onSnapshot } = firestoreModular;
      try {
        onSnapshot(doc(getFirestore(), `${NO_RULE_COLLECTION}/nope`), {
          next: 'foo',
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'observer.next' or 'onNext' expected a function");
        return Promise.resolve();
      }
    });

    it('throws if error callback is invalid', function () {
      const { getFirestore, doc, onSnapshot } = firestoreModular;
      try {
        onSnapshot(doc(getFirestore(), `${NO_RULE_COLLECTION}/nope`), {
          error: 'foo',
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'observer.error' or 'onError' expected a function");
        return Promise.resolve();
      }
    });

    it('unsubscribes from further updates', async function () {
      if (Platform.other) {
        return;
      }
      const { getFirestore, doc, onSnapshot, setDoc } = firestoreModular;

      const callback = sinon.spy();
      const docRef = doc(getFirestore(), `${COLLECTION}/unsub`);

      const unsub = onSnapshot(docRef, callback);
      await Utils.spyToBeCalledOnceAsync(callback);
      await setDoc(docRef, { foo: 'bar' });
      unsub();
      await Utils.sleep(800);
      await setDoc(docRef, { foo: 'bar2' });
      await Utils.spyToBeCalledTimesAsync(callback, 2);
      callback.should.be.callCount(2);
    });
  });
});
