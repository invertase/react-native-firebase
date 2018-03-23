import should from 'should';
import URL from 'url-parse';
import queryString from 'query-string';

function linksTests({ describe, it, firebase, tryCatch }) {
  describe('test links', () => {
    const links = firebase.native.links();
    const link = 'https://yoursite.example.com';
    const dynamicLinkDomain = 'x59dg.app.goo.gl';

    const androidPackageName = 'com.reactnativefirebasedemo';
    const androidFallbackLink = 'android.fallback.com';
    const androidMinPackageVersionCode = '42';

    const iosBundleId = 'com.invertase.ReactNativeFirebaseDemo';
    const iosFallbackLink = 'ios.fallback.com';
    const iosCustomScheme = 'custom';
    const iosIpadFallbackLink = 'ios.ipad.fallback.com';
    const iosIpadBundleId = 'com.invertase.ReactNativeFirebaseDemo';
    const iosAppStoreId = '0123456789';

    const socialTitle = 'title';
    const socialDescription = 'description';
    const socialImageLink = 'test.imageUrl.com';

    it('create long dynamic link with all supported parameters', async () => {
      const dynamicLink = new firebase.native.links.DynamicLink(
        link,
        dynamicLinkDomain
      );
      dynamicLink.android
        .setPackageName(androidPackageName)
        .android.setFallbackUrl(androidFallbackLink)
        .android.setMinimumVersion(androidMinPackageVersionCode)
        .ios.setBundleId(iosBundleId)
        .ios.setFallbackUrl(iosFallbackLink)
        .ios.setCustomScheme(iosCustomScheme)
        .ios.setIPadFallbackUrl(iosIpadFallbackLink)
        .ios.setIPadBundleId(iosIpadBundleId)
        .ios.setAppStoreId(iosAppStoreId)
        .social.setTitle(socialTitle)
        .social.setDescriptionText(socialDescription)
        .social.setImageUrl(socialImageLink);

      const result = await links.createDynamicLink(dynamicLink);

      const expectedParameters = {
        sd: socialDescription,
        si: socialImageLink,
        st: socialTitle,
        afl: androidFallbackLink,
        amv: androidMinPackageVersionCode,
        apn: androidPackageName,
        ibi: iosBundleId,
        ifl: iosFallbackLink,
        isi: iosAppStoreId,
        ius: iosCustomScheme,
        ipbi: iosIpadBundleId,
        ipfl: iosIpadFallbackLink,
        link,
      };

      const url = new URL(result);
      url.protocol.should.eql('https:');
      url.hostname.should.eql(dynamicLinkDomain);
      const params = queryString.parse(url.query);

      Object.keys(expectedParameters).forEach(key => {
        const val = expectedParameters[key];
        params[key].should.eql(val);
      });
    });

    it('create long dynamic link with minimal parameters', async () => {
      const dynamicLink = new firebase.native.links.DynamicLink(
        link,
        dynamicLinkDomain
      );

      const result = await links.createDynamicLink(dynamicLink);

      const url = new URL(result);
      url.protocol.should.eql('https:');
      url.hostname.should.eql(dynamicLinkDomain);
      const params = queryString.parse(url.query);
      params.link.should.eql(link);
    });

    it('fail to create long dynamic link without link object', () =>
      new Promise((resolve, reject) => {
        const success = tryCatch(() => {
          // Assertion
          reject(new Error('createDynamicLink did not fail.'));
        }, reject);

        const failure = tryCatch(error => {
          // Assertion
          error.message.should.equal(
            'DynamicLink: Missing required `link` property'
          );
          resolve();
        }, reject);

        const dynamicLink = new firebase.native.links.DynamicLink();

        // Test

        links
          .createDynamicLink(dynamicLink)
          .then(success)
          .catch(failure);
      }));

    it('fail to create long dynamic link without iosBundleId', () =>
      new Promise((resolve, reject) => {
        const success = tryCatch(() => {
          // Assertion
          reject(new Error('createDynamicLink did not fail.'));
        }, reject);

        const failure = tryCatch(error => {
          // Assertion
          error.message.should.equal(
            'IOSParameters: Missing required `bundleId` property'
          );
          resolve();
        }, reject);

        // Setup
        const dynamicLink = new firebase.native.links.DynamicLink(
          link,
          dynamicLinkDomain
        );
        dynamicLink.android
          .setPackageName(androidPackageName)
          .android.setFallbackUrl(androidFallbackLink)
          .android.setMinimumVersion(androidMinPackageVersionCode)
          .ios.setFallbackUrl(iosFallbackLink)
          .ios.setCustomScheme(iosCustomScheme)
          .ios.setIPadFallbackUrl(iosIpadFallbackLink)
          .ios.setIPadBundleId(iosIpadBundleId)
          .ios.setAppStoreId(iosAppStoreId)
          .social.setTitle(socialTitle)
          .social.setDescriptionText(socialDescription)
          .social.setImageUrl(socialImageLink);

        // Test

        links
          .createDynamicLink(dynamicLink)
          .then(success)
          .catch(failure);
      }));

    it('fail to create long dynamic link without androidPackageName', () =>
      new Promise((resolve, reject) => {
        const success = tryCatch(() => {
          // Assertion
          reject(new Error('createDynamicLink did not fail.'));
        }, reject);

        const failure = tryCatch(error => {
          // Assertion
          error.message.should.equal(
            'AndroidParameters: Missing required `packageName` property'
          );
          resolve();
        }, reject);

        // Setup
        const dynamicLink = new firebase.native.links.DynamicLink(
          link,
          dynamicLinkDomain
        );
        dynamicLink.android
          .setFallbackUrl(androidFallbackLink)
          .android.setMinimumVersion(androidMinPackageVersionCode)
          .ios.setBundleId(iosBundleId)
          .ios.setFallbackUrl(iosFallbackLink)
          .ios.setCustomScheme(iosCustomScheme)
          .ios.setIPadFallbackUrl(iosIpadFallbackLink)
          .ios.setIPadBundleId(iosIpadBundleId)
          .ios.setAppStoreId(iosAppStoreId)
          .social.setTitle(socialTitle)
          .social.setDescriptionText(socialDescription)
          .social.setImageUrl(socialImageLink);

        // Test

        links
          .createDynamicLink(dynamicLink)
          .then(success)
          .catch(failure);
      }));

    it('create short (unguessable) dynamic link with all supported parameters', async () => {
      const url = 'https://www.google.co.il/search?q=react+native+firebase';
      const dynamicLink = new firebase.native.links.DynamicLink(
        url,
        dynamicLinkDomain
      );
      dynamicLink.android
        .setPackageName(androidPackageName)
        .android.setFallbackUrl(androidFallbackLink)
        .android.setMinimumVersion(androidMinPackageVersionCode)
        .ios.setBundleId(iosBundleId)
        .ios.setFallbackUrl(iosFallbackLink)
        .ios.setCustomScheme(iosCustomScheme)
        .ios.setIPadFallbackUrl(iosIpadFallbackLink)
        .ios.setIPadBundleId(iosIpadBundleId)
        .ios.setAppStoreId(iosAppStoreId)
        .social.setTitle(socialTitle)
        .social.setDescriptionText(socialDescription)
        .social.setImageUrl(socialImageLink);

      const result = await links.createShortDynamicLink(
        dynamicLink,
        'UNGUESSABLE'
      );
      result.should.startWith(`https://${dynamicLinkDomain}`);

      const response = await fetch(result);
      url.should.eql(response.url);
    });

    it('create short (short) dynamic link with all supported parameters', async () => {
      const url = 'https://www.google.co.il/search?q=react+native+firebase';
      const dynamicLink = new firebase.native.links.DynamicLink(
        url,
        dynamicLinkDomain
      );
      dynamicLink.android
        .setPackageName(androidPackageName)
        .android.setFallbackUrl(androidFallbackLink)
        .android.setMinimumVersion(androidMinPackageVersionCode)
        .ios.setBundleId(iosBundleId)
        .ios.setFallbackUrl(iosFallbackLink)
        .ios.setCustomScheme(iosCustomScheme)
        .ios.setIPadFallbackUrl(iosIpadFallbackLink)
        .ios.setIPadBundleId(iosIpadBundleId)
        .ios.setAppStoreId(iosAppStoreId)
        .social.setTitle(socialTitle)
        .social.setDescriptionText(socialDescription)
        .social.setImageUrl(socialImageLink);

      const result = await links.createShortDynamicLink(dynamicLink, 'SHORT');
      result.should.startWith(`https://${dynamicLinkDomain}`);

      const response = await fetch(result);
      url.should.eql(response.url);
    });

    it('getInitialLink should return null or undefined', async () => {
      // TODO: iOS returns undefined, Android returns null
      // const initialLink = await links.getInitialLink();
      // should(initialLink).be.undefined();
    });

    it('should listen to link', () => {
      const unsubscribe = links.onLink((url: string) => {
        console.log(url);
        // handle link
      });
      unsubscribe();
    });
  });
}
export default linksTests;
