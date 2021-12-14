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
const { getE2eEmulatorHost } = require('@react-native-firebase/app/e2e/helpers');
const jsFirebase = require('firebase/compat/app');
require('firebase/compat/firestore');

const testNumbers = {
  zero: 0, // int
  negativeZero: -0, // double
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
  describe('issues', function () {
    before(async function () {
      await Promise.all([
        firebase.firestore().doc(`${COLLECTION}/wbXwyLJheRfYXXWlY46j`).set({ index: 2, number: 2 }),
        firebase.firestore().doc(`${COLLECTION}/kGC5cYPN1nKnZCcAb9oQ`).set({ index: 6, number: 2 }),
        firebase.firestore().doc(`${COLLECTION}/8Ek8iWCDQPPJ5s2n8PiQ`).set({ index: 4, number: 2 }),
        firebase.firestore().doc(`${COLLECTION}/mr7MdAygvuheF6AUtWma`).set({ index: 1, number: 1 }),
        firebase.firestore().doc(`${COLLECTION}/RCO5SvNn4fdoE49OKrIV`).set({ index: 3, number: 1 }),
        firebase.firestore().doc(`${COLLECTION}/CvVG7VP1hXTtcfdUaeNl`).set({ index: 5, number: 1 }),
      ]);
    });

    it('returns all results', async function () {
      const db = firebase.firestore();
      const ref = db.collection(COLLECTION).orderBy('number', 'desc');
      const allResultsSnapshot = await ref.get();
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
      const db = firebase.firestore();
      const ref = db.collection(COLLECTION).orderBy('number', 'desc');
      const firstPageSnapshot = await ref.limit(2).get();
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
      const db = firebase.firestore();
      const ref = db.collection(COLLECTION).orderBy('number', 'desc');
      const firstPageSnapshot = await ref.limit(2).get();
      let lastDocument;
      firstPageSnapshot.forEach(doc => {
        lastDocument = doc;
      });

      const secondPageSnapshot = await ref.startAfter(lastDocument).limit(2).get();
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

  describe('number type consistency', function () {
    before(async function () {
      jsFirebase.initializeApp(FirebaseHelpers.app.config());
      jsFirebase.firestore().useEmulator(getE2eEmulatorHost(), 8080);

      // Put one example of each number in our collection using JS SDK
      await Promise.all(
        Object.entries(testNumbers).map(([testName, testValue]) => {
          return jsFirebase
            .firestore()
            .doc(`${COLLECTION}/numberTestsJS/cases/${testName}`)
            .set({ number: testValue });
        }),
      );

      // Put one example of each number in our collection using Native SDK
      await Promise.all(
        Object.entries(testNumbers).map(([testName, testValue]) => {
          return firebase
            .firestore()
            .doc(`${COLLECTION}/numberTestsNative/cases/${testName}`)
            .set({ number: testValue });
        }),
      );
    });

    it('types inserted by JS may be queried by native with filters', async function () {
      const testValues = Object.values(testNumbers);
      const ref = firebase
        .firestore()
        .collection(`${COLLECTION}/numberTestsJS/cases`)
        .where('number', 'in', testValues);
      typesSnap = await ref.get();
      should.deepEqual(typesSnap.docs.map(d => d.id).sort(), Object.keys(testNumbers).sort());
    });

    it('types inserted by native may be queried by JS with filters', async function () {
      const testValues = Object.values(testNumbers);
      const ref = jsFirebase
        .firestore()
        .collection(`${COLLECTION}/numberTestsNative/cases`)
        .where('number', 'in', testValues);
      typesSnap = await ref.get();
      should.deepEqual(typesSnap.docs.map(d => d.id).sort(), Object.keys(testNumbers).sort());
    });
  });
});
