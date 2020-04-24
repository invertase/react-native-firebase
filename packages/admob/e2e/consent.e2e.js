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

describe('admob() AdsConsent', () => {
  before(() => {
    AdsConsent = jet.require('packages/admob/lib/AdsConsent');
  });

  describe('requestInfoUpdate', () => {
    it('throws if publisherIds is not an array', () => {
      try {
        AdsConsent.requestInfoUpdate('pub-123');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'publisherIds' expected an array of string values");
        return Promise.resolve();
      }
    });

    it('throws if publisherIds is empty array', () => {
      try {
        AdsConsent.requestInfoUpdate([]);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'publisherIds' list of publisher IDs cannot be empty");
        return Promise.resolve();
      }
    });

    it('throws if publisherIds contains non-string values', () => {
      try {
        AdsConsent.requestInfoUpdate(['foo', 123]);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'publisherIds[1]' expected a string value");
        return Promise.resolve();
      }
    });

    it('requests info update', async () => {
      const info = await AdsConsent.requestInfoUpdate(['pub-4406399463942824']);
      info.status.should.Number();
      info.isRequestLocationInEeaOrUnknown.should.be.Boolean();
    });
  });

  describe('showForm', () => {
    it('throws if options is not valid', () => {
      try {
        AdsConsent.showForm('foo');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'options' expected an object value");
        return Promise.resolve();
      }
    });

    it('throws if privacy policy is not valid', () => {
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

    it('throws if withPersonalizedAds is not a boolean', () => {
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

    it('throws if withNonPersonalizedAds is not a boolean', () => {
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

    it('throws if withAdFree is not a boolean', () => {
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

    it('throws if all options are false', () => {
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

  describe('getAdProviders', () => {
    it('returns a list of ad providers', async () => {
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

  describe('setDebugGeography', () => {
    it('throws if geography is invalid', () => {
      try {
        AdsConsent.setDebugGeography(3);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'geography' expected one of ");
        return Promise.resolve();
      }
    });

    it('sets the geography', async () => {
      await AdsConsent.setDebugGeography(0);
      const r1 = await AdsConsent.requestInfoUpdate(['pub-4406399463942824']);
      r1.isRequestLocationInEeaOrUnknown.should.be.Boolean();

      await AdsConsent.setDebugGeography(1);
      const r2 = await AdsConsent.requestInfoUpdate(['pub-4406399463942824']);
      r2.isRequestLocationInEeaOrUnknown.should.eql(true);

      await AdsConsent.setDebugGeography(2);
      const r3 = await AdsConsent.requestInfoUpdate(['pub-4406399463942824']);
      r3.isRequestLocationInEeaOrUnknown.should.eql(false);
    });
  });

  describe('getStatus / setStatus', () => {
    it('throws if status is invalid', () => {
      try {
        AdsConsent.setStatus(4);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'status' expected one of ");
        return Promise.resolve();
      }
    });

    it('sets and gets unknown', async () => {
      await AdsConsent.setStatus(0);
      const s = await AdsConsent.getStatus();
      s.should.eql(0);
    });

    it('sets and gets non-personalized', async () => {
      await AdsConsent.setStatus(1);
      const s = await AdsConsent.getStatus();
      s.should.eql(1);
    });

    it('sets and gets personalized', async () => {
      await AdsConsent.setStatus(2);
      const s = await AdsConsent.getStatus();
      s.should.eql(2);
    });
  });

  describe('setTagForUnderAgeOfConsent', () => {
    it('throws if value is not a boolean', () => {
      try {
        AdsConsent.setTagForUnderAgeOfConsent('true');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'tag' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('sets a value', async () => {
      await AdsConsent.setTagForUnderAgeOfConsent(false);
    });
  });

  describe('addTestDevices', () => {
    it('throws if value is not an array', () => {
      try {
        AdsConsent.addTestDevices(12345);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'deviceIds' expected an array of string values");
        return Promise.resolve();
      }
    });

    it('throws if deviceIds contains invalid value', () => {
      try {
        AdsConsent.addTestDevices(['foo', 123]);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'deviceIds' expected an array of string values");
        return Promise.resolve();
      }
    });

    it('sets device IDs', async () => {
      await AdsConsent.addTestDevices(['foo', 'bar']);
    });
  });
});
