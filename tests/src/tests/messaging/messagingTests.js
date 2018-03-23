function messagingTests({ describe, it, firebase }) {
  describe('FCM', () => {
    it('it should build a RemoteMessage', () => {
      const remoteMessage = new firebase.native.messaging.RemoteMessage();
      remoteMessage.setTo('305229645282');

      // all optional
      remoteMessage.setMessageId('foobar');
      remoteMessage.setTtl(12000);
      remoteMessage.setMessageType('something');
      remoteMessage.setData({
        string: 'hello',
      });

      // return json object so we can assert values
      const mOutput = remoteMessage.build();

      mOutput.messageId.should.equal('foobar');
      mOutput.ttl.should.equal(12000);
      mOutput.messageType.should.equal('something');
      mOutput.data.should.be.a.Object();

      // all data types should be a string as this is all that native accepts
      mOutput.data.string.should.equal('hello');

      return Promise.resolve();
    });

    it('should send a RemoteMessage', () => {
      const remoteMessage = new firebase.native.messaging.RemoteMessage();
      remoteMessage.setTo('305229645282');
      // all optional
      remoteMessage.setMessageId('foobar');
      remoteMessage.setTtl(12000);
      remoteMessage.setMessageType('something');
      remoteMessage.setData({
        string: 'hello',
      });

      firebase.native.messaging().sendMessage(remoteMessage);
      return Promise.resolve();
    });

    it('it should return fcm token from getToken', () => {
      const successCb = token => {
        token.should.be.a.String();
        return Promise.resolve();
      };

      return firebase.native
        .messaging()
        .getToken()
        .then(successCb);
    });

    it('it should create/remove onTokenRefresh listeners', () => {
      try {
        const unsub = firebase.native.messaging().onTokenRefresh(() => {});
        unsub();
      } catch (e) {
        return Promise.reject(e);
      }

      return Promise.resolve();
    });

    it('it should subscribe/unsubscribe to topics', () => {
      firebase.native.messaging().subscribeToTopic('foobar');
      firebase.native.messaging().unsubscribeFromTopic('foobar');
      return Promise.resolve();
    });

    it('it should show a notification', () => {
      const notification = new firebase.native.notifications.Notification();
      notification.setBody('My Notification Message').setTitle('Hello');
      notification.android.setChannelId('test');
      firebase.native.notifications().displayNotification(notification);

      return Promise.resolve();
    });
  });
}

export default messagingTests;
