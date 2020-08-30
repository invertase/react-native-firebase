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

describe('messaging().sendMessage(*)', () => {
  it('throws if no object provided', () => {
    try {
      firebase.messaging().sendMessage(123);
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("'remoteMessage' expected an object value");
      return Promise.resolve();
    }
  });

  it('uses default values', async () => {
    firebase.messaging().sendMessage({});
  });

  describe('to', () => {
    it('throws if not a string', () => {
      try {
        firebase.messaging().sendMessage({
          to: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'remoteMessage.to' expected a string value");
        return Promise.resolve();
      }
    });

    it('accepts custom value', async () => {
      await firebase.messaging().sendMessage({
        to: 'foobar',
      });
    });
  });

  describe('messageId', () => {
    it('throws if not a string', () => {
      try {
        firebase.messaging().sendMessage({
          messageId: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'remoteMessage.messageId' expected a string value");
        return Promise.resolve();
      }
    });

    it('accepts custom value', async () => {
      await firebase.messaging().sendMessage({
        messageId: 'foobar',
      });
    });
  });

  describe('ttl', () => {
    it('throws if not a number', () => {
      try {
        firebase.messaging().sendMessage({
          ttl: '123',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("remoteMessage.ttl' expected a number value");
        return Promise.resolve();
      }
    });

    it('throws if negative number', () => {
      try {
        firebase.messaging().sendMessage({
          ttl: -2,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'remoteMessage.ttl' expected a positive integer value");
        return Promise.resolve();
      }
    });

    it('throws if float number', () => {
      try {
        firebase.messaging().sendMessage({
          ttl: 123.4,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'remoteMessage.ttl' expected a positive integer value");
        return Promise.resolve();
      }
    });

    it('accepts custom value', async () => {
      await firebase.messaging().sendMessage({
        ttl: 123,
      });
    });
  });

  describe('data', () => {
    it('throws if not an object', () => {
      try {
        firebase.messaging().sendMessage({
          data: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'remoteMessage.data' expected an object value");
        return Promise.resolve();
      }
    });

    it('accepts custom value', async () => {
      await firebase.messaging().sendMessage({
        data: {
          foo: 'bar',
        },
      });
    });
  });

  describe('collapseKey', () => {
    it('throws if not a string', () => {
      try {
        firebase.messaging().sendMessage({
          collapseKey: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'remoteMessage.collapseKey' expected a string value");
        return Promise.resolve();
      }
    });

    it('accepts custom value', async () => {
      await firebase.messaging().sendMessage({
        collapseKey: 'foobar',
      });
    });
  });

  describe('messageType', () => {
    it('throws if not a string', () => {
      try {
        firebase.messaging().sendMessage({
          messageType: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'remoteMessage.messageType' expected a string value");
        return Promise.resolve();
      }
    });

    it('accepts custom value', async () => {
      await firebase.messaging().sendMessage({
        messageType: 'foobar',
      });
    });
  });
});
