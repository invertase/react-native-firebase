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

describe('onChildChanged', function () {
  before(async function () {
    await seed(TEST_PATH);
  });

  after(async function () {
    await wipe(TEST_PATH);
  });

  // FIXME super flaky on Jet
  xit('should stop listening if ListeningOptions.onlyOnce is true', async function () {
    if (Platform.ios) {
      this.skip();
    }

    const { getDatabase, ref, set, child, onChildChanged } = databaseModular;
    const dbRef = ref(getDatabase(), `${TEST_PATH}/childAdded`);
    await set(child(dbRef, 'changeme'), 'foo');

    const callback = sinon.spy();

    onChildChanged(
      dbRef,
      $ => {
        callback($.val());
      },
      { onlyOnce: true },
    );

    await set(child(dbRef, 'changeme'), 'bar');
    await Utils.spyToBeCalledOnceAsync(callback, 5000);
    callback.should.be.calledWith('bar');

    await set(child(dbRef, 'changeme'), 'baz');
    callback.should.not.be.calledWith('baz');
  });

  // FIXME super flaky on Jet
  xit('subscribe to child changed events', async function () {
    const { getDatabase, ref, set, child, onChildChanged } = databaseModular;

    if (Platform.ios) {
      const successCallback = sinon.spy();
      const cancelCallback = sinon.spy();

      const dbRef = ref(getDatabase(), `${TEST_PATH}/childChanged2`);
      const refChild = child(dbRef, 'changeme');
      await set(refChild, 'foo');

      const unsubscribe = onChildChanged(
        dbRef,
        $ => {
          successCallback($.val());
        },
        () => {
          cancelCallback();
        },
      );

      const value1 = Date.now();
      const value2 = Date.now() + 123;

      await set(refChild, value1);
      await set(refChild, value2);
      await Utils.spyToBeCalledTimesAsync(successCallback, 2);
      unsubscribe();

      successCallback.getCall(0).args[0].should.equal(value1);
      successCallback.getCall(1).args[0].should.equal(value2);
      cancelCallback.should.be.callCount(0);
    } else {
      this.skip();
    }
  });
});
