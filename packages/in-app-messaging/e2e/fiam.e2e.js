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

describe('inAppMessaging()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.inAppMessaging);
      app.inAppMessaging().app.should.equal(app);
    });
  });

  describe('setAutomaticDataCollectionEnabled()', () => {
    it('true', async () => {
      if (Platform.ios) {
        // android has this as false when Perf tests run prior - internally all share the same flag on the native SDK
        should.equal(firebase.inAppMessaging().isAutomaticDataCollectionEnabled, true);
      }
      await firebase.inAppMessaging().setAutomaticDataCollectionEnabled(true);
      should.equal(firebase.inAppMessaging().isAutomaticDataCollectionEnabled, true);
      await Utils.sleep(2000);
    });

    it('false', async () => {
      await device.launchApp();
      await firebase.inAppMessaging().setAutomaticDataCollectionEnabled(false);
      should.equal(firebase.inAppMessaging().isAutomaticDataCollectionEnabled, false);
      await Utils.sleep(1500);
      await firebase.inAppMessaging().setAutomaticDataCollectionEnabled(true);
      should.equal(firebase.inAppMessaging().isAutomaticDataCollectionEnabled, true);
      await Utils.sleep(1500);
    });

    it('errors if not boolean', async () => {
      try {
        firebase.inAppMessaging().setAutomaticDataCollectionEnabled();
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a boolean');
        return Promise.resolve();
      }
    });
  });

  describe('setMessagesDisplaySuppressed()', () => {
    it('false', async () => {
      should.equal(firebase.inAppMessaging().isMessagesDisplaySuppressed, false);
      await firebase.inAppMessaging().setMessagesDisplaySuppressed(false);
      should.equal(firebase.inAppMessaging().isMessagesDisplaySuppressed, false);
      await Utils.sleep(2000);
    });

    it('true', async () => {
      await device.launchApp();
      await firebase.inAppMessaging().setMessagesDisplaySuppressed(true);
      should.equal(firebase.inAppMessaging().isMessagesDisplaySuppressed, true);
      await Utils.sleep(1500);
      await firebase.inAppMessaging().setMessagesDisplaySuppressed(false);
      should.equal(firebase.inAppMessaging().isMessagesDisplaySuppressed, false);
      await Utils.sleep(1500);
    });

    it('errors if not boolean', async () => {
      try {
        firebase.inAppMessaging().setMessagesDisplaySuppressed();
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a boolean');
        return Promise.resolve();
      }
    });
  });
});
