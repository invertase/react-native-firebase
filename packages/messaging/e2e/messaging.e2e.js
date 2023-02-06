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

async function isSimulator() {
  return await DeviceInfo.isEmulator();
}

async function isAPNSCapableSimulator() {
  supportedAbis = await DeviceInfo.supportedAbis(); // looking for an ARM Simulator implying M1 host
  iosVersionMajor = DeviceInfo.getSystemVersion().split('.')[0]; // looking for iOS16+
  macOSVersionMajor = require('os').release().split('.')[0]; // host macOS13+ has Darwin kernel 22+
  if (macOSVersionMajor >= 22 && supportedAbis.includes('ARM64E') && iosVersionMajor >= 16) {
    return true;
  }
  return false;
}

describe('messaging()', function () {
  describe('firebase v8 compatibility', function () {
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
          await firebase.messaging().unregisterDeviceForRemoteMessages();
          should.equal(firebase.messaging().isDeviceRegisteredForRemoteMessages, false);
          await firebase.messaging().registerDeviceForRemoteMessages();
          should.equal(firebase.messaging().isDeviceRegisteredForRemoteMessages, true);
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
      it('resolves on ios with token on supported simulators', async function () {
        // Make sure we are registered for remote notifications, else no token
        await firebase.messaging().registerDeviceForRemoteMessages();

        if (device.getPlatform() === 'ios') {
          apnsToken = await firebase.messaging().getAPNSToken();

          simulator = await isSimulator();
          aPNSCapableSimulator = await isAPNSCapableSimulator();

          if (!simulator || (simulator && aPNSCapableSimulator)) {
            apnsToken.should.be.a.String();
          } else {
            // unsupported iOS Simulator returns null (typically,
            // can attempt-but-fail if M1 Simulator but not macOS13+/ios16+, rare combo)
            if (apnsToken !== null) {
              apnsToken.should.be.a.String();
            }
          }
        } else {
          this.skip();
        }
      });
    });

    describe('setAPNSToken', function () {
      it('requires a token parameter', async function () {
        try {
          firebase.messaging().setAPNSToken();
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'token' expected a string value");
        }
        try {
          firebase.messaging().setAPNSToken(123);
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'token' expected a string value");
          return Promise.resolve();
        }
      });

      it('verifies type parameter is valid if specified', async function () {
        try {
          firebase.messaging().setAPNSToken('typeparamtest', 123);
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'type' expected one of 'prod', 'sandbox', or 'unknown'");
        }
        try {
          firebase.messaging().setAPNSToken('typeparamtest', 'bogus');
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'type' expected one of 'prod', 'sandbox', or 'unknown'");
        }
      });

      it('resolves on android', async function () {
        if (device.getPlatform() === 'android') {
          should.equal(await firebase.messaging().setAPNSToken('foo'), null);
        } else {
          this.skip();
        }
      });

      it('correctly sets new token on ios', async function () {
        if (device.getPlatform() === 'ios') {
          originalAPNSToken = await firebase.messaging().getAPNSToken();
          // 74657374696E67746F6B656E is hex for "testingtoken"
          await firebase.messaging().setAPNSToken('74657374696E67746F6B656E', 'unknown');
          newAPNSToken = await firebase.messaging().getAPNSToken();
          newAPNSToken.should.eql('74657374696E67746F6B656E');
          newAPNSToken.should.not.eql(originalAPNSToken);
          if (originalAPNSToken !== null) {
            await firebase.messaging().setAPNSToken(originalAPNSToken);
          }
        } else {
          this.skip();
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

    describe('getToken()', function () {
      it('should throw Error with wrong parameters types', async function () {
        try {
          await firebase.messaging().getToken({ appName: 33 });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'appName' expected a string");
        }

        try {
          await firebase.messaging().getToken({ senderId: 33 });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'senderId' expected a string.");
          return Promise.resolve();
        }
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

    describe('isSupported()', function () {
      it('should return "true" if the device or browser supports Firebase Messaging', async function () {
        // For android, when the play services are available, it will return "true"
        // iOS & web always return "true". Web can be fully implemented when the platform is supported
        should.equal(await firebase.messaging().isSupported(), true);
      });
    });
  });

  describe('firebase v9 modular API', function () {
    describe('getMessaging', function () {
      it('pass app as argument', function () {
        const { getMessaging } = messagingModular;

        const messaging = getMessaging(firebase.app());

        messaging.constructor.name.should.be.equal('FirebaseMessagingModule');
      });

      it('no app as argument', function () {
        const { getMessaging } = messagingModular;

        const messaging = getMessaging();

        messaging.constructor.name.should.be.equal('FirebaseMessagingModule');
      });
    });

    describe('setAutoInitEnabled()', function () {
      // These depend on `tests/firebase.json` having `messaging_auto_init_enabled` set to false the first time
      // The setting is persisted across restarts, reset to false after for local runs where prefs are sticky
      afterEach(async function () {
        const { getMessaging, setAutoInitEnabled } = messagingModular;
        await setAutoInitEnabled(getMessaging(), false);
      });

      it('throws if enabled is not a boolean', async function () {
        const { getMessaging, setAutoInitEnabled } = messagingModular;
        try {
          await setAutoInitEnabled(getMessaging(), 123);

          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'enabled' expected a boolean value");
          return Promise.resolve();
        }
      });

      it('sets the value', async function () {
        const { getMessaging, isAutoInitEnabled, setAutoInitEnabled } = messagingModular;
        should.equal(isAutoInitEnabled(getMessaging()), false);
        await firebase.messaging().setAutoInitEnabled(true);
        should.equal(isAutoInitEnabled(getMessaging()), true);

        // Set it back to the default value for future runs in re-use mode
        await setAutoInitEnabled(getMessaging(), false);
        should.equal(firebase.messaging().isAutoInitEnabled, false);
      });
    });

    describe('isDeviceRegisteredForRemoteMessages default state', function () {
      it('returns true on android', function () {
        const { getMessaging, isDeviceRegisteredForRemoteMessages } = messagingModular;

        if (device.getPlatform() === 'android') {
          should.equal(isDeviceRegisteredForRemoteMessages(getMessaging()), true);
        } else {
          this.skip();
        }
      });
    });

    describe('remote message device register / unregister', function () {
      it('resolves on android, remains registered', async function () {
        const {
          getMessaging,
          unregisterDeviceForRemoteMessages,
          isDeviceRegisteredForRemoteMessages,
        } = messagingModular;

        if (device.getPlatform() === 'android') {
          await unregisterDeviceForRemoteMessages(getMessaging());
          should.equal(isDeviceRegisteredForRemoteMessages(getMessaging()), true);
        } else {
          this.skip();
        }
      });
      it('successfully unregisters on ios', async function () {
        const {
          getMessaging,
          unregisterDeviceForRemoteMessages,
          isDeviceRegisteredForRemoteMessages,
          registerDeviceForRemoteMessages,
        } = messagingModular;

        if (device.getPlatform() === 'ios') {
          await unregisterDeviceForRemoteMessages(getMessaging());
          should.equal(isDeviceRegisteredForRemoteMessages(getMessaging()), false);
          await registerDeviceForRemoteMessages(getMessaging());
          should.equal(isDeviceRegisteredForRemoteMessages(getMessaging()), true);
        } else {
          this.skip();
        }
      });
    });

    describe('hasPermission', function () {
      it('returns true android (default)', async function () {
        const { getMessaging, hasPermission } = messagingModular;
        if (device.getPlatform() === 'android') {
          should.equal(await hasPermission(getMessaging()), true);
        } else {
          this.skip();
        }
      });
      it('returns -1 on ios (default)', async function () {
        const { getMessaging, hasPermission } = messagingModular;
        if (device.getPlatform() === 'ios') {
          should.equal(await hasPermission(getMessaging()), -1);
        }
      });
    });

    describe('requestPermission', function () {
      it('resolves 1 on android', async function () {
        const { getMessaging, requestPermission } = messagingModular;
        if (device.getPlatform() === 'android') {
          should.equal(await requestPermission(getMessaging()), 1);
        } else {
          this.skip();
        }
      });
    });

    describe('getAPNSToken', function () {
      it('resolves null on android', async function () {
        const { getMessaging, getAPNSToken } = messagingModular;
        if (device.getPlatform() === 'android') {
          should.equal(await getAPNSToken(getMessaging()), null);
        } else {
          this.skip();
        }
      });
      it('resolves on ios with token on supported simulators', async function () {
        // Make sure we are registered for remote notifications, else no token
        const { getMessaging, getAPNSToken, registerDeviceForRemoteMessages } = messagingModular;
        await registerDeviceForRemoteMessages(getMessaging());

        if (device.getPlatform() === 'ios') {
          apnsToken = await getAPNSToken(getMessaging());

          simulator = await isSimulator();
          aPNSCapableSimulator = await isAPNSCapableSimulator();

          if (!simulator || (simulator && aPNSCapableSimulator)) {
            apnsToken.should.be.a.String();
          } else {
            // unsupported iOS Simulator returns null (typically,
            // can attempt-but-fail if M1 Simulator but not macOS13+/ios16+, rare combo)
            if (apnsToken !== null) {
              apnsToken.should.be.a.String();
            }
          }
        } else {
          this.skip();
        }
      });
    });

    describe('setAPNSToken', function () {
      it('requires a token parameter', async function () {
        const { getMessaging, setAPNSToken } = messagingModular;
        try {
          setAPNSToken(getMessaging());
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'token' expected a string value");
        }
        try {
          setAPNSToken(getMessaging(), 123);
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'token' expected a string value");
          return Promise.resolve();
        }
      });

      it('verifies type parameter is valid if specified', async function () {
        const { getMessaging, setAPNSToken } = messagingModular;
        try {
          setAPNSToken(getMessaging(), 'typeparamtest', 123);
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'type' expected one of 'prod', 'sandbox', or 'unknown'");
        }
        try {
          setAPNSToken(getMessaging(), 'typeparamtest', 'bogus');
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'type' expected one of 'prod', 'sandbox', or 'unknown'");
        }
      });

      it('resolves on android', async function () {
        const { getMessaging, setAPNSToken } = messagingModular;
        if (device.getPlatform() === 'android') {
          should.equal(await setAPNSToken(getMessaging(), 'foo'), null);
        } else {
          this.skip();
        }
      });

      it('correctly sets new token on ios', async function () {
        const { getMessaging, getAPNSToken, setAPNSToken } = messagingModular;
        if (device.getPlatform() === 'ios') {
          originalAPNSToken = await getAPNSToken(getMessaging());
          // 74657374696E67746F6B656E6D6F64756C6172 is hex for "testingtokenmodular"
          await firebase
            .messaging()
            .setAPNSToken('74657374696E67746F6B656E6D6F64756C6172', 'unknown');
          newAPNSToken = await firebase.messaging().getAPNSToken();
          newAPNSToken.should.eql('74657374696E67746F6B656E6D6F64756C6172');
          newAPNSToken.should.not.eql(originalAPNSToken);
          if (originalAPNSToken !== null) {
            await setAPNSToken(getMessaging(), originalAPNSToken);
          }
        } else {
          this.skip();
        }
      });
    });

    describe('getInitialNotification', function () {
      it('returns null when no initial notification', async function () {
        const { getMessaging, getInitialNotification } = messagingModular;
        should.strictEqual(await getInitialNotification(getMessaging()), null);
      });
    });

    describe('deleteToken()', function () {
      it('generate a new token after deleting', async function () {
        const { getMessaging, getToken, deleteToken } = messagingModular;
        const token1 = await getToken(getMessaging());
        should.exist(token1);
        await deleteToken(getMessaging());
        const token2 = await getToken(getMessaging());
        should.exist(token2);
        token1.should.not.eql(token2);
      });

      it('should throw Error with wrong parameter types', async function () {
        try {
          await firebase.messaging().deleteToken({ appName: 33 });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'appName' expected a string");
        }

        try {
          await firebase.messaging().getToken({ senderId: 33 });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'senderId' expected a string.");
          return Promise.resolve();
        }
      });
    });

    describe('onMessage()', function () {
      it('throws if listener is not a function', function () {
        const { getMessaging, onMessage } = messagingModular;
        try {
          onMessage(getMessaging(), {});
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'listener' expected a function");
          return Promise.resolve();
        }
      });

      xit('receives messages when the app is in the foreground', async function () {
        const { getMessaging, onMessage, registerDeviceForRemoteMessages, getToken } =
          messagingModular;
        const spy = sinon.spy();
        const unsubscribe = onMessage(getMessaging(), spy);
        if (device.getPlatform() === 'ios') {
          await registerDeviceForRemoteMessages(getMessaging());
        }
        const token = await getToken(getMessaging());
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
        const { getMessaging, onTokenRefresh } = messagingModular;
        try {
          onTokenRefresh(getMessaging(), {});
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'listener' expected a function");
          return Promise.resolve();
        }
      });
    });

    describe('onDeletedMessages()', function () {
      it('throws if listener is not a function', function () {
        const { getMessaging, onDeletedMessages } = messagingModular;
        try {
          onDeletedMessages(getMessaging(), 123);
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'listener' expected a function");
          return Promise.resolve();
        }
      });
    });

    describe('onMessageSent()', function () {
      it('throws if listener is not a function', function () {
        const { getMessaging, onMessageSent } = messagingModular;
        try {
          onMessageSent(getMessaging(), 123);
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'listener' expected a function");
          return Promise.resolve();
        }
      });
    });

    describe('onSendError()', function () {
      it('throws if listener is not a function', function () {
        const { getMessaging, onSendError } = messagingModular;
        try {
          onSendError(getMessaging(), '123');
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'listener' expected a function");
          return Promise.resolve();
        }
      });
    });

    describe('setBackgroundMessageHandler()', function () {
      it('throws if handler is not a function', function () {
        const { getMessaging, setBackgroundMessageHandler } = messagingModular;
        try {
          setBackgroundMessageHandler(getMessaging(), '123');
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'handler' expected a function");
          return Promise.resolve();
        }
      });

      // FIXME unfortunately this has started to fake locally as well. Disabling for now.
      xit('receives messages when the app is in the background', async function () {
        const { getMessaging, getToken, setBackgroundMessageHandler } = messagingModular;
        // This is slow and thus flaky in CI. It runs locally on android though.
        if (device.getPlatform() === 'android' && !global.isCI) {
          const spy = sinon.spy();
          const token = await getToken(getMessaging());
          setBackgroundMessageHandler(getMessaging(), remoteMessage => {
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
        const { getMessaging, subscribeToTopic } = messagingModular;
        try {
          subscribeToTopic(getMessaging(), 123);
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'topic' expected a string value");
          return Promise.resolve();
        }
      });

      it('throws if topic contains a /', function () {
        const { getMessaging, subscribeToTopic } = messagingModular;
        try {
          subscribeToTopic(getMessaging(), 'foo/bar');
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql('\'topic\' must not include "/"');
          return Promise.resolve();
        }
      });
    });

    describe('unsubscribeFromTopic()', function () {
      it('throws if topic is not a string', function () {
        const { getMessaging, unsubscribeFromTopic } = messagingModular;
        try {
          unsubscribeFromTopic(getMessaging(), 123);
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'topic' expected a string value");
          return Promise.resolve();
        }
      });

      it('throws if topic contains a /', function () {
        const { getMessaging, unsubscribeFromTopic } = messagingModular;
        try {
          unsubscribeFromTopic(getMessaging(), 'foo/bar');
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql('\'topic\' must not include "/"');
          return Promise.resolve();
        }
      });
    });

    describe('setDeliveryMetricsExportToBigQuery()', function () {
      afterEach(async function () {
        const { getMessaging, experimentalSetDeliveryMetricsExportedToBigQueryEnabled } =
          messagingModular;
        await experimentalSetDeliveryMetricsExportedToBigQueryEnabled(getMessaging(), false);
      });

      it('throws if enabled is not a boolean', function () {
        const { getMessaging, experimentalSetDeliveryMetricsExportedToBigQueryEnabled } =
          messagingModular;
        try {
          experimentalSetDeliveryMetricsExportedToBigQueryEnabled(getMessaging(), 123);
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'enabled' expected a boolean value");
          return Promise.resolve();
        }
      });

      it('sets the value', async function () {
        const {
          getMessaging,
          experimentalSetDeliveryMetricsExportedToBigQueryEnabled,
          isDeliveryMetricsExportToBigQueryEnabled,
        } = messagingModular;

        should.equal(isDeliveryMetricsExportToBigQueryEnabled(getMessaging()), false);
        await experimentalSetDeliveryMetricsExportedToBigQueryEnabled(getMessaging(), true);
        should.equal(isDeliveryMetricsExportToBigQueryEnabled(getMessaging()), true);

        // Set it back to the default value for future runs in re-use mode
        await experimentalSetDeliveryMetricsExportedToBigQueryEnabled(getMessaging(), false);
        should.equal(isDeliveryMetricsExportToBigQueryEnabled(getMessaging()), false);
      });

      describe('isSupported()', function () {
        it('should return "true" if the device or browser supports Firebase Messaging', async function () {
          const { isSupported, getMessaging } = messagingModular;
          // For android, when the play services are available, it will return "true"
          // iOS & web always return "true". Web can be fully implemented when the platform is supported
          should.equal(await isSupported(getMessaging()), true);
        });
      });
    });
  });
});
