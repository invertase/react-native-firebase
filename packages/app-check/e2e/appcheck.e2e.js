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

const jwt = require('jsonwebtoken');

describe('appCheck() modular', function () {
  describe('firebase v8 compatibility', function () {
    before(function () {
      rnfbProvider = firebase.appCheck().newReactNativeFirebaseAppCheckProvider();
      rnfbProvider.configure({
        android: {
          provider: 'debug',
          debugToken: '698956B2-187B-49C6-9E25-C3F3530EEBAF',
        },
        apple: {
          provider: 'debug',
          debugToken: '698956B2-187B-49C6-9E25-C3F3530EEBAF',
        },
        web: {
          provider: 'debug',
          siteKey: 'none',
        },
      });

      // Our tests configure a debug provider with shared secret so we should get a valid token
      firebase
        .appCheck()
        .initializeAppCheck({ provider: rnfbProvider, isTokenAutoRefreshEnabled: false });
    });

    describe('config', function () {
      // This depends on firebase.json containing a false value for token auto refresh, we
      // verify here that it was carried in to the Info.plist correctly
      // it relies on token auto refresh being left false for local tests where the app is reused, since it is persistent
      // but in CI it's fresh every time and would be true if not overridden in Info.plist
      it('should configure token auto refresh in Info.plist on ios', async function () {
        if (device.getPlatform() === 'ios') {
          const tokenRefresh =
            await NativeModules.RNFBAppCheckModule.isTokenAutoRefreshEnabled('[DEFAULT]');
          tokenRefresh.should.equal(false);
        } else {
          this.skip();
        }
      });
    });

    describe('setTokenAutoRefresh())', function () {
      it('should set token refresh', async function () {
        firebase.appCheck().setTokenAutoRefreshEnabled(false);

        // Only iOS lets us assert on this unfortunately, other platforms have no accessor
        if (device.getPlatform() === 'ios') {
          let tokenRefresh =
            await NativeModules.RNFBAppCheckModule.isTokenAutoRefreshEnabled('[DEFAULT]');
          tokenRefresh.should.equal(false);
        }
        firebase.appCheck().setTokenAutoRefreshEnabled(true);
        // Only iOS lets us assert on this unfortunately, other platforms have no accessor
        if (device.getPlatform() === 'ios') {
          tokenRefresh =
            await NativeModules.RNFBAppCheckModule.isTokenAutoRefreshEnabled('[DEFAULT]');
          tokenRefresh.should.equal(true);
        }
      });
    });

    describe('getToken())', function () {
      it('token fetch attempt with configured debug token should work', async function () {
        const { token } = await firebase.appCheck().getToken(true);
        token.should.not.equal('');
        const decodedToken = jwt.decode(token);
        decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
        if (decodedToken.exp < Date.now()) {
          Promise.reject('Token already expired');
        }

        // on android if you move too fast, you may not get a fresh token
        await Utils.sleep(2000);

        // Force refresh should get a different token?
        // TODO sometimes fails on android https://github.com/firebase/firebase-android-sdk/issues/2954
        const { token: token2 } = await firebase.appCheck().getToken(true);
        token2.should.not.equal('');
        const decodedToken2 = jwt.decode(token2);
        decodedToken2.aud[1].should.equal('projects/react-native-firebase-testing');
        if (decodedToken2.exp < Date.now()) {
          Promise.reject('Token already expired');
        }
        (token === token2).should.be.false();
      });

      it('token fetch with config switch to invalid then valid should fail then work', async function () {
        rnfbProvider = firebase.appCheck().newReactNativeFirebaseAppCheckProvider();
        rnfbProvider.configure({
          android: {
            provider: 'playIntegrity',
          },
          apple: {
            provider: 'appAttest',
          },
          web: {
            provider: 'debug',
            siteKey: 'none',
          },
        });

        // Our tests configure a debug provider with shared secret so we should get a valid token
        firebase
          .appCheck()
          .initializeAppCheck({ provider: rnfbProvider, isTokenAutoRefreshEnabled: false });
        try {
          await firebase.appCheck().getToken(true);
          return Promise.reject(new Error('should have thrown an error'));
        } catch (e) {
          e.message.should.containEql('appCheck/token-error');
        }

        rnfbProvider.configure({
          android: {
            provider: 'debug',
            debugToken: '698956B2-187B-49C6-9E25-C3F3530EEBAF',
          },
          apple: {
            provider: 'debug',
          },
          web: {
            provider: 'debug',
            siteKey: 'none',
          },
        });
        firebase
          .appCheck()
          .initializeAppCheck({ provider: rnfbProvider, isTokenAutoRefreshEnabled: false });

        const { token } = await firebase.appCheck().getToken(true);
        token.should.not.equal('');
        const decodedToken = jwt.decode(token);
        decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
        if (decodedToken.exp < Date.now()) {
          Promise.reject('Token already expired');
        }
      });
    });

    describe('getLimitedUseToken())', function () {
      it('limited use token fetch attempt with configured debug token should work', async function () {
        const { token } = await firebase.appCheck().getLimitedUseToken();
        token.should.not.equal('');
        const decodedToken = jwt.decode(token);
        decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
        if (decodedToken.exp < Date.now()) {
          Promise.reject('Token already expired');
        }
      });
    });

    describe('activate())', function () {
      it('should activate with default provider and defined token refresh', function () {
        firebase
          .appCheck()
          .activate('ignored', false)
          .then(value => expect(value).toBe(undefined))
          .catch(e => new Error('app-check activate failed? ' + e));
      });

      it('should error if activate gets no parameters', async function () {
        try {
          firebase.appCheck().activate();
          return Promise.reject(new Error('should have thrown an error'));
        } catch (e) {
          e.message.should.containEql('siteKeyOrProvider must be a string value');
        }
      });

      it('should not error if activate called with no token refresh value', async function () {
        try {
          firebase.appCheck().activate('ignored');
          return Promise.resolve(true);
        } catch (e) {
          return Promise.reject(new Error('should not have thrown an error - ' + e));
        }
      });
    });
  });

  describe('modular', function () {
    var appCheckInstance;
    before(async function () {
      const { initializeAppCheck } = appCheckModular;

      rnfbProvider = firebase.appCheck().newReactNativeFirebaseAppCheckProvider();
      rnfbProvider.configure({
        android: {
          provider: 'debug',
          debugToken: '698956B2-187B-49C6-9E25-C3F3530EEBAF',
        },
        apple: {
          provider: 'debug',
          debugToken: '698956B2-187B-49C6-9E25-C3F3530EEBAF',
        },
        web: {
          provider: 'debug',
          siteKey: 'none',
        },
      });

      // Our tests configure a debug provider with shared secret so we should get a valid token
      appCheckInstance = await initializeAppCheck(undefined, {
        provider: rnfbProvider,
        isTokenAutoRefreshEnabled: false,
      });
    });

    describe('setTokenAutoRefresh())', function () {
      it('should set token refresh', async function () {
        const { setTokenAutoRefreshEnabled } = appCheckModular;

        setTokenAutoRefreshEnabled(appCheckInstance, false);
        // Only iOS lets us assert on this unfortunately, other platforms have no accessor
        if (device.getPlatform() === 'ios') {
          let tokenRefresh =
            await NativeModules.RNFBAppCheckModule.isTokenAutoRefreshEnabled('[DEFAULT]');
          tokenRefresh.should.equal(false);
        }
        setTokenAutoRefreshEnabled(appCheckInstance, true);
        // Only iOS lets us assert on this unfortunately, other platforms have no accessor
        if (device.getPlatform() === 'ios') {
          tokenRefresh =
            await NativeModules.RNFBAppCheckModule.isTokenAutoRefreshEnabled('[DEFAULT]');
          tokenRefresh.should.equal(true);
        }
      });
    });

    describe('getToken())', function () {
      it('token fetch attempt with configured debug token should work', async function () {
        const { getToken } = appCheckModular;

        const { token } = await getToken(appCheckInstance, true);
        token.should.not.equal('');
        const decodedToken = jwt.decode(token);
        decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
        if (decodedToken.exp < Date.now()) {
          Promise.reject('Token already expired');
        }

        // on android if you move too fast, you may not get a fresh token
        await Utils.sleep(2000);

        // Force refresh should get a different token?
        // TODO sometimes fails on android https://github.com/firebase/firebase-android-sdk/issues/2954
        const { token: token2 } = await getToken(appCheckInstance, true);
        token2.should.not.equal('');
        const decodedToken2 = jwt.decode(token2);
        decodedToken2.aud[1].should.equal('projects/react-native-firebase-testing');
        if (decodedToken2.exp < Date.now()) {
          Promise.reject('Token already expired');
        }
        (token === token2).should.be.false();
      });

      it('token fetch with config switch to invalid then valid should fail then work', async function () {
        const { initializeAppCheck, getToken } = appCheckModular;

        rnfbProvider = firebase.appCheck().newReactNativeFirebaseAppCheckProvider();
        rnfbProvider.configure({
          android: {
            provider: 'playIntegrity',
          },
          apple: {
            provider: 'appAttest',
          },
          web: {
            provider: 'debug',
            siteKey: 'none',
          },
        });

        // Our tests configure a debug provider with shared secret so we should get a valid token
        const instance1 = await initializeAppCheck(undefined, {
          provider: rnfbProvider,
          isTokenAutoRefreshEnabled: false,
        });
        try {
          await getToken(instance1, true);
          return Promise.reject(new Error('should have thrown an error'));
        } catch (e) {
          e.message.should.containEql('appCheck/token-error');
        }

        rnfbProvider.configure({
          android: {
            provider: 'debug',
            debugToken: '698956B2-187B-49C6-9E25-C3F3530EEBAF',
          },
          apple: {
            provider: 'debug',
          },
          web: {
            provider: 'debug',
            siteKey: 'none',
          },
        });
        const instance2 = await initializeAppCheck(undefined, {
          provider: rnfbProvider,
          isTokenAutoRefreshEnabled: false,
        });

        const { token } = await getToken(instance2, true);
        token.should.not.equal('');
        const decodedToken = jwt.decode(token);
        decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
        if (decodedToken.exp < Date.now()) {
          Promise.reject('Token already expired');
        }
      });
    });

    describe('getLimitedUseToken())', function () {
      it('limited use token fetch attempt with configured debug token should work', async function () {
        const { initializeAppCheck, getLimitedUseToken } = appCheckModular;

        rnfbProvider = firebase.appCheck().newReactNativeFirebaseAppCheckProvider();
        rnfbProvider.configure({
          android: {
            provider: 'debug',
            debugToken: '698956B2-187B-49C6-9E25-C3F3530EEBAF',
          },
          apple: {
            provider: 'debug',
          },
          web: {
            provider: 'debug',
            siteKey: 'none',
          },
        });

        const appCheckInstance = await initializeAppCheck(undefined, {
          provider: rnfbProvider,
          isTokenAutoRefreshEnabled: false,
        });

        const { token } = await getLimitedUseToken(appCheckInstance);
        token.should.not.equal('');
        const decodedToken = jwt.decode(token);
        decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
        if (decodedToken.exp < Date.now()) {
          Promise.reject('Token already expired');
        }
      });
    });
  });
});
