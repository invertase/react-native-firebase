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

const { PATH, wipe } = require('../helpers');

const TEST_PATH = `${PATH}/onDisconnectRemove`;

describe('database().ref().onDisconnect().remove()', function () {
  after(async function () {
    await wipe(TEST_PATH);
  });

  describe('modular', function () {
    afterEach(async function () {
      const { getDatabase, goOnline } = databaseModular;
      const db = getDatabase();

      // Ensures the db is online before running each test
      goOnline(db);
    });

    it('throws if onComplete is not a function', function () {
      const { getDatabase, ref, onDisconnect } = databaseModular;
      const db = getDatabase();
      const dbRef = ref(db, TEST_PATH);

      const disconnect = onDisconnect(dbRef);
      try {
        disconnect.remove('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'onComplete' must be a function if provided");
        return Promise.resolve();
      }
    });

    it('removes a node whilst offline', async function () {
      if (Platform.android) {
        // offline / online behavior does not work in android + firebase emulator
        this.skip();
      }
      const { getDatabase, ref, child, onDisconnect, goOffline, goOnline, get, set } =
        databaseModular;
      const db = getDatabase();
      const dbRef = ref(db, TEST_PATH);
      const childRef = child(dbRef, 'removeMe');

      await set(childRef, 'foobar');
      await onDisconnect(childRef).remove();
      goOffline(db);
      goOnline(db);
      const snapshot = await get(childRef);
      snapshot.exists().should.eql(false);
    });

    it('calls back to the onComplete function', async function () {
      const callback = sinon.spy();

      const { getDatabase, ref, child, onDisconnect, goOffline, goOnline, set } = databaseModular;
      const db = getDatabase();
      const dbRef = ref(db, TEST_PATH);
      const childRef = child(dbRef, 'removeMe');

      // Set an initial value
      await set(childRef, 'foo');

      await onDisconnect(childRef).remove(callback);
      goOffline(db);
      goOnline(db);

      callback.should.be.calledOnce();
    });
  });
});
