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

describe('dynamicLinks() dynamicLinkParams.navigation', function () {
  describe('v8 compatibility', function () {
    it('throws if navigation is not an object', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          navigation: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.navigation' must be an object");
        return Promise.resolve();
      }
    });

    it('throws if navigation.forcedRedirectEnabled is not a boolean', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          navigation: {
            forcedRedirectEnabled: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'dynamicLinksParams.navigation.forcedRedirectEnabled' must be a boolean",
        );
        return Promise.resolve();
      }
    });
  });

  describe('modular', function () {
    it('throws if navigation is not an object', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          navigation: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.navigation' must be an object");
        return Promise.resolve();
      }
    });

    it('throws if navigation.forcedRedirectEnabled is not a boolean', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          navigation: {
            forcedRedirectEnabled: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'dynamicLinksParams.navigation.forcedRedirectEnabled' must be a boolean",
        );
        return Promise.resolve();
      }
    });
  });
});
