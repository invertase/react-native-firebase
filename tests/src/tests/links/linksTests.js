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

      const expectedParameters = { sd: socialDescription,
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

      Object.keys(expectedParameters).forEach((key) => {
        const val = expectedParameters[key];
        params[key].should.eql(val);
      });
    });

    it('create long dynamic link with minimal parameters', async () => {
      const data = {
        dynamicLinkInfo: {
          link,
          dynamicLinkDomain,
        },
      };

      const result = await links.createDynamicLink(data);

      const url = new URL(result);
      url.protocol.should.eql('https:');
      url.hostname.should.eql(dynamicLinkDomain);
      const params = queryString.parse(url.query);
      params.link.should.eql(link);
    });

    it('fail to create long dynamic link with empty data object', () => {
      return new Promise((resolve, reject) => {
        const success = tryCatch(() => {
          // Assertion
          reject(new Error('createDynamicLink did not fail.'));
        }, reject);

        const failure = tryCatch(() => {
          // Assertion
          resolve();
        }, reject);

        const data = { };

        // Test

        links.createDynamicLink(data)
        .then(success)
        .catch(failure);
      });
    });

    it('fail to create long dynamic link without iosBundleId', () => {
      return new Promise((resolve, reject) => {
        const success = tryCatch(() => {
          // Assertion
          reject(new Error('createDynamicLink did not fail.'));
        }, reject);

        const failure = tryCatch((error) => {
          // Assertion
          error.message.should.equal('no iosBundleId was specified.');
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

    it('fail to create long dynamic link without androidPackageName', () => {
      return new Promise((resolve, reject) => {
        const success = tryCatch(() => {
          // Assertion
          reject(new Error('createDynamicLink did not fail.'));
        }, reject);

        const failure = tryCatch((error) => {
          // Assertion
          error.message.should.equal('no androidPackageName was specified.');
          resolve();
        }, reject);

        // Setup
        const data = {
          dynamicLinkInfo: {
            link,
            dynamicLinkDomain,
            androidInfo: {
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

        // Test

        links.createDynamicLink(data)
        .then(success)
        .catch(failure);
      });
    });

    it('fail to create long dynamic link with unsupported dynamicLinkInfo parameters', () => {
      return new Promise((resolve, reject) => {
        const success = tryCatch(() => {
          // Assertion
          reject(new Error('createDynamicLink did not fail.'));
        }, reject);

        const failure = tryCatch((error) => {
          // Assertion
          error.message.should.equal('Invalid Parameters.');
          resolve();
        }, reject);

        const data = {
          dynamicLinkInfo: {
            link,
            dynamicLinkDomain,
            someInvalidParameter: 'invalid',
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
          error.message.should.equal('Invalid Parameters.');
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
          error.message.should.equal('Invalid Parameters.');
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
          error.message.should.equal('Invalid Parameters.');
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
    });

    it('getInitialLink should return null', async () => {
      const initialLink = await links.getInitialLink();
      should(initialLink).be.null();
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
