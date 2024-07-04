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

describe('onChildAdded', function () {
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

    const { getDatabase, ref, set, child, onChildAdded } = databaseModular;
    const dbRef = ref(getDatabase(), `${TEST_PATH}/childAdded`);

    const callback = sinon.spy();

    onChildAdded(
      dbRef,
      $ => {
        callback($.val());
      },
      { onlyOnce: true },
    );

    set(child(dbRef, 'child1'), 'foo');
    await Utils.spyToBeCalledOnceAsync(callback, 5000);
    callback.should.be.calledWith('foo');

    set(child(dbRef, 'child1'), 'bar');
    callback.should.not.be.calledWith('bar');
  });

  // FIXME super flaky on android emulator
  it('subscribe to child added events', async function () {
    if (Platform.ios) {
      const { getDatabase, ref, set, child, onChildAdded } = databaseModular;

      const successCallback = sinon.spy();
      const cancelCallback = sinon.spy();
      const dbRef = ref(getDatabase(), `${TEST_PATH}/childAdded2`);

      const unsubscribe = onChildAdded(
        dbRef,
        $ => {
          successCallback($.val());
        },
        () => {
          cancelCallback();
        },
      );

      await set(child(dbRef, 'child1'), 'foo');
      await set(child(dbRef, 'child2'), 'bar');
      await Utils.spyToBeCalledTimesAsync(successCallback, 2);
      unsubscribe();

      successCallback.getCall(0).args[0].should.equal('foo');
      successCallback.getCall(1).args[0].should.equal('bar');
      cancelCallback.should.be.callCount(0);
    } else {
      this.skip();
    }
  });
});
