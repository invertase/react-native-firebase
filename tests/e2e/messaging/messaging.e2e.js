describe('messaging()', () => {
  describe('requestPermission()', () => {
    it('returns fcm token', async () => {
      if (device.getPlatform() === 'android') {
        await firebase.messaging().requestPermission();
      }
    });
  });

  describe('hasPermission()', () => {
    it('returns fcm token', async () => {
      const bool = await firebase.messaging().hasPermission();
      bool.should.be.Boolean();
      if (device.getPlatform() === 'android') {
        should.equal(bool, true);
      } else {
        should.equal(bool, false);
      }
    });
  });

  describe('RemoteMessage', () => {
    it('builds a remote message', async () => {
      const message = new firebase.messaging.RemoteMessage();
      message.messageId.should.be.a.String(); // default
      message.setMessageId('123');
      message.messageId.should.equal('123');

      message.setData({ foo: 'bar' });
      message.data.should.be.a.Object();

      should.equal(message.ttl, 3600); // default
      message.setTtl(666);
      should.equal(message.ttl, 666);

      should.equal(message.to, undefined);
      message.setTo('some-topic');

      message.build();
    });
  });

  describe('sendMessage()', () => {
    it('sends a message', async () => {
      const message = new firebase.messaging.RemoteMessage();
      message.setData({ foo: 'bar' });
      message.setMessageType('data');
      message.setTo(
        `${firebase.app().options.messagingSenderId}@gcm.googleapis.com`
      );
      await firebase.messaging().sendMessage(message);
      // TODO test with new firebase admin testing api
      // const { promise, resolve, reject } = Promise.defer();
      // const unsubscribe = firebase.messaging().onMessage(msg => {
      //   resolve();
      // });
      // await promise;
      // unsubscribe();
    });
  });

  describe('subscribeToTopic()', () => {
    it('subscribe without error', async () => {
      await firebase.messaging().subscribeToTopic('foo-bar-baz');
      // TODO test subscription with new firebase testing api
    });
  });

  describe('unsubscribeFromTopic()', () => {
    it('unsubscribe without error', async () => {
      await firebase.messaging().unsubscribeFromTopic('foo-bar-baz');
      // TODO test unsub with new firebase testing api
    });
  });

  describe('getToken()', () => {
    it('returns fcm token', async () => {
      const token = await firebase.messaging().getToken();
      token.should.be.a.String();
    });
  });

  describe('onTokenRefresh()', () => {
    it('triggers when token changes', async () => {
      let refreshedToken = null;
      let unsubscribe = null;

      const tokenBefore = await firebase.messaging().getToken();
      tokenBefore.should.be.a.String();

      const { promise, resolve, reject } = Promise.defer();
      unsubscribe = firebase.messaging().onTokenRefresh(newToken => {
        unsubscribe();

        try {
          newToken.should.be.a.String();
          tokenBefore.should.not.equal(newToken);
        } catch (e) {
          return reject(e);
        }

        refreshedToken = newToken;
        return resolve();
      });

      await firebase.messaging().deleteToken();
      await sleep(10000);
      await firebase.iid().delete();
      await sleep(10000);
      await firebase.iid().get();
      await sleep(1000);

      const tokenAfter = await firebase.messaging().getToken();
      tokenAfter.should.be.a.String();
      tokenBefore.should.not.equal(tokenAfter);

      // TODO ios triggers twice, on initial token and new
      if (device.getPlatform() === 'android') {
        tokenAfter.should.equal(refreshedToken);
      }

      await promise;

      await sleep(500);
    });
  });

  describe('deleteToken()', () => {
    it('deletes the current fcm token', async () => {
      // This call is racy. On my machine this fails about 40% of the time (over 50 reps)
      // If I sleep 2 seconds while the token does the auto-background fetch it is stable though
      await sleep(10000);

      const tokenBefore = await firebase.messaging().getToken();
      tokenBefore.should.be.a.String();
      await firebase.messaging().deleteToken();

      // This call is racy. On my machine this fails about 40% of the time (over 50 reps)
      // If I sleep 2 seconds while the token does the auto-background fetch it is stable though
      await sleep(10000);

      const tokenAfter = await firebase.messaging().getToken();
      tokenAfter.should.be.a.String();
      tokenBefore.should.not.equal(tokenAfter);
      await sleep(500);
    });
  });
});
