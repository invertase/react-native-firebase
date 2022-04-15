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
const { wipe } = require('../helpers');
const BUNDLE_URL = 'https://api.rnfirebase.io/firestore/bundle';
const QUERY_NAME = 'named-bundle-test';

describe('firestore().namedQuery()', function () {
  before(function () {
    return wipe();
  });
  async function prepareBundle() {
    const resp = await fetch(BUNDLE_URL);
    const bundleString = await resp.text();
    await firebase.firestore().loadBundle(bundleString);
  }
  it('gets from named query', async function () {
    await prepareBundle();
    const query = firebase.firestore().namedQuery(QUERY_NAME);
    const snapshot = await query.get({ source: 'cache' });
    snapshot.constructor.name.should.eql('FirestoreQuerySnapshot');
    snapshot.forEach(doc => {
      doc.data().number.should.equalOneOf(1, 2, 3);
    });
  });
  it('gets from named query with limit modification', async function () {
    await prepareBundle();
    const query = firebase.firestore().namedQuery(QUERY_NAME);
    const snapshot = await query.limit(1).get({ source: 'cache' });
    snapshot.constructor.name.should.eql('FirestoreQuerySnapshot');
    snapshot.size.should.equal(1);
  });
  it('gets from firestore backend when omitting source: cache', async function () {
    await prepareBundle();
    const query = firebase.firestore().namedQuery(QUERY_NAME);
    const snapshot = await query.get();
    snapshot.constructor.name.should.eql('FirestoreQuerySnapshot');
    snapshot.size.should.equal(0);
  });
  it('throws if invalid query name', async function () {
    await prepareBundle();
    const query = firebase.firestore().namedQuery('invalid-query');
    try {
      await query.get({ source: 'cache' });
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      // TODO: better error message
      return Promise.resolve();
    }
  });
});
