import { describe, expect, it, jest } from '@jest/globals';
import { NativeModules } from 'react-native';
import {
  deleteApp,
  registerVersion,
  onLog,
  getApps,
  initializeApp,
  getApp,
  setLogLevel,
} from '../lib';
import { Logger, LogLevel } from '../lib/internal/logger';
import { NativeFirebaseError } from '../lib/internal';
import Base64 from '../lib/common/Base64';
import FirebaseModule from '../lib/internal/FirebaseModule';
import { getOrCreateModularInstance } from '../lib/internal/registry/modular';
import type { ModuleConfig } from '../lib/types/internal';

const nativeAppModule = NativeModules.NativeRNFBTurboApp;
nativeAppModule.initializeApp = jest.fn(() => Promise.resolve());
nativeAppModule.deleteApp = jest.fn(() => Promise.resolve());

const firebaseOptions = {
  apiKey: 'api-key',
  appId: 'app-id',
  databaseURL: 'https://example.firebaseio.com',
  messagingSenderId: 'sender-id',
  projectId: 'project-id',
  storageBucket: 'example.appspot.com',
};

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

    it.each(['toString', '__proto__'])('supports the app name %s', async function (name) {
      const app = await initializeApp(firebaseOptions, name);
      const namespace = `registry-${name}`;
      const config: ModuleConfig = {
        namespace,
        nativeModuleName: 'NativeRNFBTurboApp',
        hasMultiAppSupport: true,
      };

      try {
        expect(getApp(name)).toBe(app);
        expect(getOrCreateModularInstance(FirebaseModule, config, app)).toBe(
          getOrCreateModularInstance(FirebaseModule, config, app),
        );
        expect(Object.prototype.hasOwnProperty.call(Object.prototype, namespace)).toBe(false);
      } finally {
        await deleteApp(app);
        delete (Object.prototype as Record<string, unknown>)[namespace];
      }
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
        onLog(null);
        // eslint-disable-next-line no-console
        console.info = origInfo;
      }
    });

    it('applies the global log level to Logger instances created later', function () {
      setLogLevel('error');

      try {
        expect(new Logger('late-logger').logLevel).toBe(LogLevel.ERROR);
      } finally {
        setLogLevel('info');
      }
    });

    it('applies the global log handler to Logger instances created later', function () {
      const spy = jest.fn();
      onLog(spy, { level: 'warn' });

      try {
        const logger = new Logger('late-logger');
        logger.logHandler = jest.fn();
        logger.info('ignored');
        logger.warn('captured');

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({
            args: ['captured'],
            level: 'warn',
            message: 'captured',
            type: 'late-logger',
          }),
        );
      } finally {
        onLog(null);
      }
    });
  });

  describe('Base64', function () {
    it('rejects when FileReader cannot start reading a Blob', async function () {
      const OriginalFileReader = globalThis.FileReader;

      class ThrowingFileReader {
        readAsDataURL(): void {
          throw new Error('read failed');
        }
      }

      globalThis.FileReader = ThrowingFileReader as unknown as typeof FileReader;

      try {
        await expect(Base64.fromData(new Blob())).rejects.toThrow('read failed');
      } finally {
        globalThis.FileReader = OriginalFileReader;
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
