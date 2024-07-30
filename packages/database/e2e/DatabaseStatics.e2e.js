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

const { PATH, wipe } = require('./helpers');

const TEST_PATH = `${PATH}/statics`;

describe('database.X', function () {
  describe('v8 compatibility', function () {
    after(function () {
      return wipe(TEST_PATH);
    });

    describe('ServerValue.TIMESTAMP', function () {
      it('returns a valid object', function () {
        const { TIMESTAMP } = firebase.database.ServerValue;
        should.equal(Object.keys(TIMESTAMP).length, 1);
        TIMESTAMP.should.have.property('.sv');
        TIMESTAMP['.sv'].should.eql('timestamp');
      });

      it('populates the property with a Unix timestamp', async function () {
        const ref = firebase.database().ref(`${TEST_PATH}/timestamp`);
        await ref.set(firebase.database.ServerValue.TIMESTAMP);
        const snapshot = await ref.once('value');
        snapshot.val().should.be.a.Number();
      });
    });

    describe('ServerValue.increment', function () {
      it('returns a valid object', function () {
        const incrementObject = firebase.database.ServerValue.increment(1);
        should.equal(Object.keys(incrementObject).length, 1);
        incrementObject.should.have.property('.sv');
        incrementObject['.sv'].should.have.property('increment');
      });

      it('increments on the server', async function () {
        const ref = firebase.database().ref(`${TEST_PATH}/increment`);

        await ref.set({ increment: 0 });

        const res1 = await ref.once('value');
        res1.val().increment.should.equal(0);

        await ref.set({ increment: firebase.database.ServerValue.increment(1) });

        const res2 = await ref.once('value');
        res2.val().increment.should.equal(1);
      });

      it('increments on the server when no value is present', async function () {
        const ref = firebase.database().ref(`${TEST_PATH}/increment-empty`);

        await ref.set({ increment: firebase.database.ServerValue.increment(2) });

        const res = await ref.once('value');
        res.val().increment.should.equal(2);
      });
    });
  });

  describe('modular', function () {
    after(function () {
      return wipe(TEST_PATH);
    });

    describe('serverTimestamp', function () {
      it('returns a valid object', function () {
        const { serverTimestamp } = databaseModular;
        const timestamp = serverTimestamp();

        should.equal(Object.keys(timestamp).length, 1);
        timestamp.should.have.property('.sv');
        timestamp['.sv'].should.eql('timestamp');
      });

      it('populates the property with a Unix timestamp', async function () {
        const { serverTimestamp, getDatabase, ref, set } = databaseModular;
        const dbRef = ref(getDatabase(), `${TEST_PATH}/timestamp`);
        await set(dbRef, serverTimestamp());
        const snapshot = await dbRef.once('value');
        snapshot.val().should.be.a.Number();
      });
    });

    describe('increment', function () {
      it('returns a valid object', function () {
        const { increment } = databaseModular;

        const incrementObject = increment(1);
        should.equal(Object.keys(incrementObject).length, 1);
        incrementObject.should.have.property('.sv');
        incrementObject['.sv'].should.have.property('increment');
      });

      it('increments on the server', async function () {
        const { getDatabase, ref, set, get, increment } = databaseModular;

        const dbRef = ref(getDatabase(), `${TEST_PATH}/increment`);

        await set(dbRef, { increment: 0 });

        const res1 = await get(dbRef);
        res1.val().increment.should.equal(0);

        await set(dbRef, { increment: increment(1) });

        const res2 = await get(dbRef);
        res2.val().increment.should.equal(1);
      });

      it('increments on the server when no value is present', async function () {
        const { getDatabase, ref, set, get, increment } = databaseModular;

        const dbRef = ref(getDatabase(), `${TEST_PATH}/increment-empty`);

        await set(dbRef, { increment: increment(2) });

        const res = await get(dbRef);
        res.val().increment.should.equal(2);
      });
    });
  });
});
