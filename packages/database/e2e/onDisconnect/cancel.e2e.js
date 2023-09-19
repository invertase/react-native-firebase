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

const TEST_PATH = `${PATH}/onDisconnectCancel`;

describe('database().ref().onDisconnect().cancel()', function () {
  after(async function () {
    await wipe(TEST_PATH);
  });

  describe('v8 compatibility', function () {
    afterEach(async function () {
      // Ensures the db is online before running each test
      await firebase.database().goOnline();
    });

    it('throws if onComplete is not a function', function () {
      const ref = firebase.database().ref(TEST_PATH).onDisconnect();
      try {
        ref.cancel('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'onComplete' must be a function if provided");
        return Promise.resolve();
      }
    });

    it('cancels all previously queued events', async function () {
      const ref = firebase.database().ref(TEST_PATH);

      await ref.set('foobar');
      const value = Date.now();

      await ref.onDisconnect().set(value);
      await ref.onDisconnect().cancel();
      await firebase.database().goOffline();
      await firebase.database().goOnline();

      const snapshot = await ref.once('value');
      snapshot.val().should.eql('foobar');
    });

    it('calls back to the onComplete function', async function () {
      const callback = sinon.spy();
      const ref = firebase.database().ref(TEST_PATH);

      // Set an initial value
      await ref.set('foo');

      await ref.onDisconnect().set('bar');
      await ref.onDisconnect().cancel(callback);
      await firebase.database().goOffline();
      await firebase.database().goOnline();

      callback.should.be.calledOnce();
    });
  });

  describe('modular', function () {
    afterEach(async function () {
      const { getDatabase, goOnline } = databaseModular;
      const db = getDatabase();

      // Ensures the db is online before running each test
      await goOnline(db);
    });

    it('throws if onComplete is not a function', function () {
      const { getDatabase, ref, onDisconnect } = databaseModular;
      const db = getDatabase();
      const dbRef = ref(db, TEST_PATH);

      const disconnect = onDisconnect(dbRef);
      try {
        disconnect.cancel('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'onComplete' must be a function if provided");
        return Promise.resolve();
      }
    });

    it('cancels all previously queued events', async function () {
      const { getDatabase, ref, onDisconnect, goOffline, goOnline, get } = databaseModular;
      const db = getDatabase();
      const dbRef = ref(db, TEST_PATH);

      await dbRef.set('foobar');
      const value = Date.now();

      await onDisconnect(dbRef).set(value);
      await onDisconnect(dbRef).cancel();
      await goOffline(db);
      await goOnline(db);

      const snapshot = await get(dbRef);
      snapshot.val().should.eql('foobar');
    });

    it('calls back to the onComplete function', async function () {
      const { getDatabase, ref, onDisconnect, set, goOffline, goOnline } = databaseModular;
      const db = getDatabase();

      const callback = sinon.spy();
      const dbRef = ref(db, TEST_PATH);

      // Set an initial value
      await set(dbRef, 'foo');

      await onDisconnect(dbRef).set('bar');
      await onDisconnect(dbRef).cancel(callback);
      await goOffline(db);
      await goOnline(db);

      callback.should.be.calledOnce();
    });
  });
});
