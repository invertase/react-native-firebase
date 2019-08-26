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
    validate = jet.require('packages/notifications/lib/validateAndroidNotification');
  });

  it('uses default values', () => {
    const v = validate();

    const expected = jet.contextify({
      autoCancel: true,
      badgeIconType: firebase.notifications.AndroidBadgeIconType.NONE,
      colorized: false,
      groupAlertBehaviour: firebase.notifications.AndroidGroupAlertBehavior.ALL,
      groupSummary: false,
      localOnly: false,
      ongoing: false,
      onlyAlertOnce: false,
      priority: firebase.notifications.AndroidPriority.DEFAULT,
      showWhenTimestamp: false,
      smallIcon: ['ic_launcher', -1],
      usesChronometer: false,
      vibrate: true,
      visibility: firebase.notifications.AndroidVisibility.PRIVATE,
    });

    const actual = jet.contextify(v);
    actual.should.eql(expected);
  });

  it('throws if not an object', () => {
    try {
      validate(123);
      return Promise.reject(new Error('Did not throw Error'));
    } catch (e) {
      e.message.should.containEql("'notification.android' expected an object value");
      return Promise.resolve();
    }
  });

  describe('actions', () => {
    // todo
  });

  describe('autoCancel', () => {
    it('throws if not a boolean', () => {
      try {
        validate({ autoCancel: 'false' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.autoCancel' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets a autoCancel value', () => {
      const v = validate({ autoCancel: false });
      v.autoCancel.should.be.eql(false);
    });
  });

  describe('badgeIconType', () => {
    it('throws if not a valid type', () => {
      try {
        validate({ badgeIconType: '1' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.badgeIconType' expected a valid AndroidBadgeIconType",
        );
        return Promise.resolve();
      }
    });

    it('sets a badgeIconType value', () => {
      const v = validate({ badgeIconType: firebase.notifications.AndroidBadgeIconType.LARGE });
      v.badgeIconType.should.be.eql(firebase.notifications.AndroidBadgeIconType.LARGE);
    });
  });

  describe('category', () => {
    it('throws if category is not a valid', () => {
      try {
        validate({ category: 'foo' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.category' expected a valid AndroidCategory",
        );
        return Promise.resolve();
      }
    });

    it('sets a category', () => {
      const v = validate({ category: firebase.notifications.AndroidCategory.EMAIL });
      v.category.should.eql(firebase.notifications.AndroidCategory.EMAIL);
    });
  });

  describe('channelId', () => {
    it('throws if id is not a string', () => {
      try {
        validate({ channelId: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.channelId' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets a channelId', () => {
      const v = validate({ channelId: 'foobar' });
      v.channelId.should.eql('foobar');
    });
  });

  describe('clickAction', () => {
    it('throws if action is not a string', () => {
      try {
        validate({ clickAction: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.clickAction' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets a clickAction', () => {
      const v = validate({ clickAction: 'foobar' });
      v.clickAction.should.eql('foobar');
    });
  });

  describe('color', () => {
    it('throws if color is not a string', () => {
      try {
        validate({ color: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.color' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if color is is invalid', () => {
      try {
        validate({ color: 'ffffff' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.color' invalid color");
        return Promise.resolve();
      }
    });

    it('sets a color', () => {
      const v1 = validate({ color: firebase.notifications.AndroidColor.GREEN });
      const v2 = validate({ color: '#ffffff' });
      const v3 = validate({ color: '#80ffffff' });

      v1.color.should.eql(firebase.notifications.AndroidColor.GREEN);
      v2.color.should.eql('#ffffff');
      v3.color.should.eql('#80ffffff');
    });
  });

  describe('colorized', () => {
    it('throws if colorized is not a boolean', () => {
      try {
        validate({ colorized: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.colorized' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets colorized', () => {
      const v = validate({ colorized: true });
      v.colorized.should.eql(true);
    });
  });

  describe('contentInfo', () => {
    it('throws if contentInfo is not a string', () => {
      try {
        validate({ contentInfo: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.contentInfo' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets contentInfo value', () => {
      const v = validate({ contentInfo: 'foo bar' });
      v.contentInfo.should.eql('foo bar');
    });
  });

  describe('defaults', () => {
    it('throws if defaults is not an array', () => {
      try {
        validate({ defaults: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.defaults' expected an array");
        return Promise.resolve();
      }
    });

    it('throws if defaults is an empty array', () => {
      try {
        validate({ defaults: [] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.defaults' expected an array containing AndroidDefaults",
        );
        return Promise.resolve();
      }
    });

    it('throws if value is not valid', () => {
      try {
        validate({
          defaults: [
            firebase.notifications.AndroidDefaults.SOUND,
            firebase.notifications.AndroidDefaults.VIBRATE,
            'foo',
          ],
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.defaults' invalid array value, expected a AndroidDefaults value",
        );
        return Promise.resolve();
      }
    });

    it('sets defaults', () => {
      const v = validate({
        defaults: [
          firebase.notifications.AndroidDefaults.SOUND,
          firebase.notifications.AndroidDefaults.VIBRATE,
        ],
      });
      v.defaults.should.be.Array();
      v.defaults.length.should.eql(2);
      v.defaults[0].should.eql(firebase.notifications.AndroidDefaults.SOUND);
      v.defaults[1].should.eql(firebase.notifications.AndroidDefaults.VIBRATE);
    });
  });

  describe('group', () => {
    it('throws if group is not a string', () => {
      try {
        validate({ group: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.group' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets a group', () => {
      const v = validate({ group: 'foobar' });
      v.group.should.eql('foobar');
    });
  });

  describe('groupAlertBehaviour', () => {
    it('throws if groupAlertBehaviour is invalid', () => {
      try {
        validate({ groupAlertBehaviour: 'foobar' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.groupAlertBehaviour' expected a valid AndroidGroupAlertBehavior",
        );
        return Promise.resolve();
      }
    });

    it('sets groupAlertBehaviour', () => {
      const v = validate({
        groupAlertBehaviour: firebase.notifications.AndroidGroupAlertBehavior.SUMMARY,
      });
      v.groupAlertBehaviour.should.eql(firebase.notifications.AndroidGroupAlertBehavior.SUMMARY);
    });
  });

  describe('groupSummary', () => {
    it('throws if groupSummary is not a boolean', () => {
      try {
        validate({ groupSummary: 'true' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.groupSummary' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets groupSummary', () => {
      const v = validate({ groupSummary: true });
      v.groupSummary.should.eql(true);
    });
  });

  describe('largeIcon', () => {
    it('throws if largeIcon is not a string', () => {
      try {
        validate({ largeIcon: true });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.largeIcon' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if largeIcon is not valid', () => {
      try {
        validate({ largeIcon: '' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.largeIcon' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets largeIcon', () => {
      const v = validate({ largeIcon: 'foobar' });
      v.largeIcon.should.eql('foobar');
    });
  });

  describe('lights', () => {
    it('thows if not an array', () => {
      try {
        validate({ lights: '#ffffff' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.lights' expected an array value containing the color, on ms and off ms",
        );
        return Promise.resolve();
      }
    });

    it('throws if color is invalid', () => {
      try {
        validate({ lights: ['ffffff'] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.lights' invalid color. Expected an AndroidColor or hexadecimal string value",
        );
        return Promise.resolve();
      }
    });

    it('throws if onMs is invalid', () => {
      try {
        validate({ lights: ['#ffffff', '123', 100] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          '\'notification.android.lights\' invalid "on" millisecond value, expected a number greater than 0',
        );
        return Promise.resolve();
      }
    });

    it('throws if onMs is less than 1', () => {
      try {
        validate({ lights: ['#ffffff', 0, 100] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          '\'notification.android.lights\' invalid "on" millisecond value, expected a number greater than 0',
        );
        return Promise.resolve();
      }
    });

    it('throws if offMs is invalid', () => {
      try {
        validate({ lights: ['#ffffff', 300, '123'] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          '\'notification.android.lights\' invalid "off" millisecond value, expected a number greater than 0',
        );
        return Promise.resolve();
      }
    });

    it('throws if offMs is less than 1', () => {
      try {
        validate({ lights: ['#ffffff', 300, 0] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          '\'notification.android.lights\' invalid "off" millisecond value, expected a number greater than 0',
        );
        return Promise.resolve();
      }
    });

    it('sets lights', () => {
      const v = validate({ lights: ['#ffffff', 300, 400] });
      v.lights.should.be.Array();
      v.lights[0].should.eql('#ffffff');
      v.lights[1].should.eql(300);
      v.lights[2].should.eql(400);
    });
  });

  describe('localOnly', () => {
    it('throws if localOnly is not a boolean', () => {
      try {
        validate({ localOnly: 'true' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.localOnly' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets localOnly', () => {
      const v = validate({ localOnly: true });
      v.localOnly.should.eql(true);
    });
  });

  describe('number', () => {
    it('throws if not a number', () => {
      try {
        validate({ number: '1' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.number' expected a number value");
        return Promise.resolve();
      }
    });

    it('sets a number', () => {
      const v = validate({ number: 1337 });
      v.number.should.eql(1337);
    });
  });

  describe('ongoing', () => {
    it('throws if ongoing is not a boolean', () => {
      try {
        validate({ ongoing: 'true' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.ongoing' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets ongoing', () => {
      const v = validate({ ongoing: true });
      v.ongoing.should.eql(true);
    });
  });

  describe('onlyAlertOnce', () => {
    it('throws if onlyAlertOnce is not a boolean', () => {
      try {
        validate({ onlyAlertOnce: 'true' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.onlyAlertOnce' expected a boolean value",
        );
        return Promise.resolve();
      }
    });

    it('sets onlyAlertOnce', () => {
      const v = validate({ onlyAlertOnce: true });
      v.onlyAlertOnce.should.eql(true);
    });
  });

  describe('priority', () => {
    it('throws if priority is not a valid', () => {
      try {
        validate({ priority: 'super important' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.priority' expected a valid AndroidPriority",
        );
        return Promise.resolve();
      }
    });

    it('sets priority', () => {
      const v = validate({ priority: firebase.notifications.AndroidPriority.LOW });
      v.priority.should.eql(firebase.notifications.AndroidPriority.LOW);
    });
  });

  describe('progress', () => {
    it('throws if priority is not an object', () => {
      try {
        validate({ progress: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("notification.android.progress' expected an object value");
        return Promise.resolve();
      }
    });

    it('throws if max progress is not a number', () => {
      try {
        validate({
          progress: {
            max: '123',
          },
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.progress.max' expected a number value");
        return Promise.resolve();
      }
    });

    it('throws if current progress is not a number', () => {
      try {
        validate({
          progress: {
            max: 10,
            current: '5',
          },
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.progress.current' expected a number value",
        );
        return Promise.resolve();
      }
    });

    it('throws if current progress greater than max', () => {
      try {
        validate({
          progress: {
            max: 10,
            current: 11,
          },
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.progress.current' current progress can not exceed max progress value",
        );
        return Promise.resolve();
      }
    });

    it('sets max and current progress', () => {
      const v = validate({
        progress: {
          max: 10,
          current: 5,
        },
      });
      v.progress.max.should.eql(10);
      v.progress.current.should.eql(5);
      v.progress.indeterminate.should.eql(false);
    });

    it('throws if indeterminate is not a boolean', () => {
      try {
        validate({
          progress: {
            max: 10,
            current: 5,
            indeterminate: 3,
          },
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.progress.indeterminate' expected a boolean value",
        );
        return Promise.resolve();
      }
    });

    it('sets indeterminate value', () => {
      const v = validate({
        progress: {
          max: 10,
          current: 5,
          indeterminate: true,
        },
      });
      v.progress.max.should.eql(10);
      v.progress.current.should.eql(5);
      v.progress.indeterminate.should.eql(true);
    });
  });

  describe('remoteInputHistory', () => {
    it('throws if value is not an array', () => {
      try {
        validate({
          remoteInputHistory: 'foo',
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.remoteInputHistory' expected an array of string values",
        );
        return Promise.resolve();
      }
    });

    it('throws if value is valid', () => {
      try {
        validate({
          remoteInputHistory: ['foo', 123],
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.remoteInputHistory' expected an array of string values",
        );
        return Promise.resolve();
      }
    });

    it('sets remote input history', () => {
      const v = validate({
        remoteInputHistory: ['foo', 'bar'],
      });
      v.remoteInputHistory.should.be.Array();
      v.remoteInputHistory.length.should.eql(2);
      v.remoteInputHistory[0].should.eql('foo');
      v.remoteInputHistory[1].should.eql('bar');
    });
  });

  describe('shortcutId', () => {
    it('throws if shortcutId is not a string', () => {
      try {
        validate({ shortcutId: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.shortcutId' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets shortcutId', () => {
      const v = validate({ shortcutId: 'foo' });
      v.shortcutId.should.eql('foo');
    });
  });

  describe('showWhenTimestamp', () => {
    it('throws if showWhenTimestamp is not a boolean', () => {
      try {
        validate({ showWhenTimestamp: 'true' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.showWhenTimestamp' expected a boolean value",
        );
        return Promise.resolve();
      }
    });

    it('sets showWhenTimestamp', () => {
      const v = validate({ showWhenTimestamp: true });
      v.showWhenTimestamp.should.eql(true);
    });
  });

  describe('smallIcon', () => {
    it('throws if smallIcon is not a string', () => {
      try {
        validate({ smallIcon: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql('expected an array containing icon with level or string value');
        return Promise.resolve();
      }
    });

    it('throws if smallIcon (w/ level) is not a string', () => {
      try {
        validate({ smallIcon: [123] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.smallIcon' expected icon to be a string",
        );
        return Promise.resolve();
      }
    });

    it('throws if smallIcon level (w/ level) is not a valid number', () => {
      try {
        validate({ smallIcon: ['foo', -1] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.smallIcon' expected level to be a positive number",
        );
        return Promise.resolve();
      }
    });

    it('sets smallIcon string', () => {
      const v = validate({ smallIcon: 'foo' });
      v.smallIcon.should.be.Array();
      v.smallIcon[0].should.eql('foo');
      v.smallIcon[1].should.eql(-1);
    });

    it('sets smallIcon string with level', () => {
      const v = validate({ smallIcon: ['foo', 2] });
      v.smallIcon.should.be.Array();
      v.smallIcon[0].should.be.eql('foo');
      v.smallIcon[1].should.be.eql(2);
    });
  });

  describe('sortKey', () => {
    it('throws if sortKey is not a string', () => {
      try {
        validate({ sortKey: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.sortKey' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets sortKey', () => {
      const v = validate({ sortKey: 'foo' });
      v.sortKey.should.eql('foo');
    });
  });

  describe('style', () => {
    it('throws if style is not an object', () => {
      try {
        validate({ style: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.style' expected an object value");
        return Promise.resolve();
      }
    });

    it('throws if style type is invalid', () => {
      try {
        validate({
          style: {
            type: 'custom',
          },
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.style' style type must be one of ");
        return Promise.resolve();
      }
    });

    describe('BigPictureStyle', () => {
      it('throws if picture is not a string', () => {
        try {
          validate({
            style: {
              type: firebase.notifications.AndroidStyle.BIGPICTURE,
              picture: 123,
            },
          });
          return Promise.reject(new Error('Did not throw Error'));
        } catch (e) {
          e.message.should.containEql(
            "'notification.android.style' BigPictureStyle: 'picture' expected a valid string value",
          );
          return Promise.resolve();
        }
      });

      it('throws if picture is not a valid string', () => {
        try {
          validate({
            style: {
              type: firebase.notifications.AndroidStyle.BIGPICTURE,
              picture: '',
            },
          });
          return Promise.reject(new Error('Did not throw Error'));
        } catch (e) {
          e.message.should.containEql(
            "'notification.android.style' BigPictureStyle: 'picture' expected a valid string value",
          );
          return Promise.resolve();
        }
      });

      it('sets a picture value', () => {
        const v = validate({
          style: {
            type: firebase.notifications.AndroidStyle.BIGPICTURE,
            picture: 'foo',
          },
        });
        v.style.picture.should.eql('foo');
        Object.keys(v.style).length.should.be.eql(2);
      });

      it('throws if largeIcon is not a valid string', () => {
        try {
          validate({
            style: {
              type: firebase.notifications.AndroidStyle.BIGPICTURE,
              picture: 'foo',
              largeIcon: 123,
            },
          });
          return Promise.reject(new Error('Did not throw Error'));
        } catch (e) {
          e.message.should.containEql(
            "'notification.android.style' BigPictureStyle: 'largeIcon' expected a string value",
          );
          return Promise.resolve();
        }
      });

      it('sets a largeIcon value', () => {
        const v = validate({
          style: {
            type: firebase.notifications.AndroidStyle.BIGPICTURE,
            picture: 'foo',
            largeIcon: 'bar',
          },
        });
        v.style.picture.should.eql('foo');
        v.style.largeIcon.should.eql('bar');
        Object.keys(v.style).length.should.be.eql(3);
      });

      it('throws if title is not a valid string', () => {
        try {
          validate({
            style: {
              type: firebase.notifications.AndroidStyle.BIGPICTURE,
              picture: 'foo',
              title: 123,
            },
          });
          return Promise.reject(new Error('Did not throw Error'));
        } catch (e) {
          e.message.should.containEql(
            "'notification.android.style' BigPictureStyle: 'title' expected a string value",
          );
          return Promise.resolve();
        }
      });

      it('sets a title value', () => {
        const v = validate({
          style: {
            type: firebase.notifications.AndroidStyle.BIGPICTURE,
            picture: 'foo',
            title: 'bar',
          },
        });
        v.style.picture.should.eql('foo');
        v.style.title.should.eql('bar');
        Object.keys(v.style).length.should.be.eql(3);
      });

      it('throws if summary is not a valid string', () => {
        try {
          validate({
            style: {
              type: firebase.notifications.AndroidStyle.BIGPICTURE,
              picture: 'foo',
              summary: 123,
            },
          });
          return Promise.reject(new Error('Did not throw Error'));
        } catch (e) {
          e.message.should.containEql(
            "'notification.android.style' BigPictureStyle: 'summary' expected a string value",
          );
          return Promise.resolve();
        }
      });

      it('sets a summary value', () => {
        const v = validate({
          style: {
            type: firebase.notifications.AndroidStyle.BIGPICTURE,
            picture: 'foo',
            summary: 'bar',
          },
        });
        v.style.picture.should.eql('foo');
        v.style.summary.should.eql('bar');
        Object.keys(v.style).length.should.be.eql(3);
      });

      it('sets all values', () => {
        const v = validate({
          style: {
            type: firebase.notifications.AndroidStyle.BIGPICTURE,
            picture: 'foo',
            largeIcon: 'bar',
            title: 'baz',
            summary: 'dave',
          },
        });
        v.style.picture.should.eql('foo');
        v.style.largeIcon.should.eql('bar');
        v.style.title.should.eql('baz');
        v.style.summary.should.eql('dave');
        Object.keys(v.style).length.should.be.eql(5);
      });
    });

    describe('BigTextStyle', () => {
      it('throws if text is not a string', () => {
        try {
          validate({
            style: {
              type: firebase.notifications.AndroidStyle.BIGTEXT,
              text: 123,
            },
          });
          return Promise.reject(new Error('Did not throw Error'));
        } catch (e) {
          e.message.should.containEql(
            "'notification.android.style' BigTextStyle: 'text' expected a valid string value",
          );
          return Promise.resolve();
        }
      });

      it('throws if text is not a valid string', () => {
        try {
          validate({
            style: {
              type: firebase.notifications.AndroidStyle.BIGTEXT,
              text: '',
            },
          });
          return Promise.reject(new Error('Did not throw Error'));
        } catch (e) {
          e.message.should.containEql(
            "'notification.android.style' BigTextStyle: 'text' expected a valid string value",
          );
          return Promise.resolve();
        }
      });

      it('sets a text value', () => {
        const v = validate({
          style: {
            type: firebase.notifications.AndroidStyle.BIGTEXT,
            text: 'foo',
          },
        });
        v.style.text.should.eql('foo');
        Object.keys(v.style).length.should.be.eql(2);
      });

      it('throws if title is not a valid string', () => {
        try {
          validate({
            style: {
              type: firebase.notifications.AndroidStyle.BIGTEXT,
              text: 'foo',
              title: 123,
            },
          });
          return Promise.reject(new Error('Did not throw Error'));
        } catch (e) {
          e.message.should.containEql(
            "'notification.android.style' BigTextStyle: 'title' expected a string value",
          );
          return Promise.resolve();
        }
      });

      it('sets a title value', () => {
        const v = validate({
          style: {
            type: firebase.notifications.AndroidStyle.BIGTEXT,
            text: 'foo',
            title: 'baz',
          },
        });
        v.style.text.should.eql('foo');
        v.style.title.should.eql('baz');
        Object.keys(v.style).length.should.be.eql(3);
      });

      it('throws if summary is not a valid string', () => {
        try {
          validate({
            style: {
              type: firebase.notifications.AndroidStyle.BIGTEXT,
              text: 'foo',
              summary: 123,
            },
          });
          return Promise.reject(new Error('Did not throw Error'));
        } catch (e) {
          e.message.should.containEql(
            "'notification.android.style' BigTextStyle: 'summary' expected a string value",
          );
          return Promise.resolve();
        }
      });

      it('sets a summary value', () => {
        const v = validate({
          style: {
            type: firebase.notifications.AndroidStyle.BIGTEXT,
            text: 'foo',
            summary: 'baz',
          },
        });
        v.style.text.should.eql('foo');
        v.style.summary.should.eql('baz');
        Object.keys(v.style).length.should.be.eql(3);
      });

      it('sets all values', () => {
        const v = validate({
          style: {
            type: firebase.notifications.AndroidStyle.BIGTEXT,
            text: 'foo',
            title: 'bar',
            summary: 'baz',
          },
        });
        v.style.text.should.eql('foo');
        v.style.title.should.eql('bar');
        v.style.summary.should.eql('baz');
        Object.keys(v.style).length.should.be.eql(4);
      });
    });
  });

  describe('ticker', () => {
    it('throws if ticker is not a string', () => {
      try {
        validate({ ticker: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.ticker' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets ticker', () => {
      const v = validate({ ticker: 'foo' });
      v.ticker.should.eql('foo');
    });
  });

  describe('timeoutAfter', () => {
    it('throws if timeoutAfter is not a number', () => {
      try {
        validate({ timeoutAfter: 'now' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.timeoutAfter' expected a number value");
        return Promise.resolve();
      }
    });

    it('throws if timestamp is invalid', () => {
      try {
        validate({ timeoutAfter: -1000 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.timeoutAfter' invalid millisecond timestamp",
        );
        return Promise.resolve();
      }
    });

    it('sets timeoutAfter', () => {
      const future = Date.now() + 10000;
      const v = validate({ timeoutAfter: future });
      v.timeoutAfter.should.eql(future);
    });
  });

  describe('usesChronometer', () => {
    it('throws if usesChronometer is not a boolean', () => {
      try {
        validate({ usesChronometer: 'true' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.usesChronometer' expected a boolean value",
        );
        return Promise.resolve();
      }
    });

    it('sets usesChronometer', () => {
      const v = validate({ usesChronometer: true });
      v.usesChronometer.should.eql(true);
    });
  });

  describe('vibrate', () => {
    it('throws if vibrate is not a boolean', () => {
      try {
        validate({ vibrate: 'true' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.vibrate' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets vibrate', () => {
      const v = validate({ vibrate: false });
      v.usesChronometer.should.eql(false);
    });
  });

  describe('vibrationPattern', () => {
    it('throws if vibrationPattern is not an array', () => {
      try {
        validate({ vibrationPattern: 'true' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.vibrationPattern' expected an array containing an even number of positive values",
        );
        return Promise.resolve();
      }
    });

    it('throws if vibratePattern does not have valid length', () => {
      try {
        validate({ vibrationPattern: [100, 200, 100] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.vibrationPattern' expected an array containing an even number of positive values",
        );
        return Promise.resolve();
      }
    });

    it('throws if vibrationPattern does not have valid values', () => {
      try {
        validate({ vibrationPattern: [100, '200'] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.vibrationPattern' expected an array containing an even number of positive values",
        );
        return Promise.resolve();
      }
    });

    it('throws if vibrationPattern value is less than 1', () => {
      try {
        validate({ vibrationPattern: [100, 0] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.vibrationPattern' expected an array containing an even number of positive values",
        );
        return Promise.resolve();
      }
    });

    it('sets vibrationPattern', () => {
      const v = validate({ vibrationPattern: [100, 200] });
      v.vibrationPattern.should.be.Array();
      v.vibrationPattern.length.should.eql(2);
      v.vibrationPattern[0].should.be.eql(100);
      v.vibrationPattern[1].should.be.eql(200);
    });
  });

  describe('when', () => {
    it('throws if vibrate is not a number', () => {
      try {
        validate({ when: 'tomorrow' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.when' expected a number value");
        return Promise.resolve();
      }
    });

    it('throws if when is not a valid timestamp', () => {
      try {
        validate({ when: -2000 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.when' invalid millisecond timestamp");
        return Promise.resolve();
      }
    });

    it('sets when', () => {
      const future = Date.now() + 10000;
      const v = validate({ when: future });
      v.when.should.eql(future);
    });
  });
});
