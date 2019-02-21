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

android.describe('perf()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.perf);
      app.perf().app.should.equal(app);
    });
  });

  describe('newHttpMetric()', () => {
    it('returns an instance of HttpMetric', async () => {
      const metric = firebase.perf().newHttpMetric('https://invertase.io', 'GET');
      metric.constructor.name.should.be.equal('HttpMetric');
      metric._url.should.equal('https://invertase.io');
      metric._httpMethod.should.equal('GET');
    });

    it('errors if url not a string', async () => {
      try {
        firebase.perf().newHttpMetric(1337, 7331);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a string');
        return Promise.resolve();
      }
    });

    it('errors if httpMethod not a string', async () => {
      try {
        firebase.perf().newHttpMetric('https://invertase.io', 1337);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be one of');
        return Promise.resolve();
      }
    });

    it('errors if httpMethod not a valid type', async () => {
      try {
        firebase.perf().newHttpMetric('https://invertase.io', 'FIRE');
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be one of');
        return Promise.resolve();
      }
    });
  });
});
