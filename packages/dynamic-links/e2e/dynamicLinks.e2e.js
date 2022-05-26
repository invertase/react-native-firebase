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

// This host is set up in Xcode/iOS applinks: + Android intent-filter + Firebase console Android test app SHA256
const DYNAMIC_LINK_DOMAIN = 'https://reactnativefirebase.page.link';
const LINK_TARGET_DOMAIN = 'https://reactnativefirebase.page.link'; // was https://invertase.io
const TEST_LINK1_TARGET = `${LINK_TARGET_DOMAIN}/developers`;
const TEST_LINK1 = `${DYNAMIC_LINK_DOMAIN}/?link=${TEST_LINK1_TARGET}&apn=com.invertase.testing`;
const TEST_LINK2_TARGET = `${LINK_TARGET_DOMAIN}/contact`;
const TEST_LINK2 = `${DYNAMIC_LINK_DOMAIN}/?link=${TEST_LINK2_TARGET}&apn=com.invertase.testing`;
const TEST_LINK3_TARGET = `${LINK_TARGET_DOMAIN}/blog`;
const TEST_LINK3 = `${DYNAMIC_LINK_DOMAIN}/?link=${TEST_LINK3_TARGET}&apn=com.invertase.testing`;

const baseParams = {
  link: TEST_LINK2_TARGET,
  domainUriPrefix: DYNAMIC_LINK_DOMAIN,
};

const getShortLink = async function (url, type) {
  return await firebase.dynamicLinks().buildShortLink(
    {
      link: url,
      domainUriPrefix: DYNAMIC_LINK_DOMAIN,
      analytics: {
        source: 'github',
        medium: 'web',
        campaign: 'prs-welcome',
        content: 'fluff',
        term: 'long',
      },
      ios: {
        bundleId: 'io.invertase.testing',
        minimumVersion: '123',
      },
      android: {
        packageName: 'com.invertase.testing',
        minimumVersion: '123', // the version code in tests/android/app/build.gradle must be higher!
      },
    },
    type,
  );
};

module.exports.baseParams = baseParams;

describe('dynamicLinks()', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      should.exist(app.dynamicLinks);
      app.dynamicLinks().app.should.equal(app);
    });
  });

  describe('buildLink()', function () {
    it('returns a dynamic link', async function () {
      const link = await firebase.dynamicLinks().buildLink(baseParams);
      link.should.be.String();
      link.length.should.be.greaterThan(6);
    });
  });

  describe('buildShortLink()', function () {
    it('returns a short link', async function () {
      const link = await firebase.dynamicLinks().buildShortLink(baseParams);
      link.should.be.String();
      link.length.should.be.greaterThan(6);
    });

    it('throws if type is invalid', function () {
      try {
        firebase.dynamicLinks().buildShortLink(baseParams, 'LONG');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'shortLinkType' expected one of DEFAULT, SHORT or UNGUESSABLE",
        );
        return Promise.resolve();
      }
    });
  });

  describe('resolveLink()', function () {
    it('resolves a long link', async function () {
      // TODO: flaky on android if link is used for open tests as well?
      // https://github.com/firebase/firebase-android-sdk/issues/2909
      const link = await firebase.dynamicLinks().resolveLink(TEST_LINK2);
      link.should.be.an.Object();
      link.url.should.equal(TEST_LINK2_TARGET);
      should.equal(link.minimumAppVersion, null);
    });

    it('resolves a short link', async function () {
      const shortLink = await getShortLink(
        TEST_LINK2_TARGET,
        firebase.dynamicLinks.ShortLinkType.UNGUESSABLE,
      );
      shortLink.should.be.String();
      // Unguessable links are 17 characters by definitions, add the slash: 18 chars
      shortLink.length.should.be.eql(baseParams.domainUriPrefix.length + 18);

      const link = await firebase.dynamicLinks().resolveLink(shortLink);
      link.should.be.an.Object();
      link.url.should.equal(TEST_LINK2_TARGET);
      // TODO: harmonize the API so that minimumAppVersion is either a number or a string
      // it would be a breaking change in the API though
      // On Android it's a number and iOS a String, so parseInt is used to have a single test
      parseInt(link.minimumAppVersion, 10).should.equal(123);

      // "utm_content" and "utm_term" will not come back when resolved, even if you build with them
      link.utmParameters.utm_source.should.equal('github');
      link.utmParameters.utm_medium.should.equal('web');
      link.utmParameters.utm_campaign.should.equal('prs-welcome');
    });

    it('throws on links that do not exist', async function () {
      try {
        await firebase.dynamicLinks().resolveLink(baseParams.domainUriPrefix + '/not-a-valid-link');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.code.should.containEql('not-found');
        e.message.should.containEql('Dynamic link not found');
        return Promise.resolve();
      }
    });

    it('throws on static links', async function () {
      try {
        await firebase.dynamicLinks().resolveLink(TEST_LINK2_TARGET);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql('Dynamic link not found');
        return Promise.resolve();
      }
    });

    it('throws on invalid links', async function () {
      try {
        await firebase.dynamicLinks().resolveLink(null);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql('Invalid link parameter');
        return Promise.resolve();
      }
    });

    // // The API is documented as being capable of suffering a processing failure, and we
    // // handle it, but I don't know how to trigger it to validate
    // it('throws on link processing error', async () => {
    //   try {
    //     await firebase.dynamicLinks().resolveLink(SOME UNKNOWN INPUT TO CAUSE PROCESSING ERROR);
    //     return Promise.reject(new Error('Did not throw Error.'));
    //   } catch (e) {
    //     e.code.should.containEql('resolve-link-error');
    //     return Promise.resolve();
    //   }
    // });
  });

  describe('getInitialLink()', function () {
    it('should return the dynamic link instance that launched the app', async function () {
      const shortLink = await getShortLink(
        TEST_LINK3_TARGET,
        firebase.dynamicLinks.ShortLinkType.SHORT,
      );
      if (device.getPlatform() === 'android') {
        await device.launchApp({ newInstance: true, url: shortLink });
      } else {
        // #2660 - iOS getInitialLink fails, while Linking.getInitialLink() will return the link for resolution !?
        // #2631 - on iOS getInitialLink will return same link: open app w/link (correct), background, open again (old link)
        await device.openURL({ url: TEST_LINK3 });
        // TODO: ios is not able to open short links on simulator?
        // await device.openURL({ url: shortLink });
      }
      const link = await firebase.dynamicLinks().getInitialLink();

      link.should.be.an.Object();
      link.url.should.equal(TEST_LINK3_TARGET);
      // "utm_content" and "utm_term" will not come back when resolved, even if you build with them
      // and they only come back when resolved from a short link, which is android only in testing
      if (device.getPlatform() === 'android') {
        link.utmParameters.utm_source.should.equal('github');
        link.utmParameters.utm_medium.should.equal('web');
        link.utmParameters.utm_campaign.should.equal('prs-welcome');
      } else {
        link.utmParameters.should.eql({});
      }
    });
  });

  describe('onLink()', function () {
    it('should emit dynamic links', async function () {
      // This is frequently flaky in CI - but works sometimes. Skipping only in CI for now.
      if (!isCI) {
        const shortLink = await getShortLink(
          TEST_LINK1_TARGET,
          firebase.dynamicLinks.ShortLinkType.DEFAULT,
        );
        const spy = sinon.spy();
        firebase.dynamicLinks().onLink(spy);

        if (device.getPlatform() === 'android') {
          await device.launchApp({ url: shortLink });
        } else {
          await device.openURL({ url: TEST_LINK1 });
        }
        await Utils.spyToBeCalledOnceAsync(spy);

        const link = spy.getCall(0).args[0];
        link.should.be.an.Object();
        link.url.should.equal(TEST_LINK1_TARGET);
        // "utm_content" and "utm_term" will not come back when resolved, even if you build with them
        // and they only come back when resolved from a short link, which is android only in testing
        if (device.getPlatform() === 'android') {
          link.utmParameters.utm_source.should.equal('github');
          link.utmParameters.utm_medium.should.equal('web');
          link.utmParameters.utm_campaign.should.equal('prs-welcome');
        } else {
          link.utmParameters.should.eql({});
        }
      } else {
        this.skip();
      }
    });
  });

  describe('performDiagnostics()', function () {
    it('should perform diagnostics without error', async function () {
      firebase.dynamicLinks().performDiagnostics();
    });
  });
});
