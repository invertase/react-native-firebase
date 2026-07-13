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

const { PATH, seed, wipe } = require('./helpers');

const TEST_PATH = `${PATH}/issues`;

describe('database issues', function () {
  before(async function () {
    await seed(TEST_PATH);
  });

  after(async function () {
    await wipe(TEST_PATH);
  });

  describe('modular', function () {
    // FIXME requires a second database set up locally, full app initialization etc
    xit('#2813 should return a null snapshot key if path is root', async function () {
      const { getDatabase, ref, get } = databaseModular;

      const db = getDatabase(undefined, 'https://react-native-firebase-testing-db2.firebaseio.com');
      const dbRef = ref(db);
      const snapshot = await get(dbRef);
      should.equal(snapshot.key, null);
    });

    it('#2833 should not mutate modifiers ordering', async function () {
      const { getDatabase, ref, child, query, equalTo, orderByChild, onValue } = databaseModular;

      const callback = sinon.spy();
      const testRef = query(
        child(ref(getDatabase()), TEST_PATH),
        orderByChild('disabled'),
        equalTo(false),
      );

      testRef._modifiers.toString().should.be.a.String();
      testRef._modifiers.toArray()[0].name.should.equal('orderByChild');

      const unsubscribe = onValue(testRef, snapshot => {
        callback(snapshot.val());
      });

      await Utils.spyToBeCalledOnceAsync(callback, 3000);

      unsubscribe();
    });

    it('#100 array should return null where key is missing', async function () {
      const { getDatabase, ref, set, get } = databaseModular;

      const dbRef = ref(getDatabase(), `${TEST_PATH}/issue_100`);

      const data = {
        1: {
          someKey: 'someValue',
          someOtherKey: 'someOtherValue',
        },
        2: {
          someKey: 'someValue',
          someOtherKey: 'someOtherValue',
        },
        3: {
          someKey: 'someValue',
          someOtherKey: 'someOtherValue',
        },
      };

      await set(dbRef, data);
      const snapshot = await get(dbRef);

      snapshot.val().should.eql([null, data[1], data[2], data[3]]);
    });

    describe('#108 filters correctly by float values', function () {
      it('returns filtered results', async function () {
        const { getDatabase, ref, set, get, query, orderByChild, startAt, endAt } = databaseModular;

        const dbRef = ref(getDatabase(), `${TEST_PATH}/issue_108/filter`);

        const data = {
          foobar: {
            name: 'Foobar Pizzas',
            latitude: 34.1013717,
          },
          notTheFoobar: {
            name: "Not the pizza you're looking for",
            latitude: 34.456787,
          },
          notAFloat: {
            name: 'Not a float',
            latitude: 37,
          },
        };

        await set(dbRef, data);
        const snapshot = await get(
          query(
            dbRef,
            orderByChild('latitude'),
            startAt(34.00867000999119),
            endAt(34.17462960866099),
          ),
        );

        const val = snapshot.val();
        val.foobar.should.eql(data.foobar);

        should.equal(Object.keys(val).length, 1);
      });

      describe('issue 8981 - android firestore instance cache key mismatch', function () {
        // A real, already-provisioned second database in the test project - see
        // packages/firestore/e2e/SecondDatabase/*.e2e.js.
        const SECOND_DATABASE_ID = 'second-rnfb';

        it('does not throw when switching databases on the same app and reapplying settings', async function () {
          if (Platform.other) {
            // Not supported on web lite sdk - no persistent native instance cache to break
            return;
          }

          const { initializeApp, deleteApp } = modular;
          const { getFirestore, doc, setDoc, getDoc } = firestoreModular;

          // A dedicated, dynamically created app guarantees Firestore instances that have
          // never been started before this test runs.
          const appName = `firestoreIssue8981${FirebaseHelpers.id}`;
          const app = await initializeApp(FirebaseHelpers.app.config(), appName);

          try {
            // Same app, two different database IDs.
            //
            // Regression test for https://github.com/invertase/react-native-firebase/issues/8981:
            // on Android, `UniversalFirebaseFirestoreCommon.getFirestoreForApp()` read the
            // instance cache keyed by `appName:databaseId` but wrote it back keyed by
            // `appName` alone. Both databases therefore collided on a single cache slot
            // that could never actually be hit on lookup (which always includes the
            // `:databaseId` suffix) - switching from one database to another and back
            // never protects either instance's settings from being re-derived.
            const defaultDb = getFirestore(app);
            const secondDb = getFirestore(app, SECOND_DATABASE_ID);

            // Start the default database with an initial settings value.
            await defaultDb.settings({ cacheSizeBytes: 1048576 });
            await setDoc(doc(defaultDb, `${COLLECTION}/issue8981/default`), { value: 1 });

            // Switch to the second database under the *same* app and start it too - this
            // is the "different db ID hitting the same app" half of the bug: both native
            // calls are keyed by the same broken, appName-only cache slot.
            await secondDb.settings({ cacheSizeBytes: 2097152 });
            await setDoc(doc(secondDb, `${COLLECTION}/issue8981/second`), { value: 2 });

            // Switch back to the default database and reapply *different* settings to an
            // already-started instance. Android's `FirebaseFirestore.setFirestoreSettings()`
            // only throws when the newly-derived settings actually differ from what's
            // already active (identical settings passed repeatedly are an explicit no-op
            // in the native SDK) - so this value change is what deterministically triggers
            // `IllegalStateException: FirebaseFirestore has already been started...` before
            // the fix, once the cache-miss-on-every-call bug re-applies it natively.
            await defaultDb.settings({ cacheSizeBytes: 5242880 });
            await setDoc(doc(defaultDb, `${COLLECTION}/issue8981/default`), { value: 3 });

            const [snap1, snap2] = await Promise.all([
              getDoc(doc(defaultDb, `${COLLECTION}/issue8981/default`)),
              getDoc(doc(secondDb, `${COLLECTION}/issue8981/second`)),
            ]);
            snap1.data().value.should.equal(3);
            snap2.data().value.should.equal(2);
          } catch (e) {
            // Fail explicitly with the regression context rather than letting the native
            // `IllegalStateException` (surfaced here as a rejected promise) bubble up with a
            // generic message - see https://github.com/invertase/react-native-firebase/issues/8981.
            fail(
              `Regression in issue 8981: switching database on the same app and reapplying settings should not throw, but got: ${e}`,
            );
          } finally {
            await deleteApp(app);
          }
        });
      });

      it('returns correct results when not using float values', async function () {
        const { getDatabase, ref, set, get, query, orderByChild, equalTo } = databaseModular;

        const dbRef = ref(getDatabase(), `${TEST_PATH}/issue_108/integer`);

        const data = {
          foobar: {
            name: 'Foobar Pizzas',
            latitude: 34.1013717,
          },
          notTheFoobar: {
            name: "Not the pizza you're looking for",
            latitude: 34.456787,
          },
          notAFloat: {
            name: 'Not a float',
            latitude: 37,
          },
        };

        await set(dbRef, data);
        const snapshot = await get(query(dbRef, orderByChild('latitude'), equalTo(37)));

        const val = snapshot.val();

        val.notAFloat.should.eql(data.notAFloat);

        should.equal(Object.keys(val).length, 1);
      });
    });

    it('#489 reutrns long numbers correctly', async function () {
      const { getDatabase, ref, set, get } = databaseModular;

      const LONG = 1508777379000;
      const dbRef = ref(getDatabase(), `${TEST_PATH}/issue_489`);
      await set(dbRef, LONG);
      const snapshot = await get(dbRef);
      snapshot.val().should.eql(LONG);
    });
  });
});
