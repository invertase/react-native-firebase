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
  CONTENT,
  seed,
  wipe,
  waitForNativeDbListenerReady,
  waitForNativeDbListenerRegistration,
} = require('../helpers');

const TEST_PATH = `${PATH}/once`;

describe('database().ref().once()', function () {
  describe('modular', function () {
    before(function () {
      return seed(TEST_PATH);
    });

    after(function () {
      return wipe(TEST_PATH);
    });

    it('returns a promise', async function () {
      const { getDatabase, ref, get } = databaseModular;

      const dbRef = ref(getDatabase(), 'tests/types/number');
      const returnValue = get(dbRef);
      returnValue.should.be.Promise();
    });

    it('resolves with the correct values', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const dbRef = ref(getDatabase(), `${TEST_PATH}/types`);

      await Promise.all(
        Object.keys(CONTENT.TYPES).map(async key => {
          const value = CONTENT.TYPES[key];
          const snapsnot = await get(child(dbRef, key));
          snapsnot.val().should.eql(jet.contextify(value));
        }),
      );
    });

    it('is is called when the value is changed', async function () {
      const { getDatabase, ref, set, onValue } = databaseModular;
      const callback = sinon.spy();
      const dbRef = ref(getDatabase(), `${TEST_PATH}/types/number`);
      onValue(
        dbRef,
        $ => {
          callback($.val());
        },
        { onlyOnce: true },
      );
      await set(dbRef, 1337);
      await Utils.spyToBeCalledOnceAsync(callback);
    });

    it('errors if permission denied', async function () {
      const { getDatabase, ref, get } = databaseModular;

      const dbRef = ref(getDatabase(), 'nope');
      try {
        await get(dbRef);
        return Promise.reject(new Error('No permission denied error'));
      } catch (error) {
        error.code.includes('database/permission-denied').should.be.true();
        return Promise.resolve();
      }
    });

    it('it calls when a child is added', async function () {
      const { getDatabase, ref, set, child, onChildAdded } = databaseModular;
      const value = Date.now();
      const callback = sinon.spy();
      const dbRef = ref(getDatabase(), `${TEST_PATH}/childAdded`);
      onChildAdded(
        dbRef,
        $ => callback($.val()),
        error => callback(error),
        { onlyOnce: true },
      );
      await waitForNativeDbListenerRegistration(`${TEST_PATH}/childAdded`);
      await set(child(dbRef, 'foo'), value);
      await Utils.spyToBeCalledOnceAsync(callback, 5000);
      callback.should.be.calledWith(value);
    });

    it('resolves when a child is changed', async function () {
      const { getDatabase, ref, set, child, onChildAdded, onChildChanged } = databaseModular;
      const callbackAdd = sinon.spy();
      const callbackChange = sinon.spy();
      const date = Date.now();
      const dbRef = ref(getDatabase(), `${TEST_PATH}/childChanged/${date}`);

      onChildAdded(dbRef, $ => callbackAdd($.val()), { onlyOnce: true });
      await waitForNativeDbListenerRegistration(`${TEST_PATH}/childChanged/${date}`);
      await set(child(dbRef, 'foo'), 1);
      await Utils.spyToBeCalledOnceAsync(callbackAdd, 10000);
      onChildChanged(dbRef, $ => callbackChange($.val()), { onlyOnce: true });
      await waitForNativeDbListenerReady(`${TEST_PATH}/childChanged/${date}/foo`, 1);
      await set(child(dbRef, 'foo'), 2);
      await Utils.spyToBeCalledOnceAsync(callbackChange, 10000);
      callbackChange.should.be.calledWith(2);
    });

    it('resolves when a child is removed', async function () {
      const { getDatabase, ref, set, child, remove, onChildAdded, onChildRemoved } =
        databaseModular;
      const callbackAdd = sinon.spy();
      const callbackRemove = sinon.spy();
      const date = Date.now();
      const dbRef = ref(getDatabase(), `${TEST_PATH}/childRemoved/${date}`);
      onChildAdded(dbRef, $ => callbackAdd($.val()), { onlyOnce: true });
      await waitForNativeDbListenerRegistration(`${TEST_PATH}/childRemoved/${date}`);
      const childRef = child(dbRef, 'removeme');
      await set(childRef, 'foo');
      await Utils.spyToBeCalledOnceAsync(callbackAdd, 10000);
      onChildRemoved(
        dbRef,
        $ => callbackRemove($.val()),
        error => callbackRemove(error),
        { onlyOnce: true },
      );
      await waitForNativeDbListenerReady(`${TEST_PATH}/childRemoved/${date}/removeme`, 'foo');
      await remove(childRef);
      await Utils.spyToBeCalledOnceAsync(callbackRemove, 10000);
      callbackRemove.should.be.calledWith('foo');
    });

    // https://github.com/firebase/firebase-js-sdk/blob/6b53e0058483c9002d2fe56119f86fc9fb96b56c/packages/database/test/order_by.test.ts#L104
    it('resolves when a child is moved', async function () {
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
      onChildMoved(
        orderedRef,
        $ => callback($.val()),
        error => callback(error),
        { onlyOnce: true },
      );
      await waitForNativeDbListenerRegistration(`${TEST_PATH}/childMoved`);
      await set(dbRef, initial);
      await set(child(dbRef, 'greg/nuggets'), 57);
      await Utils.spyToBeCalledOnceAsync(callback, 5000);
      callback.should.be.calledWith({ nuggets: 57 });
    });
  });
});
