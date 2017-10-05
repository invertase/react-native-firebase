import should from 'should';

function linksTests({ describe, it, firebase, tryCatch }) {
  describe('test links', () => {
    const links = firebase.native.links();
    const link = 'https://yoursite.example.com';
    const linkString = 'https%3A%2F%2Fyoursite.example.com';
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
      const data = {
        dynamicLinkInfo: {
          link,
          dynamicLinkDomain,
          androidInfo: {
            androidPackageName,
            androidFallbackLink,
            androidMinPackageVersionCode,
          },
          iosInfo: {
            iosBundleId,
            iosFallbackLink,
            iosCustomScheme,
            iosIpadFallbackLink,
            iosIpadBundleId,
            iosAppStoreId,
          },
          socialMetaTagInfo: {
            socialTitle,
            socialDescription,
            socialImageLink,
          },
        },
      };

      const result = await links.createDynamicLink(data);

      const expectedUrl = `https://${dynamicLinkDomain}?sd=${
        socialDescription}&si=${
          socialImageLink}&st=${
            socialTitle}&afl=${
              androidFallbackLink}&amv=${
                androidMinPackageVersionCode}&apn=${
                  androidPackageName}&ibi=${
                    iosBundleId}&ifl=${
                      iosFallbackLink}&isi=${
                        iosAppStoreId}&ius=${
                          iosCustomScheme}&ipbi=${
                            iosIpadBundleId}&ipfl=${
                              iosIpadFallbackLink}&link=${linkString}`;

      result.should.eql(expectedUrl);
      Promise.resolve();
    });

    it('create long dynamic link with few parameters', async () => {
      const data = {
        dynamicLinkInfo: {
          link,
          dynamicLinkDomain,
          androidInfo: {
            androidPackageName,
          },
          iosInfo: {
            iosBundleId,
          },
        },
      };

      const result = await links.createDynamicLink(data);

      const expectedUrl = `https://${dynamicLinkDomain}?apn=${
        androidPackageName}&ibi=${
          iosBundleId}&link=${linkString}`;

      result.should.eql(expectedUrl);
      Promise.resolve();
    });

    it('fail to create long dynamic link without iosBundleId', () => {
      return new Promise((resolve, reject) => {
        const success = tryCatch(() => {
          // Assertion
          reject(new Error('createDynamicLink did not fail.'));
        }, reject);

        const failure = tryCatch((error) => {
          // Assertion
          error.code.includes('links/failure').should.be.true();
          resolve();
        }, reject);

        // Setup
        const data = {
          dynamicLinkInfo: {
            link,
            dynamicLinkDomain,
            androidInfo: {
              androidPackageName,
              androidFallbackLink,
              androidMinPackageVersionCode,
            },
            iosInfo: {
              iosFallbackLink,
              iosCustomScheme,
              iosIpadFallbackLink,
              iosIpadBundleId,
              iosAppStoreId,
            },
            socialMetaTagInfo: {
              socialTitle,
              socialDescription,
              socialImageLink,
            },
          },
        };

        // Test

        links.createDynamicLink(data)
        .then(success)
        .catch(failure);
      });
    });

    it('fail to create long dynamic link with unsupported ios parameters', () => {
      return new Promise((resolve, reject) => {
        const success = tryCatch(() => {
          // Assertion
          reject(new Error('createDynamicLink did not fail.'));
        }, reject);

        const failure = tryCatch((error) => {
          // Assertion
          error.code.includes('links/failure').should.be.true();
          resolve();
        }, reject);

        const data = {
          dynamicLinkInfo: {
            link,
            dynamicLinkDomain,
            androidInfo: {
              androidPackageName,
            },
            iosInfo: {
              iosBundleId,
              someInvalidParameter: 'invalid',
              someOtherParameter: 'invalid',
            },
          },
        };

        // Test

        links.createDynamicLink(data)
        .then(success)
        .catch(failure);
      });
    });

    it('fail to create long dynamic link with unsupported android parameters', () => {
      return new Promise((resolve, reject) => {
        const success = tryCatch(() => {
          // Assertion
          reject(new Error('createDynamicLink did not fail.'));
        }, reject);

        const failure = tryCatch((error) => {
          // Assertion
          error.code.includes('links/failure').should.be.true();
          resolve();
        }, reject);

        const data = {
          dynamicLinkInfo: {
            link,
            dynamicLinkDomain,
            androidInfo: {
              androidPackageName,
              someInvalidParameter: 'invalid',
              someOtherParameter: 'invalid',
            },
            iosInfo: {
              iosBundleId,
            },
          },
        };

        // Test

        links.createDynamicLink(data)
        .then(success)
        .catch(failure);
      });
    });

    it('fail to create long dynamic link with unsupported social parameters', () => {
      return new Promise((resolve, reject) => {
        const success = tryCatch(() => {
          // Assertion
          reject(new Error('createDynamicLink did not fail.'));
        }, reject);

        const failure = tryCatch((error) => {
          // Assertion
          error.code.includes('links/failure').should.be.true();
          resolve();
        }, reject);

        const data = {
          dynamicLinkInfo: {
            link,
            dynamicLinkDomain,
            androidInfo: {
              androidPackageName,
            },
            iosInfo: {
              iosBundleId,
            },
            socialMetaTagInfo: {
              someInvalidParameter: 'invalid',
              someOtherParameter: 'invalid',
            },
          },
        };

        // Test

        links.createDynamicLink(data)
        .then(success)
        .catch(failure);
      });
    });

    it('create short (unguessable) dynamic link with all supported parameters', async () => {
      const url = 'https://www.google.co.il/search?q=react+native+firebase';
      const data = {
        dynamicLinkInfo: {
          link: url,
          dynamicLinkDomain,
          androidInfo: {
            androidPackageName,
            androidFallbackLink,
            androidMinPackageVersionCode,
          },
          iosInfo: {
            iosBundleId,
            iosFallbackLink,
            iosCustomScheme,
            iosIpadFallbackLink,
            iosIpadBundleId,
            iosAppStoreId,
          },
          socialMetaTagInfo: {
            socialTitle,
            socialDescription,
            socialImageLink,
          },
        },
      };

      const result = await links.createShortDynamicLink(data);
      result.should.startWith(`https://${dynamicLinkDomain}`);

      const response = await fetch(result);
      url.should.eql(response.url);
      Promise.resolve();
    });

    it('create short (short) dynamic link with all supported parameters', async () => {
      const url = 'https://www.google.co.il/search?q=react+native+firebase';
      const data = {
        dynamicLinkInfo: {
          link: url,
          dynamicLinkDomain,
          androidInfo: {
            androidPackageName,
            androidFallbackLink,
            androidMinPackageVersionCode,
          },
          iosInfo: {
            iosBundleId,
            iosFallbackLink,
            iosCustomScheme,
            iosIpadFallbackLink,
            iosIpadBundleId,
            iosAppStoreId,
          },
          socialMetaTagInfo: {
            socialTitle,
            socialDescription,
            socialImageLink,
          },
        },
        suffix: {
          option: 'SHORT',
        },
      };

      const result = await links.createShortDynamicLink(data);
      result.should.startWith(`https://${dynamicLinkDomain}`);

      const response = await fetch(result);
      url.should.eql(response.url);
      Promise.resolve();
    });

    it('getInitialLink should return null', async () => {
      const initialLink = await links.getInitialLink();
      should(initialLink).be.null();
      Promise.resolve();
    });

    it('should listen to link', () => {
      const unsubscribe = links.onLink((url: string) => {
        // handle link
      });
      unsubscribe();
      Promise.resolve();
    });
  });
}
export default linksTests;
