import { describe, expect, it, jest } from '@jest/globals';
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
import { NativeFirebaseError } from '../lib/internal';

describe('App', function () {
  describe('modular', function () {
    it('`deleteApp` function is properly exposed to end user', function () {
      expect(deleteApp).toBeDefined();
    });

    it('`registerVersion` function is properly exposed to end user', function () {
      expect(registerVersion).toBeDefined();
    });

    it('`registerVersion` throws synchronously on react-native', function () {
      expect(() => registerVersion('test-library', '1.0.0')).toThrow(
        'registerVersion is only supported on Web',
      );
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
      // eat the log messages that actually go through so we don't pollute test logs
      // eslint-disable-next-line no-console
      const origInfo = console.info;
      // eslint-disable-next-line no-console
      console.info = (_: string) => {};

      try {
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
      } finally {
        // eslint-disable-next-line no-console
        console.info = origInfo;
      }
    });
  });

  describe('`NativeFirebaseError` can cope with missing properties', function () {
    it('missing `userInfo.code` does not error', function () {
      const testNativeError = {
        userInfo: undefined,
      };
      const testNativeFirebaseError = new NativeFirebaseError(
        // @ts-ignore - using malformed object to test handling of malformed objects
        testNativeError,
        new Error().stack!,
        'testNamespace',
      );
      expect(testNativeFirebaseError.namespace).toBe('testNamespace');
      expect(testNativeFirebaseError.code).toBe('testNamespace/unknown');
    });
  });
});
