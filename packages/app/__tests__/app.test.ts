import { jest, describe, expect, it } from '@jest/globals';

import {
  deleteApp,
  registerVersion,
  onLog,
  getApps,
  initializeApp,
  getApp,
  setLogLevel,
} from '../lib';
import { Logger } from '../lib/internal/logger';

describe('App', function () {
  describe('modular', function () {
    it('`deleteApp` function is properly exposed to end user', function () {
      expect(deleteApp).toBeDefined();
    });

    it('`registerVersion` function is properly exposed to end user', function () {
      expect(registerVersion).toBeDefined();
    });

    it('`onLog` function is properly exposed to end user', function () {
      expect(onLog).toBeDefined();
    });

    it('`getApps` function is properly exposed to end user', function () {
      expect(getApps).toBeDefined();
    });

    it('`initializeApp` function is properly exposed to end user', function () {
      expect(initializeApp).toBeDefined();
    });

    it('`getApp` function is properly exposed to end user', function () {
      expect(getApp).toBeDefined();
    });

    it('`setLogLevel` function is properly exposed to end user', function () {
      expect(setLogLevel).toBeDefined();
    });

    it('`onLog()` is called when using Logger (currently only VertexAI uses `onLog()`)', function () {
      const logger = new Logger('@firebase/vertexai');
      const spy2 = jest.fn();

      onLog(spy2);
      logger.info('test');

      expect(spy2).toHaveBeenCalledWith(
        expect.objectContaining({
          args: ['test'],
          level: 'info',
          message: 'test',
          type: '@firebase/vertexai',
        }),
      );
    });
  });
});
