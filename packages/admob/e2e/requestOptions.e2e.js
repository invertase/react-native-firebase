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

let validator = null;

describe('admob() requestOptions', function () {
  before(function () {
    validator = jet.require('packages/admob/lib/validateAdRequestOptions');
  });

  it('returns an empty object is not defined', function () {
    const v = validator();
    v.should.eql(jet.contextify({}));
  });

  it('throws if options is not an object', function () {
    try {
      validator('foo');
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("'options' expected an object value");
      return Promise.resolve();
    }
  });

  describe('requestNonPersonalizedAdsOnly', function () {
    it('throws if requestNonPersonalizedAdsOnly is not a boolean', function () {
      try {
        validator({
          requestNonPersonalizedAdsOnly: 'true',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.requestNonPersonalizedAdsOnly' expected a boolean value",
        );
        return Promise.resolve();
      }
    });

    it('accepts requestNonPersonalizedAdsOnly boolean', function () {
      const v = validator({
        requestNonPersonalizedAdsOnly: false,
      });
      v.requestNonPersonalizedAdsOnly.should.eql(false);
    });
  });

  describe('networkExtras', function () {
    it('throws if networkExtras is not an object', function () {
      try {
        validator({
          networkExtras: ['foo', 'bar'],
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.networkExtras' expected an object of key/value pairs",
        );
        return Promise.resolve();
      }
    });

    it('throws if networkExtras value is not a string', function () {
      try {
        validator({
          networkExtras: {
            foo: 'bar',
            bar: 123,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          '\'options.networkExtras\' expected a string value for object key "bar"',
        );
        return Promise.resolve();
      }
    });

    it('accepts networkExtras object', function () {
      const v = validator({
        networkExtras: {
          foo: 'bar',
          bar: 'baz',
        },
      });

      v.networkExtras.foo.should.eql('bar');
      v.networkExtras.bar.should.eql('baz');
    });
  });

  describe('keywords', function () {
    it('throws if keywords is not an array', function () {
      try {
        validator({
          keywords: { foo: 'bar' },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.keywords' expected an array containing string values",
        );
        return Promise.resolve();
      }
    });

    it('throws if a keyword is not a string', function () {
      try {
        validator({
          keywords: ['foo', 123],
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.keywords' expected an array containing string values",
        );
        return Promise.resolve();
      }
    });

    it('accepts keywords array', function () {
      const v = validator({
        keywords: ['foo', 'bar'],
      });

      v.keywords.should.be.Array();
      v.keywords[0].should.eql('foo');
      v.keywords[1].should.eql('bar');
    });
  });

  describe('testDevices', function () {
    it('throws if testDevices is not an array', function () {
      try {
        validator({
          testDevices: { foo: 'bar' },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.testDevices' expected an array containing string values",
        );
        return Promise.resolve();
      }
    });

    it('throws if a testDevices is not a string', function () {
      try {
        validator({
          testDevices: ['foo', 123],
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.testDevices' expected an array containing string values",
        );
        return Promise.resolve();
      }
    });

    it('accepts testDevices array', function () {
      const v = validator({
        testDevices: ['foo', 'bar'],
      });

      v.testDevices.should.be.Array();
      v.testDevices[0].should.eql('foo');
      v.testDevices[1].should.eql('bar');
    });
  });

  describe('contentUrl', function () {
    it('throws if contentUrl is not a string', function () {
      try {
        validator({
          contentUrl: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'options.contentUrl' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if contentUrl is not a valid url', function () {
      try {
        validator({
          contentUrl: 'www.invertase.io',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'options.contentUrl' expected a valid HTTP or HTTPS url");
        return Promise.resolve();
      }
    });

    it('throws if contentUrl is too long', function () {
      let str = '';
      for (let i = 0; i < 530; i++) {
        str += i.toString();
      }

      try {
        validator({
          contentUrl: `https://invertase.io?${str}`,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.contentUrl' maximum length of a content URL is 512 characters",
        );
        return Promise.resolve();
      }
    });

    it('accepts a contentUrl', function () {
      const v = validator({
        contentUrl: 'http://invertase.io/privacy-policy',
      });

      v.contentUrl.should.be.eql('http://invertase.io/privacy-policy');
    });
  });

  describe('location', function () {
    it('throws if not an array', function () {
      try {
        validator({
          location: 'United Kingdom',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.location' expected an array value containing a latitude & longitude number value",
        );
        return Promise.resolve();
      }
    });

    it('throws if latitude not a number', function () {
      try {
        validator({
          location: ['123', 123],
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.location' expected an array value containing a latitude & longitude number value",
        );
        return Promise.resolve();
      }
    });

    it('throws if latitude is invalid', function () {
      try {
        validator({
          location: [-100, 100],
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.location' latitude value must be a number between -90 and 90",
        );
        return Promise.resolve();
      }
    });

    it('throws if longitude not a number', function () {
      try {
        validator({
          location: [10, '123'],
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.location' expected an array value containing a latitude & longitude number value",
        );
        return Promise.resolve();
      }
    });

    it('throws if longitude is invalid', function () {
      try {
        validator({
          location: [50, 200],
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.location' longitude value must be a number between -180 and 180",
        );
        return Promise.resolve();
      }
    });

    it('accepts a latitude and longitude', function () {
      const v = validator({
        location: [10, 20],
      });

      v.location.should.be.Array();
      v.location[0].should.be.eql(10);
      v.location[1].should.be.eql(20);
    });
  });

  describe('locationAccuracy', function () {
    it('throws if not a number', function () {
      try {
        validator({
          locationAccuracy: '10',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'options.locationAccuracy' expected a number value");
        return Promise.resolve();
      }
    });

    it('throws if less than 0', function () {
      try {
        validator({
          locationAccuracy: -1,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'options.locationAccuracy' expected a number greater than 0");
        return Promise.resolve();
      }
    });

    it('accepts locationAccuracy', function () {
      const v = validator({
        locationAccuracy: 10.5,
      });
      v.locationAccuracy.should.eql(10.5);
    });

    it('uses a defaultValue', function () {
      const v = validator({});
      v.locationAccuracy.should.eql(5);
    });
  });

  describe('requestAgent', function () {
    it('throws if not a string', function () {
      try {
        validator({
          requestAgent: 1,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'options.requestAgent' expected a string value");
        return Promise.resolve();
      }
    });

    it('accepts a requestAgent', function () {
      const v = validator({
        requestAgent: 'CoolAds',
      });
      v.requestAgent.should.eql('CoolAds');
    });
  });

  describe('serverSideVerificationOptions', function () {
    it('throws if userId is not a string', function () {
      try {
        validator({
          serverSideVerificationOptions: {
            userId: 111,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.serverSideVerificationOptions.userId' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('throws if customData is not a string', function () {
      try {
        validator({
          serverSideVerificationOptions: {
            customData: 1111,
          },
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'options.serverSideVerificationOptions.customData' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('accepts a serverSideVerificationOptions', function () {
      const v = validator({
        serverSideVerificationOptions: {
          userId: '1',
          customData: 'my-custom-data',
        },
      });
      v.serverSideVerificationOptions.userId.should.eql('1');
      v.serverSideVerificationOptions.customData.should.eql('my-custom-data');
    });
  });
});
