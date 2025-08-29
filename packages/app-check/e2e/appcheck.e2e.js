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

import { Base64 } from '@react-native-firebase/app/lib/common';

const tokenUUIDs = [
  'fd650953-e806-4293-b5df-edfe544d82a8',
  '91794ec5-0746-4017-abd3-f26d2be221b3',
  '1cc5dda7-1bf9-48f5-b41b-1c1fd3cdf93f',
  '0f870158-ffc4-428a-8ea0-c31c640de7ed',
  'e5f7e243-8b1b-468f-a3da-6d897872f0ad',
  '397d7b10-1688-4ceb-9e73-528b4be5ae6d',
  '249cdc09-2aad-4ad2-95df-bc184b8e533d',
  '351c7cc6-c86b-4618-837b-d0fc14dc0d16',
  'f32173a6-768d-47f6-b6dd-6c6cdacc2063',
  'df93feea-93f3-48c1-a1ee-db846848030c',
  '3185331d-7401-449c-b448-a6ba982fa514',
  '68fa446c-d43c-4c4c-9e72-a35f228b21b6',
  '4203c679-9b0b-4111-a453-b4f871be5e2d',
  '67ae2273-2933-4d47-81d6-8c063da532c4',
  '00505845-37a2-41b5-9dc2-5dee1d10c394',
  '698956B2-187B-49C6-9E25-C3F3530EEBAF',
];

function getRandomToken() {
  // return tokenUUIDs[Math.floor(Math.random() * tokenUUIDs.length)];
  return tokenUUIDs[0];
}

function decodeJWT(token) {
  // Split the token into its parts
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  // Decode the base64 URL parts
  const base64UrlDecode = str => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (base64.length % 4) {
      case 0:
        break;
      case 2:
        base64 += '==';
        break;
      case 3:
        base64 += '=';
        break;
      default:
        throw new Error('Invalid base64 string');
    }

    return decodeURIComponent(
      Base64.atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
  };

  // Decode the payload
  const payload = JSON.parse(base64UrlDecode(parts[1]));

  return payload;
}

describe('appCheck()', function () {
  describe('firebase v8 compatibility', function () {
    beforeEach(async function beforeEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterEach(async function afterEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    describe('CustomProvider', function () {
      if (!Platform.other) {
        return;
      }

      it('should throw an error if no provider options are defined', function () {
        try {
          new firebase.appCheck.CustomProvider();
          return Promise.reject(new Error('Did not throw an error.'));
        } catch (e) {
          e.message.should.containEql('no provider options defined');
          return Promise.resolve();
        }
      });

      it('should throw an error if no getToken function is defined', function () {
        try {
          new firebase.appCheck.CustomProvider({});
          return Promise.reject(new Error('Did not throw an error.'));
        } catch (e) {
          e.message.should.containEql('no getToken function defined');
          return Promise.resolve();
        }
      });

      it('should return a token from a custom provider', async function () {
        const spy = sinon.spy();
        const provider = new firebase.appCheck.CustomProvider({
          getToken() {
            spy();
            return FirebaseHelpers.fetchAppCheckToken();
          },
        });

        // Call from the provider directly.
        const { token, expireTimeMillis } = await provider.getToken();
        spy.should.be.calledOnce();
        token.should.be.a.String();
        expireTimeMillis.should.be.a.Number();

        // Call from the app check instance.
        await firebase
          .appCheck()
          .initializeAppCheck({ provider, isTokenAutoRefreshEnabled: false });
        const { token: tokenFromAppCheck } = await firebase.appCheck().getToken(true);
        tokenFromAppCheck.should.be.a.String();

        // Confirm that app check used the custom provider getToken function.
        spy.should.be.calledTwice();
      });

      // TODO flakey after many runs, sometimes fails on android & ios,
      // possibly a rate limiting issue on the server side
      it('should return a limited use token from a custom provider', async function () {
        const provider = new firebase.appCheck.CustomProvider({
          getToken() {
            return FirebaseHelpers.fetchAppCheckToken();
          },
        });

        await firebase
          .appCheck()
          .initializeAppCheck({ provider, isTokenAutoRefreshEnabled: false });
        const { token: tokenFromAppCheck } = await firebase.appCheck().getLimitedUseToken();
        tokenFromAppCheck.should.be.a.String();
      });

      it('should listen for token changes', async function () {
        const provider = new firebase.appCheck.CustomProvider({
          getToken() {
            return FirebaseHelpers.fetchAppCheckToken();
          },
        });

        await firebase
          .appCheck()
          .initializeAppCheck({ provider, isTokenAutoRefreshEnabled: false });
        const unsubscribe = firebase.appCheck().onTokenChanged(_ => {
          // TODO - improve testing cloud function to allow us to return tokens with low expiry
        });

        // TODO - improve testing cloud function to allow us to return tokens with low expiry
        // result.should.be.an.Object();
        // const { token, expireTimeMillis } = result;
        // token.should.be.a.String();
        // expireTimeMillis.should.be.a.Number();
        unsubscribe();
      });
    });

    describe('AppCheck API methods', function () {
      beforeEach(function () {
        const { ReactNativeFirebaseAppCheckProvider } = appCheckModular;
        let provider;

        if (!Platform.other) {
          provider = firebase.appCheck().newReactNativeFirebaseAppCheckProvider();
          provider.configure({
            android: {
              provider: 'debug',
              debugToken: getRandomToken(),
            },
            apple: {
              provider: 'debug',
              debugToken: getRandomToken(),
            },
            web: {
              provider: 'debug',
              siteKey: 'none',
            },
          });
        } else {
          provider = new ReactNativeFirebaseAppCheckProvider({
            getToken() {
              return FirebaseHelpers.fetchAppCheckToken();
            },
          });
        }

        // Our tests configure a debug provider with shared secret so we should get a valid token
        firebase.appCheck().initializeAppCheck({ provider, isTokenAutoRefreshEnabled: false });
      });

      describe('config', function () {
        // This depends on firebase.json containing a false value for token auto refresh, we
        // verify here that it was carried in to the Info.plist correctly
        // it relies on token auto refresh being left false for local tests where the app is reused, since it is persistent
        // but in CI it's fresh every time and would be true if not overridden in Info.plist
        it('should configure token auto refresh in Info.plist on ios', async function () {
          if (Platform.ios) {
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
          if (Platform.ios) {
            let tokenRefresh =
              await NativeModules.RNFBAppCheckModule.isTokenAutoRefreshEnabled('[DEFAULT]');
            tokenRefresh.should.equal(false);
          }
          firebase.appCheck().setTokenAutoRefreshEnabled(true);
          // Only iOS lets us assert on this unfortunately, other platforms have no accessor
          if (Platform.ios) {
            tokenRefresh =
              await NativeModules.RNFBAppCheckModule.isTokenAutoRefreshEnabled('[DEFAULT]');
            tokenRefresh.should.equal(true);
          }
        });
      });

      // TODO flakey after many runs, sometimes fails on android & ios,
      // possibly a rate limiting issue on the server side
      describe('getToken()', function () {
        it('token fetch attempt with configured debug token should work', async function () {
          try {
            const { token } = await firebase.appCheck().getToken(true);
            token.should.not.equal('');
            const decodedToken = decodeJWT(token);
            decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
            if (decodedToken.exp * 1000 < Date.now()) {
              return Promise.reject(
                `Token expired? now ${Date.now()} token exp: ${decodedToken.exp * 1000}`,
              );
            }

            // on android if you move too fast, you may not get a fresh token
            await Utils.sleep(2000);

            // Force refresh should get a different token?
            // TODO sometimes fails on android https://github.com/firebase/firebase-android-sdk/issues/2954
            const { token: token2 } = await firebase.appCheck().getToken(true);
            token2.should.not.equal('');
            const decodedToken2 = decodeJWT(token2);
            decodedToken2.aud[1].should.equal('projects/react-native-firebase-testing');
            if (decodedToken2.exp * 1000 < Date.now()) {
              return Promise.reject(
                `Token expired? now ${Date.now()} token exp: ${decodedToken2.exp * 1000}`,
              );
            }
            (token === token2).should.be.false();
          } catch (e) {
            // we will silently pass rate limiting errors
            e.message.should.containEql('Quota exceeded');
            this.skip();
          }
        });

        it('token fetch with config switch to invalid then valid should fail then work', async function () {
          if (Platform.other) {
            this.skip();
          }
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
              debugToken: getRandomToken(),
            },
            apple: {
              provider: 'debug',
              debugToken: getRandomToken(),
            },
            web: {
              provider: 'debug',
              siteKey: 'none',
            },
          });
          firebase
            .appCheck()
            .initializeAppCheck({ provider: rnfbProvider, isTokenAutoRefreshEnabled: false });

          try {
            const { token } = await firebase.appCheck().getToken(true);
            token.should.not.equal('');
            const decodedToken = decodeJWT(token);
            decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
            if (decodedToken.exp * 1000 < Date.now()) {
              return Promise.reject(
                `Token expired? now ${Date.now()} token exp: ${decodedToken.exp * 1000}`,
              );
            }
          } catch (e) {
            // we will silently pass rate limiting errors
            e.message.should.containEql('Quota exceeded');
            this.skip();
          }
        });
      });

      describe('getLimitedUseToken()', function () {
        it('limited use token fetch attempt with configured debug token should work', async function () {
          try {
            const { token } = await firebase.appCheck().getLimitedUseToken();
            token.should.not.equal('');
            const decodedToken = decodeJWT(token);
            decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
            if (decodedToken.exp * 1000 < Date.now()) {
              return Promise.reject(
                `Token expired? now ${Date.now()} token exp: ${decodedToken.exp * 1000}`,
              );
            }
          } catch (e) {
            // we will silently pass rate limiting errors
            e.message.should.containEql('Quota exceeded');
            this.skip();
          }
        });
      });

      describe('activate())', function () {
        if (Platform.other) {
          return;
        }

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
  });

  describe('modular', function () {
    let appCheckInstance;

    beforeEach(async function () {
      const { initializeAppCheck, ReactNativeFirebaseAppCheckProvider } = appCheckModular;

      let provider;

      if (!Platform.other) {
        provider = new ReactNativeFirebaseAppCheckProvider();
        provider.configure({
          android: {
            provider: 'debug',
            debugToken: getRandomToken(),
          },
          apple: {
            provider: 'debug',
            debugToken: getRandomToken(),
          },
          web: {
            provider: 'debug',
            siteKey: 'none',
          },
        });
      } else {
        provider = new ReactNativeFirebaseAppCheckProvider({
          getToken() {
            return FirebaseHelpers.fetchAppCheckToken();
          },
        });
      }

      // Our tests configure a debug provider with shared secret so we should get a valid token
      appCheckInstance = await initializeAppCheck(undefined, {
        provider,
        isTokenAutoRefreshEnabled: false,
      });
    });

    describe('setTokenAutoRefresh())', function () {
      it('should set token refresh', async function () {
        const { setTokenAutoRefreshEnabled } = appCheckModular;

        setTokenAutoRefreshEnabled(appCheckInstance, false);
        // Only iOS lets us assert on this unfortunately, other platforms have no accessor
        if (Platform.ios) {
          let tokenRefresh =
            await NativeModules.RNFBAppCheckModule.isTokenAutoRefreshEnabled('[DEFAULT]');
          tokenRefresh.should.equal(false);
        }
        setTokenAutoRefreshEnabled(appCheckInstance, true);
        // Only iOS lets us assert on this unfortunately, other platforms have no accessor
        if (Platform.ios) {
          tokenRefresh =
            await NativeModules.RNFBAppCheckModule.isTokenAutoRefreshEnabled('[DEFAULT]');
          tokenRefresh.should.equal(true);
        }
      });
    });

    describe('getToken()', function () {
      it('token fetch attempt with configured debug token should work', async function () {
        const { getToken } = appCheckModular;

        try {
          const { token } = await getToken(appCheckInstance, true);
          token.should.not.equal('');
          const decodedToken = decodeJWT(token);
          decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
          if (decodedToken.exp * 1000 < Date.now()) {
            return Promise.reject(
              `Token expired? now ${Date.now()} token exp: ${decodedToken.exp * 1000}`,
            );
          }

          // on android if you move too fast, you may not get a fresh token
          await Utils.sleep(2000);

          // Force refresh should get a different token?
          // TODO sometimes fails on android https://github.com/firebase/firebase-android-sdk/issues/2954
          const { token: token2 } = await getToken(appCheckInstance, true);
          token2.should.not.equal('');
          const decodedToken2 = decodeJWT(token2);
          decodedToken2.aud[1].should.equal('projects/react-native-firebase-testing');
          if (decodedToken2.exp * 1000 < Date.now()) {
            return Promise.reject(
              `Token expired? now ${Date.now()} token exp: ${decodedToken2.exp * 1000}`,
            );
          }
          (token === token2).should.be.false();
        } catch (e) {
          // we will silently pass rate limiting errors
          e.message.should.containEql('Quota exceeded');
          this.skip();
        }
      });

      it('token fetch with config switch to invalid then valid should fail then work', async function () {
        if (Platform.other) {
          this.skip();
        }
        const { initializeAppCheck, getToken, ReactNativeFirebaseAppCheckProvider } =
          appCheckModular;

        rnfbProvider = new ReactNativeFirebaseAppCheckProvider();
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

        // this config is invalid so it should fail
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
            debugToken: getRandomToken(),
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

        try {
          const { token } = await getToken(instance2, true);
          token.should.not.equal('');
          const decodedToken = decodeJWT(token);
          decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
          if (decodedToken.exp * 1000 < Date.now()) {
            return Promise.reject(
              `Token expired? now ${Date.now()} token exp: ${decodedToken.exp * 1000}`,
            );
          }
        } catch (e) {
          // we will silently pass rate limiting errors
          e.message.should.containEql('Quota exceeded');
          this.skip();
        }
      });
    });

    describe('getLimitedUseToken()', function () {
      it('limited use token fetch attempt with configured debug token should work', async function () {
        const { initializeAppCheck, getLimitedUseToken, ReactNativeFirebaseAppCheckProvider } =
          appCheckModular;

        const rnfbProvider = new ReactNativeFirebaseAppCheckProvider();
        rnfbProvider.configure({
          android: {
            provider: 'debug',
            debugToken: getRandomToken(),
          },
          apple: {
            provider: 'debug',
            debugToken: getRandomToken(),
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

        try {
          const { token } = await getLimitedUseToken(appCheckInstance);
          token.should.not.equal('');
          const decodedToken = decodeJWT(token);
          decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
          if (decodedToken.exp * 1000 < Date.now()) {
            return Promise.reject(
              `Token expired? now ${Date.now()} token exp: ${decodedToken.exp * 1000}`,
            );
          }
        } catch (e) {
          // we will silently pass rate limiting errors
          e.message.should.containEql('Quota exceeded');
          this.skip();
        }
      });
    });
  });
});
