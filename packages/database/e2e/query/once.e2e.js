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
        .once('value', () => {}, 'foo');
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
        .once('value', () => {}, () => {}, 'foo');
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
      Object.keys(CONTENT.TYPES).map(async key => {
        const value = CONTENT.TYPES[key];
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

  xit('resolves when a child is added', async () => {
    const ref = firebase.database().ref(`${TEST_PATH}/childAdded`);
    const value = Date.now();

    ref
      .once('child_added')
      .then(snapshot => {
        snapshot.key.should.eql('foo');
        snapshot.val().should.eql(value);
        return Promise.resolve();
      })
      .catch(error => Promise.reject(error));

    // Allow the listener to subscribe before calling
    setTimeout(async () => {
      await ref.child('foo').set(value);
    }, 100);
  });

  // TODO Never seems to trigger on native?
  xit('resolves when a child is changed', async () => {
    const ref = firebase.database().ref(`${TEST_PATH}/childChanged`);
    const child = ref.child('changed');
    await child.set(1);

    return new Promise(async (resolve, reject) => {
      ref.once('child_changed', (snapshot) => {
        snapshot.key.should.eql('foo');
        snapshot.val().should.eql(2);
        return resolve();
      });

      // Allow the listener to subscribe before calling
      await child.set(2);
    });
  });

  xit('resolves when a child is removed', async () => {
    const ref = firebase.database().ref(`${TEST_PATH}/childRemoved`);
    const child = ref.child('removed');
    await child.set('foo');

    ref
      .once('child_removed')
      .then(snapshot => {
        snapshot.val().should.eql('foo');
        return Promise.resolve();
      })
      .catch(error => Promise.reject(error));

    // Allow the listener to subscribe before calling
    setTimeout(async () => {
      await child.remove();
    }, 100);
  });

  // https://github.com/firebase/firebase-js-sdk/blob/6b53e0058483c9002d2fe56119f86fc9fb96b56c/packages/database/test/order_by.test.ts#L104
  xit('resolves when a child is moved', async () => {
    const ref = firebase.database()
      .ref(`${TEST_PATH}/childMoved`)
      .orderByChild('nuggets');

    const initial = {
      alex: { nuggets: 60 },
      rob: { nuggets: 56 },
      vassili: { nuggets: 55.5 },
      tony: { nuggets: 52 },
      greg: { nuggets: 52 },
    };

    ref
      .once('child_moved')
      .then(snapshot => {
        // snapshot.val().should.eql('foo');
        return Promise.resolve();
      })
      .catch(error => Promise.reject(error));

    // Allow the listener to subscribe before calling
    setTimeout(async () => {
      await ref.child.set(initial);
      await ref.child('greg/nuggets').set(57);
    }, 100);
  });
});
