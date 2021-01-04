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

const { PATH } = require('../helpers');

const TEST_PATH = `${PATH}/on`;

// TODO flakey on CI - improve database paths so no current test conflicts & remove sleep util usage
xdescribe('database().ref().on()', function () {
  it('throws if event type is invalid', async function () {
    try {
      await firebase.database().ref().on('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'eventType' must be one of");
      return Promise.resolve();
    }
  });

  it('throws if callback is not a function', async function () {
    try {
      await firebase.database().ref().on('value', 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'callback' must be a function");
      return Promise.resolve();
    }
  });

  it('throws if cancel callback is not a function', async function () {
    try {
      await firebase
        .database()
        .ref()
        .on('value', () => {}, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'cancelCallbackOrContext' must be a function or object");
      return Promise.resolve();
    }
  });

  it('throws if context is not an object', async function () {
    try {
      await firebase
        .database()
        .ref()
        .on(
          'value',
          () => {},
          () => {},
          'foo',
        );
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'context' must be an object.");
      return Promise.resolve();
    }
  });
  // TODO test flakey on CI - swap out Util.sleep
  xit('should callback with an initial value', async function () {
    const callback = sinon.spy();
    const ref = firebase.database().ref(`${TEST_PATH}/init`);
    const value = Date.now();
    await ref.set(value);

    ref.on('value', $ => {
      callback($.val());
    });

    await Utils.sleep(500);
    callback.should.be.calledOnce();
    callback.should.be.calledWith(value);

    ref.off('value');
  });

  it('should callback multiple times when the value changes', async function () {
    const callback = sinon.spy();
    const ref = firebase.database().ref(`${TEST_PATH}/changes`);
    await ref.set('foo');

    ref.on('value', $ => {
      callback($.val());
    });

    await Utils.sleep(500);
    await ref.set('bar');
    await Utils.sleep(500);

    ref.off('value');
    callback.should.be.calledTwice();
    callback.getCall(0).args[0].should.equal('foo');
    callback.getCall(1).args[0].should.equal('bar');
  });

  it('should cancel when something goes wrong', async function () {
    const successCallback = sinon.spy();
    const cancelCallback = sinon.spy();
    const ref = firebase.database().ref('nope');

    ref.on(
      'value',
      $ => {
        successCallback($.val());
      },
      error => {
        error.message.should.containEql(
          "Client doesn't have permission to access the desired data",
        );
        cancelCallback();
      },
    );

    await Utils.sleep(1200); // takes a while to call at times
    ref.off('value');
    successCallback.should.be.callCount(0);
    cancelCallback.should.be.calledOnce();
  });

  it('subscribe to child added events', async function () {
    const successCallback = sinon.spy();
    const cancelCallback = sinon.spy();
    const ref = firebase.database().ref(`${TEST_PATH}/childAdded`);

    ref.on(
      'child_added',
      $ => {
        successCallback($.val());
      },
      () => {
        cancelCallback();
      },
    );

    await Utils.sleep(500);
    await ref.child('child1').set('foo');
    await ref.child('child2').set('bar');
    await Utils.sleep(500);
    ref.off('child_added');
    successCallback.should.be.callCount(2);
    successCallback.getCall(0).args[0].should.equal('foo');
    successCallback.getCall(1).args[0].should.equal('bar');
    cancelCallback.should.be.callCount(0);
  });

  it('subscribe to child changed events', async function () {
    const successCallback = sinon.spy();
    const cancelCallback = sinon.spy();
    const ref = firebase.database().ref(`${TEST_PATH}/childChanged`);
    const child = ref.child('changeme');
    await child.set('foo');

    ref.on(
      'child_changed',
      $ => {
        successCallback($.val());
      },
      () => {
        cancelCallback();
      },
    );

    const value1 = Date.now();
    const value2 = Date.now() + 123;

    await Utils.sleep(500);
    await child.set(value1);
    await child.set(value2);
    await Utils.sleep(500);
    ref.off('child_changed');
    successCallback.should.be.callCount(2);
    successCallback.getCall(0).args[0].should.equal(value1);
    successCallback.getCall(1).args[0].should.equal(value2);
    cancelCallback.should.be.callCount(0);
  });

  it('subscribe to child removed events', async function () {
    const successCallback = sinon.spy();
    const cancelCallback = sinon.spy();
    const ref = firebase.database().ref(`${TEST_PATH}/childRemoved`);
    const child = ref.child('removeme');
    await child.set('foo');

    ref.on(
      'child_removed',
      $ => {
        successCallback($.val());
      },
      () => {
        cancelCallback();
      },
    );

    await Utils.sleep(500);
    await child.remove();
    await Utils.sleep(500);
    ref.off('child_removed');
    successCallback.should.be.callCount(1);
    successCallback.getCall(0).args[0].should.equal('foo');
    cancelCallback.should.be.callCount(0);
  });

  it('subscribe to child moved events', async function () {
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

    orderedRef.on('child_moved', $ => {
      // console.log($);
      callback($.val());
    });
    await ref.set(initial);
    await ref.child('greg/nuggets').set(57);
    await ref.child('rob/nuggets').set(61);
    await Utils.sleep(500);
    ref.off('child_moved');
    callback.should.be.calledTwice();
    callback.getCall(0).args[0].should.be.eql(jet.contextify({ nuggets: 57 }));
    callback.getCall(1).args[0].should.be.eql(jet.contextify({ nuggets: 61 }));
  });
});
