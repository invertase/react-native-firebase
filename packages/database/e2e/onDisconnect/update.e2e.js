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

const { PATH, wipe } = require('../helpers');

const TEST_PATH = `${PATH}/onDisconnectUpdate`;

describe('database().ref().onDisconnect().update()', () => {
  after(() => wipe(TEST_PATH));

  afterEach(() => {
    // Ensures the db is online before running each test
    firebase.database().goOnline();
  });

  it('throws if values is not an object', async () => {
    try {
      await firebase
        .database()
        .ref(TEST_PATH)
        .onDisconnect()
        .update('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'values' must be an object`);
      return Promise.resolve();
    }
  });

  it('throws if values does not contain any values', async () => {
    try {
      await firebase
        .database()
        .ref(TEST_PATH)
        .onDisconnect()
        .update({});
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'values' must be an object containing multiple values`);
      return Promise.resolve();
    }
  });

  it('throws if onComplete is not a function', () => {
    const ref = firebase
      .database()
      .ref(TEST_PATH)
      .onDisconnect();
    try {
      ref.update({ foo: 'bar' }, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'onComplete' must be a function if provided`);
      return Promise.resolve();
    }
  });

  it('updates value when disconnected', async () => {
    const ref = firebase.database().ref(TEST_PATH);

    const value = Date.now();
    await ref.set({
      foo: {
        bar: 'baz',
      },
    });

    await ref
      .child('foo')
      .onDisconnect()
      .update({
        bar: value,
      });
    await firebase.database().goOffline();
    await firebase.database().goOnline();

    const snapshot = await ref.child('foo').once('value');
    snapshot.val().should.eql(
      jet.contextify({
        bar: value,
      }),
    );
  });

  it('calls back to the onComplete function', async () => {
    const callback = sinon.spy();
    const ref = firebase.database().ref(TEST_PATH);

    // Set an initial value
    await ref.set('foo');
    await ref.onDisconnect().update({ foo: 'bar' }, callback);
    await firebase.database().goOffline();
    await firebase.database().goOnline();

    callback.should.be.calledOnce();
  });
});
