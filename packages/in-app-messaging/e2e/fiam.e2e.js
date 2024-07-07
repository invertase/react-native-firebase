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

describe('inAppMessaging()', function () {
  // TODO Conflicts with Modular tests in Jet,
  // Ignore for now since v8 compat going away eventually
  xdescribe('v8 compatibility', function () {
    describe('namespace', function () {
      it('accessible from firebase.app()', function () {
        const app = firebase.app();
        should.exist(app.inAppMessaging);
        app.inAppMessaging().app.should.equal(app);
      });
    });

    describe('setAutomaticDataCollectionEnabled()', function () {
      // These depend on `tests/firebase.json` having `in_app_messaging_auto_collection_enabled` set to false the first time
      // The setting is persisted across restarts, reset to false after for local runs where prefs are sticky
      afterEach(async function () {
        await firebase.inAppMessaging().setAutomaticDataCollectionEnabled(false);
      });

      it('true', async function () {
        should.equal(firebase.inAppMessaging().isAutomaticDataCollectionEnabled, false);
        await firebase.inAppMessaging().setAutomaticDataCollectionEnabled(true);
        should.equal(firebase.inAppMessaging().isAutomaticDataCollectionEnabled, true);
      });

      it('false', async function () {
        await firebase.inAppMessaging().setAutomaticDataCollectionEnabled(false);
        should.equal(firebase.inAppMessaging().isAutomaticDataCollectionEnabled, false);
      });

      it('errors if not boolean', async function () {
        try {
          firebase.inAppMessaging().setAutomaticDataCollectionEnabled();
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a boolean');
          return Promise.resolve();
        }
      });
    });
  });

  describe('modular', function () {
    // TODO flakey on Jet tests
    xdescribe('setAutomaticDataCollectionEnabled()', function () {
      // These depend on `tests/firebase.json` having `in_app_messaging_auto_collection_enabled` set to false the first time
      // The setting is persisted across restarts, reset to false after for local runs where prefs are sticky
      afterEach(async function () {
        await firebase.inAppMessaging().setAutomaticDataCollectionEnabled(false);
      });
      // afterEach(async function () {
      //   const { getInAppMessaging, setAutomaticDataCollectionEnabled } = inAppMessagingModular;
      //   const inAppMessaging = getInAppMessaging();
      //   await setAutomaticDataCollectionEnabled(inAppMessaging, false);
      // });

      it('true', async function () {
        const {
          getInAppMessaging,
          setAutomaticDataCollectionEnabled,
          isAutomaticDataCollectionEnabled,
        } = inAppMessagingModular;
        const inAppMessaging = getInAppMessaging();

        should.equal(isAutomaticDataCollectionEnabled(inAppMessaging), false);
        await setAutomaticDataCollectionEnabled(inAppMessaging, true);
        should.equal(isAutomaticDataCollectionEnabled(inAppMessaging), true);
      });

      it('false', async function () {
        const {
          getInAppMessaging,
          setAutomaticDataCollectionEnabled,
          isAutomaticDataCollectionEnabled,
        } = inAppMessagingModular;
        const inAppMessaging = getInAppMessaging();

        await setAutomaticDataCollectionEnabled(inAppMessaging, false);
        should.equal(isAutomaticDataCollectionEnabled(inAppMessaging), false);
      });

      it('errors if not boolean', async function () {
        const { getInAppMessaging, setAutomaticDataCollectionEnabled } = inAppMessagingModular;

        try {
          await setAutomaticDataCollectionEnabled(getInAppMessaging());
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a boolean');
          return Promise.resolve();
        }
      });
    });
  });
});
