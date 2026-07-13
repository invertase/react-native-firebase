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

const COLLECTION = 'firestore';
const { getE2eEmulatorHost } = require('../../app/e2e/helpers');
// const jsFirebase = require('firebase/compat/app');
// require('firebase/compat/firestore');

const jsFirebaseModular = require('firebase/app');
const jsFirestoreModular = require('firebase/firestore');

const testNumbers = {
  zero: 0, // int
  // TODO JS SDK does not support negative zero anymore for some reason
  // negativeZero: -0, // double
  half: 0.5, // double
  unsafeInt: Number.MAX_SAFE_INTEGER + 1, // double
  nagativeUnsafeInt: Number.MIN_SAFE_INTEGER - 1, // double
  safeInt: Number.MAX_SAFE_INTEGER, // int
  nagativeSafeInt: Number.MIN_SAFE_INTEGER, // int
  inf: Infinity, // double
  negativeInf: -Infinity, // double
  // nan: NaN, // double -- where-in queries on NaN do not work
};

describe('firestore()', function () {
  describe('modular', function () {
    describe('issues', function () {
      before(async function () {
        const { getFirestore, doc, setDoc } = firestoreModular;
        const db = getFirestore();

        await Promise.all([
          setDoc(doc(db, `${COLLECTION}/wbXwyLJheRfYXXWlY46j`), { index: 2, number: 2 }),
          setDoc(doc(db, `${COLLECTION}/kGC5cYPN1nKnZCcAb9oQ`), { index: 6, number: 2 }),
          setDoc(doc(db, `${COLLECTION}/8Ek8iWCDQPPJ5s2n8PiQ`), { index: 4, number: 2 }),
          setDoc(doc(db, `${COLLECTION}/mr7MdAygvuheF6AUtWma`), { index: 1, number: 1 }),
          setDoc(doc(db, `${COLLECTION}/RCO5SvNn4fdoE49OKrIV`), { index: 3, number: 1 }),
          setDoc(doc(db, `${COLLECTION}/CvVG7VP1hXTtcfdUaeNl`), { index: 5, number: 1 }),
        ]);
      });

      it('returns all results', async function () {
        const { getFirestore, collection, query, orderBy, getDocs } = firestoreModular;
        const db = getFirestore();

        const ref = query(collection(db, COLLECTION), orderBy('number', 'desc'));
        const allResultsSnapshot = await getDocs(ref);
        allResultsSnapshot.forEach((doc, i) => {
          if (i === 0) {
            doc.id.should.equal('wbXwyLJheRfYXXWlY46j');
          }
          if (i === 1) {
            doc.id.should.equal('kGC5cYPN1nKnZCcAb9oQ');
          }
          if (i === 2) {
            doc.id.should.equal('8Ek8iWCDQPPJ5s2n8PiQ');
          }
          if (i === 3) {
            doc.id.should.equal('mr7MdAygvuheF6AUtWma');
          }
          if (i === 4) {
            doc.id.should.equal('RCO5SvNn4fdoE49OKrIV');
          }
          if (i === 5) {
            doc.id.should.equal('CvVG7VP1hXTtcfdUaeNl');
          }
        });
      });

      it('returns first page', async function () {
        const { getFirestore, collection, query, orderBy, limit, getDocs } = firestoreModular;
        const db = getFirestore();

        const ref = query(collection(db, COLLECTION), orderBy('number', 'desc'));
        const firstPageSnapshot = await getDocs(query(ref, limit(2)));
        should.equal(firstPageSnapshot.docs.length, 2);
        firstPageSnapshot.forEach((doc, i) => {
          if (i === 0) {
            doc.id.should.equal('wbXwyLJheRfYXXWlY46j');
          }
          if (i === 1) {
            doc.id.should.equal('kGC5cYPN1nKnZCcAb9oQ');
          }
        });
      });

      it('returns second page', async function () {
        const { getFirestore, collection, query, orderBy, limit, startAfter, getDocs } =
          firestoreModular;
        const db = getFirestore();

        const ref = query(collection(db, COLLECTION), orderBy('number', 'desc'));
        const firstPageSnapshot = await getDocs(query(ref, limit(2)));
        let lastDocument;
        firstPageSnapshot.forEach(doc => {
          lastDocument = doc;
        });

        const secondPageSnapshot = await getDocs(query(ref, startAfter(lastDocument), limit(2)));
        should.equal(secondPageSnapshot.docs.length, 2);
        secondPageSnapshot.forEach((doc, i) => {
          if (i === 0) {
            doc.id.should.equal('8Ek8iWCDQPPJ5s2n8PiQ');
          }
          if (i === 1) {
            doc.id.should.equal('mr7MdAygvuheF6AUtWma');
          }
        });
      });
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

    describe('number type consistency', function () {
      before(async function () {
        // FIXME:
        // This only throws an error in the suite since this is already initialized in the v8 tests above.
        // It throws the following error:
        //
        // FirebaseError: Firestore has already been started and its settings can no longer be changed.
        // You can only modify settings before calling any other methods on a Firestore object.
        try {
          jsFirebaseModular.initializeApp(FirebaseHelpers.app.config());
          jsFirestoreModular.connectFirestoreEmulator(
            jsFirestoreModular.getFirestore(),
            getE2eEmulatorHost(),
            8080,
          );
        } catch (_e) {}

        // Put one example of each number in our collection using JS SDK
        await Promise.all(
          Object.entries(testNumbers).map(([testName, testValue]) => {
            return jsFirestoreModular.setDoc(
              jsFirestoreModular.doc(
                jsFirestoreModular.getFirestore(),
                `${COLLECTION}/numberTestsJS/cases/${testName}`,
              ),
              { number: testValue },
            );
          }),
        );

        const { getFirestore, doc, setDoc } = firestoreModular;

        // Put one example of each number in our collection using Native SDK
        await Promise.all(
          Object.entries(testNumbers).map(([testName, testValue]) => {
            return setDoc(
              doc(getFirestore(), `${COLLECTION}/numberTestsNative/cases/${testName}`),
              {
                number: testValue,
              },
            );
          }),
        );
      });

      it('types inserted by JS may be queried by native with filters', async function () {
        const { getFirestore, collection, query, where, getDocs } = firestoreModular;
        const testValues = Object.values(testNumbers);
        const ref = query(
          collection(getFirestore(), `${COLLECTION}/numberTestsJS/cases`),
          where('number', 'in', testValues),
        );
        const typesSnap = await getDocs(ref);
        should.deepEqual(typesSnap.docs.map(d => d.id).sort(), Object.keys(testNumbers).sort());
      });

      it('types inserted by native may be queried by JS with filters', async function () {
        const testValues = Object.values(testNumbers);
        const ref = jsFirestoreModular.query(
          jsFirestoreModular.collection(
            jsFirestoreModular.getFirestore(),
            `${COLLECTION}/numberTestsNative/cases`,
          ),
          jsFirestoreModular.where('number', 'in', testValues),
        );
        typesSnap = await jsFirestoreModular.getDocs(ref);
        should.deepEqual(typesSnap.docs.map(d => d.id).sort(), Object.keys(testNumbers).sort());
      });
    });
  });
});
