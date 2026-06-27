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
});
