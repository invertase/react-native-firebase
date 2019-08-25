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

describe('notifications()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.notifications);
      app.notifications().app.should.equal(app);
    });
  });

  it('calls cancelAllNotifications without throwing', () => {
    // todo
  });

  describe('cancelNotification()', () => {
    it('throws if notificationId is not a string', () => {
      try {
        firebase.notifications().cancelNotification(123);
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notificationId' expected a string value");
        return Promise.resolve();
      }
    });

    it('cancels a notification', () => {
      // todo
    });
  });

  describe('createChannel()', () => {
    it('throws if channel is invalid', () => {
      try {
        firebase.notifications().createChannel(123);
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        // has own tests
        return Promise.resolve();
      }
    });

    it('creates a channel', () => {
      // todo
    });
  });

  describe('createChannels()', () => {
    it('throws if channels is not an array', () => {
      try {
        firebase.notifications().createChannels({});
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channels' expected an array of AndroidChannel");
        return Promise.resolve();
      }
    });

    it('throws if channels are invalid', () => {
      try {
        firebase.notifications().createChannels([{}]);
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        // has own tests
        e.message.should.containEql("'channels' a channel is invalid:");
        return Promise.resolve();
      }
    });

    it('creates a channel', () => {
      // todo
    });
  });

  describe('createChannelGroup()', () => {
    it('throws if channel group is invalid', () => {
      try {
        firebase.notifications().createChannelGroup(123);
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        // has own tests
        return Promise.resolve();
      }
    });

    it('creates a channel group', () => {
      // todo
    });
  });

  describe('createChannelGroups()', () => {
    it('throws if channel groups is not an array', () => {
      try {
        firebase.notifications().createChannelGroups({});
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'channelGroups' expected an array of AndroidChannelGroup");
        return Promise.resolve();
      }
    });

    it('throws if channel groups are invalid', () => {
      try {
        firebase.notifications().createChannelGroups([{}]);
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        // has own tests
        e.message.should.containEql("'channelGroups' a channel group is invalid:");
        return Promise.resolve();
      }
    });

    it('creates channel groups', () => {
      // todo
    });
  });

  describe('deleteChannel', () => {
    it('throws if channel id is not a string', () => {
      try {
        firebase.notifications().deleteChannel(123);
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        // has own tests
        e.message.should.containEql("'channelId' expected a string value");
        return Promise.resolve();
      }
    });

    it('deletes a channel', () => {
      // todo
    });
  });

  describe('deleteChannelGroup', () => {
    it('throws if channel group id is not a string', () => {
      try {
        firebase.notifications().deleteChannelGroup(123);
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        // has own tests
        e.message.should.containEql("'channelGroupId' expected a string value");
        return Promise.resolve();
      }
    });

    it('deletes a channel group', () => {
      // todo
    });
  });

  describe('displayNotification()', () => {
    it('throws if notification is invalid', () => {
      try {
        firebase.notifications().displayNotification('foobar');
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        // has own tests
        return Promise.resolve();
      }
    });

    it('displays a notification', () => {
      // todo
    });
  });

  xdescribe('getBadge()', () => {
    it('gets a value', async () => {
      await firebase.notifications.setBadge(123);
      const value = await firebase.getBadge();
      value.should.eql(123);
    });
  });

  xdescribe('setBadge()', () => {
    it('sets a value', async () => {
      await firebase.notifications.setBadge(234);
      const value = await firebase.getBadge();
      value.should.eql(243);
    });

    it('removes the badge', async () => {
      await firebase.notifications.setBadge(null);
      const value = await firebase.getBadge();
      should.equal(value, null);
    });
  });

  describe('getInitialNotification()', () => {
    // todo
  });

  describe('getScheduledNotifications()', () => {
    // todo
  });

  describe('onNotificationDisplayed()', () => {
    it('throws if function not provided', () => {
      try {
        firebase.notifications().onNotificationDisplayed('foobar');
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'observer' expected a function");
        return Promise.resolve();
      }
    });
  });

  describe('onNotificationOpened()', () => {
    it('throws if function not provided', () => {
      try {
        firebase.notifications().onNotificationOpened('foobar');
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'observer' expected a function");
        return Promise.resolve();
      }
    });
  });

  describe('removeAllDeliveredNotifications()', () => {
    // todo
  });

  describe('removeDeliveredNotification()', () => {
    it('throws if id is invalid', () => {
      try {
        firebase.notifications().removeDeliveredNotification(123);
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'notificationId' expected a string value");
        return Promise.resolve();
      }
    });

    it('removes delivered notification', () => {
      // todo
    });
  });

  describe('scheduleNotification()', () => {
    it('throws if notification is invalid', () => {
      try {
        firebase.notifications().scheduleNotification(123);
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        // own tests
        return Promise.resolve();
      }
    });

    it('throws if schedule is invalid', () => {
      try {
        firebase.notifications().scheduleNotification(
          {
            body: 'foobar',
          },
          'foo',
        );
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        // own tests
        return Promise.resolve();
      }
    });

    it('schedules a notification', () => {
      // todo
    });
  });
});
