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

import AndroidPriority from '../lib/AndroidPriority';
import AndroidVisibility from '../lib/AndroidVisibility';
import AndroidCategory from '../lib/AndroidCategory';
import AndroidDefaults from '../lib/AndroidDefaults';
import AndroidGroupAlertBehavior from '../lib/AndroidGroupAlertBehavior';

let validate;

describe('notifications() Notification', () => {
  before(() => {
    const func = jet.require('packages/notifications/lib/validateAndroidNotification');
    validate = android => func({ body: 'foo', android });
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
      usesChronometer: false,
      vibrate: true,
      visibility: firebase.notifications.AndroidVisibility.PRIVATE,
    });

    jet.contextify(v.android).should.eql(expected);
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
      v.android.autoCancel.should.be.eql(false);
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
      v.android.badgeIconType.should.be.eql(firebase.notifications.AndroidBadgeIconType.LARGE);
    });
  });

  describe('bigPictureStyle', () => {
    it('throws if not an object', () => {
      try {
        validate({ bigPictureStyle: 'icon' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.bigPictureStyle' expected an object value",
        );
        return Promise.resolve();
      }
    });

    it('throws if picture is not a string', () => {
      try {
        validate({ bigPictureStyle: { picture: 123 } });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.bigPictureStyle.picture' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('throws if picture is not a valid string', () => {
      try {
        validate({ bigPictureStyle: { picture: '' } });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.bigPictureStyle.picture' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('sets a picture value', () => {
      const v = validate({ bigPictureStyle: { picture: 'foo' } });
      v.android.bigPictureStyle.picture.should.eql('foo');
      Object.keys(v.android.bigPictureStyle).length.should.be.eql(1);
    });

    it('throws if largeIcon is not a valid string', () => {
      try {
        validate({ bigPictureStyle: { picture: 'foo', largeIcon: 123 } });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.bigPictureStyle.largeIcon' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('sets a largeIcon value', () => {
      const v = validate({ bigPictureStyle: { picture: 'foo', largeIcon: 'bar' } });
      v.android.bigPictureStyle.picture.should.eql('foo');
      v.android.bigPictureStyle.largeIcon.should.eql('bar');
      Object.keys(v.android.bigPictureStyle).length.should.be.eql(2);
    });

    it('throws if contentTitle is not a valid string', () => {
      try {
        validate({ bigPictureStyle: { picture: 'foo', contentTitle: 123 } });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.bigPictureStyle.contentTitle' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('sets a contentTitle value', () => {
      const v = validate({ bigPictureStyle: { picture: 'foo', contentTitle: 'bar' } });
      v.android.bigPictureStyle.picture.should.eql('foo');
      v.android.bigPictureStyle.contentTitle.should.eql('bar');
      Object.keys(v.android.bigPictureStyle).length.should.be.eql(2);
    });

    it('throws if summaryText is not a valid string', () => {
      try {
        validate({ bigPictureStyle: { picture: 'foo', summaryText: 123 } });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.bigPictureStyle.summaryText' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('sets a summaryText value', () => {
      const v = validate({ bigPictureStyle: { picture: 'foo', summaryText: 'bar' } });
      v.android.bigPictureStyle.picture.should.eql('foo');
      v.android.bigPictureStyle.summaryText.should.eql('bar');
      Object.keys(v.android.bigPictureStyle).length.should.be.eql(2);
    });

    it('sets all values', () => {
      const v = validate({
        bigPictureStyle: {
          picture: 'foo',
          largeIcon: 'bar',
          contentTitle: 'baz',
          summaryText: 'dave',
        },
      });
      v.android.bigPictureStyle.picture.should.eql('foo');
      v.android.bigPictureStyle.largeIcon.should.eql('bar');
      v.android.bigPictureStyle.contentTitle.should.eql('baz');
      v.android.bigPictureStyle.summaryText.should.eql('dave');
      Object.keys(v.android.bigPictureStyle).length.should.be.eql(4);
    });
  });

  describe('bigTextStyle', () => {
    it('throws if not an object', () => {
      try {
        validate({ bigTextStyle: 'icon' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notification.android.bigTextStyle' expected an object value");
        return Promise.resolve();
      }
    });

    it('throws if text is not a string', () => {
      try {
        validate({ bigTextStyle: { text: 123 } });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.bigTextStyle.text' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('throws if text is not a valid string', () => {
      try {
        validate({ bigTextStyle: { text: '' } });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.bigTextStyle.text' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('sets a text value', () => {
      const v = validate({ bigTextStyle: { text: 'foo' } });
      v.android.bigTextStyle.text.should.eql('foo');
      Object.keys(v.android.bigTextStyle).length.should.be.eql(1);
    });

    it('throws if contentTitle is not a valid string', () => {
      try {
        validate({ bigTextStyle: { text: 'foo', contentTitle: 123 } });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.bigTextStyle.contentTitle' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('sets a contentTitle value', () => {
      const v = validate({ bigTextStyle: { text: 'foo', contentTitle: 'baz' } });
      v.android.bigTextStyle.text.should.eql('foo');
      v.android.bigTextStyle.contentTitle.should.eql('baz');
      Object.keys(v.android.bigTextStyle).length.should.be.eql(2);
    });

    it('throws if summaryText is not a valid string', () => {
      try {
        validate({ bigTextStyle: { text: 'foo', summaryText: 123 } });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.bigTextStyle.summaryText' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('sets a summaryText value', () => {
      const v = validate({ bigTextStyle: { text: 'foo', summaryText: 'baz' } });
      v.android.bigTextStyle.text.should.eql('foo');
      v.android.bigTextStyle.summaryText.should.eql('baz');
      Object.keys(v.android.bigTextStyle).length.should.be.eql(2);
    });

    it('sets all values', () => {
      const v = validate({
        bigTextStyle: {
          text: 'foo',
          contentTitle: 'baz',
          summaryText: 'baz',
        },
      });
      v.android.bigTextStyle.text.should.eql('foo');
      v.android.bigTextStyle.contentTitle.should.eql('bar');
      v.android.bigTextStyle.summaryText.should.eql('baz');
      Object.keys(v.android.bigTextStyle).length.should.be.eql(3);
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
      v.android.category.should.eql(firebase.notifications.AndroidCategory.EMAIL);
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
      v.android.channelId.should.eql('foobar');
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
      v.android.clickAction.should.eql('foobar');
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

      v1.android.color.should.eql(firebase.notifications.AndroidColor.GREEN);
      v1.android.color.should.eql('#ffffff');
      v1.android.color.should.eql('#80ffffff');
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
      v.android.colorized.should.eql(true);
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
      v.android.contentInfo.should.eql('foo bar');
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
      v.android.defaults.should.be.Array();
      v.android.defaults.length.should.eql(2);
      v.android.defaults[0].should.eql(firebase.notifications.AndroidDefaults.SOUND);
      v.android.defaults[1].should.eql(firebase.notifications.AndroidDefaults.VIBRATE);
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
      v.android.group.should.eql('foobar');
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
      v.android.groupAlertBehaviour.should.eql(
        firebase.notifications.AndroidGroupAlertBehavior.SUMMARY,
      );
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
      v.android.groupSummary.should.eql(true);
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
        e.message.should.containEql(
          "'notification.android.largeIcon' expected a valid string value",
        );
        return Promise.resolve();
      }
    });

    it('sets largeIcon', () => {
      const v = validate({ largeIcon: 'foobar' });
      v.android.largeIcon.should.eql('foobar');
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
        validate({ lights: ['#ffffff', '123'] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          `'notification.android.lights' invalid "on" millisecond value, expected a number greater than 0`,
        );
        return Promise.resolve();
      }
    });

    it('throws if onMs is less than 1', () => {
      try {
        validate({ lights: ['#ffffff', 0] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          `'notification.android.lights' invalid "on" millisecond value, expected a number greater than 0`,
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
          `'notification.android.lights' invalid "off" millisecond value, expected a number greater than 0`,
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
          `'notification.android.lights' invalid "off" millisecond value, expected a number greater than 0`,
        );
        return Promise.resolve();
      }
    });

    it('sets lights', () => {
      const v = validate({ lights: ['#ffffff', 300, 400] });
      v.android.lights.should.be.Array();
      v.android.lights[0].should.eql('#ffffff');
      v.android.lights[1].should.eql(300);
      v.android.lights[2].should.eql(400);
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
      v.android.localOnly.should.eql(true);
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
      v.android.number.should.eql(1337);
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
      v.android.ongoing.should.eql(true);
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
      v.android.onlyAlertOnce.should.eql(true);
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
      v.android.priority.should.eql(firebase.notifications.AndroidPriority.LOW);
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
      v.android.progress.max.should.eql(10);
      v.android.progress.current.should.eql(5);
      v.android.progress.indeterminate.should.eql(false);
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
      v.android.progress.max.should.eql(10);
      v.android.progress.current.should.eql(5);
      v.android.progress.indeterminate.should.eql(true);
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
      v.android.remoteInputHistory.should.be.Array();
      v.android.remoteInputHistory.length.should.eql(2);
      v.android.remoteInputHistory[0].should.eql('foo');
      v.android.remoteInputHistory[1].should.eql('bar');
    });
  });

  describe('shortcutId', () => {
    it('throws if shortcutId is not a string', () => {
      try {
        validate({ shortcutId: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.shortcutId' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('sets shortcutId', () => {
      const v = validate({ shortcutId: 'foo' });
      v.android.shortcutId.should.eql('foo');
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
      v.android.showWhenTimestamp.should.eql(true);
    });
  });

  describe('smallIcon', () => {
    it('throws if smallIcon is not a string', () => {
      try {
        validate({ smallIcon: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.smallIcon' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('sets smallIcon', () => {
      const v = validate({ smallIcon: 'foo' });
      v.android.smallIcon.should.eql('foo');
    });
  });

  describe('sortKey', () => {
    it('throws if sortKey is not a string', () => {
      try {
        validate({ sortKey: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.sortKey' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('sets sortKey', () => {
      const v = validate({ sortKey: 'foo' });
      v.android.sortKey.should.eql('foo');
    });
  });

  describe('ticker', () => {
    it('throws if ticker is not a string', () => {
      try {
        validate({ sortKey: 123 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.ticker' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('sets ticker', () => {
      const v = validate({ ticker: 'foo' });
      v.android.ticker.should.eql('foo');
    });
  });

  describe('timeoutAfter', () => {
    it('throws if timeoutAfter is not a number', () => {
      try {
        validate({ timeoutAfter: 'now' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.timeoutAfter' expected a number value",
        );
        return Promise.resolve();
      }
    });

    it('throws if timestamp is invalid', () => {
      try {
        validate({ timeoutAfter: Date.now() - 1000 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.timeoutAfter' invalid millisecond timestamp, date must be in the future",
        );
        return Promise.resolve();
      }
    });

    it('sets timeoutAfter', () => {
      const future = Date.now() + 10000;
      const v = validate({ timeoutAfter: future });
      v.android.ticker.should.eql(future);
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
      v.android.usesChronometer.should.eql(true);
    });
  });

  describe('vibrate', () => {
    it('throws if vibrate is not a boolean', () => {
      try {
        validate({ vibrate: 'true' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.vibrate' expected a boolean value",
        );
        return Promise.resolve();
      }
    });

    it('sets vibrate', () => {
      const v = validate({ vibrate: false });
      v.android.usesChronometer.should.eql(false);
    });
  });

  describe('vibratePattern', () => {
    it('throws if vibratePattern is not an array', () => {
      try {
        validate({ vibratePattern: 'true' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.vibratePattern' expected an array containing positive number values",
        );
        return Promise.resolve();
      }
    });

    it('throws if vibratePattern does not have valid length', () => {
      try {
        validate({ vibratePattern: [100, 200, 100] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.vibratePattern' expected an array containing positive number values",
        );
        return Promise.resolve();
      }
    });

    it('throws if vibratePattern does not have valid values', () => {
      try {
        validate({ vibratePattern: [100, '200'] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.vibratePattern' expected an array containing positive number values",
        );
        return Promise.resolve();
      }
    });

    it('throws if vibratePattern value is less than 1', () => {
      try {
        validate({ vibratePattern: [100, 0] });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.vibratePattern' expected an array containing positive number values",
        );
        return Promise.resolve();
      }
    });

    it('sets vibratePattern', () => {
      const v = validate({ vibratePattern: [100, 200] });
      v.android.vibratePattern.should.be.Array();
      v.android.vibratePattern.length.should.eql(2);
      v.android.vibratePattern[0].should.be.eql(100);
      v.android.vibratePattern[1].should.be.eql(200);
    });
  });

  describe('when', () => {
    it('throws if vibrate is not a number', () => {
      try {
        validate({ when: 'tomorrow' });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.when' expected a number value",
        );
        return Promise.resolve();
      }
    });

    it('throws if when is not a valid timestamp', () => {
      try {
        validate({ when: Date.now() - 2000 });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql(
          "'notification.android.when' invalid millisecond timestamp, date must be in the future",
        );
        return Promise.resolve();
      }
    });

    it('sets when', () => {
      const future = Date.now() + 10000;
      const v = validate({ when: future });
      v.android.when.should.eql(future);
    });
  });
});
