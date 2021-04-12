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

let AdsConsent;

describe('admob() AdsConsent', function () {
  before(function () {
    AdsConsent = jet.require('packages/admob/lib/AdsConsent');
  });

  describe('requestInfoUpdate', function () {
    it('requests info update', async function () {
      const info = await AdsConsent.requestInfoUpdate(['pub-4406399463942824']);
      info.status.should.Number();
      info.isRequestLocationInEeaOrUnknown.should.be.Boolean();
    });
  });

  describe('showForm', function () {
    it('throws if options is not valid', function () {
      try {
        AdsConsent.showForm('foo');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'options' expected an object value");
        return Promise.resolve();
      }
    });

    it('throws if privacy policy is not valid', function () {
      try {
        AdsConsent.showForm({
          privacyPolicy: 'www.invertase.io',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'options.privacyPolicy' expected a valid HTTP or HTTPS URL");
        return Promise.resolve();
      }
    });

    it('throws if withPersonalizedAds is not a boolean', function () {
      try {
        AdsConsent.showForm({
          privacyPolicy: 'https://invertase.io',
          withPersonalizedAds: 'foo',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'options.withPersonalizedAds' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('throws if withNonPersonalizedAds is not a boolean', function () {
      try {
        AdsConsent.showForm({
          privacyPolicy: 'https://invertase.io',
          withNonPersonalizedAds: 'foo',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'options.withNonPersonalizedAds' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('throws if withAdFree is not a boolean', function () {
      try {
        AdsConsent.showForm({
          privacyPolicy: 'https://invertase.io',
          withAdFree: 'foo',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'options.withAdFree' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('throws if all options are false', function () {
      try {
        AdsConsent.showForm({
          privacyPolicy: 'https://invertase.io',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'options' form requires at least one option to be enabled");
        return Promise.resolve();
      }
    });

    // TODO test show form works?
  });

  describe('getAdProviders', function () {
    it('returns a list of ad providers', async function () {
      await AdsConsent.requestInfoUpdate(['pub-4406399463942824']);
      const providers = await AdsConsent.getAdProviders();
      providers.should.be.Array();

      // TODO in dev?
      // providers.length.should.be.greaterThan(0);
      //
      // providers[0].companyId.should.be.String();
      // providers[0].companyName.should.be.String();
      // providers[0].privacyPolicyUrl.should.be.String();
    });
  });

  describe('setDebugGeography', function () {
    it('throws if geography is invalid', function () {
      try {
        AdsConsent.setDebugGeography(3);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'geography' expected one of ");
        return Promise.resolve();
      }
    });

    it('sets the geography', async function () {
      await AdsConsent.setDebugGeography(0);
      const r1 = await AdsConsent.requestInfoUpdate(['pub-4406399463942824']);
      r1.isRequestLocationInEeaOrUnknown.should.eql(false);

      // FIXME works on iOS simulator, but android emulator not recognized as test device
      // unless you specifically get the id and add it. Probably same on iOS real device.

      // If it is not recognized as a test device, setting debug geography is ignored at runtime.

      // This ID comes from the logcat on a specific emulator, replace with what you see and it works:
      // AdsConsent.addTestDevices(['E67A2829C5CBBCB857969849D1729B5C']);

      // Real fix is to get the ID and add it to test device list (then remove it)
      // Should be able to get it like so from Apple and Android:
      // https://developer.apple.com/documentation/adsupport/asidentifiermanager/1614151-advertisingidentifier
      // https://developer.android.com/training/articles/ad-id
      // There is an API to check if you are currently set as a test device as well
      if (device.getPlatform() === 'android') {
        // temporary fix is to just return on android, and let iOS run it.
        return;
      }

      await AdsConsent.setDebugGeography(1);
      const r2 = await AdsConsent.requestInfoUpdate(['pub-4406399463942824']);
      if (!global.isCI) {
        r2.isRequestLocationInEeaOrUnknown.should.eql(true);
      }

      await AdsConsent.setDebugGeography(2);
      const r3 = await AdsConsent.requestInfoUpdate(['pub-4406399463942824']);
      if (!global.isCI) {
        r3.isRequestLocationInEeaOrUnknown.should.eql(false);
      }
    });
  });

  describe('getStatus / setStatus', function () {
    it('throws if status is invalid', function () {
      try {
        AdsConsent.setStatus(4);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'status' expected one of ");
        return Promise.resolve();
      }
    });

    it('sets and gets unknown', async function () {
      await AdsConsent.setStatus(0);
      const s = await AdsConsent.getStatus();
      s.should.eql(0);
    });

    it('sets and gets non-personalized', async function () {
      await AdsConsent.setStatus(1);
      const s = await AdsConsent.getStatus();
      s.should.eql(1);
    });

    it('sets and gets personalized', async function () {
      await AdsConsent.setStatus(2);
      const s = await AdsConsent.getStatus();
      s.should.eql(2);
    });
  });

  describe('setTagForUnderAgeOfConsent', function () {
    it('throws if value is not a boolean', function () {
      try {
        AdsConsent.setTagForUnderAgeOfConsent('true');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'tag' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets a value', async function () {
      await AdsConsent.setTagForUnderAgeOfConsent(false);
    });
  });

  describe('addTestDevices', function () {
    it('throws if value is not an array', function () {
      try {
        AdsConsent.addTestDevices(12345);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'deviceIds' expected an array of string values");
        return Promise.resolve();
      }
    });

    it('throws if deviceIds contains invalid value', function () {
      try {
        AdsConsent.addTestDevices(['foo', 123]);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'deviceIds' expected an array of string values");
        return Promise.resolve();
      }
    });

    it('sets device IDs', async function () {
      await AdsConsent.addTestDevices(['foo', 'bar']);
    });
  });
});
