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

describe('iid()', function() {
  afterEach(async function() {
    await Utils.sleep(150);
  });
  describe('namespace', function() {
    it('accessible from firebase.app()', function() {
      const app = firebase.app();
      should.exist(app.iid);
      app.iid().app.should.equal(app);
    });

    it('supports multiple apps', async function() {
      firebase.iid().app.name.should.equal('[DEFAULT]');

      firebase
        .iid(firebase.app('secondaryFromNative'))
        .app.name.should.equal('secondaryFromNative');

      firebase
        .app('secondaryFromNative')
        .iid()
        .app.name.should.equal('secondaryFromNative');
      await Utils.sleep(1000);

      const defaultToken = await firebase.iid().getToken();
      await Utils.sleep(1000);

      const secondaryToken = await firebase
        .app('secondaryFromNative')
        .iid()
        .getToken();

      defaultToken.should.be.a.String();
      secondaryToken.should.be.a.String();

      if (device.getPlatform() === 'ios') {
        secondaryToken.should.equal(defaultToken);
      } else if (device.getPlatform() === 'android') {
        secondaryToken.should.not.equal(defaultToken);
      }
    });
  });

  describe('get()', function() {
    it('returns instance id string', async function() {
      const iid = await firebase.iid().get();
      iid.should.be.a.String();
    });
  });

  describe('delete()', function() {
    android.it('deletes the current instance id', async () => {
      const iidBefore = await firebase.iid().get();
      await Utils.sleep(1000);
      await firebase.iid().delete();
      await Utils.sleep(1000);

      const iidAfter = await firebase.iid().get();

      iidAfter.should.be.a.String();
      iidBefore.should.not.equal(iidAfter);
      await Utils.sleep(3000);
    });
  });

  describe('getToken()', function() {
    it('should return an FCM token from getToken with arguments', async function() {
      const authorizedEntity = firebase.iid().app.options.messagingSenderId;
      const token = await firebase.iid().getToken(authorizedEntity, '*');
      token.should.be.a.String();
    });

    it('should return an FCM token from getToken without arguments', async function() {
      const token = await firebase.iid().getToken();
      token.should.be.a.String();
    });

    it('should return an FCM token from getToken with 1 argument', async function() {
      const authorizedEntity = firebase.iid().app.options.messagingSenderId;

      const token = await firebase.iid().getToken(authorizedEntity);
      token.should.be.a.String();
    });
  });

  describe('deleteToken()', function() {
    android.it('should return nil from deleteToken with arguments', async () => {
      const authorizedEntity = firebase.iid().app.options.messagingSenderId;
      const token = await firebase.iid().deleteToken(authorizedEntity, '*');
      should.not.exist(token);
    });

    android.it('should return nil from deleteToken without arguments', async () => {
      const token = await firebase.iid().deleteToken();
      should.not.exist(token);
    });

    android.it('should return nil from deleteToken with 1 argument', async () => {
      const authorizedEntity = firebase.iid().app.options.messagingSenderId;
      const token = await firebase.iid().deleteToken(authorizedEntity);
      should.not.exist(token);
    });
  });
});
