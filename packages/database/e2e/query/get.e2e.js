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

const { PATH, CONTENT, seed, wipe } = require('../helpers');

const TEST_PATH = `${PATH}/once`;

describe('get()', function () {
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

  it('returns only the child when a parent location is being listened to', async function () {
    // firebase/firebase-ios-sdk#12168: getData under a covering listener returns the parent node.
    const { getDatabase, ref, child, get, onValue } = databaseModular;

    const parentRef = ref(getDatabase(), `${TEST_PATH}/types`);
    let unsubscribe;
    await new Promise(resolve => {
      unsubscribe = onValue(parentRef, resolve);
    });

    try {
      const snapshot = await get(child(parentRef, 'string'));
      snapshot.val().should.eql(CONTENT.TYPES.string);
    } finally {
      unsubscribe();
    }
  });

  it('returns the same children as once() for a query', async function () {
    const { getDatabase, ref, get, query, orderByKey, limitToFirst } = databaseModular;

    const queryRef = query(ref(getDatabase(), `${TEST_PATH}/types`), orderByKey(), limitToFirst(2));
    const snapshot = await get(queryRef);

    Object.keys(snapshot.val()).should.eql(Object.keys(CONTENT.TYPES).sort().slice(0, 2));
  });

  it('waits for the connection while offline, like once()', async function () {
    this.timeout(20000);
    const { getDatabase, ref, child, get, goOffline, goOnline } = databaseModular;

    const db = getDatabase();
    goOffline(db);
    try {
      const pending = get(child(ref(db, `${TEST_PATH}/types`), 'number'));
      // Longer than the native get's connect timeout (3s on iOS and Android).
      await Utils.sleep(5000);
      goOnline(db);
      const snapshot = await pending;
      snapshot.val().should.eql(CONTENT.TYPES.number);
    } finally {
      goOnline(db);
    }
  });

  it('reads client-local .info paths without the server', async function () {
    const { getDatabase, ref, get } = databaseModular;

    const snapshot = await get(ref(getDatabase(), '.info/serverTimeOffset'));
    snapshot.val().should.be.a.Number();
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
});
