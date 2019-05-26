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

describe('database().ref()', () => {
  describe('key', () => {
    it('returns null when no reference path is provides', () => {
      const ref = firebase.database().ref();
      should.eql(ref.key, null);
    });

    it('return last token in reference path', () => {
      const ref1 = firebase.database().ref('foo');
      const ref2 = firebase.database().ref('foo/bar/baz');
      ref1.key.should.eql('foo');
      ref2.key.should.eql('baz');
    });
  });

  describe('parent', () => {
    it('returns null when no reference path is provides', () => {
      const ref = firebase.database().ref();
      should.eql(ref.parent, null);
    });

    it('return last token in reference path', () => {
      const ref1 = firebase.database().ref('/foo').parent;
      const ref2 = firebase.database().ref('/foo/bar/baz').parent;
      should.eql(ref1, null);
      ref2.key.should.eql('bar');
    });
  });

  describe('root', () => {
    it('returns a root reference', () => {
      const ref = firebase.database().ref('foo/bar/baz');
      should.eql(ref.root.key, null);
    });
  });

  describe('child()', () => {
    it('throws if path is not a string', async () => {
      try {
        firebase
          .database()
          .ref()
          .child({ foo: 'bar' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'path' must be a string value`);
        return Promise.resolve();
      }
    });

    it('throws if path is not a valid string', async () => {
      try {
        firebase
          .database()
          .ref()
          .child('$$$$$');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'path' can't contain`);
        return Promise.resolve();
      }
    });
  });

  describe('set()', async () => {
    it('throws if no value is provided', async () => {
      try {
        await firebase
          .database()
          .ref('tests/elliot')
          .set();
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'value' must be defined`);
        return Promise.resolve();
      }
    });

    it('throws if onComplete is not a function', async () => {
      try {
        await firebase
          .database()
          .ref('tests/elliot')
          .set(null, 'foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'onComplete' must be a function if provided`);
        return Promise.resolve();
      }
    });

    xit('sets a new value', async () => {
      const value = Date.now();
      await firebase
        .database()
        .ref('tests/elliot')
        .set(value);
      // TODO Validate value saved
    });

    it('callback if function is passed', async () => {
      const value = Date.now();
      return new Promise(async resolve => {
        await firebase
          .database()
          .ref('tests/elliot')
          .set(value, resolve);
      });
    });

    it.only('throws if permission defined', async () => {
      const value = Date.now();
      try {
        await firebase
          .database()
          .ref('nope/foo')
          .set(value);
        return Promise.reject(new Error('Did not throw error.'));
      } catch (error) {
        console.log(error);
        error.code.includes('database/permission-denied').should.be.true();
        return Promise.resolve();
      }
    });
  });

  describe('update()', () => {
    it('throws if values is not an object', async () => {
      try {
        await firebase
          .database()
          .ref('tests/elliot')
          .update('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'values' must be an object`);
        return Promise.resolve();
      }
    });

    it('throws if onComplete is not a function', async () => {
      try {
        await firebase
          .database()
          .ref('tests/elliot')
          .update(null, 'foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'onComplete' must be a function if provided`);
        return Promise.resolve();
      }
    });

    xit('updates values', async () => {
      const value = Date.now();
      await firebase
        .database()
        .ref('tests/elliot')
        .update({
          foo: value,
        });
      // TODO Validate value saved
    });

    it('callback if function is passed', async () => {
      const value = Date.now();
      return new Promise(async resolve => {
        await firebase
          .database()
          .ref('tests/elliot')
          .update(
            {
              foo: value,
            },
            resolve,
          );
      });
    });
  });

  describe('setWithPriority()', async () => {
    it('throws if newVal is not defined', async () => {
      try {
        await firebase
          .database()
          .ref('tests/elliot')
          .setWithPriority();
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'newVal' must be defined`);
        return Promise.resolve();
      }
    });

    it('throws if newPriority is incorrect type', async () => {
      try {
        await firebase
          .database()
          .ref('tests/elliot')
          .setWithPriority(null, { foo: 'bar' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'newPriority' must be a number, string or null value`);
        return Promise.resolve();
      }
    });

    it('throws if onComplete is not a function', async () => {
      try {
        await firebase
          .database()
          .ref('tests/elliot')
          .setWithPriority(null, null, 'foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'onComplete' must be a function if provided`);
        return Promise.resolve();
      }
    });

    xit('sets with a new value and priority', async () => {
      // TODO
    });
  });

  describe('set()', async () => {
  });

  describe('remove()', async () => {
    it('throws if onComplete is not a function', async () => {
      try {
        await firebase
          .database()
          .ref('tests/elliot')
          .remove('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'onComplete' must be a function if provided`);
        return Promise.resolve();
      }
    });

    it('removes a value at the path', async () => {

    });
  });

  describe('transaction()', async () => {
  });

  describe('setPriority()', async () => {
  });

  describe('push()', async () => {
  });

  describe('onDisconnect()', () => {
    it('returns an OnDisconnect instance', async () => {
      const instance = firebase
        .database()
        .ref()
        .onDisconnect();
      should.eql(instance.constructor.name, 'DatabaseOnDisconnect');
    });
  });
});
