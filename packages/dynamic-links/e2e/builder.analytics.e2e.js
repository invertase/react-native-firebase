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

describe('dynamicLinks() dynamicLinkParams.analytics', function () {
  describe('v8 compatibility', function () {
    it('throws if analytics is not an object', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          analytics: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.analytics' must be an object");
        return Promise.resolve();
      }
    });

    it('throws if analytics.campaign is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          analytics: {
            campaign: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.analytics.campaign' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if analytics.content is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          analytics: {
            content: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.analytics.content' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if analytics.medium is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          analytics: {
            medium: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.analytics.medium' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if analytics.source is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          analytics: {
            source: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.analytics.source' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if analytics.term is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          analytics: {
            term: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.analytics.term' must be a string");
        return Promise.resolve();
      }
    });
  });

  describe('modular', function () {
    it('throws if analytics is not an object', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          analytics: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.analytics' must be an object");
        return Promise.resolve();
      }
    });

    it('throws if analytics.campaign is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          analytics: {
            campaign: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.analytics.campaign' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if analytics.content is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          analytics: {
            content: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.analytics.content' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if analytics.medium is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          analytics: {
            medium: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.analytics.medium' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if analytics.source is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          analytics: {
            source: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.analytics.source' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if analytics.term is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          analytics: {
            term: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.analytics.term' must be a string");
        return Promise.resolve();
      }
    });
  });
});
