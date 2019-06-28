describe('crashlytics()', () => {
  // todo test is flakey due to a detox error occurring sometimes;
  // Error: the string "Error when sending event: websocketFailed with body:
  // {\n    id = 0;\n    message = \"The operation couldn\\U2019t be completed.
  // Connection refused\";\n}. Bridge is not set. This is probably because you've
  // explicitly synthesized the bridge in RCTWebSocketModule, even though it's
  // inherited from RCTEventEmitter.
  xdescribe('crash()', () => {
    it('should force an app crash', async () => {
      await firebase.crashlytics().crash();
      // ios responds quicker after a fatal exception if we re-install
      await device.uninstallApp();
      await device.installApp();

      await device.launchApp({ newInstance: true });
      await firebase.crashlytics().log('app relaunched from a crash');
    });
  });

  describe('log()', () => {
    it('should set a string value', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase.crashlytics().log('123abc');
    });

    it('should error on a non string value', async () => {
      try {
        await firebase.crashlytics().log(123456);
      } catch (e) {
        e.message.should.containEql('Invalid parameter');
      }
    });
  });

  describe('recordError()', () => {
    it('should record an error with a code and message', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase.crashlytics().recordError(1234, 'Test error');
    });

    it('should error on invalid args', async () => {
      try {
        await firebase.crashlytics().recordError({}, []);
      } catch (e) {
        e.message.should.containEql('Invalid parameter');
      }
    });
  });

  describe('recordCustomError()', () => {
    it('should record an error with a name and message', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase
        .crashlytics()
        .recordCustomError('Test Error', 'Really bad error!');
    });

    it('should record an error with a name and message and customError', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase
        .crashlytics()
        .recordCustomError('Test Error', 'Really bad error!', [
          { fileName: 'TestFile.js' },
        ]);
    });

    it('should record an error with a name and message and multiple customErrors', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase
        .crashlytics()
        .recordCustomError('Test Error', 'Really bad error!', [
          { fileName: 'TestFile.js' },
          { fileName: 'TestFile1.js' },
        ]);
    });

    it('should error on invalid args', async () => {
      // failing from XCode 10.1 -> 10.2
      try {
        await firebase.crashlytics().recordCustomError({}, []);
      } catch (e) {
        e.message.should.containEql('Invalid parameter');
      }
    });

    it('should error on missing required customError property', async () => {
      // failing from XCode 10.1 -> 10.2
      try {
        await firebase
          .crashlytics()
          .recordCustomError('Test Error', 'Really bad error!', [{}]);
      } catch (e) {
        e.message.should.containEql('Missing required argument');
      }
    });

    it('should error on missing required customError property with multiple customErrors', async () => {
      // failing from XCode 10.1 -> 10.2
      try {
        await firebase
          .crashlytics()
          .recordCustomError('Test Error', 'Really bad error!', [
            { fileName: 'TestFile.js' },
            {},
          ]);
      } catch (e) {
        e.message.should.containEql('Missing required argument');
      }
    });

    it('should error on invalid customError arg', async () => {
      // failing from XCode 10.1 -> 10.2
      try {
        await firebase
          .crashlytics()
          .recordCustomError('Test Error', 'Really bad error!', 1234);
      } catch (e) {
        e.message.should.containEql('Invalid parameter');
      }
    });
  });

  describe('setBoolValue()', () => {
    it('should set a boolean value', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase.crashlytics().setBoolValue('boolKey', true);
    });
    it('should error on a non boolean value', async () => {
      try {
        await firebase.crashlytics().setFloatValue('boolKey', '123456');
      } catch (e) {
        e.message.should.containEql('Invalid parameter');
      }
    });
  });

  describe('setFloatValue()', () => {
    it('should set a float value', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase.crashlytics().setFloatValue('floatKey', 1.23);
    });
    it('should set a float value from int value', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase.crashlytics().setFloatValue('floatKey', 1234);
    });
    it('should error on a non number value', async () => {
      try {
        await firebase.crashlytics().setFloatValue('floatKey', '123456');
      } catch (e) {
        e.message.should.containEql('Invalid parameter');
      }
    });
  });

  describe('setIntValue()', () => {
    it('should set a integer value', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase.crashlytics().setIntValue('intKey', 123);
    });
    it('should set a integer value from float', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase.crashlytics().setIntValue('intKey', 12.36);
    });
    it('should error on a non number value', async () => {
      try {
        await firebase.crashlytics().setIntValue('intKey', '123456');
      } catch (e) {
        e.message.should.containEql('Invalid parameter');
      }
    });
  });

  describe('setStringValue()', () => {
    it('should set a string value', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase.crashlytics().setStringValue('stringKey', 'test');
    });
    it('should error on a non string value', async () => {
      try {
        await firebase.crashlytics().setStringValue('stringKey', 123456);
      } catch (e) {
        e.message.should.containEql('Invalid parameter');
      }
    });
  });

  describe('setUserIdentifier()', () => {
    it('should set a string value', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase.crashlytics().setUserIdentifier('123abc');
    });

    it('should error on a non string value', async () => {
      try {
        await firebase.crashlytics().setUserIdentifier(123456);
      } catch (e) {
        e.message.should.containEql('Invalid parameter');
      }
    });
  });

  describe('setUserName()', () => {
    it('should set a string value', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase.crashlytics().setUserName('123abc');
    });

    it('should error on a non string value', async () => {
      // failing from XCode 10.1 -> 10.2
      try {
        await firebase.crashlytics().setUserName(123456);
      } catch (e) {
        e.message.should.containEql('Invalid parameter');
      }
    });
  });

  describe('setUserEmail()', () => {
    it('should set a string value', async () => {
      // failing from XCode 10.1 -> 10.2
      await firebase.crashlytics().setUserEmail('123abc');
    });

    it('should error on a non string value', async () => {
      // failing from XCode 10.1 -> 10.2
      try {
        await firebase.crashlytics().setUserEmail(123456);
      } catch (e) {
        e.message.should.containEql('Invalid parameter');
      }
    });
  });

  describe('enableCrashlyticsCollection()', () => {
    // failing from XCode 10.1 -> 10.2
    it('should not throw', async () => {
      await firebase.crashlytics().enableCrashlyticsCollection();
    });
  });
});
