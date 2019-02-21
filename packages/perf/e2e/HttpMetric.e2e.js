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
  describe('HttpMetric', () => {
    it('start() & stop()', async () => {
      const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
      await httpMetric.start();
      await httpMetric.stop();
    });

    it('removeAttribute()', async () => {
      const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
      await httpMetric.start();
      httpMetric.putAttribute('foo', 'bar');
      const value = httpMetric.getAttribute('foo');
      should.equal(value, 'bar');
      httpMetric.removeAttribute('foo');
      const value2 = httpMetric.getAttribute('foo');
      should.equal(value2, null);
      await httpMetric.stop();
    });

    it('getAttribute() should return null', async () => {
      const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
      await httpMetric.start();
      const value = httpMetric.getAttribute('foo');
      should.equal(value, null);
      httpMetric.removeAttribute('foo');
      await httpMetric.stop();
    });

    it('getAttribute() should return string value', async () => {
      const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
      await httpMetric.start();
      httpMetric.putAttribute('foo', 'bar');
      const value = httpMetric.getAttribute('foo');
      should.equal(value, 'bar');
      httpMetric.removeAttribute('foo');
      await httpMetric.stop();
    });

    it('putAttribute()', async () => {
      const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
      await httpMetric.start();
      httpMetric.putAttribute('foo', 'bar');
      const value = httpMetric.getAttribute('foo');
      value.should.equal('bar');
      httpMetric.removeAttribute('foo');
      await httpMetric.stop();
    });

    it('getAttributes()', async () => {
      const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
      await httpMetric.start();
      httpMetric.putAttribute('foo', 'bar');
      httpMetric.putAttribute('bar', 'baz');
      const value = httpMetric.getAttributes();
      // value.should.deepEqual({
      //   foo: 'bar',
      //   bar: 'baz',
      // });
      httpMetric.removeAttribute('foo');
      httpMetric.removeAttribute('bar');
      await httpMetric.stop();
    });

    it('setHttpResponseCode()', async () => {
      const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
      await httpMetric.start();
      httpMetric.setHttpResponseCode(500);
      await httpMetric.stop();
    });

    it('setRequestPayloadSize()', async () => {
      const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
      await httpMetric.start();
      httpMetric.setRequestPayloadSize(1337);
      await httpMetric.stop();
    });

    it('setResponseContentType()', async () => {
      const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
      await httpMetric.start();
      httpMetric.setResponseContentType('application/foobar');
      await httpMetric.stop();
    });

    it('setResponsePayloadSize()', async () => {
      const httpMetric = firebase.perf().newHttpMetric(aCoolUrl, 'GET');
      await httpMetric.start();
      httpMetric.setResponsePayloadSize(13377331);
      await httpMetric.stop();
    });
  });
});
