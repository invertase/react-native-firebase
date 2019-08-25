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

let validate;

describe('notifications() Notification', () => {
  before(() => {
    validate = jet.require('packages/notifications/lib/validateNotification');
  });

  it('throws if notification is not an object', () => {
    try {
      validate('foo');
      return Promise.reject(new Error('Did not throw Error'));
    } catch (e) {
      e.message.should.containEql("'notification' expected an object value");
      return Promise.resolve();
    }
  });

  describe('body', () => {
    it('throws if not provided', () => {
      try {
        validate({});
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.body' expected a string value containing notification text",
        );
        return Promise.resolve();
      }
    });

    it('throws if not a string', () => {
      try {
        validate({
          body: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.body' expected a string value containing notification text",
        );
        return Promise.resolve();
      }
    });

    it('throws if empty string', () => {
      try {
        validate({
          body: '',
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.body' expected a string value containing notification text",
        );
        return Promise.resolve();
      }
    });

    it('sets the body value', () => {
      const v = validate({
        body: 'foo bar',
      });
      v.body.should.be.eql('foo bar');
    });
  });

  describe('notificationId', () => {
    it('throws if not a string', () => {
      try {
        validate({
          body: 'foo',
          notificationId: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql('invalid notification ID, expected a unique string value');
        return Promise.resolve();
      }
    });

    it('throws if empty string', () => {
      try {
        validate({
          body: 'foo',
          notificationId: '',
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql('invalid notification ID, expected a unique string value');
        return Promise.resolve();
      }
    });

    it('generates a unique value if not provided', () => {
      const v = validate({
        body: 'foo',
      });
      v.notificationId.should.be.String();
      v.notificationId.length.should.be.greaterThan(1);
    });
  });

  describe('title', () => {
    it('throws if not a string', () => {
      try {
        validate({
          body: 'foo',
          title: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.title' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets the title', () => {
      const v = validate({
        body: 'foo',
        title: 'foo bar',
      });
      v.title.should.eql('foo bar');
    });
  });

  describe('subtitle', () => {
    it('throws if not a string', () => {
      try {
        validate({
          body: 'foo',
          subtitle: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.subtitle' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets the title', () => {
      const v = validate({
        body: 'foo',
        subtitle: 'foo bar',
      });
      v.subtitle.should.eql('foo bar');
    });
  });

  describe('data', () => {
    it('throws if not an object', () => {
      try {
        validate({
          body: 'foo',
          data: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.data' expected an object value containing key/value pairs",
        );
        return Promise.resolve();
      }
    });

    it('throws if value is not a string', () => {
      try {
        validate({
          body: 'foo',
          data: {
            foo: 'bar',
            bar: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql('\'notification.data\' value for key "bar" is invalid');
        return Promise.resolve();
      }
    });

    it('sets data object', () => {
      const data = {
        foo: 'bar',
        bar: 'baz',
      };

      const v = validate({
        body: 'foo',
        data,
      });

      const output = jet.contextify(v.data);
      output.should.eql(jet.contextify(data));
    });
  });

  describe('sound', () => {
    it('throws if not a string', () => {
      try {
        validate({
          body: 'foo',
          sound: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.sound' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets sound', () => {
      const v = validate({
        body: 'foo',
        sound: 'fart',
      });

      v.sound.should.eql('fart');
    });
  });

  // Has own validation tests
  describe('android', () => {
    it('sets android options', () => {
      const v = validate({
        body: 'foo',
        android: {
          autoCancel: true,
        },
      });

      v.android.autoCancel.should.eql(true);
    });
  });

  // Has own validation tests
  xdescribe('ios', () => {
    // todo
  });
});
