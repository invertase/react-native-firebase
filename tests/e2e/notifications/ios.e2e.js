const trigger = {
  type: 'push',
};

const notification = {
  trigger,
  title: 'Foo',
  subtitle: 'Bar',
  body: 'World',
  // badge: 0,
  payload: {
    foo: 'world',
  },
  // category: '',
  // 'content-available': 0,
  // 'user-text': '',
  // 'action-identifier': '',
};

describe('notifications() - iOS Only', () => {
  describe('getInitialNotification()', () => {
    xit('should be provided ', async () => {
      if (device.getPlatform() === 'ios') {
        await device.relaunchApp({ userNotification: notification });
        const initialNotification = await firebase
          .notifications()
          .getInitialNotification();

        initialNotification.action.should.equal(
          'com.apple.UNNotificationDefaultActionIdentifier'
        );

        initialNotification.notification.should.be.an.instanceOf(
          jet.require('src/modules/notifications/Notification')
        );

        initialNotification.notification.title.should.equal(notification.title);

        initialNotification.notification.subtitle.should.equal(
          notification.subtitle
        );

        initialNotification.notification.body.should.equal(notification.body);

        initialNotification.notification.data.foo.should.equal(
          notification.payload.foo
        );

        // TODO: Salakar: more validations
      }
    });
  });
});
