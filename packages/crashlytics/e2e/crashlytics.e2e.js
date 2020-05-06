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

describe('crashlytics()', () => {
  // Run locally only - flakey on CI
  xdescribe('crash()', () => {
    it('crashes the app', async () => {
      jet.context._BEFORE_CRASH_ = 1;
      firebase.crashlytics().crash();
      await Utils.sleep(1500);
      await device.launchApp({ newInstance: false });
      await Utils.sleep(1500);
      should.equal(jet.context._BEFORE_CRASH_, undefined);
    });
  });

  describe('log()', () => {
    it('accepts any value', async () => {
      firebase.crashlytics().log('invertase');
      firebase.crashlytics().log(1337);
      firebase.crashlytics().log(null);
      firebase.crashlytics().log(true);
      firebase.crashlytics().log({});
      firebase.crashlytics().log([]);
      firebase.crashlytics().log(() => {});
    });
  });

  describe('setUserId()', () => {
    it('accepts string values', async () => {
      await firebase.crashlytics().setUserId('invertase');
    });

    it('rejects none string values', async () => {
      try {
        await firebase.crashlytics().setUserId(666.1337);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql('must be a string');
      }
    });
  });

  describe('setUserName()', () => {
    it('accepts string values', async () => {
      await firebase.crashlytics().setUserName('invertase');
    });

    it('rejects none string values', async () => {
      try {
        await firebase.crashlytics().setUserName(666.1337);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql('must be a string');
      }
    });
  });

  describe('setUserEmail()', () => {
    it('accepts string values', async () => {
      await firebase.crashlytics().setUserEmail('oss@invertase.io');
    });

    it('rejects none string values', async () => {
      try {
        await firebase.crashlytics().setUserEmail(666.1337);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql('must be a string');
      }
    });
  });

  describe('setAttribute()', () => {
    it('accepts string values', async () => {
      await firebase.crashlytics().setAttribute('invertase', '1337');
    });

    it('rejects none string values', async () => {
      try {
        await firebase.crashlytics().setAttribute('invertase', 33.3333);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql('must be a string');
      }
    });

    it('errors if attribute name is not a string', async () => {
      try {
        await firebase.crashlytics().setAttribute(1337, 'invertase');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql('must be a string');
      }
    });
  });

  describe('setAttributes()', () => {
    it('errors if arg is not an object', async () => {
      try {
        await firebase.crashlytics().setAttributes(1337);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql('must be an object');
      }
    });

    it('accepts string values', async () => {
      await firebase.crashlytics().setAttributes({ invertase: '1337' });
    });
  });

  describe('recordError()', () => {
    it('warns if not an error', async () => {
      const orig = jet.context.console.warn;
      let logged = false;
      jet.context.console.warn = msg => {
        msg.should.containEql('expects an instance of Error');
        logged = true;
        jet.context.console.warn = orig;
      };

      firebase.crashlytics().recordError(1337);
      should.equal(logged, true);
    });

    it('accepts Error values', async () => {
      firebase.crashlytics().recordError(new Error("I'm a teapot!"));
      // TODO verify stack obj
    });
  });

  describe('setCrashlyticsCollectionEnabled()', () => {
    it('true', async () => {
      await firebase.crashlytics().setCrashlyticsCollectionEnabled(true);
      should.equal(firebase.crashlytics().isCrashlyticsCollectionEnabled, true);
    });

    it('false', async () => {
      await firebase.crashlytics().setCrashlyticsCollectionEnabled(false);
      should.equal(firebase.crashlytics().isCrashlyticsCollectionEnabled, false);
    });

    it('errors if not boolean', async () => {
      try {
        await firebase.crashlytics().setCrashlyticsCollectionEnabled(1337);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql('must be a boolean');
      }
    });
  });
});
