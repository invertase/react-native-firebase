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

describe('perf() modular', function () {
  describe('firebase v8 compatibility', function () {
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

    describe('isInstrumentationEnabled', function () {
      it('should be true', function () {
        should.equal(firebase.perf().isInstrumentationEnabled, true);
      });
    });

    describe('setDataCollectionEnabled()', function () {
      afterEach(async function () {
        await firebase.perf().setDataCollectionEnabled(false);
      });
      it('should be true', async function () {
        await firebase.perf().setDataCollectionEnabled(true);

        should.equal(firebase.perf().isDataCollectionEnabled, true);
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

  describe('modular', function () {
    describe('getPerformance', function () {
      it('pass app as argument', function () {
        const { getPerformance } = perfModular;

        const perf = getPerformance(firebase.app());

        perf.constructor.name.should.be.equal('FirebasePerfModule');
      });

      it('no app as argument', function () {
        const { getPerformance } = perfModular;

        const perf = getPerformance();

        perf.constructor.name.should.be.equal('FirebasePerfModule');
      });
    });

    describe('initializePerformance()', function () {
      it('call and set "dataCollectionEnabled" to `false`', async function () {
        const { initializePerformance, isPerformanceCollectionEnabled } = perfModular;

        const perf = await initializePerformance(firebase.app(), { dataCollectionEnabled: false });

        const enabled = await isPerformanceCollectionEnabled(perf);

        should.equal(enabled, false);
      });

      it('call and set "dataCollectionEnabled" to `true`', async function () {
        const { initializePerformance, isPerformanceCollectionEnabled } = perfModular;

        const perf = await initializePerformance(firebase.app(), { dataCollectionEnabled: true });

        const enabled = await isPerformanceCollectionEnabled(perf);

        should.equal(enabled, true);
      });
    });

    describe('setPerformanceCollectionEnabled()', function () {
      // These depend on `tests/firebase.json` having `perf_auto_collection_enabled` set to false the first time
      // The setting is persisted across restarts, reset to false after for local runs where prefs are sticky
      afterEach(async function () {
        const { getPerformance, setPerformanceCollectionEnabled } = perfModular;

        const perf = getPerformance();
        await setPerformanceCollectionEnabled(perf, false);
      });

      it('true', async function () {
        const { getPerformance, setPerformanceCollectionEnabled, isPerformanceCollectionEnabled } =
          perfModular;

        const perf = getPerformance();
        should.equal(isPerformanceCollectionEnabled(perf), false);
        await setPerformanceCollectionEnabled(perf, true);
        should.equal(isPerformanceCollectionEnabled(perf), true);
      });

      it('false', async function () {
        const { getPerformance, setPerformanceCollectionEnabled, isPerformanceCollectionEnabled } =
          perfModular;

        const perf = getPerformance();
        await setPerformanceCollectionEnabled(perf, false);
        should.equal(isPerformanceCollectionEnabled(perf), false);
      });
    });

    describe('isDataCollectionEnabled', function () {
      afterEach(async function () {
        const { getPerformance } = perfModular;

        const perf = getPerformance();
        perf.dataCollectionEnabled = false;
      });

      it('true', function () {
        const { getPerformance } = perfModular;

        const perf = getPerformance();
        perf.isDataCollectionEnabled = true;
        should.equal(perf.isDataCollectionEnabled, true);
      });
    });

    describe('isInstrumentationEnabled', function () {
      afterEach(async function () {
        const { getPerformance } = perfModular;

        const perf = getPerformance();
        perf.isInstrumentationEnabled = false;
      });

      it('true', function () {
        const { getPerformance } = perfModular;

        const perf = getPerformance();
        perf.isInstrumentationEnabled = false;

        should.equal(perf.isInstrumentationEnabled, true);
      });
    });

    describe('startTrace()', function () {
      it('resolves a started instance of Trace', async function () {
        const { getPerformance, trace } = perfModular;
        const perf = getPerformance();
        const traceInvertase = trace(perf, 'invertase');
        await traceInvertase.start();
        traceInvertase.constructor.name.should.be.equal('Trace');
        traceInvertase._identifier.should.equal('invertase');
        traceInvertase._started.should.equal(true);
        await traceInvertase.stop();
      });
    });
  });
});
