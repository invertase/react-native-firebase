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

describe('firestore.doc().get()', () => {
  before(() => wipe());

  it('throws if get options are not an object', () => {
    try {
      firebase
        .firestore()
        .doc('bar/baz')
        .get('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'options' must be an object is provided");
      return Promise.resolve();
    }
  });

  it('throws if get options are invalid', () => {
    try {
      firebase
        .firestore()
        .doc('bar/baz')
        .get({ source: 'nope' });
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        "'options' GetOptions.source must be one of 'default', 'server' or 'cache'",
      );
      return Promise.resolve();
    }
  });

  it('gets data from default source', async () => {
    const ref = firebase.firestore().doc('v6/get');
    const data = { foo: 'bar', bar: 123 };
    await ref.set(data);
    const snapshot = await ref.get();
    snapshot.data().should.eql(jet.contextify(data));
    await ref.delete();
  });

  it('gets data from the server', async () => {
    const ref = firebase.firestore().doc('v6/get');
    const data = { foo: 'bar', bar: 123 };
    await ref.set(data);
    const snapshot = await ref.get({ source: 'server' });
    snapshot.data().should.eql(jet.contextify(data));
    snapshot.metadata.fromCache.should.equal(false);
    await ref.delete();
  });

  it('gets data from cache', async () => {
    const ref = firebase.firestore().doc('v6/get');
    const data = { foo: 'bar', bar: 123 };
    await ref.set(data);
    const snapshot = await ref.get({ source: 'cache' });
    snapshot.data().should.eql(jet.contextify(data));
    snapshot.metadata.fromCache.should.equal(true);
    await ref.delete();
  });
});
