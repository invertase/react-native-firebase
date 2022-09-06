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

describe('messaging()', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      should.exist(app.messaging);
      app.messaging().app.should.equal(app);
    });
  });

  describe('setAutoInitEnabled()', function () {
    // These depend on `tests/firebase.json` having `messaging_auto_init_enabled` set to false the first time
    // The setting is persisted across restarts, reset to false after for local runs where prefs are sticky
    afterEach(async function () {
      await firebase.messaging().setAutoInitEnabled(false);
    });

    it('throws if enabled is not a boolean', function () {
      try {
        firebase.messaging().setAutoInitEnabled(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'enabled' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets the value', async function () {
      should.equal(firebase.messaging().isAutoInitEnabled, false);
      await firebase.messaging().setAutoInitEnabled(true);
      should.equal(firebase.messaging().isAutoInitEnabled, true);

      // Set it back to the default value for future runs in re-use mode
      await firebase.messaging().setAutoInitEnabled(false);
      should.equal(firebase.messaging().isAutoInitEnabled, false);
    });
  });

  describe('isDeviceRegisteredForRemoteMessages', function () {
    it('returns true on android', function () {
      if (device.getPlatform() === 'android') {
        should.equal(firebase.messaging().isDeviceRegisteredForRemoteMessages, true);
      } else {
        this.skip();
      }
    });
    it('defaults to false on ios before registering', async function () {
      if (device.getPlatform() === 'ios') {
        should.equal(firebase.messaging().isDeviceRegisteredForRemoteMessages, false);
        await firebase.messaging().registerDeviceForRemoteMessages();
        should.equal(firebase.messaging().isDeviceRegisteredForRemoteMessages, true);
      } else {
        this.skip();
      }
    });
  });

  describe('unregisterDeviceForRemoteMessages', function () {
    it('resolves on android, remains registered', async function () {
      if (device.getPlatform() === 'android') {
        await firebase.messaging().unregisterDeviceForRemoteMessages();
        should.equal(firebase.messaging().isDeviceRegisteredForRemoteMessages, true);
      } else {
        this.skip();
      }
    });
    it('successfully unregisters on ios', async function () {
      if (device.getPlatform() === 'ios') {
        should.equal(firebase.messaging().isDeviceRegisteredForRemoteMessages, true);
        await firebase.messaging().unregisterDeviceForRemoteMessages();
        should.equal(firebase.messaging().isDeviceRegisteredForRemoteMessages, false);
      } else {
        this.skip();
      }
    });
  });

  describe('hasPermission', function () {
    it('returns true android (default)', async function () {
      if (device.getPlatform() === 'android') {
        should.equal(await firebase.messaging().hasPermission(), true);
      } else {
        this.skip();
      }
    });
    it('returns -1 on ios (default)', async function () {
      if (device.getPlatform() === 'ios') {
        should.equal(await firebase.messaging().hasPermission(), -1);
      }
    });
  });

  describe('requestPermission', function () {
    it('resolves 1 on android', async function () {
      if (device.getPlatform() === 'android') {
        should.equal(await firebase.messaging().requestPermission(), 1);
      } else {
        this.skip();
      }
    });
  });

  describe('getAPNSToken', function () {
    it('resolves null on android', async function () {
      if (device.getPlatform() === 'android') {
        should.equal(await firebase.messaging().getAPNSToken(), null);
      } else {
        this.skip();
      }
    });
    it('resolves null on ios if using simulator', async function () {
      if (device.getPlatform() === 'ios') {
        should.equal(await firebase.messaging().getAPNSToken(), null);
      }
    });
  });

  describe('unsupported web sdk methods', function () {
    it('useServiceWorker should not error when called', function () {
      firebase.messaging().useServiceWorker();
    });
    it('usePublicVapidKey should not error when called', function () {
      firebase.messaging().usePublicVapidKey();
    });
  });

  describe('getInitialNotification', function () {
    it('returns null when no initial notification', async function () {
      should.strictEqual(await firebase.messaging().getInitialNotification(), null);
    });
  });

  describe('deleteToken()', function () {
    it('generate a new token after deleting', async function () {
      const token1 = await firebase.messaging().getToken();
      should.exist(token1);
      await firebase.messaging().deleteToken();
      const token2 = await firebase.messaging().getToken();
      should.exist(token2);
      token1.should.not.eql(token2);
    });
  });

  describe('onMessage()', function () {
    it('throws if listener is not a function', function () {
      try {
        firebase.messaging().onMessage({});
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'listener' expected a function");
        return Promise.resolve();
      }
    });

    xit('receives messages when the app is in the foreground', async function () {
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

  describe('onTokenRefresh()', function () {
    it('throws if listener is not a function', function () {
      try {
        firebase.messaging().onTokenRefresh({});
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'listener' expected a function");
        return Promise.resolve();
      }
    });
  });

  describe('onDeletedMessages()', function () {
    it('throws if listener is not a function', function () {
      try {
        firebase.messaging().onDeletedMessages(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'listener' expected a function");
        return Promise.resolve();
      }
    });
  });

  describe('onMessageSent()', function () {
    it('throws if listener is not a function', function () {
      try {
        firebase.messaging().onMessageSent(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'listener' expected a function");
        return Promise.resolve();
      }
    });
  });

  describe('onSendError()', function () {
    it('throws if listener is not a function', function () {
      try {
        firebase.messaging().onSendError('123');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'listener' expected a function");
        return Promise.resolve();
      }
    });
  });

  describe('setBackgroundMessageHandler()', function () {
    it('throws if handler is not a function', function () {
      try {
        firebase.messaging().setBackgroundMessageHandler('123');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'handler' expected a function");
        return Promise.resolve();
      }
    });

    // FIXME unfortunately this has started to fake locally as well. Disabling for now.
    xit('receives messages when the app is in the background', async function () {
      // This is slow and thus flaky in CI. It runs locally on android though.
      if (device.getPlatform() === 'android' && !global.isCI) {
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
      } else {
        this.skip();
      }
    });
  });

  describe('subscribeToTopic()', function () {
    it('throws if topic is not a string', function () {
      try {
        firebase.messaging().subscribeToTopic(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'topic' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if topic contains a /', function () {
      try {
        firebase.messaging().subscribeToTopic('foo/bar');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql('\'topic\' must not include "/"');
        return Promise.resolve();
      }
    });
  });

  describe('unsubscribeFromTopic()', function () {
    it('throws if topic is not a string', function () {
      try {
        firebase.messaging().unsubscribeFromTopic(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'topic' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if topic contains a /', function () {
      try {
        firebase.messaging().unsubscribeFromTopic('foo/bar');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql('\'topic\' must not include "/"');
        return Promise.resolve();
      }
    });
  });

  describe('setDeliveryMetricsExportToBigQuery()', function () {
    afterEach(async function () {
      await firebase.messaging().setDeliveryMetricsExportToBigQuery(false);
    });

    it('throws if enabled is not a boolean', function () {
      try {
        firebase.messaging().setDeliveryMetricsExportToBigQuery(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'enabled' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets the value', async function () {
      should.equal(firebase.messaging().isDeliveryMetricsExportToBigQueryEnabled, false);
      await firebase.messaging().setDeliveryMetricsExportToBigQuery(true);
      should.equal(firebase.messaging().isDeliveryMetricsExportToBigQueryEnabled, true);

      // Set it back to the default value for future runs in re-use mode
      await firebase.messaging().setDeliveryMetricsExportToBigQuery(false);
      should.equal(firebase.messaging().isDeliveryMetricsExportToBigQueryEnabled, false);
    });
  });
});
