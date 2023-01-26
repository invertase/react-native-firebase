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

describe('perf()', function () {
  describe('setPerformanceCollectionEnabled()', function () {
    // These depend on `tests/firebase.json` having `perf_auto_collection_enabled` set to false the first time
    // The setting is persisted across restarts, reset to false after for local runs where prefs are sticky
    afterEach(async function () {
      await firebase.perf().setPerformanceCollectionEnabled(false);
    });

    it('true', async function () {
      should.equal(firebase.perf().isPerformanceCollectionEnabled, false);
      await firebase.perf().setPerformanceCollectionEnabled(true);
      should.equal(firebase.perf().isPerformanceCollectionEnabled, true);
    });

    it('false', async function () {
      await firebase.perf().setPerformanceCollectionEnabled(false);
      should.equal(firebase.perf().isPerformanceCollectionEnabled, false);
    });
  });

  describe('startTrace()', function () {
    it('resolves a started instance of Trace', async function () {
      const trace = await firebase.perf().startTrace('invertase');
      trace.constructor.name.should.be.equal('Trace');
      trace._identifier.should.equal('invertase');
      trace._started.should.equal(true);
      await trace.stop();
    });
  });
});
