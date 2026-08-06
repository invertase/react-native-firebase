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

const {
  PATH,
  seed,
  wipe,
  waitForNativeDbListenerReady,
  waitForNativeDbListenerRegistration,
} = require('../helpers');

const TEST_PATH = `${PATH}/on`;

describe('database().ref().on()', function () {
  describe('modular', function () {
    before(async function () {
      await seed(TEST_PATH);
    });

    after(async function () {
      await wipe(TEST_PATH);
    });

    it('throws if callback is not a function', async function () {
      const { getDatabase, ref, onValue } = databaseModular;

      try {
        onValue(ref(getDatabase()), 'foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'callback' must be a function");
        return Promise.resolve();
      }
    });

    it('throws if cancel callback is not a function', async function () {
      const { getDatabase, ref, onValue } = databaseModular;

      try {
        onValue(ref(getDatabase()), () => {}, 'foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'cancelCallbackOrContext' must be a function or object");
        return Promise.resolve();
      }
    });

    it('should callback with an initial value', async function () {
      const { getDatabase, ref, set, onValue } = databaseModular;
      const dbRef = ref(getDatabase(), `${TEST_PATH}/init`);

      const callback = sinon.spy();
      const unsubscribe = onValue(dbRef, $ => {
        callback($.val());
      });

      const value = Date.now();
      await set(dbRef, value);
      await Utils.spyToBeCalledOnceAsync(callback, 5000);
      callback.should.be.calledWith(value);

      unsubscribe();
    });

    it('should callback multiple times when the value changes', async function () {
      const { getDatabase, ref, set, onValue } = databaseModular;
      const callback = sinon.spy();
      const date = Date.now();
      const dbRef = ref(getDatabase(), `${TEST_PATH}/multi-change/${date}`);
      const unsubscribe = onValue(dbRef, $ => {
        callback($.val());
      });
      // onValue *should* be async, it uses bridge to add native listener
      // That would be a breaking API change so wait for initial callback
      await Utils.spyToBeCalledOnceAsync(callback, 1000);
      callback.should.be.calledWith(null); // initial callback pre-set
      await set(dbRef, 'foo');
      await set(dbRef, 'bar');
      await Utils.spyToBeCalledTimesAsync(callback, 3);
      unsubscribe();
      callback.getCall(1).args[0].should.equal('foo');
      callback.getCall(2).args[0].should.equal('bar');
    });

    // the cancelCallback is never called for ref.on but ref.once works?
    it('should cancel when something goes wrong', async function () {
      const { getDatabase, ref, onValue } = databaseModular;
      const successCallback = sinon.spy();
      const cancelCallback = sinon.spy();
      const dbRef = ref(getDatabase(), 'nope');

      const unsubscribe = onValue(
        dbRef,
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
      await Utils.spyToBeCalledOnceAsync(cancelCallback);
      unsubscribe();
      successCallback.should.be.callCount(0);
    });

    it('subscribe to child added events', async function () {
      const { getDatabase, ref, set, child, onChildAdded } = databaseModular;
      const successCallback = sinon.spy();
      const cancelCallback = sinon.spy();
      const date = Date.now();
      const dbRef = ref(getDatabase(), `${TEST_PATH}/childAdded/${date}`);

      const unsubscribe = onChildAdded(
        dbRef,
        $ => {
          successCallback($.val());
        },
        () => {
          cancelCallback();
        },
      );

      await waitForNativeDbListenerRegistration(`${TEST_PATH}/childAdded/${date}`);
      await set(child(dbRef, 'child1'), 'foo');
      await set(child(dbRef, 'child2'), 'bar');
      await Utils.spyToBeCalledTimesAsync(successCallback, 2);
      unsubscribe();
      successCallback.getCall(0).args[0].should.equal('foo');
      successCallback.getCall(1).args[0].should.equal('bar');
      cancelCallback.should.be.callCount(0);
    });

    it('subscribe to child changed events', async function () {
      if (Platform.other) {
        this.skip('Errors on JS SDK about a missing index.');
        return;
      }
      const { getDatabase, ref, set, child, onChildChanged } = databaseModular;
      const successCallback = sinon.spy();
      const cancelCallback = sinon.spy();
      const date = Date.now();
      const dbRef = ref(getDatabase(), `${TEST_PATH}/childChanged/${date}`);
      const childRef = child(dbRef, 'changeme');
      await set(childRef, 'foo');

      const unsubscribe = onChildChanged(
        dbRef,
        $ => {
          successCallback($.val());
        },
        () => {
          cancelCallback();
        },
      );
      await waitForNativeDbListenerReady(`${TEST_PATH}/childChanged/${date}/changeme`, 'foo');

      const value1 = Date.now();
      const value2 = Date.now() + 123;

      await set(childRef, value1);
      await set(childRef, value2);
      await Utils.spyToBeCalledTimesAsync(successCallback, 2);
      unsubscribe();
      successCallback.getCall(0).args[0].should.equal(value1);
      successCallback.getCall(1).args[0].should.equal(value2);
      cancelCallback.should.be.callCount(0);
    });

    it('subscribe to child removed events', async function () {
      const { getDatabase, ref, set, child, remove, onChildRemoved } = databaseModular;
      const successCallback = sinon.spy();
      const cancelCallback = sinon.spy();
      const dbRef = ref(getDatabase(), `${TEST_PATH}/childRemoved`);
      const childRef = child(dbRef, 'removeme');
      await set(childRef, 'foo');
      const unsubscribe = onChildRemoved(
        dbRef,
        $ => {
          successCallback($.val());
        },
        () => {
          cancelCallback();
        },
      );
      await waitForNativeDbListenerReady(`${TEST_PATH}/childRemoved/removeme`, 'foo');
      await remove(childRef);
      await Utils.spyToBeCalledOnceAsync(successCallback, 5000);
      unsubscribe();
      successCallback.getCall(0).args[0].should.equal('foo');
      cancelCallback.should.be.callCount(0);
    });

    it('subscribe to child moved events', async function () {
      if (Platform.other) {
        this.skip('Errors on JS SDK about a missing index.');
        return;
      }
      const { getDatabase, ref, set, child, onChildMoved, query, orderByChild } = databaseModular;
      const callback = sinon.spy();
      const dbRef = ref(getDatabase(), `${TEST_PATH}/childMoved`);
      const orderedRef = query(dbRef, orderByChild('nuggets'));

      const initial = {
        alex: { nuggets: 60 },
        rob: { nuggets: 56 },
        vassili: { nuggets: 55.5 },
        tony: { nuggets: 52 },
        greg: { nuggets: 52 },
      };

      const unsubscribe = onChildMoved(orderedRef, $ => {
        callback($.val());
      });
      await waitForNativeDbListenerRegistration(`${TEST_PATH}/childMoved`);
      await set(dbRef, initial);
      await set(child(dbRef, 'greg/nuggets'), 57);
      await set(child(dbRef, 'rob/nuggets'), 61);
      await Utils.spyToBeCalledTimesAsync(callback, 2);
      unsubscribe();
      callback.getCall(0).args[0].should.be.eql(jet.contextify({ nuggets: 57 }));
      callback.getCall(1).args[0].should.be.eql(jet.contextify({ nuggets: 61 }));
    });
  });
});
