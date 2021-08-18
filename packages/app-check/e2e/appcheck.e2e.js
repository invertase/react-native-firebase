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

describe('appCheck()', function () {
  describe('config', function () {
    // This depends on firebase.json containing a false value for token auto refresh, we
    // verify here that it was carried in to the Info.plist correctly
    // it relies on token auto refresh being left false for local tests where the app is reused, since it is persistent
    // but in CI it's fresh every time and would be true if not overridden in Info.plist
    it('should configure token auto refresh in Info.plist on ios', async function () {
      if (device.getPlatform() === 'ios') {
        const tokenRefresh = await NativeModules.RNFBAppCheckModule.isTokenAutoRefreshEnabled(
          '[DEFAULT]',
        );
        tokenRefresh.should.equal(false);
      } else {
        this.skip();
      }
    });
  });

  describe('setTokenAutoRefresh())', function () {
    it('should set token refresh', function () {
      firebase.appCheck().setTokenAutoRefreshEnabled(false);
    });
  });
  describe('getToken())', function () {
    it('token fetch attempt should work', async function () {
      // Our tests configure a debug provider with shared secret so we should get a valid token
      const token = await firebase.appCheck().getToken();
      token.should.not.equal('');
      const decodedToken = jwt.decode(token);
      decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
      if (decodedToken.exp < Date.now()) {
        Promise.reject('Token already expired');
      }

      // Force refresh should get a different token?
      // TODO iOS tokens are stale because of https://github.com/firebase/firebase-ios-sdk/issues/8544
      if (device.getPlatform() === 'android') {
        const token2 = await firebase.appCheck().getToken(true);
        token2.should.not.equal('');
        const decodedToken2 = jwt.decode(token2);
        decodedToken2.aud[1].should.equal('projects/react-native-firebase-testing');
        if (decodedToken2.exp < Date.now()) {
          Promise.reject('Token already expired');
        }
        (token === token2).should.be.false();
      }
    });
  });
  describe('activate())', function () {
    it('should activate with default provider and default token refresh', async function () {
      try {
        await firebase.appCheck().activate('ignored', false);
      } catch (e) {
        return Promise.reject(e);
      }
    });
    // Dynamic providers are not possible on iOS, so the debug provider is always working
    it('token fetch attempt should work but fail attestation', async function () {
      if (device.getPlatform() === 'android') {
        try {
          // Activating on Android clobbers the shared secret in the debug provider shared secret, should fail now
          await firebase.appCheck().getToken(true);
          return Promise.reject(
            'Should have thrown after resetting shared secret on debug provider',
          );
        } catch (e) {
          e.message.should.containEql('[appCheck/token-error]');
          e.message.should.containEql('App attestation failed');
          return Promise.resolve();
        }
      } else {
        this.skip();
      }
    });
  });
});
