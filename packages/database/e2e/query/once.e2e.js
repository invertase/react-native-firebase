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

const { PATH, CONTENT, seed, wipe } = require('../helpers');

const TEST_PATH = `${PATH}/once`;

describe('database().ref().once()', function () {
  before(function () {
    return seed(TEST_PATH);
  });
  after(function () {
    return wipe(TEST_PATH);
  });

  it('throws if event type is invalid', async function () {
    try {
      await firebase.database().ref().once('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'eventType' must be one of");
      return Promise.resolve();
    }
  });

  it('throws if success callback is not a function', async function () {
    try {
      await firebase.database().ref().once('value', 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'successCallBack' must be a function");
      return Promise.resolve();
    }
  });

  it('throws if failure callback is not a function', async function () {
    try {
      await firebase
        .database()
        .ref()
        .once('value', () => {}, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'failureCallbackOrContext' must be a function or context");
      return Promise.resolve();
    }
  });

  it('throws if context is not an object', async function () {
    try {
      await firebase
        .database()
        .ref()
        .once(
          'value',
          () => {},
          () => {},
          'foo',
        );
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'context' must be a context object.");
      return Promise.resolve();
    }
  });

  it('returns a promise', async function () {
    const ref = firebase.database().ref('tests/types/number');
    const returnValue = ref.once('value');
    returnValue.should.be.Promise();
  });

  it('resolves with the correct values', async function () {
    const ref = firebase.database().ref(`${TEST_PATH}/types`);

    await Promise.all(
      Object.keys(CONTENT.TYPES).map(async key => {
        const value = CONTENT.TYPES[key];
        const snapsnot = await ref.child(key).once('value');
        snapsnot.val().should.eql(jet.contextify(value));
      }),
    );
  });

  it('is is called when the value is changed', async function () {
    const callback = sinon.spy();
    const ref = firebase.database().ref(`${TEST_PATH}/types/number`);
    ref.once('value').then(callback);
    await ref.set(1337);
    await Utils.spyToBeCalledOnceAsync(callback);
  });

  it('errors if permission denied', async function () {
    const ref = firebase.database().ref('nope');
    try {
      await ref.once('value');
      return Promise.reject(new Error('No permission denied error'));
    } catch (error) {
      error.code.includes('database/permission-denied').should.be.true();
      return Promise.resolve();
    }
  });

  it('it calls when a child is added', async function () {
    const value = Date.now();
    const callback = sinon.spy();
    const ref = firebase.database().ref(`${TEST_PATH}/childAdded`);

    ref.once('child_added').then($ => callback($.val()));
    await ref.child('foo').set(value);
    await Utils.spyToBeCalledOnceAsync(callback, 5000);
    callback.should.be.calledWith(value);
  });

  // FIXME not working on ios locally against emulator
  // FIXME too flaky against android
  xit('resolves when a child is changed', async function () {
    const callbackAdd = sinon.spy();
    const callbackChange = sinon.spy();
    const ref = firebase.database().ref(`${TEST_PATH}/childChanged`);

    ref.once('child_added').then($ => callbackAdd($.val()));
    await ref.child('foo').set(1);
    await Utils.spyToBeCalledOnceAsync(callbackAdd, 10000);
    ref.once('child_changed').then($ => callbackChange($.val()));
    await ref.child('foo').set(2);
    await Utils.spyToBeCalledOnceAsync(callbackChange, 10000);
    callbackChange.should.be.calledWith(2);
  });

  // FIXME too flaky against android in CI
  it('resolves when a child is removed', async function () {
    if (device.getPlatform() === 'ios') {
      const callbackAdd = sinon.spy();
      const callbackRemove = sinon.spy();
      const ref = firebase.database().ref(`${TEST_PATH}/childRemoved`);
      ref.once('child_added').then($ => callbackAdd($.val()));
      const child = ref.child('removeme');
      await child.set('foo');
      await Utils.spyToBeCalledOnceAsync(callbackAdd, 10000);

      ref.once('child_removed').then($ => callbackRemove($.val()));
      await child.remove();
      await Utils.spyToBeCalledOnceAsync(callbackRemove, 10000);
      callbackRemove.should.be.calledWith('foo');
    } else {
      this.skip();
    }
  });

  // https://github.com/firebase/firebase-js-sdk/blob/6b53e0058483c9002d2fe56119f86fc9fb96b56c/packages/database/test/order_by.test.ts#L104
  it('resolves when a child is moved', async function () {
    const callback = sinon.spy();
    const ref = firebase.database().ref(`${TEST_PATH}/childMoved`);
    const orderedRef = ref.orderByChild('nuggets');

    const initial = {
      alex: { nuggets: 60 },
      rob: { nuggets: 56 },
      vassili: { nuggets: 55.5 },
      tony: { nuggets: 52 },
      greg: { nuggets: 52 },
    };

    orderedRef.once('child_moved').then($ => callback($.val()));
    await ref.set(initial);
    await ref.child('greg/nuggets').set(57);
    await Utils.spyToBeCalledOnceAsync(callback, 5000);
    callback.should.be.calledWith({ nuggets: 57 });
  });
});
