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

describe('messaging().sendMessage(*)', function () {
  it('throws if used on ios', function () {
    if (device.getPlatform() === 'ios') {
      try {
        firebase.messaging().sendMessage(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          'firebase.messaging().sendMessage() is only supported on Android devices.',
        );
        return Promise.resolve();
      }
    } else {
      Promise.resolve();
    }
  });

  it('throws if no object provided', function () {
    if (device.getPlatform() === 'android') {
      try {
        firebase.messaging().sendMessage(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'remoteMessage' expected an object value");
        return Promise.resolve();
      }
    } else {
      this.skip();
    }
  });

  it('uses default values', async function () {
    if (device.getPlatform() === 'android') {
      firebase.messaging().sendMessage({});
    } else {
      this.skip();
    }
  });

  describe('to', function () {
    it('throws if to is not a string', function () {
      if (device.getPlatform() === 'android') {
        try {
          firebase.messaging().sendMessage({
            to: 123,
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'remoteMessage.to' expected a string value");
          return Promise.resolve();
        }
      } else {
        this.skip();
      }
    });

    it('accepts custom to value', async function () {
      if (device.getPlatform() === 'android') {
        await firebase.messaging().sendMessage({
          to: 'foobar',
        });
      } else {
        this.skip();
      }
    });
  });

  describe('messageId', function () {
    it('throws if messageId is not a string', function () {
      if (device.getPlatform() === 'android') {
        try {
          firebase.messaging().sendMessage({
            messageId: 123,
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'remoteMessage.messageId' expected a string value");
          return Promise.resolve();
        }
      } else {
        this.skip();
      }
    });

    it('accepts custom messageId value', async function () {
      if (device.getPlatform() === 'android') {
        await firebase.messaging().sendMessage({
          messageId: 'foobar',
        });
      } else {
        this.skip();
      }
    });
  });

  describe('ttl', function () {
    it('throws if not a number', function () {
      if (device.getPlatform() === 'android') {
        try {
          firebase.messaging().sendMessage({
            ttl: '123',
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("remoteMessage.ttl' expected a number value");
          return Promise.resolve();
        }
      } else {
        this.skip();
      }
    });

    it('throws if negative number', function () {
      if (device.getPlatform() === 'android') {
        try {
          firebase.messaging().sendMessage({
            ttl: -2,
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'remoteMessage.ttl' expected a positive integer value");
          return Promise.resolve();
        }
      } else {
        this.skip();
      }
    });

    it('throws if float number', function () {
      if (device.getPlatform() === 'android') {
        try {
          firebase.messaging().sendMessage({
            ttl: 123.4,
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'remoteMessage.ttl' expected a positive integer value");
          return Promise.resolve();
        }
      } else {
        this.skip();
      }
    });

    it('accepts custom ttl value', async function () {
      if (device.getPlatform() === 'android') {
        await firebase.messaging().sendMessage({
          ttl: 123,
        });
      } else {
        this.skip();
      }
    });
  });

  describe('data', function () {
    it('throws if data not an object', function () {
      if (device.getPlatform() === 'android') {
        try {
          firebase.messaging().sendMessage({
            data: 123,
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'remoteMessage.data' expected an object value");
          return Promise.resolve();
        }
      } else {
        this.skip();
      }
    });

    it('accepts custom data value', async function () {
      if (device.getPlatform() === 'android') {
        await firebase.messaging().sendMessage({
          data: {
            foo: 'bar',
          },
        });
      } else {
        this.skip();
      }
    });
  });

  describe('collapseKey', function () {
    it('throws if collapseKey is not a string', function () {
      if (device.getPlatform() === 'android') {
        try {
          firebase.messaging().sendMessage({
            collapseKey: 123,
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'remoteMessage.collapseKey' expected a string value");
          return Promise.resolve();
        }
      } else {
        this.skip();
      }
    });

    it('accepts custom collapseKey value', async function () {
      if (device.getPlatform() === 'android') {
        await firebase.messaging().sendMessage({
          collapseKey: 'foobar',
        });
      } else {
        this.skip();
      }
    });
  });

  describe('messageType', function () {
    it('throws if messageType is not a string', function () {
      if (device.getPlatform() === 'android') {
        try {
          firebase.messaging().sendMessage({
            messageType: 123,
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'remoteMessage.messageType' expected a string value");
          return Promise.resolve();
        }
      } else {
        this.skip();
      }
    });

    it('accepts custom messageType value', async function () {
      if (device.getPlatform() === 'android') {
        await firebase.messaging().sendMessage({
          messageType: 'foobar',
        });
      } else {
        this.skip();
      }
    });
  });
});
