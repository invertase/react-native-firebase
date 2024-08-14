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

const { PATH, seed, wipe } = require('../helpers');

const TEST_PATH = `${PATH}/on`;

describe('onValue()', function () {
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
    const unsubscribe = onValue(
      dbRef,
      $ => {
        callback($.val());
      },
      error => {
        callback(error);
      },
    );

    const value = Date.now();
    await set(dbRef, value);
    await Utils.spyToBeCalledOnceAsync(callback, 5000);
    callback.should.be.calledWith(value);

    unsubscribe();
  });

  // FIXME super flaky on jet
  xit('should stop listening if ListeningOptions.onlyOnce is true', async function () {
    if (Platform.ios || !global.isCI) {
      const { getDatabase, ref, set, onValue } = databaseModular;
      const dbRef = ref(getDatabase(), `${TEST_PATH}/init`);

      const callback = sinon.spy();

      onValue(
        dbRef,
        $ => {
          callback($.val());
        },
        { onlyOnce: true },
      );

      let value = Date.now();
      set(dbRef, value);
      await Utils.spyToBeCalledOnceAsync(callback, 5000);
      callback.should.be.calledWith(value);

      let secondValue = Date.now();
      set(dbRef, secondValue);
      callback.should.not.be.calledWith(secondValue);
    } else {
      this.skip();
    }
  });

  xit('should callback multiple times when the value changes', async function () {
    const { getDatabase, ref, set, onValue } = databaseModular;
    const dbRef = ref(getDatabase(), `${TEST_PATH}/init`);

    const callback = sinon.spy();
    const unsubscribe = onValue(dbRef, $ => {
      callback($.val());
    });

    await set(dbRef, 'foo');
    await set(dbRef, 'bar');
    await Utils.spyToBeCalledTimesAsync(callback, 2);
    unsubscribe();

    callback.getCall(0).args[0].should.equal('foo'); // FIXME these simply do *not* come back
    callback.getCall(1).args[0].should.equal('bar'); // in the right order every time. ??
  });

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
    await Utils.spyToBeCalledOnceAsync(cancelCallback, 5000);
    successCallback.should.be.callCount(0);

    unsubscribe();
  });
});
