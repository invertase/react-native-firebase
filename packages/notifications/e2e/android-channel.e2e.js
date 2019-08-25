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
    validate = jet.require('packages/notifications/lib/validateAndroidChannel');
  });

  it('throws if not an object', () => {
    try {
      validate(123);
      return Promise.reject(new Error('Did not throw Error'));
    } catch (e) {
      e.message.should.containEql("'channel' expected an object value");
      return Promise.resolve();
    }
  });

  describe('channelId', () => {
    it('throws if channel id not a string', () => {
      try {
        validate({
          channelId: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.channelId' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if channel id not valid', () => {
      try {
        validate({
          channelId: '',
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.channelId' expected a valid string channelId");
        return Promise.resolve();
      }
    });
  });

  describe('name', () => {
    it('throws if channel name not a string', () => {
      try {
        validate({
          channelId: 'foo',
          name: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.name' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if channel name not valid', () => {
      try {
        validate({
          channelId: 'foo',
          name: '',
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.name' expected a valid channel name");
        return Promise.resolve();
      }
    });
  });

  it('returns default values', () => {
    const v = validate({
      channelId: 'foo',
      name: 'bar',
    });
    v.channelId.should.eql('foo');
    v.name.should.eql('bar');
    v.allowBubbles.should.eql(false);
    v.bypassDnd.should.eql(false);
    v.enableLights.should.eql(true);
    v.enableVibration.should.eql(true);
    v.showBadge.should.eql(false);
    v.sound.should.eql('default');
    v.lockscreenVisibility.should.eql(firebase.notifications.AndroidVisibility.PRIVATE);
  });

  xdescribe('allowBubbles', () => {
    it('throws if allowBubbles is not a boolean', () => {
      try {
        validate({ allowBubbles: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.allowBubbles' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets allowBubbles', () => {
      const v = validate({ allowBubbles: true });
      v.allowBubbles.should.eql(true);
    });
  });

  describe('bypassDnd', () => {
    it('throws if bypassDnd is not a boolean', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          bypassDnd: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.bypassDnd' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets bypassDnd', () => {
      const v = validate({
        channelId: 'foo',
        name: 'bar',
        bypassDnd: true,
      });
      v.bypassDnd.should.eql(true);
    });
  });

  describe('description', () => {
    it('throws if description is not a string', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          description: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.description' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets description', () => {
      const v = validate({
        channelId: 'foo',
        name: 'bar',
        description: 'foobar',
      });
      v.description.should.eql('foobar');
    });
  });

  describe('enableLights', () => {
    it('throws if enableLights is not a boolean', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          enableLights: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.enableLights' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets enableLights', () => {
      const v = validate({
        channelId: 'foo',
        name: 'bar',
        enableLights: false,
      });
      v.enableLights.should.eql(false);
    });
  });

  describe('enableVibration', () => {
    it('throws if enableVibration is not a boolean', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          enableVibration: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.enableVibration' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets enableVibration', () => {
      const v = validate({
        channelId: 'foo',
        name: 'bar',
        enableVibration: false,
      });
      v.enableVibration.should.eql(false);
    });
  });

  describe('groupId', () => {
    it('throws if description is not a string', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          groupId: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.groupId' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets groupId', () => {
      const v = validate({
        channelId: 'foo',
        name: 'bar',
        groupId: 'foobar',
      });
      v.groupId.should.eql('foobar');
    });
  });

  describe('importance', () => {
    it('throws if not a valid type', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          importance: 'high',
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.importance' expected an AndroidImportance value");
        return Promise.resolve();
      }
    });

    it('sets importance', () => {
      const v = validate({
        channelId: 'foo',
        name: 'bar',
        importance: firebase.notifications.AndroidImportance.MIN,
      });
      v.importance.should.eql(firebase.notifications.AndroidImportance.MIN);
    });
  });

  describe('lightColor', () => {
    it('throws if lightColor is not a string', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          lightColor: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.lightColor' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if lightColor is invalid', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          lightColor: 'ffffff',
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          'invalid color. Expected an AndroidColor or hexadecimal string value',
        );
        return Promise.resolve();
      }
    });

    it('sets lightColor', () => {
      const v = validate({
        channelId: 'foo',
        name: 'bar',
        lightColor: '#000000',
      });
      v.lightColor.should.eql('#000000');
    });
  });

  describe('lockscreenVisibility', () => {
    it('throws if is not a valid type', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          lockscreenVisibility: 'public',
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'channel.lockscreenVisibility' expected visibility to be an AndroidVisibility value",
        );
        return Promise.resolve();
      }
    });

    it('sets a value', () => {
      const v = validate({
        channelId: 'foo',
        name: 'bar',
        lockscreenVisibility: firebase.notifications.AndroidVisibility.SECRET,
      });
      v.lockscreenVisibility.should.eql(firebase.notifications.AndroidVisibility.SECRET);
    });
  });

  describe('showBadge', () => {
    it('throws if showBadge is not a boolean', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          showBadge: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.showBadge' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets showBadge', () => {
      const v = validate({
        channelId: 'foo',
        name: 'bar',
        showBadge: true,
      });
      v.enableVibration.should.eql(true);
    });
  });

  describe('sound', () => {
    it('throws if sound is not a string', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          sound: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.sound' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if sound is invalid', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          sound: '',
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.sound' expected a valid sound string");
        return Promise.resolve();
      }
    });

    it('sets a sound', () => {
      const v = validate({
        channelId: 'foo',
        name: 'bar',
        sound: 'ring',
      });
      v.sound.should.be.eql('ring');
    });
  });

  describe('vibrationPattern', () => {
    it('throws if vibratePattern is not an array', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          vibrationPattern: 'true',
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channel.vibrationPattern' expected an array");
        return Promise.resolve();
      }
    });

    it('throws if vibratePattern does not have valid length', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          vibrationPattern: [100, 200, 100],
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'channel.vibrationPattern' expected an array containing an even number of positive values",
        );
        return Promise.resolve();
      }
    });

    it('throws if vibratePattern does not have valid values', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          vibrationPattern: [100, '200'],
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'channel.vibrationPattern' expected an array containing an even number of positive values",
        );
        return Promise.resolve();
      }
    });

    it('throws if vibratePattern value is less than 1', () => {
      try {
        validate({
          channelId: 'foo',
          name: 'bar',
          vibrationPattern: [100, 0],
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'channel.vibrationPattern' expected an array containing an even number of positive values",
        );
        return Promise.resolve();
      }
    });

    it('sets vibratePattern', () => {
      const v = validate({
        channelId: 'foo',
        name: 'bar',
        vibrationPattern: [130, 230, 100, 200],
      });
      v.vibrationPattern.should.be.Array();
      v.vibrationPattern.length.should.eql(4);
      v.vibrationPattern[0].should.be.eql(130);
      v.vibrationPattern[1].should.be.eql(230);
      v.vibrationPattern[2].should.be.eql(100);
      v.vibrationPattern[3].should.be.eql(200);
    });
  });
});
