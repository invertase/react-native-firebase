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
const TEST_PATH = `${PATH}/connected`;

describe("database().ref('.info/connected')", function () {
  describe('modular', function () {
    before(async function () {
      const { getDatabase, goOnline } = databaseModular;

      goOnline(getDatabase());
    });

    after(async function () {
      const { getDatabase, goOnline } = databaseModular;

      goOnline(getDatabase());
    });

    xit('returns true when used with once', async function () {
      const { getDatabase, ref, get } = databaseModular;

      const snapshot = await get(ref(getDatabase(), '.info/connected'));
      snapshot.val().should.equal(true);
    });

    xit('returns true when used with once with a previous call', async function () {
      const { getDatabase, ref, get } = databaseModular;

      await get(ref(getDatabase(), `${TEST_PATH}/foo`));
      const snapshot = await get(ref(getDatabase(), '.info/connected'));
      snapshot.val().should.equal(true);
    });

    // FIXME on android this can work against the emulator
    // on iOS it doesn't work at all ?
    xit('subscribes to online state', async function () {
      const { getDatabase, ref, onValue, goOffline, goOnline, off } = databaseModular;
      const db = getDatabase();

      const callback = sinon.spy();
      const dbRef = ref(db, '.info/connected');
      const handler = $ => {
        callback($.val());
      };

      onValue(dbRef, handler);
      goOffline(db);
      await Utils.sleep(1000); // FIXME why is this sleep needed here? callback is called immediately
      goOnline(db);
      off('value', handler);

      await Utils.spyToBeCalledTimesAsync(callback, 2);
      callback.getCall(0).args[0].should.equal(false);
      callback.getCall(1).args[0].should.equal(true);
    });
  });
});
