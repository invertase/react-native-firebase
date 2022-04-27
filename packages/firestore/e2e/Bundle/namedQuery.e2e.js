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
  beforeEach(async function () {
    await wipe();
    return await firebase.firestore().loadBundle(getBundle());
  });

  it('returns bundled QuerySnapshot', async function () {
    const query = firebase.firestore().namedQuery(BUNDLE_QUERY_NAME);
    const snapshot = await query.get({ source: 'cache' });

    snapshot.constructor.name.should.eql('FirestoreQuerySnapshot');
    snapshot.docs.forEach(doc => {
      doc.data().number.should.equalOneOf(1, 2, 3);
      doc.metadata.fromCache.should.eql(true);
    });
  });

  it('limits the number of documents in bundled QuerySnapshot', async function () {
    const query = firebase.firestore().namedQuery(BUNDLE_QUERY_NAME);
    const snapshot = await query.limit(1).get({ source: 'cache' });

    snapshot.size.should.equal(1);
    snapshot.docs[0].metadata.fromCache.should.eql(true);
  });

  it('returns QuerySnapshot from firestore backend when omitting "source: cache"', async function () {
    const docRef = firebase.firestore().collection(BUNDLE_COLLECTION).doc();
    await docRef.set({ number: 4 });

    const query = firebase.firestore().namedQuery(BUNDLE_QUERY_NAME);
    const snapshot = await query.get();

    snapshot.size.should.equal(1);
    snapshot.docs[0].data().number.should.eql(4);
    snapshot.docs[0].metadata.fromCache.should.eql(false);
  });

  it('calls onNext with QuerySnapshot from firestore backend', async function () {
    const docRef = firebase.firestore().collection(BUNDLE_COLLECTION).doc();
    await docRef.set({ number: 5 });

    const onNext = sinon.spy();
    const onError = sinon.spy();
    const unsub = firebase.firestore().namedQuery(BUNDLE_QUERY_NAME).onSnapshot(onNext, onError);

    await Utils.spyToBeCalledOnceAsync(onNext);

    onNext.should.be.calledOnce();
    onError.should.be.callCount(0);
    // FIXME not stable on tests:<platform>:test-reuse
    // 5 on first run, 4 on reuse
    // onNext.args[0][0].docs[0].data().number.should.eql(4);
    unsub();
  });

  it('throws if invalid query name', async function () {
    const query = firebase.firestore().namedQuery('invalid-query');
    try {
      await query.get({ source: 'cache' });
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('unknown');
      return Promise.resolve();
    }
  });

  it('calls onError if invalid query name', async function () {
    const onNext = sinon.spy();
    const onError = sinon.spy();
    const unsub = firebase.firestore().namedQuery('invalid-query').onSnapshot(onNext, onError);

    await Utils.spyToBeCalledOnceAsync(onError);

    onNext.should.be.callCount(0);
    onError.should.be.calledOnce();
    onError.args[0][0].message.should.containEql('unknown');
    unsub();
  });
});
