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

const TEST_PATH = `${PATH}/onDisconnectSetWithPriority`;

describe('database().ref().onDisconnect().setWithPriority()', function () {
  after(async function () {
    await wipe(TEST_PATH);
  });

  describe('v8 compatibility', function () {
    afterEach(async function () {
      // Ensures the db is online before running each test
      await firebase.database().goOnline();
    });

    it('throws if value is not a defined', function () {
      const ref = firebase.database().ref(TEST_PATH).onDisconnect();
      try {
        ref.setWithPriority();
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'value' must be defined");
        return Promise.resolve();
      }
    });

    it('throws if priority is not a valid type', function () {
      const ref = firebase.database().ref(TEST_PATH).onDisconnect();
      try {
        ref.setWithPriority(null, { foo: 'bar' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'priority' must be a number, string or null value");
        return Promise.resolve();
      }
    });

    it('throws if onComplete is not a function', function () {
      const ref = firebase.database().ref(TEST_PATH).onDisconnect();
      try {
        ref.setWithPriority(null, 1, 'foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'onComplete' must be a function if provided");
        return Promise.resolve();
      }
    });

    xit('sets value with priority when disconnected', async function () {
      const ref = firebase.database().ref(TEST_PATH);

      const value = Date.now();

      await ref.onDisconnect().setWithPriority(value, 3);
      await firebase.database().goOffline();
      await firebase.database().goOnline();

      const snapshot = await ref.once('value');
      snapshot.exportVal()['.value'].should.eql(value);
      snapshot.exportVal()['.priority'].should.eql(3);
    });

    it('calls back to the onComplete function', async function () {
      const callback = sinon.spy();
      const ref = firebase.database().ref(TEST_PATH);

      // Set an initial value
      await ref.set('foo');

      await ref.onDisconnect().setWithPriority('bar', 2, callback);
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

    it('throws if value is not a defined', function () {
      const { getDatabase, ref, onDisconnect } = databaseModular;
      const db = getDatabase();
      const dbRef = ref(db, TEST_PATH);

      const disconnect = onDisconnect(dbRef);
      try {
        disconnect.setWithPriority();
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'value' must be defined");
        return Promise.resolve();
      }
    });

    it('throws if priority is not a valid type', function () {
      const { getDatabase, ref, onDisconnect } = databaseModular;
      const db = getDatabase();
      const dbRef = ref(db, TEST_PATH);

      const disconnect = onDisconnect(dbRef);
      try {
        disconnect.setWithPriority(null, { foo: 'bar' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'priority' must be a number, string or null value");
        return Promise.resolve();
      }
    });

    it('throws if onComplete is not a function', function () {
      const { getDatabase, ref, onDisconnect } = databaseModular;
      const db = getDatabase();
      const dbRef = ref(db, TEST_PATH);

      const disconnect = onDisconnect(dbRef);
      try {
        disconnect.setWithPriority(null, 1, 'foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'onComplete' must be a function if provided");
        return Promise.resolve();
      }
    });

    xit('sets value with priority when disconnected', async function () {
      const { getDatabase, ref, onDisconnect, goOffline, goOnline, get } = databaseModular;
      const db = getDatabase();
      const dbRef = ref(db, TEST_PATH);

      const value = Date.now();

      await onDisconnect(dbRef).setWithPriority(value, 3);
      await goOffline(db);
      await goOnline(db);

      const snapshot = await get(dbRef);
      snapshot.exportVal()['.value'].should.eql(value);
      snapshot.exportVal()['.priority'].should.eql(3);
    });

    it('calls back to the onComplete function', async function () {
      const { getDatabase, ref, onDisconnect, set, goOffline, goOnline } = databaseModular;
      const db = getDatabase();

      const callback = sinon.spy();
      const dbRef = ref(db, TEST_PATH);

      // Set an initial value
      await set(dbRef, 'foo');

      await onDisconnect(dbRef).setWithPriority('bar', 2, callback);
      await goOffline(db);
      await goOnline(db);

      callback.should.be.calledOnce();
    });
  });
});
