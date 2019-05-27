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

const { PATH, CONTENT, seed, wipe } = require('../helpers');

const TEST_PATH = `${PATH}/once`;

describe('database().ref().once()', () => {

  before(() => seed(TEST_PATH));
  after(() => wipe(TEST_PATH));

  it('throws if event type is invalid', async () => {
    try {
      await firebase
        .database()
        .ref()
        .once('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'eventType' must be one of`);
      return Promise.resolve();
    }
  });

  it('throws if success callback is not a function', async () => {
    try {
      await firebase
        .database()
        .ref()
        .once('value', 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'successCallBack' must be a function`);
      return Promise.resolve();
    }
  });

  it('throws if failure callback is not a function', async () => {
    try {
      await firebase
        .database()
        .ref()
        .once('value', () => {
        }, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'failureCallbackOrContext' must be a function or context`);
      return Promise.resolve();
    }
  });

  it('throws if context is not an object', async () => {
    try {
      await firebase
        .database()
        .ref()
        .once('value', () => {
        }, () => {
        }, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'context' must be a context object.`);
      return Promise.resolve();
    }
  });

  it('returns a promise', async () => {
    const ref = firebase.database().ref('tests/types/number');
    const returnValue = ref.once('value');
    returnValue.should.be.Promise();
  });

  it('resolves with the correct values', async () => {
    const ref = firebase.database().ref(`${TEST_PATH}/types`);

    await Promise.all(
      Object.keys(CONTENT.DEFAULT).map(async key => {
        const value = CONTENT.DEFAULT[key];
        const snapsnot = await ref.child(key).once('value');
        snapsnot.val().should.eql(jet.contextify(value));
      }),
    );
  });

  it('is NOT called when the value is changed', async () => {
    const callback = sinon.spy();
    const ref = firebase.database().ref(`${TEST_PATH}/types/number`);
    ref.once('value').then(callback);
    await ref.set(1337);
    callback.should.be.calledOnce();
  });

  it('errors if permission denied', async () => {
    const ref = firebase.database().ref('nope');
    try {
      await ref.once('value');
      return Promise.reject(new Error('No permission denied error'));
    } catch (error) {
      error.code.includes('database/permission-denied').should.be.true();
      return Promise.resolve();
    }
  });

  it('resolves when a child is added', async () => {
    const ref = firebase.database().ref(`${TEST_PATH}/childAdded`);
    const value = Date.now();

    // eslint-disable-next-line consistent-return
    return new Promise(async (resolve, reject) => {
      try {
        ref.once('child_added').then(snapshot => {
          snapshot.key.should.eql('foo');
          snapshot.val().should.eql(value);
          return resolve();
        });
        await ref.child('foo').set(value);
      } catch (error) {
        return reject(error);
      }
    });
  });

  it('resolves when a child is added', async () => {
    const ref = firebase.database().ref(`${TEST_PATH}/childAdded`);
    const value = Date.now();

    // eslint-disable-next-line consistent-return
    return new Promise(async (resolve, reject) => {
      try {
        ref.once('child_added').then(snapshot => {
          snapshot.key.should.eql('foo');
          snapshot.val().should.eql(value);
          return resolve();
        });
        await ref.child('foo').set(value);
      } catch (error) {
        return reject(error);
      }
    });
  });

  it.only('resolves when a child is changed', async () => {
    const ref = firebase.database().ref(`${TEST_PATH}/childChanged`);
    await ref.set(1);

    // eslint-disable-next-line consistent-return
    return new Promise(async (resolve, reject) => {
      try {
        ref.once('child_changed').then(snapshot => {
          snapshot.key.should.eql('foo');
          snapshot.val().should.eql(2);
          return resolve();
        });
        await ref.set(2);
      } catch (error) {
        return reject(error);
      }
    });
  });
});
