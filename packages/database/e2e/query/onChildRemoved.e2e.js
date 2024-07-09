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

describe('onChildRemoved', function () {
  before(async function () {
    await seed(TEST_PATH);
  });

  after(async function () {
    await wipe(TEST_PATH);
  });

  // FIXME super flaky on jet
  xit('should stop listening if ListeningOptions.onlyOnce is true', async function () {
    if (Platform.ios) {
      this.skip();
    }

    const { getDatabase, ref, child, set, remove, onChildRemoved } = databaseModular;
    const dbRef = ref(getDatabase(), `${TEST_PATH}/childRemoved`);
    const childRef = child(dbRef, 'removeme');
    await set(childRef, 'foo');

    const callback = sinon.spy();

    onChildRemoved(
      dbRef,
      $ => {
        callback($.val());
      },
      { onlyOnce: true },
    );

    await remove(childRef);
    await Utils.spyToBeCalledTimesAsync(callback, 1);
    callback.should.be.calledWith('foo');
  });

  // FIXME super flaky on jet
  xit('subscribe to child removed events', async function () {
    const { getDatabase, ref, child, set, remove, onChildRemoved } = databaseModular;

    const successCallback = sinon.spy();
    const cancelCallback = sinon.spy();

    const dbRef = ref(getDatabase(), `${TEST_PATH}/childRemoved2`);
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

    await remove(childRef);
    await Utils.spyToBeCalledOnceAsync(successCallback, 10000);
    unsubscribe();

    successCallback.getCall(0).args[0].should.equal('foo');
    cancelCallback.should.be.callCount(0);
  });
});
