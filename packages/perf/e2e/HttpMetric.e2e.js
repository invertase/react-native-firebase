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

const aCoolUrl = 'https://invertase.io';

describe('HttpMetric modular', function () {
  describe('modular', function () {
    describe('start()', function () {
      it('correctly starts with internal flag ', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
        httpMetricRequest.start();
        httpMetricRequest.setHttpResponseCode(200);
        should.equal(httpMetricRequest._started, true);
        await Utils.sleep(75);
        httpMetricRequest.stop();
      });

      it('returns undefined if already started', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'POST');

        httpMetricRequest.start();
        should.equal(httpMetricRequest._started, true);
        httpMetricRequest.setHttpResponseCode(200);
        should.equal(httpMetricRequest.start(), undefined);
        await Utils.sleep(75);
        httpMetricRequest.stop();
      });
    });

    describe('stop()', function () {
      it('correctly stops with internal flag ', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
        httpMetricRequest.start();
        httpMetricRequest.setHttpResponseCode(500);
        httpMetricRequest.setRequestPayloadSize(1337);
        httpMetricRequest.setResponseContentType('application/invertase');
        httpMetricRequest.setResponsePayloadSize(1337);
        httpMetricRequest.putAttribute('foo', 'bar');
        httpMetricRequest.putAttribute('bar', 'foo');
        await Utils.sleep(100);
        httpMetricRequest.stop();
        should.equal(httpMetricRequest._stopped, true);
      });

      it('returns undefined if already stopped', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'POST');
        httpMetricRequest.start();
        await Utils.sleep(100);
        httpMetricRequest.stop();
        should.equal(httpMetricRequest.stop(), undefined);
      });

      it('handles floating point numbers', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'POST');
        httpMetricRequest.start();
        const floatingPoint = 500.447553;

        httpMetricRequest.setHttpResponseCode(floatingPoint);
        httpMetricRequest.setResponsePayloadSize(floatingPoint);
        httpMetricRequest.setRequestPayloadSize(floatingPoint);

        await Utils.sleep(100);
        httpMetricRequest.stop();
      });
    });

    // describe('removeAttribute()', function () {
    //   it('errors if not a string', async function () {
    //     const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
    //     try {
    //       httpMetric.putAttribute('inver', 'tase');
    //       httpMetric.removeAttribute(13377331);
    //       return Promise.reject(new Error('Did not throw'));
    //     } catch (e) {
    //       e.message.should.containEql('must be a string');
    //       return Promise.resolve();
    //     }
    //   });

    //   it('removes an attribute', async function () {
    //     const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
    //     httpMetric.putAttribute('inver', 'tase');
    //     const value = httpMetric.getAttribute('inver');
    //     should.equal(value, 'tase');
    //     httpMetric.removeAttribute('inver');
    //     const value2 = httpMetric.getAttribute('inver');
    //     should.equal(value2, null);
    //   });
    // });

    describe('getAttribute()', function () {
      it('should return null if attribute does not exist', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
        const value = httpMetricRequest.getAttribute('inver');
        should.equal(value, null);
      });

      it('should return an attribute string value', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
        httpMetricRequest.putAttribute('inver', 'tase');
        const value = httpMetricRequest.getAttribute('inver');
        should.equal(value, 'tase');
      });

      it('errors if attribute name is not a string', async function () {
        try {
          const { getPerformance, httpMetric } = perfModular;
          const perf = getPerformance();
          const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
          httpMetricRequest.getAttribute(1337);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a string');
          return Promise.resolve();
        }
      });
    });

    describe('putAttribute()', function () {
      it('sets an attribute string value', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
        httpMetricRequest.putAttribute('inver', 'tase');
        const value = httpMetricRequest.getAttribute('inver');
        value.should.equal('tase');
      });

      it('errors if attribute name is not a string', async function () {
        try {
          const { getPerformance, httpMetric } = perfModular;
          const perf = getPerformance();
          const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
          httpMetricRequest.putAttribute(1337, 'invertase');
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a string');
          return Promise.resolve();
        }
      });

      it('errors if attribute value is not a string', async function () {
        try {
          const { getPerformance, httpMetric } = perfModular;
          const perf = getPerformance();
          const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
          httpMetricRequest.putAttribute('invertase', 1337);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a string');
          return Promise.resolve();
        }
      });

      it('errors if attribute name is greater than 40 characters', async function () {
        try {
          const { getPerformance, httpMetric } = perfModular;
          const perf = getPerformance();
          const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
          httpMetricRequest.putAttribute(new Array(41).fill('1').join(''), 1337);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('a maximum length of 40 characters');
          return Promise.resolve();
        }
      });

      it('errors if attribute value is greater than 100 characters', async function () {
        try {
          const { getPerformance, httpMetric } = perfModular;
          const perf = getPerformance();
          const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
          httpMetricRequest.putAttribute('invertase', new Array(101).fill('1').join(''));
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('a maximum length of 100 characters');
          return Promise.resolve();
        }
      });

      it('errors if more than 5 attributes are put', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');

        httpMetricRequest.putAttribute('invertase1', '1337');
        httpMetricRequest.putAttribute('invertase2', '1337');
        httpMetricRequest.putAttribute('invertase3', '1337');
        httpMetricRequest.putAttribute('invertase4', '1337');
        httpMetricRequest.putAttribute('invertase5', '1337');

        try {
          httpMetricRequest.putAttribute('invertase6', '1337');
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('maximum number of attributes');
          return Promise.resolve();
        }
      });
    });

    // it('getAttributes()', async () => {
    //   const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
    //   httpMetric.putAttribute('inver', 'tase');
    //   httpMetric.putAttribute('tase', 'baz');
    //   const value = httpMetric.getAttributes();
    //   JSON.parse(JSON.stringify(value)).should.deepEqual({
    //     inver: 'tase',
    //     tase: 'baz',
    //   });
    // });

    describe('setHttpResponseCode()', function () {
      it('sets number value', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
        httpMetricRequest.setHttpResponseCode(500);
        should.equal(httpMetricRequest._httpResponseCode, 500);
      });

      it('sets a null value to clear value', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
        httpMetricRequest.setHttpResponseCode(null);
        should.equal(httpMetricRequest._httpResponseCode, null);
      });

      it('errors if not a number or null value', async function () {
        try {
          const { getPerformance, httpMetric } = perfModular;
          const perf = getPerformance();
          const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
          httpMetricRequest.setHttpResponseCode('500');
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a number or null');
          return Promise.resolve();
        }
      });
    });

    describe('setRequestPayloadSize()', function () {
      it('sets number value', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
        httpMetricRequest.setRequestPayloadSize(13377331);
        should.equal(httpMetricRequest._requestPayloadSize, 13377331);
      });

      it('sets a null value to clear value', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
        httpMetricRequest.setRequestPayloadSize(null);
        should.equal(httpMetricRequest._requestPayloadSize, null);
      });

      it('errors if not a number or null value', async function () {
        try {
          const { getPerformance, httpMetric } = perfModular;
          const perf = getPerformance();
          const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
          httpMetricRequest.setRequestPayloadSize('1337');
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a number or null');
          return Promise.resolve();
        }
      });
    });

    describe('setResponsePayloadSize()', function () {
      it('sets number value', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
        httpMetricRequest.setResponsePayloadSize(13377331);
        should.equal(httpMetricRequest._responsePayloadSize, 13377331);
      });

      it('sets a null value to clear value', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
        httpMetricRequest.setResponsePayloadSize(null);
        should.equal(httpMetricRequest._responsePayloadSize, null);
      });

      it('errors if not a number or null value', async function () {
        try {
          const { getPerformance, httpMetric } = perfModular;
          const perf = getPerformance();
          const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
          httpMetricRequest.setResponsePayloadSize('1337');
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a number or null');
          return Promise.resolve();
        }
      });
    });

    describe('setResponseContentType()', function () {
      it('sets string value', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
        httpMetricRequest.setResponseContentType('application/invertase');
        should.equal(httpMetricRequest._responseContentType, 'application/invertase');
      });

      it('sets a null value to clear value', async function () {
        const { getPerformance, httpMetric } = perfModular;
        const perf = getPerformance();
        const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
        httpMetricRequest.setResponseContentType(null);
        should.equal(httpMetricRequest._responseContentType, null);
      });

      it('errors if not a string or null value', async function () {
        try {
          const { getPerformance, httpMetric } = perfModular;
          const perf = getPerformance();
          const httpMetricRequest = httpMetric(perf, aCoolUrl, 'GET');
          httpMetricRequest.setResponseContentType(1337);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a string or null');
          return Promise.resolve();
        }
      });
    });
  });
});
