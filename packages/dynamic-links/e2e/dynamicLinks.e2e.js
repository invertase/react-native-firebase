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

const baseParams = {
  link: 'https://invertase.io',
  domainUriPrefix: 'https://reactnativefirebase.page.link',
};

const TEST_LINK =
  'https://reactnativefirebase.page.link/?link=https://rnfirebase.io&apn=com.invertase.testing';
const TEST_LINK2 =
  'https://reactnativefirebase.page.link/?link=https://invertase.io/hire-us&apn=com.invertase.testing';

module.exports.baseParams = baseParams;

describe('dynamicLinks()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.dynamicLinks);
      app.dynamicLinks().app.should.equal(app);
    });
  });

  describe('buildLink()', () => {
    it('returns a dynamic link', async () => {
      const link = await firebase.dynamicLinks().buildLink(baseParams);
      link.should.be.String();
      link.length.should.be.greaterThan(6);
    });
  });

  describe('createDynamicLink()', () => {
    it('should call buildLink()', async () => {
      const link = await firebase.dynamicLinks().createDynamicLink(baseParams);
      link.should.be.String();
      link.length.should.be.greaterThan(6);
    });
  });

  describe('buildShortLink()', () => {
    it('returns a short link', async () => {
      const link = await firebase.dynamicLinks().buildShortLink(baseParams);
      link.should.be.String();
      link.length.should.be.greaterThan(6);
    });

    it('throws if type is invalid', () => {
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

  describe('createShortDynamicLink()', () => {
    it('should call buildShortLink()', async () => {
      const link = await firebase.dynamicLinks().createShortDynamicLink(baseParams);
      link.should.be.String();
      link.length.should.be.greaterThan(6);
    });
  });

  describe('resolveLink()', () => {
    it('resolves a long link', async () => {
      const link = await firebase.dynamicLinks().resolveLink(TEST_LINK2);
      link.should.be.an.Object();
      link.url.should.equal('https://invertase.io/hire-us');
      should.equal(link.minimumAppVersion, null);
    });

    it('resolves a short link', async () => {
      const shortLink = await firebase.dynamicLinks().buildShortLink(
        {
          ...baseParams,
          ios: {
            bundleId: 'io.invertase.testing',
            minimumVersion: '123',
          },
          android: {
            packageName: 'com.invertase.testing',
            minimumVersion: '123',
          },
        },
        firebase.dynamicLinks.ShortLinkType.UNGUESSABLE,
      );
      shortLink.should.be.String();
      // Unguessable links are 17 characters by definitions, add the slash: 18 chars
      shortLink.length.should.be.eql(baseParams.domainUriPrefix.length + 18);

      const link = await firebase.dynamicLinks().resolveLink(shortLink);
      link.should.be.an.Object();
      link.url.should.equal(baseParams.link);
      // TODO: harmonize the API so that minimumAppVersion is either a number or a string
      // it would be a breaking change in the API though
      // On Android it's a number and iOS a String, so parseInt is used to have a single test
      parseInt(link.minimumAppVersion, 10).should.equal(123);
    });

    it('throws on links that do not exist', async () => {
      try {
        await firebase.dynamicLinks().resolveLink(baseParams.domainUriPrefix + '/not-a-valid-link');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.code.should.containEql('not-found');
        e.message.should.containEql('Dynamic link not found');
        return Promise.resolve();
      }
    });

    it('throws on invalid links', async () => {
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

  ios.describe('getInitialLink()', () => {
    it('should return the dynamic link instance that launched the app', async () => {
      await device.openURL({
        url: TEST_LINK,
      });

      const dynamicLink = await firebase.dynamicLinks().getInitialLink();

      dynamicLink.should.be.an.Object();
      dynamicLink.url.should.equal('https://rnfirebase.io');
    });
  });

  ios.describe('onLink()', () => {
    it('should emit dynamic links', async () => {
      const spy = sinon.spy();

      firebase.dynamicLinks().onLink(spy);

      await device.openURL({
        url: TEST_LINK2,
      });

      await Utils.spyToBeCalledOnceAsync(spy);

      spy.getCall(0).args[0].should.be.an.Object();
      spy.getCall(0).args[0].url.should.equal('https://invertase.io/hire-us');
    });
  });
});
