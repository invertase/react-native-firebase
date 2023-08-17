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

const { baseParams } = require('./dynamicLinks.e2e');

describe('dynamicLinks() dynamicLinkParams.itunes', function () {
  describe('v8 compatibility', function () {
    it('throws if itunes is not an object', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          itunes: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.itunes' must be an object");
        return Promise.resolve();
      }
    });

    it('throws if itunes.affiliateToken is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          itunes: {
            affiliateToken: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.itunes.affiliateToken' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if itunes.campaignToken is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          itunes: {
            campaignToken: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.itunes.campaignToken' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if itunes.providerToken is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          itunes: {
            providerToken: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.itunes.providerToken' must be a string");
        return Promise.resolve();
      }
    });
  });

  describe('modular', function () {
    it('throws if itunes is not an object', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          itunes: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.itunes' must be an object");
        return Promise.resolve();
      }
    });

    it('throws if itunes.affiliateToken is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          itunes: {
            affiliateToken: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.itunes.affiliateToken' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if itunes.campaignToken is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          itunes: {
            campaignToken: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.itunes.campaignToken' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if itunes.providerToken is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          itunes: {
            providerToken: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.itunes.providerToken' must be a string");
        return Promise.resolve();
      }
    });
  });
});
