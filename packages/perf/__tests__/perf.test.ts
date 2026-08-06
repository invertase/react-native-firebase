import { describe, expect, it } from '@jest/globals';

import {
  getPerformance,
  initializePerformance,
  trace,
  httpMetric,
  newScreenTrace,
  startScreenTrace,
} from '../lib';

describe('Performance Monitoring', function () {
  describe('modular', function () {
    it('`getPerformance` function is properly exposed to end user', function () {
      expect(getPerformance).toBeDefined();
    });

    it('`initializePerformance` function is properly exposed to end user', function () {
      expect(initializePerformance).toBeDefined();
    });

    it('`trace` function is properly exposed to end user', function () {
      expect(trace).toBeDefined();
    });

    it('`httpMetric` function is properly exposed to end user', function () {
      expect(httpMetric).toBeDefined();
    });

    it('`newScreenTrace` function is properly exposed to end user', function () {
      expect(newScreenTrace).toBeDefined();
    });

    it('`startScreenTrace` function is properly exposed to end user', function () {
      expect(startScreenTrace).toBeDefined();
    });
  });

  describe('synchronous start/stop parity', function () {
    it('`Trace.start()` and `Trace.stop()` return synchronously (not Promises)', function () {
      const perf = getPerformance();
      const traceInstance = trace(perf, 'sync-trace');

      const startResult = traceInstance.start();
      expect(startResult).toBeUndefined();
      expect(startResult).not.toBeInstanceOf(Promise);
      // @ts-expect-error internal flag for test assertion only
      expect(traceInstance._started).toBe(true);

      const stopResult = traceInstance.stop();
      expect(stopResult).toBeUndefined();
      expect(stopResult).not.toBeInstanceOf(Promise);
      // @ts-expect-error internal flag for test assertion only
      expect(traceInstance._stopped).toBe(true);
    });

    it('`HttpMetric.start()` and `HttpMetric.stop()` return synchronously (not Promises)', function () {
      const perf = getPerformance();
      const metric = httpMetric(perf, 'https://example.com', 'GET');
      metric.setHttpResponseCode(200);

      const startResult = metric.start();
      expect(startResult).toBeUndefined();
      expect(startResult).not.toBeInstanceOf(Promise);

      const stopResult = metric.stop();
      expect(stopResult).toBeUndefined();
      expect(stopResult).not.toBeInstanceOf(Promise);
    });

    it('`startTrace()` returns a started Trace synchronously (not a Promise)', function () {
      const perf = getPerformance();
      const traceInstance = (perf as unknown as { startTrace(name: string): unknown }).startTrace(
        'sync-start-trace',
      );

      expect(traceInstance).not.toBeInstanceOf(Promise);
      expect((traceInstance as { _started: boolean })._started).toBe(true);
    });
  });
});
