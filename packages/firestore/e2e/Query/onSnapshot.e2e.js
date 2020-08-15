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

describe('firestore().collection().onSnapshot()', () => {
  before(() => wipe());

  it('throws if no arguments are provided', () => {
    try {
      firebase
        .firestore()
        .collection('v6')
        .onSnapshot();
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('expected at least one argument');
      return Promise.resolve();
    }
  });

  it('returns an unsubscribe function', () => {
    const unsub = firebase
      .firestore()
      .collection('v6/foo/bar1')
      .onSnapshot(() => {});

    unsub.should.be.a.Function();
    unsub();
  });

  it('accepts a single callback function with snapshot', async () => {
    const callback = sinon.spy();
    const unsub = firebase
      .firestore()
      .collection('v6/foo/bar2')
      .onSnapshot(callback);

    await Utils.spyToBeCalledOnceAsync(callback);

    callback.should.be.calledOnce();
    callback.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
    should.equal(callback.args[0][1], null);
    unsub();
  });

  it('accepts a single callback function with Error', async () => {
    const callback = sinon.spy();
    const unsub = firebase
      .firestore()
      .collection('nope')
      .onSnapshot(callback);

    await Utils.spyToBeCalledOnceAsync(callback);

    callback.should.be.calledOnce();
    callback.args[0][1].code.should.containEql('firestore/permission-denied');
    should.equal(callback.args[0][0], null);
    unsub();
  });

  describe('multiple callbacks', () => {
    it('calls onNext when successful', async () => {
      const onNext = sinon.spy();
      const onError = sinon.spy();
      const unsub = firebase
        .firestore()
        .collection('v6/foo/bar3')
        .onSnapshot(onNext, onError);

      await Utils.spyToBeCalledOnceAsync(onNext);

      onNext.should.be.calledOnce();
      onError.should.be.callCount(0);
      onNext.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
      should.equal(onNext.args[0][1], undefined);
      unsub();
    });

    it('calls onError with Error', async () => {
      const onNext = sinon.spy();
      const onError = sinon.spy();
      const unsub = firebase
        .firestore()
        .collection('nope')
        .onSnapshot(onNext, onError);

      await Utils.spyToBeCalledOnceAsync(onError);

      onError.should.be.calledOnce();
      onNext.should.be.callCount(0);
      onError.args[0][0].code.should.containEql('firestore/permission-denied');
      should.equal(onError.args[0][1], undefined);
      unsub();
    });
  });

  describe('objects of callbacks', () => {
    it('calls next when successful', async () => {
      const onNext = sinon.spy();
      const onError = sinon.spy();
      const unsub = firebase
        .firestore()
        .collection('v6/foo/bar4')
        .onSnapshot({
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

    it('calls error with Error', async () => {
      const onNext = sinon.spy();
      const onError = sinon.spy();
      const unsub = firebase
        .firestore()
        .collection('nope')
        .onSnapshot({
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

  describe('SnapshotListenerOptions + callbacks', () => {
    it('calls callback with snapshot when successful', async () => {
      const callback = sinon.spy();
      const unsub = firebase
        .firestore()
        .collection('v6/foo/bar5')
        .onSnapshot(
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

    it('calls callback with Error', async () => {
      const callback = sinon.spy();
      const unsub = firebase
        .firestore()
        .collection('nope')
        .onSnapshot(
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

    it('calls next with snapshot when successful', async () => {
      const onNext = sinon.spy();
      const onError = sinon.spy();
      const unsub = firebase
        .firestore()
        .collection('v6/foo/bar6')
        .onSnapshot(
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

    it('calls error with Error', async () => {
      const onNext = sinon.spy();
      const onError = sinon.spy();
      const unsub = firebase
        .firestore()
        .collection('nope')
        .onSnapshot(
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

  describe('SnapshotListenerOptions + object of callbacks', () => {
    it('calls next with snapshot when successful', async () => {
      const onNext = sinon.spy();
      const onError = sinon.spy();
      const unsub = firebase
        .firestore()
        .collection('v6/foo/bar7')
        .onSnapshot(
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

    it('calls error with Error', async () => {
      const onNext = sinon.spy();
      const onError = sinon.spy();
      const unsub = firebase
        .firestore()
        .collection('nope')
        .onSnapshot(
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

  it('throws if SnapshotListenerOptions is invalid', () => {
    try {
      firebase
        .firestore()
        .collection('nope')
        .onSnapshot({
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

  it('throws if next callback is invalid', () => {
    try {
      firebase
        .firestore()
        .collection('nope')
        .onSnapshot({
          next: 'foo',
        });
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'observer.next' or 'onNext' expected a function");
      return Promise.resolve();
    }
  });

  it('throws if error callback is invalid', () => {
    try {
      firebase
        .firestore()
        .collection('nope')
        .onSnapshot({
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
  xit('unsubscribes from further updates', async () => {
    const callback = sinon.spy();
    const collection = firebase.firestore().collection('v6/foo/bar7');

    const unsub = collection.onSnapshot(callback);
    await Utils.sleep(800);
    await collection.add({});
    await collection.add({});
    unsub();
    await Utils.sleep(800);
    await collection.add({});
    callback.should.be.callCount(3);
  });
});
