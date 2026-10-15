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

const { seed } = require('../helpers');

/**
 * Permission-denied reject arms for onDisconnect write APIs (iOS/Android native).
 *
 * Filename sorts after update.e2e.js so these cases do not run before success-path
 * onDisconnect suites. On the JS SDK (macOS / Platform.other), onDisconnect write
 * permission checks are unreliable after goOffline/goOnline cycles and can poison
 * later child-path update success cases — skip there (no RNFB native Database).
 */

describe('database().ref().onDisconnect() permission denied', function () {
  before(async function () {
    if (Platform.other) {
      return;
    }
    // Force rules onto the emulator before denied-path probes.
    await seed('tests/onDisconnectPermissionSeed');
  });

  describe('modular', function () {
    beforeEach(function () {
      if (Platform.other) {
        this.skip();
      }
    });

    it('set throws if permission defined', async function () {
      const { getDatabase, ref, onDisconnect, goOnline } = databaseModular;
      const db = getDatabase();
      goOnline(db);
      const dbRef = ref(db, 'nope/foo');

      try {
        await onDisconnect(dbRef).set(Date.now());
        return Promise.reject(new Error('Did not throw error.'));
      } catch (error) {
        error.code.includes('database/permission-denied').should.be.true();
        return Promise.resolve();
      }
    });

    it('setWithPriority throws if permission defined', async function () {
      const { getDatabase, ref, onDisconnect, goOnline } = databaseModular;
      const db = getDatabase();
      goOnline(db);
      const dbRef = ref(db, 'nope/foo');

      try {
        await onDisconnect(dbRef).setWithPriority(Date.now(), 1);
        return Promise.reject(new Error('Did not throw error.'));
      } catch (error) {
        error.code.includes('database/permission-denied').should.be.true();
        return Promise.resolve();
      }
    });

    it('setWithPriority with string priority throws if permission defined', async function () {
      const { getDatabase, ref, onDisconnect, goOnline } = databaseModular;
      const db = getDatabase();
      goOnline(db);
      const dbRef = ref(db, 'nope/foo');

      try {
        await onDisconnect(dbRef).setWithPriority(Date.now(), 'high');
        return Promise.reject(new Error('Did not throw error.'));
      } catch (error) {
        error.code.includes('database/permission-denied').should.be.true();
        return Promise.resolve();
      }
    });

    it('update throws if permission defined', async function () {
      const { getDatabase, ref, onDisconnect, goOnline } = databaseModular;
      const db = getDatabase();
      goOnline(db);
      const dbRef = ref(db, 'nope/foo');

      try {
        await onDisconnect(dbRef).update({ bar: Date.now() });
        return Promise.reject(new Error('Did not throw error.'));
      } catch (error) {
        error.code.includes('database/permission-denied').should.be.true();
        return Promise.resolve();
      }
    });

    it('remove throws if permission defined', async function () {
      const { getDatabase, ref, onDisconnect, goOnline } = databaseModular;
      const db = getDatabase();
      goOnline(db);
      const dbRef = ref(db, 'nope/foo');

      try {
        await onDisconnect(dbRef).remove();
        return Promise.reject(new Error('Did not throw error.'));
      } catch (error) {
        error.code.includes('database/permission-denied').should.be.true();
        return Promise.resolve();
      }
    });

    // Wire evidence: onDisconnect.cancel() is acknowledged even under `.write: false`
    // (unlike set/update/remove). The Android cancel CompletionListener error arm is
    // therefore unreachable via security rules — covered by JVM unit test
    // UniversalFirebaseDatabaseOnDisconnectCancelErrorTest instead.
    it('cancel succeeds even without write permission', async function () {
      const { getDatabase, ref, onDisconnect, goOnline } = databaseModular;
      const db = getDatabase();
      goOnline(db);
      const dbRef = ref(db, 'nope/foo');

      await onDisconnect(dbRef).cancel();
    });
  });
});
