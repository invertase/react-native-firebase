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

const APP_MODULE = NativeModules.NativeRNFBTurboApp;

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

    // iOS New Architecture delivers initializeApp options as a plain NSDictionary, so JS null
    // properties arrive as { __rnfbNull: true } sentinels and must be read as absent natively.
    it('treats null optional iOS options as absent natively', async function () {
      if (!Platform.ios) return;

      const name = `nulloptionsnative${FirebaseHelpers.id}`;
      const config = FirebaseHelpers.app.config();
      const nullSentinel = { __rnfbNull: true };
      const appConfig = { name, automaticDataCollectionEnabled: true };

      try {
        const result = await APP_MODULE.initializeApp(
          {
            ...config,
            iosBundleId: nullSentinel,
            iosClientId: nullSentinel,
            appGroupId: nullSentinel,
            authDomain: nullSentinel,
          },
          appConfig,
        );

        result.appConfig.name.should.equal(name);
        result.options.apiKey.should.equal(config.apiKey);
        should.equal(result.options.clientId, undefined);
        should.equal(result.options.authDomain, undefined);
      } finally {
        await APP_MODULE.deleteApp(name);
      }
    });

    // automaticDataCollectionEnabled was previously read with a (BOOL) pointer cast, so any
    // non-nil value (including false) became YES. It is now read with boolValue.
    it('reads explicit automaticDataCollectionEnabled booleans natively on iOS', async function () {
      if (!Platform.ios) return;

      const config = FirebaseHelpers.app.config();
      const disabledName = `autodatafalse${FirebaseHelpers.id}`;
      const enabledName = `autodatatrue${FirebaseHelpers.id}`;

      try {
        const disabled = await APP_MODULE.initializeApp(
          { ...config },
          { name: disabledName, automaticDataCollectionEnabled: false },
        );
        const enabled = await APP_MODULE.initializeApp(
          { ...config },
          { name: enabledName, automaticDataCollectionEnabled: true },
        );

        disabled.appConfig.name.should.equal(disabledName);
        should.equal(disabled.appConfig.automaticDataCollectionEnabled, false);
        enabled.appConfig.name.should.equal(enabledName);
        should.equal(enabled.appConfig.automaticDataCollectionEnabled, true);
      } finally {
        await APP_MODULE.deleteApp(disabledName);
        await APP_MODULE.deleteApp(enabledName);
      }
    });

    // Intended behaviour change: a null automaticDataCollectionEnabled (JS does not validate it)
    // used to become YES through the (BOOL) pointer cast. It is now decoded to NO, which matches
    // the JS `!!null` in FirebaseApp. (An omitted key is covered by the tests below.)
    it('treats a null automaticDataCollectionEnabled as false natively on iOS', async function () {
      if (!Platform.ios) return;

      const name = `autodatanull${FirebaseHelpers.id}`;
      const config = FirebaseHelpers.app.config();

      try {
        const result = await APP_MODULE.initializeApp(
          { ...config },
          { name, automaticDataCollectionEnabled: { __rnfbNull: true } },
        );

        result.appConfig.name.should.equal(name);
        should.equal(result.appConfig.automaticDataCollectionEnabled, false);
      } finally {
        await APP_MODULE.deleteApp(name);
      }
    });

    // An omitted automaticDataCollectionEnabled must leave the SDK default untouched (it used to be
    // forced to NO). A fresh uniquely named app has no persisted flag (FIRApp stores it per app name
    // in NSUserDefaults and clears it in deleteApp), so it resolves to the Info.plist
    // FirebaseDataCollectionDefaultEnabled, which the test app build writes from
    // tests/firebase.json "app_data_collection_default_enabled": false. That default is also NO, so
    // this alone cannot tell "untouched" from "forced NO"; the default app test below does.
    it('keeps the Info.plist default when automaticDataCollectionEnabled is omitted on iOS', async function () {
      if (!Platform.ios) return;

      const name = `autodataomitted${FirebaseHelpers.id}`;
      const config = FirebaseHelpers.app.config();

      try {
        const result = await APP_MODULE.initializeApp({ ...config }, { name });

        result.appConfig.name.should.equal(name);
        should.equal(result.appConfig.automaticDataCollectionEnabled, false);
      } finally {
        await APP_MODULE.deleteApp(name);
      }
    });

    // The JS getter must reflect the flag the native SDK resolved, not the input config. A sibling
    // app initialized natively with the same omitted config provides the expected native value
    // (a fresh name has no persisted flag, so both resolve to the Info.plist default).
    it('reflects the native data collection flag when the key is omitted on iOS', async function () {
      if (!Platform.ios) return;

      const { initializeApp, deleteApp } = modular;
      const name = `autodatajsomitted${FirebaseHelpers.id}`;
      const probeName = `autodatajsprobe${FirebaseHelpers.id}`;
      const config = FirebaseHelpers.app.config();
      let app;

      try {
        const probe = await APP_MODULE.initializeApp({ ...config }, { name: probeName });
        const nativeFlag = probe.appConfig.automaticDataCollectionEnabled;
        nativeFlag.should.be.a.Boolean();

        app = await initializeApp({ ...config }, { name });
        should.equal(app.automaticDataCollectionEnabled, nativeFlag);
      } finally {
        if (app) await deleteApp(app);
        await APP_MODULE.deleteApp(probeName);
      }
    });

    // JS does not validate automaticDataCollectionEnabled. A non-boolean truthy value is ignored
    // natively (SDK default stays) but was cached as `!!input` === true in JS. The getter must follow
    // the native result instead. This only discriminates when the native default is false, which is
    // the case for the test app build (tests/firebase.json app_data_collection_default_enabled).
    it('reflects the native data collection flag when the input is a non-boolean on iOS', async function () {
      if (!Platform.ios) return;

      const { initializeApp, deleteApp } = modular;
      const name = `autodatajsnonbool${FirebaseHelpers.id}`;
      const probeName = `autodatajsnonboolprobe${FirebaseHelpers.id}`;
      const config = FirebaseHelpers.app.config();
      let app;

      try {
        const probe = await APP_MODULE.initializeApp({ ...config }, { name: probeName });
        const nativeFlag = probe.appConfig.automaticDataCollectionEnabled;

        app = await initializeApp({ ...config }, { name, automaticDataCollectionEnabled: 'yes' });
        should.equal(app.automaticDataCollectionEnabled, nativeFlag);
        should.equal(app.automaticDataCollectionEnabled, false);
      } finally {
        if (app) await deleteApp(app);
        await APP_MODULE.deleteApp(probeName);
      }
    });

    it('reflects an explicit data collection flag from native on iOS', async function () {
      if (!Platform.ios) return;

      const { initializeApp, deleteApp } = modular;
      const enabledName = `autodatajstrue${FirebaseHelpers.id}`;
      const disabledName = `autodatajsfalse${FirebaseHelpers.id}`;
      const config = FirebaseHelpers.app.config();
      let enabled;
      let disabled;

      try {
        enabled = await initializeApp(
          { ...config },
          { name: enabledName, automaticDataCollectionEnabled: true },
        );
        disabled = await initializeApp(
          { ...config },
          { name: disabledName, automaticDataCollectionEnabled: false },
        );
        should.equal(enabled.automaticDataCollectionEnabled, true);
        should.equal(disabled.automaticDataCollectionEnabled, false);
      } finally {
        if (enabled) await deleteApp(enabled);
        if (disabled) await deleteApp(disabled);
      }
    });

    // Non-vacuous check: the default app already exists, so initializeApp reuses it and its flag is
    // the value persisted by the last explicit set. Persist true (different from the build's
    // Info.plist default of false), then omit the key. If native forced NO the result would be
    // false; untouched keeps true. The previous value is restored afterwards.
    it('does not override an existing data collection flag when the key is omitted on iOS', async function () {
      if (!Platform.ios) return;

      const config = FirebaseHelpers.app.config();
      const previous = modular.getApp().automaticDataCollectionEnabled;

      try {
        const enabled = await APP_MODULE.initializeApp(
          { ...config },
          { name: '[DEFAULT]', automaticDataCollectionEnabled: true },
        );
        should.equal(enabled.appConfig.automaticDataCollectionEnabled, true);

        const omitted = await APP_MODULE.initializeApp({ ...config }, { name: '[DEFAULT]' });
        should.equal(omitted.appConfig.automaticDataCollectionEnabled, true);
      } finally {
        await APP_MODULE.initializeApp(
          { ...config },
          { name: '[DEFAULT]', automaticDataCollectionEnabled: previous },
        );
      }
    });

    // A null name is dropped, so the app resolves as the existing default app. The default app is
    // reused (options are ignored), and its data collection flag is set from appConfig, so the
    // previous value is restored afterwards. customAuthDomains["[DEFAULT]"] is also rewritten from
    // config.authDomain and is not restored; the later 'applies customAuthDomain onto Auth for the
    // default app' test sets the same value, so nothing observable.
    it('resolves the default app when the iOS app name is null', async function () {
      if (!Platform.ios) return;

      const config = FirebaseHelpers.app.config();
      const previous = modular.getApp().automaticDataCollectionEnabled;

      try {
        const result = await APP_MODULE.initializeApp(
          { ...config },
          { name: { __rnfbNull: true }, automaticDataCollectionEnabled: true },
        );

        result.appConfig.name.should.equal('[DEFAULT]');
        should.equal(result.appConfig.automaticDataCollectionEnabled, true);
        result.options.apiKey.should.equal(config.apiKey);
      } finally {
        await APP_MODULE.initializeApp(
          { ...config },
          { name: '[DEFAULT]', automaticDataCollectionEnabled: previous },
        );
      }
    });

    it('initializes a dynamic app when optional iOS options are null', async function () {
      if (!Platform.ios) return;

      const { initializeApp, getApps, getApp, deleteApp } = modular;
      const name = `nulloptionsjs${FirebaseHelpers.id}`;
      const config = FirebaseHelpers.app.config();
      const newApp = await initializeApp(
        {
          ...config,
          iosBundleId: null,
          iosClientId: null,
          appGroupId: null,
          authDomain: null,
        },
        name,
      );

      try {
        newApp.name.should.equal(name);
        getApps().includes(getApp(name)).should.equal(true);
      } finally {
        await deleteApp(newApp);
      }
    });

    it('does not retain a custom auth domain after deleting an app', async function () {
      if (!Platform.ios) return;

      const name = `authdomaintest${FirebaseHelpers.id}`;
      const config = FirebaseHelpers.app.config();
      const appConfig = { name, automaticDataCollectionEnabled: true };
      const appWithAuthDomain = await APP_MODULE.initializeApp(config, appConfig);
      appWithAuthDomain.options.authDomain.should.equal(config.authDomain);
      await APP_MODULE.deleteApp(name);

      const { authDomain: _authDomain, ...configWithoutAuthDomain } = config;
      const recreatedApp = await APP_MODULE.initializeApp(configWithoutAuthDomain, appConfig);
      const recreatedAuthDomain = recreatedApp.options.authDomain;
      await APP_MODULE.deleteApp(name);
      should.equal(recreatedAuthDomain, undefined);
    });

    // Regression: customAuthDomains is keyed by JS [DEFAULT]; Auth configureAuthDomain must
    // look up via getAppJavaScriptName (not raw FIRApp.name __FIRAPP_DEFAULT). Named secondary
    // apps never exercise that mismatch.
    it('applies customAuthDomain onto Auth for the default app', async function () {
      if (!Platform.ios) return;

      const { getApp } = modular;
      const { getAuth, getCustomAuthDomain } = authModular;
      const config = FirebaseHelpers.app.config();
      config.authDomain.should.be.a.String();

      // Seed customAuthDomains under JS [DEFAULT] even when native default already exists.
      await APP_MODULE.initializeApp(config, {
        name: '[DEFAULT]',
        automaticDataCollectionEnabled: true,
      });

      // Auth may already be constructed for the default app; re-apply from the map.
      NativeModules.NativeRNFBTurboAuth.configureAuthDomain('[DEFAULT]');

      const auth = getAuth(getApp());
      const applied = await getCustomAuthDomain(auth);
      should.equal(applied, config.authDomain);
    });

    it('does not retain a custom auth domain after failed initialization', async function () {
      if (!Platform.ios) return;

      const name = `failedauthdomaintest${FirebaseHelpers.id}`;
      const config = FirebaseHelpers.app.config();
      const { authDomain: _authDomain, ...configWithoutAuthDomain } = config;
      const appConfig = { name, automaticDataCollectionEnabled: true };
      await APP_MODULE.initializeApp(configWithoutAuthDomain, appConfig);

      let rejected = false;
      try {
        await APP_MODULE.initializeApp(config, appConfig);
      } catch (_error) {
        rejected = true;
      }
      rejected.should.equal(true);

      await APP_MODULE.deleteApp(name);
      const recoveredApp = await APP_MODULE.initializeApp(configWithoutAuthDomain, appConfig);
      const recoveredAuthDomain = recoveredApp.options.authDomain;
      await APP_MODULE.deleteApp(name);
      should.equal(recoveredAuthDomain, undefined);
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
