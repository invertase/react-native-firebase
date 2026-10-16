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
const { wipe, getBundle, BUNDLE_COLLECTION, BUNDLE_QUERY_NAME } = require('../helpers');

describe('firestore().namedQuery()', function () {
  if (Platform.other) {
    return;
  }

  describe('modular', function () {
    // Load the bundle once for cache-backed named-query cases. Per-test wipe+loadBundle
    // previously hung the iOS Jet suite on the beforeEach for invalid-name tests
    // (420s mocha timeout) after earlier cases had already passed.
    before(async function () {
      await wipe();
      const { getFirestore, loadBundle } = firestoreModular;
      await loadBundle(getFirestore(), getBundle());
    });

    it('returns bundled QuerySnapshot', async function () {
      const { getFirestore, namedQuery, getDocsFromCache } = firestoreModular;

      const query = await namedQuery(getFirestore(), BUNDLE_QUERY_NAME);
      const snapshot = await getDocsFromCache(query);

      snapshot.constructor.name.should.eql('QuerySnapshot');
      snapshot.docs.forEach(doc => {
        doc.data().number.should.equalOneOf(1, 2, 3);
        doc.metadata.fromCache.should.eql(true);
      });
    });

    it('limits the number of documents in bundled QuerySnapshot', async function () {
      const { getFirestore, namedQuery, getDocsFromCache, query, limit } = firestoreModular;

      const q = await namedQuery(getFirestore(), BUNDLE_QUERY_NAME);
      const snapshot = await getDocsFromCache(query(q, limit(1)));

      snapshot.size.should.equal(1);
      snapshot.docs[0].metadata.fromCache.should.eql(true);
    });

    // TODO: log upstream issue - this broke with BoM >= 32.0.0, source always appears to be cache now
    xit('returns QuerySnapshot from firestore backend when omitting "source: cache"', async function () {
      const { getFirestore, namedQuery, getDocs, setDoc, collection, doc } = firestoreModular;
      const db = getFirestore();

      const docRef = doc(collection(db, BUNDLE_COLLECTION));
      await setDoc(docRef, { number: 4 });

      const query = await namedQuery(db, BUNDLE_QUERY_NAME);
      if (!query) throw new Error('namedQuery returned null');
      const snapshot = await getDocs(query);

      snapshot.size.should.equal(1);
      snapshot.docs[0].data().number.should.eql(4);
      snapshot.docs[0].metadata.fromCache.should.eql(false);
    });

    // TODO not stable on jet e2e
    xit('calls onNext with QuerySnapshot from firestore backend', async function () {
      const { getFirestore, collection, doc, setDoc, namedQuery, onSnapshot } = firestoreModular;
      const db = getFirestore();

      const docRef = doc(collection(db, BUNDLE_COLLECTION));
      await setDoc(docRef, { number: 5 });

      const onNext = sinon.spy();
      const onError = sinon.spy();
      const q = await namedQuery(db, BUNDLE_QUERY_NAME);
      if (!q) throw new Error('namedQuery returned null');
      const unsub = onSnapshot(q, onNext, onError);

      await Utils.spyToBeCalledOnceAsync(onNext);

      onNext.should.be.calledOnce();
      onError.should.be.callCount(0);
      // FIXME not stable on tests:<platform>:test-reuse
      // 5 on first run, 4 on reuse
      // onNext.args[0][0].docs[0].data().number.should.eql(4);
      unsub();
    });
  });

  // Invalid names never need a loaded bundle. Keep them off the wipe+loadBundle path so a
  // stuck emulator DELETE or native loadBundle cannot strand the suite on this case.
  //
  // Miss contract (matches Firestore usage docs' `if (namedQuery)` guard and
  // `Promise<Query | null>`): unknown name → `null`. RNFB may also return a Query
  // handle that fails get/onSnapshot with "unknown"; both are accepted here.
  describe('modular invalid query name', function () {
    it('misses unknown named query (null or getDocsFromCache unknown)', async function () {
      const { getFirestore, namedQuery, getDocsFromCache } = firestoreModular;

      const query = await namedQuery(getFirestore(), 'invalid-query');
      if (query == null) {
        return;
      }
      try {
        await getDocsFromCache(query);
        return Promise.reject(new Error('Expected null miss or getDocsFromCache to throw.'));
      } catch (error) {
        error.message.should.containEql('unknown');
        return Promise.resolve();
      }
    });

    it('misses unknown named query on snapshot (null or onError unknown)', async function () {
      const { getFirestore, namedQuery, onSnapshot } = firestoreModular;

      const q = await namedQuery(getFirestore(), 'invalid-query');
      if (q == null) {
        return;
      }

      const onNext = sinon.spy();
      const onError = sinon.spy();
      const unsub = onSnapshot(q, onNext, onError);

      await Utils.spyToBeCalledOnceAsync(onError);

      onNext.should.be.callCount(0);
      onError.should.be.calledOnce();
      onError.args[0][0].message.should.containEql('unknown');
      unsub();
    });
  });
});
