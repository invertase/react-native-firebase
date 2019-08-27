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

const ID = {
  raw: 'foo-bar-baz',
  hash: -1220709030,
};

const bigText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae nisi nec ex scelerisque hendrerit. Donec accumsan leo non tellus iaculis efficitur. Integer egestas, sapien a viverra gravida, ex odio accumsan sapien, id finibus nibh leo in justo. Aenean ex dui, laoreet eu enim id, tempus tempor tellus. Nunc sit amet rutrum dui. Curabitur tincidunt vel tellus eget sodales. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas interdum ipsum vel neque aliquam, ut congue lectus gravida. Mauris rutrum vitae mi eget scelerisque. Duis non scelerisque sapien, sit amet fermentum elit.';

let testCount = 0;

android.describe('notifications', () => {
  beforeEach(async () => {
    // Prevents notifications not being delivered as we spam them
    if (testCount >= 8) {
      await device.launchApp({ newInstance: true });
      testCount = 0;
    }
    testCount++;

    await firebase.notifications().createChannel({
      name: 'Hello Foo',
      channelId: 'foo',
      importance: firebase.notifications.AndroidImportance.HIGH,
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
      const notificationId = await firebase.notifications().displayNotification({
        body: 'foo bar baz',
        android: {
          channelId: 'foo',
        },
      });

      const notification = await device.notifications.findById(notificationId);

      notification.text.should.eql('foo bar baz');
      notification.title.should.eql('');
      notification.subText.should.eql('');
    });

    it('creates a basic notification with custom id', async () => {
      const notificationId = await firebase.notifications().displayNotification({
        notificationId: ID.raw,
        body: 'foo bar baz',
        android: {
          channelId: 'foo',
        },
      });

      const notification = await device.notifications.findById(notificationId);
      should.equal(notification.id, ID.hash);
    });

    it('creates a notification with a custom tag', async () => {
      const notificationId = await firebase.notifications().displayNotification({
        body: 'foo bar baz',
        android: {
          channelId: 'foo',
          tag: 'foobarbaz',
        },
      });

      const notification = await device.notifications.findById(notificationId);
      notification.tag.should.containEql('foobarbaz');
    });

    it('creates with base data', async () => {
      const notificationId = await firebase.notifications().displayNotification({
        title: 'Hello',
        subtitle: 'World',
        body: 'foo bar baz3',
        android: {
          channelId: 'foo',
        },
      });

      const notification = await device.notifications.findById(notificationId);

      notification.text.should.eql('foo bar baz3');
      notification.title.should.eql('Hello');
      notification.subText.should.eql('World');
    });

    it('stores data on the notification', async () => {
      const data = {
        foo: 'bar',
        bar: 'invertase',
      };

      const notificationId = await firebase.notifications().displayNotification({
        title: 'foo6',
        body: 'foo bar baz5',
        android: {
          channelId: 'foo',
        },
        data,
      });

      const notification = await device.notifications.findById(notificationId);

      notification.text.should.eql('foo bar baz5');
      notification.data.foo.should.eql(data.foo);
      notification.data.bar.should.eql(data.bar);
    });

    describe('sound', () => {
      it('uses the default sound', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz5',
          android: {
            channelId: 'foo',
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.sound.should.containEql('system/notification_sound');
      });

      it('uses a custom sound', async () => {
        await firebase.notifications().createChannel({
          name: 'Custom Sound',
          channelId: 'sound',
          importance: firebase.notifications.AndroidImportance.HIGH,
          sound: 'hollow.mp3'
        });

        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz5',
          android: {
            channelId: 'sound',
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.sound.should.containEql('com.invertase.testing/');
      });
    });

    describe('actions', () => {
      // todo
    });

    describe('autoCancel', () => {
      it('sets autoCancel default on the notification', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
          },
        });

        const notification = await device.notifications.findById(notificationId);

        should.exist(notification);
      });

      it('sets autoCancel value on the notification', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            autoCancel: false,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });

    describe('badgeIconType', () => {
      it('sets badgeIconType on the notification', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            badgeIconType: firebase.notifications.AndroidBadgeIconType.LARGE,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });

    describe('category', () => {
      it('sets category on the notification', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            category: firebase.notifications.AndroidCategory.SOCIAL,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });

    describe('channelId', () => {
      it('uses the notification channel', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.channel.id.should.eql('foo');
      });
    });

    xdescribe('clickAction', () => {
      // todo native implementation
    });

    describe('color', () => {
      it('uses a predefined color', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            color: firebase.notifications.AndroidColor.AQUA,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        // https://convertingcolors.com/hex-color-00FFFF.html
        notification.color.should.containEql('00ffff');
      });

      it('uses a custom color', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            color: '#9C27B0',
          },
        });

        const notification = await device.notifications.findById(notificationId);
        // https://convertingcolors.com/hex-color-9C27B0.html
        notification.color.should.containEql('0xff9c27b0');
      });
    });

    describe('colorized', () => {
      it('sets default colorized', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.colorized.should.eql(false);
      });

      it('sets colorized', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            color: '#9C27B0',
            colorized: true,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        // https://convertingcolors.com/hex-color-9C27B0.html
        notification.color.should.containEql('0xff9c27b0');
        notification.colorized.should.eql(true);
      });
    });

    describe('contentInfo', () => {
      it('sets contentInfo', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          title: 'foo bar baz5',
          body: 'foo bar baz5',
          android: {
            channelId: 'foo',
            contentInfo: 'Content Information',
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.infoText.should.eql('Content Information');
      });
    });

    xdescribe('defaults', () => {
      // todo defaults
    });

    describe('group', () => {
      it('sets group', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            group: 'foo bar group',
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.group.should.equal('foo bar group');
      });
    });

    describe('groupAlertBehaviour', () => {
      it('sets groupAlertBehaviour', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            group: 'foo bar group',
            groupAlertBehavior: firebase.notifications.AndroidGroupAlertBehavior.CHILDREN,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.group.should.equal('foo bar group');

        notification.groupAlertBehavior.should.eql(
          firebase.notifications.AndroidGroupAlertBehavior.CHILDREN,
        );
      });
    });

    describe('groupSummary', () => {
      it('sets groupSummary', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            group: 'foo bar group',
            groupSummary: true,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });

    describe('largeIcon', () => {
      it('sets a HTTP large icon', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            largeIcon: 'https://static.invertase.io/assets/invertase-logo.png',
          },
        });

        const notification = await device.notifications.findById(notificationId);
        // TODO @salakar - largeIcon output test
        should.exist(notification);
      });

      // TODO not working
      xit('sets a mipmap large icon', async () => {
        await Utils.sleep(6000);
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            largeIcon: 'mipmap_test',
          },
        });
        const notification = await device.notifications.findById(notificationId);
        console.log(notification);
        await Utils.sleep(1000000);
        // TODO @salakar - largeIcon output test
        should.exist(notification);
      });

      it('sets a drawable large icon', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            largeIcon: 'ic_launcher',
          },
        });

        const notification = await device.notifications.findById(notificationId);
        // TODO @salakar - largeIcon output test
        should.exist(notification);
      });
    });

    describe('lights', () => {
      it('sets lights', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            lights: ['#C0392B', 300, 300],
          },
        });

        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });

    describe('localOnly', () => {
      it('sets localOnly', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            localOnly: true,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });

    describe('number', () => {
      it('sets custom number', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            number: 123,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.number.should.eql(123);
      });
    });

    describe('ongoing', () => {
      it('sets ongoing boolean', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            ongoing: true,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });

    describe('onlyAlertOnce', () => {
      it('sets onlyAlertOnce boolean', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            onlyAlertOnce: true,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });

    describe('priority', () => {
      it('sets priority', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            priority: firebase.notifications.AndroidPriority.MAX,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.priority.should.eql(firebase.notifications.AndroidPriority.MAX);
      });
    });

    describe('progress', () => {
      it('sets max/current progress', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            progress: {
              max: 10,
              current: 5,
            },
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.progress.should.eql(5);
        notification.progressMax.should.eql(10);
        notification.progressIndeterminate.should.eql(false);
      });

      it('sets indeterminate progress', async () => {
        const notificationId = await firebase.notifications().displayNotification({
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

        const notification = await device.notifications.findById(notificationId);
        notification.progress.should.eql(5);
        notification.progressMax.should.eql(10);
        notification.progressIndeterminate.should.eql(true);
      });
    });

    describe('remoteInputHistory', () => {
      it('sets remote input history', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            remoteInputHistory: ['Hello', 'World'],
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.remoteInputHistory.should.be.Array();
        notification.remoteInputHistory[0].should.be.eql('Hello');
        notification.remoteInputHistory[1].should.be.eql('World');
      });
    });

    describe('shortcutId', () => {
      it('sets shortcutId', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            shortcutId: 'foobarbaz',
          },
        });

        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });

    describe('showWhenTimestamp', () => {
      it('sets showWhenTimestamp', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            showWhenTimestamp: true,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.showWhen.should.eql(true);
      });
    });

    describe('smallIcon', () => {
      it('uses default ic_launcher drawable icon', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.icon.should.containEql('drawable/ic_launcher');
      });

      // TODO is this working? Comes up round with no icon...
      xit('uses a custom drawable icon', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            smallIcon: 'drawable_test'
          },
        });

        const notification = await device.notifications.findById(notificationId);
        console.log(notification);
        notification.icon.should.containEql('drawable/drawable_test');
      });
    });

    describe('sortKey', () => {
      it('sets sortKey', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            sortKey: 'abc',
          },
        });

        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });

    describe('style -> BigPictureStyle', () => {
      it('sets a big picture style', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            style: {
              type: firebase.notifications.AndroidStyle.BIGPICTURE,
              picture: 'https://static.invertase.io/assets/jet.png',
            },
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.style.should.equal('BigPictureStyle');
        notification.picture.should.be.String();
        notification.picture.length.should.be.greaterThan(1); // only way to check?
      });

      it('sets bigPicture with options', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            style: {
              type: firebase.notifications.AndroidStyle.BIGPICTURE,
              picture: 'https://static.invertase.io/assets/jet.png',
              largeIcon: 'https://static.invertase.io/assets/jet.png',
              title: 'Title override',
              summary: 'Summary override'
            },
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.style.should.equal('BigPictureStyle');
        notification.picture.should.be.String();
        notification.picture.length.should.be.greaterThan(1); // only way to check?

        notification['title.big'].should.eql('Title override');
        notification.summaryText.should.eql('Summary override');
        // notification.largeIcon.... // todo works, but needs test to check
      });
    });

    describe('style -> BigTextStyle', () => {
      it('sets a big text style', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            style: {
              type: firebase.notifications.AndroidStyle.BIGTEXT,
              text: bigText,
            },
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.style.should.equal('BigTextStyle');
        notification.bigText.should.eql(bigText);
      });

      it('sets bigText with options', async () => {
        const notificationId = await firebase.notifications().displayNotification({
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

        const notification = await device.notifications.findById(notificationId);
        notification.style.should.equal('BigTextStyle');
        notification.bigText.should.eql(bigText);
        notification['title.big'].should.eql('title expanded');
        notification.summaryText.should.eql('summary expanded');
      });
    });

    describe('ticker', () => {
      it('sets ticker', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            ticker: 'ticker value',
          },
        });

        const notification = await device.notifications.findById(notificationId);
        notification.tickerText.should.eql('ticker value');
      });
    });

    describe('timeoutAfter', () => {
      it('sets timeoutAfter', async () => {
        const timeout = Date.now() + 2000;
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            timeoutAfter: timeout,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });

    describe('usesChronometer', () => {
      it('sets usesChronometer', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            usesChronometer: true,
          },
        });
        const notification = await device.notifications.findById(notificationId);
        notification.showChronometer.should.eql(true);
      });
    });

    describe('vibrationPattern', () => {
      it('sets vibrationPattern', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            vibrationPattern: [300, 300],
          },
        });
        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });

    describe('visibility', () => {
      it('sets visibility', async () => {
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            visibility: firebase.notifications.AndroidVisibility.SECRET,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });

    describe('when', () => {
      it('sets when timestamp', async () => {
        const when = Date.now() + 3000000;
        const notificationId = await firebase.notifications().displayNotification({
          body: 'foo bar baz',
          android: {
            channelId: 'foo',
            when,
          },
        });

        const notification = await device.notifications.findById(notificationId);
        should.exist(notification);
      });
    });
  });
});
