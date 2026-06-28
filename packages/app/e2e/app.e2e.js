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

describe('modular', function () {
  describe('firebase v9 modular', function () {
    it('it should allow read the default app from native', function () {
      if (Platform.other) return; // Not supported on non-native platforms.
      const { getApp } = modular;

      // app is created in tests app before all hook
      should.equal(getApp()._nativeInitialized, true);
      should.equal(getApp().name, '[DEFAULT]');
    });

    it('it should create js apps for natively initialized apps', function () {
      if (Platform.other) return; // Not supported on non-native platforms.
      const { getApp } = modular;

      should.equal(getApp('secondaryFromNative')._nativeInitialized, true);
      should.equal(getApp('secondaryFromNative').name, 'secondaryFromNative');
    });

    it('natively initialized apps should have options available in js', function () {
      if (Platform.other) return; // Not supported on non-native platforms.
      const { getApp } = modular;
      const platformAppConfig = FirebaseHelpers.app.config();
      should.equal(getApp().options.apiKey, platformAppConfig.apiKey);
      should.equal(getApp().options.appId, platformAppConfig.appId);
      should.equal(getApp().options.databaseURL, platformAppConfig.databaseURL);
      should.equal(getApp().options.messagingSenderId, platformAppConfig.messagingSenderId);
      should.equal(getApp().options.projectId, platformAppConfig.projectId);
      should.equal(getApp().options.storageBucket, platformAppConfig.storageBucket);
    });

    it('SDK_VERSION should return a string version', function () {
      modular.SDK_VERSION.should.be.a.String();
    });

    it('apps should provide an array of apps', function () {
      const { getApps, getApp } = modular;
      should.equal(!!getApps().length, true);
      should.equal(getApps().includes(getApp('[DEFAULT]')), true);
    });

    it('apps can get and set data collection', async function () {
      const { getApp } = modular;
      getApp().automaticDataCollectionEnabled = false;
      should.equal(getApp().automaticDataCollectionEnabled, false);
    });

    it('should allow setting of log level', function () {
      const { setLogLevel } = modular;

      setLogLevel('error');
      setLogLevel('verbose');
    });

    it('should error if logLevel is invalid', function () {
      const { setLogLevel } = modular;

      try {
        setLogLevel('silent');
        throw new Error('did not throw on invalid log level');
      } catch (e) {
        e.message.should.containEql('LogLevel must be one of');
      }
    });

    it('it should initialize dynamic apps', async function () {
      const { initializeApp, getApps, getApp, deleteApp } = modular;

      const appCount = getApps().length;
      const name = `testscoreapp${FirebaseHelpers.id}`;
      const platformAppConfig = FirebaseHelpers.app.config();
      const newApp = await initializeApp(platformAppConfig, name);
      newApp.name.should.equal(name);
      newApp.options.apiKey.should.equal(platformAppConfig.apiKey);

      const apps = getApps();

      should.equal(apps.includes(getApp(name)), true);
      should.equal(apps.length, appCount + 1);
      return deleteApp(newApp);
    });

    it('should error if dynamic app initialization values are incorrect', async function () {
      const { initializeApp, getApps } = modular;

      const appCount = getApps().length;
      try {
        await initializeApp({ appId: 'myid' }, 'myname');
        throw new Error('Should have rejected incorrect initializeApp input');
      } catch (e) {
        e.message.should.equal("Missing or invalid FirebaseOptions property 'apiKey'.");
        should.equal(getApps().length, appCount);
        should.equal(getApps().includes('myname'), false);
      }
    });

    it('should error if dynamic app initialization values are invalid', async function () {
      const { initializeApp, getApps } = modular;

      // firebase-android-sdk & js-sdk will not complain on invalid initialization values, iOS throws
      if (Platform.android || Platform.other) {
        return;
      }

      const appCount = getApps().length;
      try {
        const firebaseConfig = {
          apiKey: 'XXXXXXXXXXXXXXXXXXXXXXX',
          authDomain: 'test-XXXXX.firebaseapp.com',
          databaseURL: 'https://test-XXXXXX.firebaseio.com',
          projectId: 'test-XXXXX',
          storageBucket: 'tes-XXXXX.appspot.com',
          messagingSenderId: 'XXXXXXXXXXXXX',
          appId: '1:XXXXXXXXX',
          app_name: 'TEST',
        };
        await initializeApp(firebaseConfig, 'myname');
        throw new Error('Should have rejected incorrect initializeApp input');
      } catch (e) {
        e.code.should.containEql('app/unknown');
        e.message.should.containEql('Configuration fails');
        should.equal(getApps().length, appCount);
        should.equal(getApps().includes('myname'), false);
      }
    });

    it('apps can be deleted, but only if it exists', async function () {
      const { initializeApp, getApp, deleteApp } = modular;

      const name = `testscoreapp${FirebaseHelpers.id}`;
      const platformAppConfig = FirebaseHelpers.app.config();
      const newApp = await initializeApp(platformAppConfig, name);

      newApp.name.should.equal(name);
      newApp.options.apiKey.should.equal(platformAppConfig.apiKey);

      await deleteApp(newApp);
      try {
        await deleteApp(newApp);
        throw new Error('Should have rejected incorrect deleteApp');
      } catch (e) {
        e.message.should.equal(`Firebase App named '${name}' already deleted`);
      }
      try {
        getApp(name);
        throw new Error('Should have rejected incorrect getApp');
      } catch (e) {
        e.message.should.equal(
          `No Firebase App '${name}' has been created - call firebase.initializeApp()`,
        );
      }
    });

    it('prevents the default app from being deleted', async function () {
      if (Platform.other) return; // We can delete the default app on other platforms.
      const { getApp, deleteApp } = modular;

      try {
        await deleteApp(getApp());
        throw new Error('Should have rejected incorrect deleteApp');
      } catch (e) {
        e.message.should.equal('Unable to delete the default native firebase app instance.');
      }
    });

    it('registerVersion is not supported on react-native', async function () {
      const { registerVersion } = modular;

      try {
        await registerVersion();
        throw new Error('Should have rejected incorrect registerVersion');
      } catch (e) {
        e.message.should.equal('registerVersion is only supported on Web');
      }
    });

    it('extendApp should provide additional functionality', function () {
      const { getApp } = modular;
      const extension = {};
      getApp().extendApp({
        extension,
      });
      getApp().extension.should.equal(extension);
    });
  });
});
