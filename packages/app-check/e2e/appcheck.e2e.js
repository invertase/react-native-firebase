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

import { Base64 } from '@react-native-firebase/app/dist/module/common';

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

function isAppCheckCloudQuotaError(error) {
  const message = error?.message || String(error);
  return /Quota exceeded|Too many server requests|RESOURCE_EXHAUSTED/i.test(message);
}

function skipIfAppCheckCloudQuotaError(error, testContext) {
  if (isAppCheckCloudQuotaError(error)) {
    testContext.skip();
  }
  throw error;
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
  describe('modular', function () {
    let appCheckInstance;

    beforeEach(async function () {
      const { initializeAppCheck, ReactNativeFirebaseAppCheckProvider, CustomProvider } =
        appCheckModular;

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
        provider = new CustomProvider({
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
            await NativeModules.NativeRNFBTurboAppCheck.isTokenAutoRefreshEnabled('[DEFAULT]');
          tokenRefresh.should.equal(false);
        }
        setTokenAutoRefreshEnabled(appCheckInstance, true);
        // Only iOS lets us assert on this unfortunately, other platforms have no accessor
        if (Platform.ios) {
          tokenRefresh =
            await NativeModules.NativeRNFBTurboAppCheck.isTokenAutoRefreshEnabled('[DEFAULT]');
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
          skipIfAppCheckCloudQuotaError(e, this);
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
          skipIfAppCheckCloudQuotaError(e, this);
        }
      });
    });

    describe('getLimitedUseToken()', function () {
      it('limited use token fetch attempt with configured debug token should work', async function () {
        if (Platform.other) {
          this.skip();
        }
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
          skipIfAppCheckCloudQuotaError(e, this);
        }
      });
    });
  });
});
