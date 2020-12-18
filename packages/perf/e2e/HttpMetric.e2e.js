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

android.describe('perf()', () => {
  describe('HttpMetric', function() {
    describe('start()', function() {
      it('correctly starts with internal flag ', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
        await httpMetric.start();
        httpMetric.setHttpResponseCode(200);
        should.equal(httpMetric._started, true);
        await Utils.sleep(75);
        await httpMetric.stop();
      });

      it('resolves null if already started', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'POST');
        await httpMetric.start();
        should.equal(httpMetric._started, true);
        httpMetric.setHttpResponseCode(200);
        should.equal(await httpMetric.start(), null);
        await Utils.sleep(75);
        await httpMetric.stop();
      });
    });

    describe('stop()', function() {
      it('correctly stops with internal flag ', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
        await httpMetric.start();
        httpMetric.setHttpResponseCode(500);
        httpMetric.setRequestPayloadSize(1337);
        httpMetric.setResponseContentType('application/invertase');
        httpMetric.setResponsePayloadSize(1337);
        httpMetric.putAttribute('foo', 'bar');
        httpMetric.putAttribute('bar', 'foo');
        await Utils.sleep(100);
        await httpMetric.stop();
        should.equal(httpMetric._stopped, true);
      });

      it('resolves null if already stopped', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'POST');
        await httpMetric.start();
        await Utils.sleep(100);
        await httpMetric.stop();
        should.equal(await httpMetric.stop(), null);
      });

      it('handles floating point numbers', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'POST');
        await httpMetric.start();
        const floatingPoint = 500.447553;

        httpMetric.setHttpResponseCode(floatingPoint);
        httpMetric.setResponsePayloadSize(floatingPoint);
        httpMetric.setRequestPayloadSize(floatingPoint);

        await Utils.sleep(100);
        await httpMetric.stop();
      });
    });

    // describe('removeAttribute()', async () => {
    //   it('errors if not a string', async () => {
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
    //
    //   it('removes an attribute', async () => {
    //     const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
    //     httpMetric.putAttribute('inver', 'tase');
    //     const value = httpMetric.getAttribute('inver');
    //     should.equal(value, 'tase');
    //     httpMetric.removeAttribute('inver');
    //     const value2 = httpMetric.getAttribute('inver');
    //     should.equal(value2, null);
    //   });
    // });

    describe('getAttribute()', function() {
      it('should return null if attribute does not exist', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
        const value = httpMetric.getAttribute('inver');
        should.equal(value, null);
      });

      it('should return an attribute string value', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
        httpMetric.putAttribute('inver', 'tase');
        const value = httpMetric.getAttribute('inver');
        should.equal(value, 'tase');
      });

      it('errors if attribute name is not a string', async function() {
        try {
          const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
          httpMetric.getAttribute(1337);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a string');
          return Promise.resolve();
        }
      });
    });

    describe('putAttribute()', function() {
      it('sets an attribute string value', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
        httpMetric.putAttribute('inver', 'tase');
        const value = httpMetric.getAttribute('inver');
        value.should.equal('tase');
      });

      it('errors if attribute name is not a string', async function() {
        try {
          const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
          httpMetric.putAttribute(1337, 'invertase');
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a string');
          return Promise.resolve();
        }
      });

      it('errors if attribute value is not a string', async function() {
        try {
          const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
          httpMetric.putAttribute('invertase', 1337);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a string');
          return Promise.resolve();
        }
      });

      it('errors if attribute name is greater than 40 characters', async function() {
        try {
          const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
          httpMetric.putAttribute(new Array(41).fill('1').join(''), 1337);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('a maximum length of 40 characters');
          return Promise.resolve();
        }
      });

      it('errors if attribute value is greater than 100 characters', async function() {
        try {
          const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
          httpMetric.putAttribute('invertase', new Array(101).fill('1').join(''));
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('a maximum length of 100 characters');
          return Promise.resolve();
        }
      });

      it('errors if more than 5 attributes are put', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');

        httpMetric.putAttribute('invertase1', '1337');
        httpMetric.putAttribute('invertase2', '1337');
        httpMetric.putAttribute('invertase3', '1337');
        httpMetric.putAttribute('invertase4', '1337');
        httpMetric.putAttribute('invertase5', '1337');

        try {
          httpMetric.putAttribute('invertase6', '1337');
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

    describe('setHttpResponseCode()', function() {
      it('sets number value', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
        httpMetric.setHttpResponseCode(500);
        should.equal(httpMetric._httpResponseCode, 500);
      });

      it('sets a null value to clear value', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
        httpMetric.setHttpResponseCode(null);
        should.equal(httpMetric._httpResponseCode, null);
      });

      it('errors if not a number or null value', async function() {
        try {
          const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
          httpMetric.setHttpResponseCode('500');
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a number or null');
          return Promise.resolve();
        }
      });
    });

    describe('setRequestPayloadSize()', function() {
      it('sets number value', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
        httpMetric.setRequestPayloadSize(13377331);
        should.equal(httpMetric._requestPayloadSize, 13377331);
      });

      it('sets a null value to clear value', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
        httpMetric.setRequestPayloadSize(null);
        should.equal(httpMetric._requestPayloadSize, null);
      });

      it('errors if not a number or null value', async function() {
        try {
          const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
          httpMetric.setRequestPayloadSize('1337');
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a number or null');
          return Promise.resolve();
        }
      });
    });

    describe('setResponsePayloadSize()', function() {
      it('sets number value', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
        httpMetric.setResponsePayloadSize(13377331);
        should.equal(httpMetric._responsePayloadSize, 13377331);
      });

      it('sets a null value to clear value', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
        httpMetric.setResponsePayloadSize(null);
        should.equal(httpMetric._responsePayloadSize, null);
      });

      it('errors if not a number or null value', async function() {
        try {
          const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
          httpMetric.setResponsePayloadSize('1337');
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a number or null');
          return Promise.resolve();
        }
      });
    });

    describe('setResponseContentType()', function() {
      it('sets string value', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
        httpMetric.setResponseContentType('application/invertase');
        should.equal(httpMetric._responseContentType, 'application/invertase');
      });

      it('sets a null value to clear value', async function() {
        const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
        httpMetric.setResponseContentType(null);
        should.equal(httpMetric._responseContentType, null);
      });

      it('errors if not a string or null value', async function() {
        try {
          const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
          httpMetric.setResponseContentType(1337);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a string or null');
          return Promise.resolve();
        }
      });
    });
  });
});
