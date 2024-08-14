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

    describe('instrumentationEnabled', function () {
      afterEach(function () {
        const perf = firebase.perf();
        perf.instrumentationEnabled = false;
      });

      it('true', function () {
        const perf = firebase.perf();

        perf.instrumentationEnabled = true;

        should.equal(perf.instrumentationEnabled, true);
      });

      it('should throw Error with wrong parameter', function () {
        const perf = firebase.perf();

        try {
          perf.instrumentationEnabled = 'some string';

          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'enabled' must be a boolean");
          return Promise.resolve();
        }
      });
    });

    // TODO: flakey in Jet e2e.
    xdescribe('dataCollectionEnabled', function () {
      afterEach(function () {
        const perf = firebase.perf();
        perf.dataCollectionEnabled = false;
      });

      it('true', function () {
        const perf = firebase.perf();

        perf.dataCollectionEnabled = true;

        should.equal(perf.dataCollectionEnabled, true);
      });

      it('should throw Error with wrong parameter', function () {
        const perf = firebase.perf();

        try {
          perf.dataCollectionEnabled = 'some string';

          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql("'enabled' must be a boolean");
          return Promise.resolve();
        }
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

    describe('startScreenTrace()', function () {
      it('resolves a started instance of a ScreenTrace', async function () {
        if (Platform.android) {
          const screenTrace = await firebase.perf().startScreenTrace('FooScreen');
          screenTrace.constructor.name.should.be.equal('ScreenTrace');
          screenTrace._identifier.should.equal('FooScreen');
          await screenTrace.stop();
          screenTrace._stopped.should.equal(true);
        }
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
        const { initializePerformance } = perfModular;

        const perf = await initializePerformance(firebase.app(), { dataCollectionEnabled: false });

        const enabled = perf.dataCollectionEnabled;

        should.equal(enabled, false);
      });

      it('call and set "dataCollectionEnabled" to `true`', async function () {
        const { initializePerformance } = perfModular;

        const perf = await initializePerformance(firebase.app(), { dataCollectionEnabled: true });

        const enabled = perf.dataCollectionEnabled;

        should.equal(enabled, true);
      });
    });

    // TODO: flakey in Jet e2e.
    xdescribe('dataCollectionEnabled', function () {
      // These depend on `tests/firebase.json` having `perf_auto_collection_enabled` set to false the first time
      // The setting is persisted across restarts, reset to false after for local runs where prefs are sticky
      afterEach(async function () {
        const { getPerformance } = perfModular;

        const perf = getPerformance();
        perf.dataCollectionEnabled = false;
      });

      it('true', async function () {
        const { getPerformance } = perfModular;

        const perf = getPerformance();
        should.equal(perf.dataCollectionEnabled, false);
        perf.dataCollectionEnabled = true;
        should.equal(perf.dataCollectionEnabled, true);
      });

      it('false', async function () {
        const { getPerformance } = perfModular;

        const perf = getPerformance();
        perf.dataCollectionEnabled = false;
        should.equal(perf.dataCollectionEnabled, false);
      });
    });

    describe('instrumentationEnabled', function () {
      afterEach(function () {
        const { getPerformance } = perfModular;

        const perf = getPerformance();
        perf.instrumentationEnabled = false;
      });

      it('true', function () {
        const { getPerformance } = perfModular;

        const perf = getPerformance();
        perf.instrumentationEnabled = true;

        should.equal(perf.instrumentationEnabled, true);
      });

      it('false', function () {
        if (Platform.ios) {
          // Only possible to change instrumentationEnabled on iOS from the app
          const { getPerformance } = perfModular;

          const perf = getPerformance();
          perf.instrumentationEnabled = false;

          should.equal(perf.instrumentationEnabled, false);
        }
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

    describe('startScreenTrace()', function () {
      it('resolves a started instance of a ScreenTrace', async function () {
        if (Platform.android) {
          const { getPerformance, startScreenTrace } = perfModular;
          const screenTrace = await startScreenTrace(getPerformance(), 'FooScreen');
          screenTrace.constructor.name.should.be.equal('ScreenTrace');
          screenTrace._identifier.should.equal('FooScreen');
          await screenTrace.stop();
          screenTrace._stopped.should.equal(true);
        }
      });
    });
  });
});
