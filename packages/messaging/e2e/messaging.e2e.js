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

describe('messaging()', function() {
  describe('namespace', function() {
    it('accessible from firebase.app()', function() {
      const app = firebase.app();
      should.exist(app.messaging);
      app.messaging().app.should.equal(app);
    });
  });

  describe('setAutoInitEnabled()', function() {
    it('throws if enabled is not a boolean', function() {
      try {
        firebase.messaging().setAutoInitEnabled(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'enabled' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets the value', async function() {
      should.equal(firebase.messaging().isAutoInitEnabled, true);
      await firebase.messaging().setAutoInitEnabled(false);
      should.equal(firebase.messaging().isAutoInitEnabled, false);

      // Set it back to the default value for future runs in re-use mode
      await firebase.messaging().setAutoInitEnabled(true);
      should.equal(firebase.messaging().isAutoInitEnabled, true);
    });
  });

  describe('isDeviceRegisteredForRemoteMessages', function() {
    android.it('returns true on android', () => {
      should.equal(firebase.messaging().isDeviceRegisteredForRemoteMessages, true);
    });
    it('defaults to false on ios before registering', function() {
      if (device.getPlatform() === 'ios') {
        should.equal(firebase.messaging().isDeviceRegisteredForRemoteMessages, false);
      }
    });
  });

  describe('unregisterDeviceForRemoteMessages', function() {
    android.it('resolves on android', async () => {
      await firebase.messaging().unregisterDeviceForRemoteMessages();
    });
  });

  describe('hasPermission', function() {
    android.it('returns true android (default)', async () => {
      should.equal(await firebase.messaging().hasPermission(), true);
    });
    it('returns -1 on ios (default)', async function() {
      if (device.getPlatform() === 'ios') {
        should.equal(await firebase.messaging().hasPermission(), -1);
      }
    });
  });

  describe('requestPermission', function() {
    android.it('resolves 1 on android', async () => {
      should.equal(await firebase.messaging().requestPermission(), 1);
    });
  });

  describe('getAPNSToken', function() {
    android.it('resolves null on android', async () => {
      should.equal(await firebase.messaging().getAPNSToken(), null);
    });
    it('resolves null on ios if using simulator', async function() {
      if (device.getPlatform() === 'ios') {
        should.equal(await firebase.messaging().getAPNSToken(), null);
      }
    });
  });

  describe('unsupported web sdk methods', function() {
    it('useServiceWorker should not error when called', function() {
      firebase.messaging().useServiceWorker();
    });
    it('usePublicVapidKey should not error when called', function() {
      firebase.messaging().usePublicVapidKey();
    });
  });

  describe('getInitialNotification', function() {
    it('returns null when no initial notification', async function() {
      should.equal(await firebase.messaging().getInitialNotification(), null);
    });
  });

  describe('getToken()', function() {
    it('throws if authorizedEntity is not a string', function() {
      try {
        firebase.messaging().getToken(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'authorizedEntity' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if scope is not a string', function() {
      try {
        firebase.messaging().getToken('123', 123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'scope' expected a string value");
        return Promise.resolve();
      }
    });
  });

  describe('deleteToken()', function() {
    it('throws if authorizedEntity is not a string', function() {
      try {
        firebase.messaging().deleteToken(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'authorizedEntity' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if scope is not a string', function() {
      try {
        firebase.messaging().deleteToken('123', 123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'scope' expected a string value");
        return Promise.resolve();
      }
    });

    xit('generate a new token after deleting', async function() {
      // const token1 = await firebase.messaging().getToken();

      await firebase.messaging().deleteToken();

      // const token2 = await firebase.messaging().getToken();
    });
  });

  describe('onMessage()', function() {
    it('throws if listener is not a function', function() {
      try {
        firebase.messaging().onMessage({});
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'listener' expected a function");
        return Promise.resolve();
      }
    });

    xit('receives messages when the app is in the foreground', async function() {
      const spy = sinon.spy();
      const unsubscribe = firebase.messaging().onMessage(spy);
      if (device.getPlatform() === 'ios') {
        await firebase.messaging().registerDeviceForRemoteMessages();
      }
      const token = await firebase.messaging().getToken();
      await TestsAPI.messaging().sendToDevice(token, {
        data: {
          foo: 'bar',
          doop: 'boop',
        },
      });
      await Utils.spyToBeCalledOnceAsync(spy);
      unsubscribe();
      spy.firstCall.args[0].should.be.an.Object();
      spy.firstCall.args[0].data.should.be.an.Object();
      spy.firstCall.args[0].data.foo.should.eql('bar');
    });
  });

  describe('onTokenRefresh()', function() {
    it('throws if listener is not a function', function() {
      try {
        firebase.messaging().onTokenRefresh({});
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'listener' expected a function");
        return Promise.resolve();
      }
    });
  });

  describe('onDeletedMessages()', function() {
    it('throws if listener is not a function', function() {
      try {
        firebase.messaging().onDeletedMessages(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'listener' expected a function");
        return Promise.resolve();
      }
    });
  });

  describe('onMessageSent()', function() {
    it('throws if listener is not a function', function() {
      try {
        firebase.messaging().onMessageSent(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'listener' expected a function");
        return Promise.resolve();
      }
    });
  });

  describe('onSendError()', function() {
    it('throws if listener is not a function', function() {
      try {
        firebase.messaging().onSendError('123');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'listener' expected a function");
        return Promise.resolve();
      }
    });
  });

  describe('setBackgroundMessageHandler()', function() {
    it('throws if handler is not a function', function() {
      try {
        firebase.messaging().setBackgroundMessageHandler('123');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'handler' expected a function");
        return Promise.resolve();
      }
    });

    android.it('receives messages when the app is in the background', async () => {
      // This is slow and thus flaky in CI. It runs locally though.
      if (global.isCI) {
        return;
      }
      const spy = sinon.spy();
      const token = await firebase.messaging().getToken();
      firebase.messaging().setBackgroundMessageHandler(remoteMessage => {
        spy(remoteMessage);
        return Promise.resolve();
      });

      await device.sendToHome();
      await TestsAPI.messaging().sendToDevice(token, {
        data: {
          foo: 'bar',
          doop: 'boop',
        },
      });
      await Utils.spyToBeCalledOnceAsync(spy);
      await device.launchApp({ newInstance: false });
      spy.firstCall.args[0].should.be.an.Object();
      spy.firstCall.args[0].data.should.be.an.Object();
      spy.firstCall.args[0].data.foo.should.eql('bar');
    });
  });

  describe('subscribeToTopic()', function() {
    it('throws if topic is not a string', function() {
      try {
        firebase.messaging().subscribeToTopic(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'topic' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if topic contains a /', function() {
      try {
        firebase.messaging().subscribeToTopic('foo/bar');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql('\'topic\' must not include "/"');
        return Promise.resolve();
      }
    });
  });

  describe('unsubscribeFromTopic()', function() {
    it('throws if topic is not a string', function() {
      try {
        firebase.messaging().unsubscribeFromTopic(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'topic' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if topic contains a /', function() {
      try {
        firebase.messaging().unsubscribeFromTopic('foo/bar');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql('\'topic\' must not include "/"');
        return Promise.resolve();
      }
    });
  });
});
