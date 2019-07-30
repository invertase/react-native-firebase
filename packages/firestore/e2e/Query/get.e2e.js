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

describe('firestore().collection().get()', () => {
  before(() => wipe());

  it('throws if get options is not an object', () => {
    try {
      firebase
        .firestore()
        .collection('v6')
        .get(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'options' must be an object is provided");
      return Promise.resolve();
    }
  });

  it('throws if get options.source is not valid', () => {
    try {
      firebase
        .firestore()
        .collection('v6')
        .get({
          source: 'foo',
        });
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        "'options' GetOptions.source must be one of 'default', 'server' or 'cache'",
      );
      return Promise.resolve();
    }
  });

  it('returns a QuerySnapshot', async () => {
    const docRef = firebase
      .firestore()
      .collection('v6')
      .doc('nestedcollection');
    const colRef = docRef.collection('get');
    const snapshot = await colRef.get();

    snapshot.constructor.name.should.eql('FirestoreQuerySnapshot');
  });

  it('returns a correct cache setting (true)', async () => {
    const docRef = firebase
      .firestore()
      .collection('v6')
      .doc('nestedcollection');
    const colRef = docRef.collection('get');
    const snapshot = await colRef.get({
      source: 'cache',
    });

    snapshot.constructor.name.should.eql('FirestoreQuerySnapshot');
    snapshot.metadata.fromCache.should.be.True();
  });

  it('returns a correct cache setting (false)', async () => {
    const docRef = firebase
      .firestore()
      .collection('v6')
      .doc('nestedcollection');
    const colRef = docRef.collection('get');
    await colRef.get(); // Puts it in cache
    const snapshot = await colRef.get({
      source: 'server',
    });

    snapshot.constructor.name.should.eql('FirestoreQuerySnapshot');
    snapshot.metadata.fromCache.should.be.False();
  });
});
