function messagingTests({ describe, it, firebase }) {
  describe('FCM', () => {
    it('it should build a RemoteMessage', () => {
      const remoteMessage = new firebase.native.messaging.RemoteMessage('305229645282');

      // all optional
      remoteMessage.setId('foobar');
      remoteMessage.setTtl(12000);
      remoteMessage.setType('something');
      remoteMessage.setData({
        object: { foo: 'bar ' },
        array: [1, 2, 3, 4, 5],
        string: 'hello',
        boolean: true,
        number: 123456,
      });

      // return json object so we can assert values
      const mOutput = remoteMessage.toJSON();

      mOutput.id.should.equal('foobar');
      mOutput.ttl.should.equal(12000);
      mOutput.type.should.equal('something');
      mOutput.data.should.be.a.Object();

      // all data types should be a string as this is all that native accepts
      mOutput.data.object.should.equal('[object Object]');
      mOutput.data.array.should.equal('1,2,3,4,5');
      mOutput.data.string.should.equal('hello');
      mOutput.data.number.should.equal('123456');

      return Promise.resolve();
    });

    it('should send a RemoteMessage', () => {
      const remoteMessage = new firebase.native.messaging.RemoteMessage('305229645282');

      // all optional
      remoteMessage.setId('foobar');
      remoteMessage.setTtl(12000);
      remoteMessage.setType('something');
      remoteMessage.setData({
        object: { foo: 'bar ' },
        array: [1, 2, 3, 4, 5],
        string: 'hello',
        number: 123456,
      });

      firebase.native.messaging().send(remoteMessage);
      return Promise.resolve();
    });

    it('it should return fcm token from getToken', () => {
      const successCb = (token) => {
        token.should.be.a.String();
        return Promise.resolve();
      };

      return firebase.native.messaging()
        .getToken()
        .then(successCb);
    });

    it('it should build a RemoteMessage', () => {
      const remoteMessage = new firebase.native.messaging.RemoteMessage('305229645282');

      // all optional
      remoteMessage.setId('foobar');
      remoteMessage.setTtl(12000);
      remoteMessage.setType('something');
      remoteMessage.setData({
        object: { foo: 'bar ' },
        array: [1, 2, 3, 4, 5],
        string: 'hello',
        boolean: true,
        number: 123456,
      });

      // return json object so we can assert values
      const mOutput = remoteMessage.toJSON();

      mOutput.id.should.equal('foobar');
      mOutput.ttl.should.equal(12000);
      mOutput.type.should.equal('something');
      mOutput.data.should.be.a.Object();

      // all data types should be a string as this is all that native accepts
      mOutput.data.object.should.equal('[object Object]');
      mOutput.data.array.should.equal('1,2,3,4,5');
      mOutput.data.string.should.equal('hello');
      mOutput.data.number.should.equal('123456');

      return Promise.resolve();
    });


    it('it should send a RemoteMessage', () => {
      const remoteMessage = new firebase.native.messaging.RemoteMessage('305229645282');

      // all optional
      remoteMessage.setId('foobar');
      remoteMessage.setTtl(12000);
      remoteMessage.setType('something');
      remoteMessage.setData({
        object: { foo: 'bar ' },
        array: [1, 2, 3, 4, 5],
        string: 'hello',
        number: 123456,
      });

      firebase.native.messaging().send(remoteMessage);
      return Promise.resolve();
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
      firebase.native.messaging().createLocalNotification({
        title: 'Hello',
        body: 'My Notification Message',
        big_text: "Is it me you're looking for?",
        sub_text: 'nope',
        show_in_foreground: true,
      });

      return Promise.resolve();
    });
  });
}

export default messagingTests;
