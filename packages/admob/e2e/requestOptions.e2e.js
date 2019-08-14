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

describe('admob() requestOptions', () => {
  before(() => {
    validator = jet.require('packages/admob/lib/validateAdRequestOptions');
  });

  it('returns an empty object is not defined', () => {
    const v = validator();
    v.should.eql(jet.contextify({}));
  });

  it('throws if options is not an object', () => {
    try {
      validator('foo');
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("'options' expected an object value");
      return Promise.resolve();
    }
  });

  describe('requestNonPersonalizedAdsOnly', () => {
    it('throws if requestNonPersonalizedAdsOnly is not a boolean', () => {
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

    it('accepts requestNonPersonalizedAdsOnly boolean', () => {
      const v = validator({
        requestNonPersonalizedAdsOnly: false,
      });
      v.requestNonPersonalizedAdsOnly.should.eql(false);
    });
  });

  describe('networkExtras', () => {
    it('throws if networkExtras is not an object', () => {
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

    it('throws if networkExtras value is not a string', () => {
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
          `'options.networkExtras' expected a string value for object key "bar"`,
        );
        return Promise.resolve();
      }
    });

    it('accepts networkExtras object', () => {
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

  describe('keywords', () => {
    it('throws if keywords is not an array', () => {
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

    it('throws if a keyword is not a string', () => {
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

    it('accepts keywords array', () => {
      const v = validator({
        keywords: ['foo', 'bar'],
      });

      v.keywords.should.be.Array();
      v.keywords[0].should.eql('foo');
      v.keywords[1].should.eql('bar');
    });
  });

  describe('testDevices', () => {
    it('throws if testDevices is not an array', () => {
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

    it('throws if a testDevices is not a string', () => {
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

    it('accepts testDevices array', () => {
      const v = validator({
        testDevices: ['foo', 'bar'],
      });

      v.testDevices.should.be.Array();
      v.testDevices[0].should.eql('foo');
      v.testDevices[1].should.eql('bar');
    });
  });

  describe('contentUrl', () => {
    it('throws if contentUrl is not a string', () => {
      try {
        validator({
          contentUrl: 123,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(`'options.contentUrl' expected a string value`);
        return Promise.resolve();
      }
    });

    it('throws if contentUrl is not a valid url', () => {
      try {
        validator({
          contentUrl: 'www.invertase.io',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(`'options.contentUrl' expected a valid HTTP or HTTPS url`);
        return Promise.resolve();
      }
    });

    it('throws if contentUrl is too long', () => {
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
          `'options.contentUrl' maximum length of a content URL is 512 characters`,
        );
        return Promise.resolve();
      }
    });

    it('accepts a contentUrl', () => {
      const v = validator({
        contentUrl: 'http://invertase.io/privacy-policy',
      });

      v.contentUrl.should.be.eql('http://invertase.io/privacy-policy');
    });
  });

  describe('location', () => {
    it('throws if not an array', () => {
      try {
        validator({
          location: 'United Kingdom',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          `'options.location' expected an array value containing a latitude & longitude number value`,
        );
        return Promise.resolve();
      }
    });

    it('throws if latitude not a number', () => {
      try {
        validator({
          location: ['123', 123],
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          `'options.location' expected an array value containing a latitude & longitude number value`,
        );
        return Promise.resolve();
      }
    });

    it('throws if latitude is invalid', () => {
      try {
        validator({
          location: [-100, 100],
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          `'options.location' latitude value must be a number between -90 and 90`,
        );
        return Promise.resolve();
      }
    });

    it('throws if longitude not a number', () => {
      try {
        validator({
          location: [10, '123'],
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          `'options.location' expected an array value containing a latitude & longitude number value`,
        );
        return Promise.resolve();
      }
    });

    it('throws if longitude is invalid', () => {
      try {
        validator({
          location: [50, 200],
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          `'options.location' longitude value must be a number between -180 and 180`,
        );
        return Promise.resolve();
      }
    });

    it('accepts a latitude and longitude', () => {
      const v = validator({
        location: [10, 20],
      });

      v.location.should.be.Array();
      v.location[0].should.be.eql(10);
      v.location[1].should.be.eql(20);
    });
  });

  describe('locationAccuracy', () => {
    it('throws if not a number', () => {
      try {
        validator({
          locationAccuracy: '10',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(`'options.locationAccuracy' expected a number value`);
        return Promise.resolve();
      }
    });

    it('throws if less than 0', () => {
      try {
        validator({
          locationAccuracy: -1,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(`'options.locationAccuracy' expected a number greater than 0`);
        return Promise.resolve();
      }
    });

    it('accepts locationAccuracy', () => {
      const v = validator({
        locationAccuracy: 10.5,
      });
      v.locationAccuracy.should.eql(10.5);
    });

    it('uses a defaultValue', () => {
      const v = validator({});
      v.locationAccuracy.should.eql(5);
    });
  });

  describe('requestAgent', () => {
    it('throws if not a string', () => {
      try {
        validator({
          requestAgent: 1,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(`'options.requestAgent' expected a string value`);
        return Promise.resolve();
      }
    });

    it('accepts a requestAgent', () => {
      const v = validator({
        requestAgent: 'CoolAds',
      });
      v.requestAgent.should.eql('CoolAds');
    });
  });
});
