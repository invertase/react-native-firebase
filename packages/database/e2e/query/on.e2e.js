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

const { PATH, seed, wipe } = require('../helpers');

const TEST_PATH = `${PATH}/on`;

describe('database().ref().on()', () => {
  // before(() => seed(TEST_PATH));
  // after(() => wipe(TEST_PATH));

  it('throws if event type is invalid', async () => {
    try {
      await firebase
        .database()
        .ref()
        .on('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'eventType' must be one of`);
      return Promise.resolve();
    }
  });

  it('throws if callback is not a function', async () => {
    try {
      await firebase
        .database()
        .ref()
        .on('value', 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'callback' must be a function`);
      return Promise.resolve();
    }
  });

  it('throws if cancel callback is not a function', async () => {
    try {
      await firebase
        .database()
        .ref()
        .on('value', () => {}, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'cancelCallbackOrContext' must be a function or object`);
      return Promise.resolve();
    }
  });

  it('throws if context is not an object', async () => {
    try {
      await firebase
        .database()
        .ref()
        .on('value', () => {}, () => {}, 'foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(`'context' must be an object.`);
      return Promise.resolve();
    }
  });

  it('should callback with an initial value', async () => {
    const callback = sinon.spy();
    const ref = firebase.database().ref(`${TEST_PATH}/init`);
    const value = Date.now();
    await ref.set(value);

    ref.on('value', $ => {
      callback($.val());
    });

    await Utils.sleep(500);
    callback.should.be.calledOnce();
    callback.should.be.calledWith(value);

    ref.off('value');
  });

  it('should callback multiple times when the value changes', async () => {
    const callback = sinon.spy();
    const ref = firebase.database().ref(`${TEST_PATH}/changes`);
    await ref.set('foo');

    ref.on('value', $ => {
      callback($.val());
    });

    await Utils.sleep(500);
    await ref.set('bar');
    await Utils.sleep(500);

    ref.off('value');
    callback.should.be.calledTwice();
    callback.getCall(0).args[0].should.equal('foo');
    callback.getCall(1).args[0].should.equal('bar');
  });

  it('should cancel when something goes wrong', async () => {
    const successCallback = sinon.spy();
    const cancelCallback = sinon.spy();
    const ref = firebase.database().ref(`nope`);

    ref.on(
      'value',
      $ => {
        successCallback($.val());
      },
      error => {
        error.message.should.containEql(
          `Client doesn't have permission to access the desired data`,
        );
        cancelCallback();
      },
    );

    await Utils.sleep(1200); // takes a while to call at times
    ref.off('value');
    successCallback.should.be.callCount(0);
    cancelCallback.should.be.calledOnce();
  });

});
