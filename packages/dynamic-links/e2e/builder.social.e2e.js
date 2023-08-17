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

describe('dynamicLinks() dynamicLinkParams.social', function () {
  describe('v8 compatibility', function () {
    it('throws if social is not an object', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          social: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.social' must be an object");
        return Promise.resolve();
      }
    });

    it('throws if social.descriptionText is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          social: {
            descriptionText: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.social.descriptionText' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if social.imageUrl is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          social: {
            imageUrl: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.social.imageUrl' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if social.title is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          social: {
            title: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.social.title' must be a string");
        return Promise.resolve();
      }
    });
  });

  describe('modular', function () {
    it('throws if social is not an object', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          social: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.social' must be an object");
        return Promise.resolve();
      }
    });

    it('throws if social.descriptionText is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          social: {
            descriptionText: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.social.descriptionText' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if social.imageUrl is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          social: {
            imageUrl: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.social.imageUrl' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if social.title is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          social: {
            title: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.social.title' must be a string");
        return Promise.resolve();
      }
    });
  });
});
