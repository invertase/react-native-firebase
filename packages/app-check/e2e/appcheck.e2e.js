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
  describe('setTokenAutoRefresh())', function () {
    it('should set token refresh', function () {
      firebase.appCheck().setTokenAutoRefreshEnabled(false);
    });
  });
  describe('getToken())', function () {
    it('token fetch attempt should work', async function () {
      // Our tests configure a debug provider with shared secret so we should get a valid token
      const token = await firebase.appCheck().getToken(true);
      token.should.not.equal('');
      const decodedToken = jwt.decode(token);
      decodedToken.aud[1].should.equal('projects/react-native-firebase-testing');
      if (decodedToken.exp < Date.now()) {
        Promise.reject('Token already expired');
      }
    });
  });
  describe('activate())', function () {
    it('should activate with default provider and default token refresh', async function () {
      try {
        await firebase.appCheck().activate('ignored', true);
      } catch (e) {
        return Promise.reject(e);
      }
    });
    // Dynamic providers are not possible on iOS, so the debug provider is always working
    android.it('token fetch attempt should work but fail attestation', async function () {
      try {
        // Activating on Android clobbers the shared secret in the debug provider shared secret, should fail now
        await firebase.appCheck().getToken(true);
        return Promise.reject('Should have thrown after resetting shared secret on debug provider');
      } catch (e) {
        e.message.should.containEql('[appCheck/token-error]');
        e.message.should.containEql('App attestation failed');
        return Promise.resolve();
      }
    });
  });
});
