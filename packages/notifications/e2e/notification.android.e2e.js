/*
 *  Copyright (c) 2016-present Invertase Limited & Contributors
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this library except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

const notificationId = {
  raw: 'foo-bar-baz',
  hash: -1220709030,
};

const bigText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae nisi nec ex scelerisque hendrerit. Donec accumsan leo non tellus iaculis efficitur. Integer egestas, sapien a viverra gravida, ex odio accumsan sapien, id finibus nibh leo in justo. Aenean ex dui, laoreet eu enim id, tempus tempor tellus. Nunc sit amet rutrum dui. Curabitur tincidunt vel tellus eget sodales. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas interdum ipsum vel neque aliquam, ut congue lectus gravida. Mauris rutrum vitae mi eget scelerisque. Duis non scelerisque sapien, sit amet fermentum elit.';

android.describe('notifications', () => {
  beforeEach(async () => {
    await firebase.notifications().createChannel({
      name: 'Hello Foo',
      channelId: 'foo',
    });
  });

  describe.only('android', () => {
    it('throws if a channel does not exist', async () => {
      try {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'idonotexist',
          },
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.code.should.containEql('notifications/channel-not-found');
        return Promise.resolve();
      }
    });

    it('creates a basic notification', async () => {
      await firebase.notifications().displayNotification({
        body: 'foo bar baz',
        android: {
          channelId: 'foo',
        },
      });

      const notification = await device.notifications.latest();

      notification.extras.text.should.eql('foo bar baz');
      notification.extras.title.should.eql('String '); // todo parser
      notification.extras.subText.should.eql('String '); // todo parser
    });

    it('creates a basic notification with custom id', async () => {
      await firebase.notifications().displayNotification({
        notificationId: notificationId.raw,
        body: 'foo bar baz',
        android: {
          channelId: 'foo',
        },
      });

      const notification = await device.notifications.latest();
      notification.key.should.containEql(notificationId.hash); // todo parser
    });

    it('creates a notification with a custom tag', async () => {
      await firebase.notifications().displayNotification({
        body: 'foo bar baz',
        android: {
          channelId: 'foo',
          tag: 'foobarbaz',
        },
      });

      const notification = await device.notifications.latest();
      notification.key.should.containEql('foobarbaz'); // todo parser
    });

    it('creates with base data', async () => {
      await firebase.notifications().displayNotification({
        title: 'Hello',
        subtitle: 'World',
        body: 'foo bar baz',
        android: {
          channelId: 'foo',
        },
      });

      const notification = await device.notifications.latest();

      notification.extras.text.should.eql('foo bar baz');
      notification.extras.title.should.eql('Hello');
      notification.extras.subText.should.eql('World');
    });

    it('stores data on the notification', async () => {
      const data = {
        foo: 'bar',
        bar: 'elliot',
      };

      await firebase.notifications().displayNotification({
        body: 'foo bar baz',
        android: {
          channelId: 'foo',
        },
        data,
      });

      const notification = await device.notifications.latest();
      console.log(notification);
      // notification.extras.text.should.eql('foo bar baz'); // TODO works if running on own, errors in row
      notification.extras.foo.should.eql(data.foo); // todo parser
      notification.extras.bar.should.eql(data.bar); // todo parser
    });

    it('uses a sound', () => {
      // TODO test sound?
    });

    describe('actions', () => {
      // todo
    });

    xdescribe('autoCancel', () => {
      it('sets autoCancel default on the notification', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
          },
        });

        const notification = await device.notifications.latest();
        // TODO autoCancel?
      });

      it('sets autoCancel default on the notification', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            autoCancel: false,
          },
        });

        const notification = await device.notifications.latest();
        // TODO autoCancel?
      });
    });

    xdescribe('badgeIconType', () => {
      it('sets badgeIconType on the notification', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            badgeIconType: firebase.notifications.AndroidBadgeIconType.LARGE,
          },
        });

        const notification = await device.notifications.latest();
        // TODO badgeIconType?
      });
    });

    xdescribe('category', () => {
      it('sets category on the notification', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            category: firebase.notifications.AndroidCategory.SOCIAL,
          },
        });

        const notification = await device.notifications.latest();
        console.log(notification);
        // TODO category?
      });
    });

    xdescribe('channelId', () => {
      // todo parser NotificationChannel
    });

    xdescribe('clickAction', () => {
      // todo native implementation
    });

    describe('color', () => {
      it('uses a predefined color', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            color: firebase.notifications.AndroidColor.AQUA,
          },
        });

        const notification = await device.notifications.latest();
        // https://convertingcolors.com/hex-color-00FFFF.html
        notification.color.should.containEql('00ffff');
      });

      it('uses a custom color', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            color: '#9C27B0',
          },
        });

        const notification = await device.notifications.latest();
        // https://convertingcolors.com/hex-color-9C27B0.html
        notification.color.should.containEql('0xff9c27b0');
      });
    });

    describe('colorized', () => {
      it('sets default colorized', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
          },
        });

        const notification = await device.notifications.latest();
        notification.extras.colorized.should.eql(false);
      });

      // todo setting colorized seems to remove the color?
      xit('sets colorized', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            color: '#9C27B0',
            colorized: true,
          },
        });

        const notification = await device.notifications.latest();
        // https://convertingcolors.com/hex-color-9C27B0.html
        notification.color.should.containEql('0xff9c27b0');
        notification.extras.colorized.should.eql(true);
      });
    });

    describe('contentInfo', () => {
      it('sets contentInfo', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            contentInfo: 'Content Information',
          },
        });

        const notification = await device.notifications.latest();
        notification.extras.infoText.should.eql('Content Information');
      });
    });

    xdescribe('defaults', () => {
      // todo defaults
    });

    describe('group', () => {
      it('sets group', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            group: 'foo bar group',
          },
        });

        const notification = await device.notifications.latest();
        notification.groupKey.should.containEql('foo bar group');
      });
    });

    describe('groupAlertBehaviour', () => {
      it('sets groupAlertBehaviour', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            group: 'foo bar group',
            groupAlertBehaviour: firebase.notifications.AndroidGroupAlertBehavior.CHILDREN,
          },
        });

        const notification = await device.notifications.latest();
        notification.groupKey.should.containEql('foo bar group');
        notification.groupAlertBehaviour.should.eql(
          firebase.notifications.AndroidGroupAlertBehavior.CHILDREN,
        );
      });
    });

    xdescribe('groupSummary', () => {
      it('sets groupSummary', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            group: 'foo bar group',
            groupSummary: true,
          },
        });

        const notification = await device.notifications.latest();
        // todo groupSumamry
      });
    });

    xdescribe('defaults', () => {
      // todo largeIcon
    });

    xdescribe('lights', () => {
      it('sets lights', async () => {
        await Utils.sleep(5000);
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            lights: ['#C0392B', 300, 300],
          },
        });

        const notification = await device.notifications.latest();
        console.log(notification);
        // todo lights - seems to work on native but no logs
      });
    });

    xdescribe('localOnly', () => {
      it('sets localOnly', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            localOnly: true,
          },
        });

        const notification = await device.notifications.latest();
        console.log(notification);
        // todo localOnly - seems to work on native but no logs
      });
    });

    describe('number', () => {
      it('sets custom number', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            number: 123,
          },
        });

        const notification = await device.notifications.latest();
        notification.number.should.eql(123);
      });
    });

    xdescribe('ongoing', () => {
      it('sets ongoing boolean', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            ongoing: true,
          },
        });

        const notification = await device.notifications.latest();
        // todo ongoing - seems to work on native but no logs
      });
    });

    xdescribe('onlyAlertOnce', () => {
      it('sets onlyAlertOnce boolean', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            onlyAlertOnce: true,
          },
        });

        const notification = await device.notifications.latest();
        // todo ongoing - seems to work on native but no logs
      });
    });

    describe('priority', () => {
      it('sets priority', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            priority: firebase.notifications.AndroidPriority.MAX,
          },
        });

        const notification = await device.notifications.latest();
        notification.priority.should.eql(firebase.notifications.AndroidPriority.MAX);
      });
    });

    describe('progress', () => {
      it('sets max/current progress', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            progress: {
              max: 10,
              current: 5,
            },
          },
        });

        const notification = await device.notifications.latest();
        notification.extras.progress.should.eql(5);
        notification.extras.progressMax.should.eql(10);
        notification.extras.progressIndeterminate.should.eql(false);
      });

      it('sets indeterminate progress', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            progress: {
              max: 10,
              current: 5,
              indeterminate: true,
            },
          },
        });

        const notification = await device.notifications.latest();
        notification.extras.progress.should.eql(5);
        notification.extras.progressMax.should.eql(10);
        notification.extras.progressIndeterminate.should.eql(true);
      });
    });

    xdescribe('remoteInputHistory', () => {
      // todo remoteInputHistory
    });

    xdescribe('shortcutId', () => {
      it('sets shortcutId', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            shortcutId: 'foobarbaz',
          },
        });

        const notification = await device.notifications.latest();
        console.log(notification);
        // todo shortcutId
      });
    });

    describe('showWhenTimestamp', () => {
      it('sets showWhenTimestamp', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            showWhenTimestamp: true,
          },
        });

        const notification = await device.notifications.latest();
        notification.extras.showWhen.should.eql(true);
      });
    });

    xdescribe('smallIcon', () => {
      // todo smallIcon
    });

    xdescribe('sortKey', () => {
      it('sets sortKey', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            sortKey: 'abc',
          },
        });

        const notification = await device.notifications.latest();
        console.log(notification);
        // todo sortkey
      });
    });

    describe('style -> BigPictureStyle', () => {
      // todo
    });

    describe('style -> BigTextStyle', () => {
      it('sets a big text style', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            style: {
              type: firebase.notifications.AndroidStyle.BIGTEXT,
              text: bigText,
            },
          },
        });

        const notification = await device.notifications.latest();
        notification.extras.template.should.containEql('BigTextStyle');
        notification.extras.bigText.should.eql(bigText);
      });

      it('sets bigText with options', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            style: {
              type: firebase.notifications.AndroidStyle.BIGTEXT,
              text: bigText,
              title: 'title expanded',
              summary: 'summary expanded',
            },
          },
        });

        const notification = await device.notifications.latest();
        console.log(notification);
        notification.extras.template.should.containEql('BigTextStyle');
        notification.extras.bigText.should.eql(bigText);
        notification.extras['title.big'].should.eql('title expanded');
        notification.extras.summaryText.should.eql('summary expanded');
      });
    });

    describe('ticker', () => {
      it('sets ticker', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            ticker: 'ticker value',
          },
        });

        const notification = await device.notifications.latest();
        notification.tickerText.should.eql('ticker value');
      });
    });

    xdescribe('timeoutAfter', () => {
      it('sets timeoutAfter', async () => {
        await Utils.sleep(3000);
        const timeout = Date.now() + 2000;
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            timeoutAfter: timeout,
          },
        });
        console.log(timeout);

        const notification = await device.notifications.latest();
        console.log(notification);
        // todo timeoutAfter
      });
    });

    describe('usesChronometer', () => {
      it('sets usesChronometer', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            usesChronometer: true,
          },
        });
        const notification = await device.notifications.latest();
        notification.extras.showChronometer.should.eql(true);
      });
    });

    xdescribe('vibrate', () => {
      it('sets vibrate', async () => {
        await Utils.sleep(3000);
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            vibrate: [300, 300],
          },
        });
        const notification = await device.notifications.latest();
        // todo vibrate - goes to native ok
      });
    });

    xdescribe('vibrate', () => {
      it('sets vibrate', async () => {
        await Utils.sleep(3000);
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            vibrate: [300, 300],
          },
        });
        const notification = await device.notifications.latest();
        // todo vibrate - goes to native ok (vibration = null)
      });
    });

    xdescribe('visibility', () => {
      it('sets visibility', async () => {
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            visibility: firebase.notifications.AndroidVisibility.SECRET,
          },
        });
        const notification = await device.notifications.latest();
        console.log(notification);
        // todo visibility
      });
    });

    xdescribe('when', () => {
      it('sets when timestamp', async () => {
        const when = Date.now() + 3000000;
        console.log(when);
        await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            when,
            // showWhenTimestamp: true,
            usesChronometer: true,
          },
        });
        const notification = await device.notifications.latest();
        // todo when - works, but no log
      });
    });
  });
});
