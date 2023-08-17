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

describe('dynamicLinks() dynamicLinkParams.ios', function () {
  describe('v8 compatibility', function () {
    it('throws if ios is not an object', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          ios: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios' must be an object");
        return Promise.resolve();
      }
    });

    it('throws if ios.appStoreId is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          ios: {
            appStoreId: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.appStoreId' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.bundleId is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          ios: {
            bundleId: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.bundleId' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.customScheme is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          ios: {
            customScheme: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.customScheme' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.fallbackUrl is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          ios: {
            fallbackUrl: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.fallbackUrl' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.iPadBundleId is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          ios: {
            iPadBundleId: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.iPadBundleId' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.iPadFallbackUrl is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          ios: {
            iPadFallbackUrl: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.iPadFallbackUrl' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.minimumVersion is not a string', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          ios: {
            minimumVersion: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.minimumVersion' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.bundleId is not set', function () {
      try {
        firebase.dynamicLinks().buildLink({
          ...baseParams,
          ios: {
            minimumVersion: '10.0',
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'dynamicLinksParams.ios' missing required 'bundleId' property",
        );
        return Promise.resolve();
      }
    });
  });

  describe('modular', function () {
    it('throws if ios is not an object', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          ios: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios' must be an object");
        return Promise.resolve();
      }
    });

    it('throws if ios.appStoreId is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          ios: {
            appStoreId: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.appStoreId' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.bundleId is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          ios: {
            bundleId: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.bundleId' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.customScheme is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          ios: {
            customScheme: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.customScheme' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.fallbackUrl is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          ios: {
            fallbackUrl: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.fallbackUrl' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.iPadBundleId is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          ios: {
            iPadBundleId: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.iPadBundleId' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.iPadFallbackUrl is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          ios: {
            iPadFallbackUrl: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.iPadFallbackUrl' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.minimumVersion is not a string', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          ios: {
            minimumVersion: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'dynamicLinksParams.ios.minimumVersion' must be a string");
        return Promise.resolve();
      }
    });

    it('throws if ios.bundleId is not set', function () {
      const { getDynamicLinks, buildLink } = dynamicLinksModular;
      try {
        buildLink(getDynamicLinks(), {
          ...baseParams,
          ios: {
            minimumVersion: '10.0',
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'dynamicLinksParams.ios' missing required 'bundleId' property",
        );
        return Promise.resolve();
      }
    });
  });
});
