import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  firebase,
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
  httpsCallableFromUrl,
  HttpsErrorCode,
  type HttpsCallableOptions,
  type HttpsCallable as HttpsCallableType,
  type Functions,
} from '../lib';

// Import namespaced to ensure NativeRNFBTurboFunctions is registered
import functions from '../lib/namespaced';
import {
  createCheckV9Deprecation,
  type CheckV9DeprecationFunction,
} from '../../app/lib/common/unitTestUtils';

// @ts-ignore test
import { getApp, type ReactNativeFirebase } from '@react-native-firebase/app';

type FirebaseApp = ReactNativeFirebase.FirebaseApp;

// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';
import { getReactNativeModule, setReactNativeModule } from '../../app/lib/internal/nativeModule';

// Ensure NativeRNFBTurboFunctions is registered - it should be registered by namespaced.ts
// but we verify and add removeFunctionsStreaming if needed
try {
  const module = getReactNativeModule('NativeRNFBTurboFunctions');
  if (module && !module.removeFunctionsStreaming) {
    module.removeFunctionsStreaming = () => {};
  }
} catch (_e) {
  // Module not registered yet - register it ourselves as fallback
  // This shouldn't happen if namespaced.ts imported correctly
  setReactNativeModule('NativeRNFBTurboFunctions', {
    httpsCallableStream: () => {},
    httpsCallableStreamFromUrl: () => {},
    removeFunctionsStreaming: () => {},
  });
}
describe('Cloud Functions', function () {
  describe('namespace', function () {
    beforeAll(async function () {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterAll(async function () {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    beforeEach(function () {
      // No need to mock here - RNFBFunctionsModule is already registered at module load time
    });

    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.functions).toBeDefined();
      expect(app.functions().httpsCallable).toBeDefined();
    });

    describe('useFunctionsEmulator()', function () {
      it('useFunctionsEmulator -> uses 10.0.2.2', function () {
        functions().useEmulator('localhost', 5001);

        // @ts-ignore
        expect(functions()._useFunctionsEmulatorHost).toBe('10.0.2.2');

        functions().useEmulator('127.0.0.1', 5001);

        // @ts-ignore
        expect(functions()._useFunctionsEmulatorHost).toBe('10.0.2.2');
      });

      it('prefers emulator to custom domain', function () {
        const app = firebase.app();
        const customUrl = 'https://test.com';
        const functions = app.functions(customUrl);

        functions.useFunctionsEmulator('http://10.0.2.2');

        // @ts-ignore
        expect(functions._useFunctionsEmulatorHost).toBe('10.0.2.2');
      });
    });

    describe('httpcallable()', function () {
      beforeEach(function () {
        // Mock the native module streaming methods to prevent real network calls
        const mockNative = {
          httpsCallableStream: jest.fn(),
          httpsCallableStreamFromUrl: jest.fn(),
          removeFunctionsStreaming: jest.fn(),
        };

        // Override the registered native module (for web platform)
        setReactNativeModule('NativeRNFBTurboFunctions', mockNative);

        // Override the native getter on FirebaseModule prototype (for native platforms)
        Object.defineProperty(FirebaseModule.prototype, 'native', {
          get: function (this: any) {
            this._nativeModule = mockNative;
            return mockNative;
          },
          configurable: true,
          enumerable: true,
        });
      });

      it('throws an error with an incorrect timeout', function () {
        const app = firebase.app();

        // @ts-ignore
        expect(() => app.functions().httpsCallable('example', { timeout: 'test' })).toThrow(
          'HttpsCallableOptions.timeout expected a Number in milliseconds',
        );
      });

      it('has stream method', function () {
        const app = firebase.app();
        const callable = app.functions().httpsCallable('example');
        expect(callable.stream).toBeDefined();
        expect(typeof callable.stream).toBe('function');
      });

      it('stream method returns unsubscribe function', function () {
        const app = firebase.app();
        const callable = app.functions().httpsCallable('example');
        const unsubscribe = callable.stream({ test: 'data' }, () => {});
        expect(typeof unsubscribe).toBe('function');
        unsubscribe();
      });
    });

    describe('httpsCallableFromUrl()', function () {
      beforeEach(function () {
        // Mock the native module streaming methods to prevent real network calls
        const mockNative = {
          httpsCallableStream: jest.fn(),
          httpsCallableStreamFromUrl: jest.fn(),
          removeFunctionsStreaming: jest.fn(),
        };

        // Override the registered native module (for web platform)
        setReactNativeModule('NativeRNFBTurboFunctions', mockNative);

        // Override the native getter on FirebaseModule prototype (for native platforms)
        Object.defineProperty(FirebaseModule.prototype, 'native', {
          get: function (this: any) {
            this._nativeModule = mockNative;
            return mockNative;
          },
          configurable: true,
          enumerable: true,
        });
      });

      it('has stream method', function () {
        const app = firebase.app();
        const callable = app.functions().httpsCallableFromUrl('https://example.com/example');
        expect(callable.stream).toBeDefined();
        expect(typeof callable.stream).toBe('function');
      });

      it('stream method returns unsubscribe function', function () {
        const app = firebase.app();
        const callable = app.functions().httpsCallableFromUrl('https://example.com/example');
        const unsubscribe = callable.stream({ test: 'data' }, () => {});
        expect(typeof unsubscribe).toBe('function');
        unsubscribe();
      });
    });
  });

  describe('modular', function () {
    beforeEach(function () {
      // Mock the native module streaming methods to prevent real network calls
      const mockNative = {
        httpsCallableStream: jest.fn(),
        httpsCallableStreamFromUrl: jest.fn(),
        removeFunctionsStreaming: jest.fn(),
      };

      // Override the registered native module (for web platform)
      setReactNativeModule('NativeRNFBTurboFunctions', mockNative);

      // Override the native getter on FirebaseModule prototype (for native platforms)
      Object.defineProperty(FirebaseModule.prototype, 'native', {
        get: function (this: any) {
          this._nativeModule = mockNative;
          return mockNative;
        },
        configurable: true,
        enumerable: true,
      });
    });

    it('`getFunctions` function is properly exposed to end user', function () {
      expect(getFunctions).toBeDefined();
    });

    it('`connectFunctionsEmulator` function is properly exposed to end user', function () {
      expect(connectFunctionsEmulator).toBeDefined();
    });

    it('`httpsCallable` function is properly exposed to end user', function () {
      expect(httpsCallable).toBeDefined();
    });

    it('`httpsCallableFromUrl` function is properly exposed to end user', function () {
      expect(httpsCallableFromUrl).toBeDefined();
    });

    it('`HttpsErrorCode` function is properly exposed to end user', function () {
      expect(HttpsErrorCode).toBeDefined();
    });

    it('`httpsCallable().stream()` method is properly exposed to end user', function () {
      const callable = httpsCallable(getFunctions(), 'example');
      expect(callable.stream).toBeDefined();
      expect(typeof callable.stream).toBe('function');
    });

    it('`httpsCallableFromUrl().stream()` method is properly exposed to end user', function () {
      const callable = httpsCallableFromUrl(getFunctions(), 'https://example.com/example');
      expect(callable.stream).toBeDefined();
      expect(typeof callable.stream).toBe('function');
    });

    it('`httpsCallable().stream()` returns unsubscribe function', function () {
      const callable = httpsCallable(getFunctions(), 'example');
      const unsubscribe = callable.stream({ test: 'data' }, () => {});
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('`httpsCallableFromUrl().stream()` returns unsubscribe function', function () {
      const callable = httpsCallableFromUrl(getFunctions(), 'https://example.com/example');
      const unsubscribe = callable.stream({ test: 'data' }, () => {});
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    describe('types', function () {
      it('`HttpsCallableOptions` type is properly exposed to end user', function () {
        const options: HttpsCallableOptions = { timeout: 5000 };
        expect(options).toBeDefined();
        expect(options.timeout).toBe(5000);
      });

      it('`HttpsCallable` type is properly exposed to end user', function () {
        // Type check - this will fail at compile time if type is not exported
        const callable: HttpsCallableType<{ test: string }, { result: number }> = Object.assign(
          async () => {
            return { data: { result: 42 } };
          },
          {
            stream: (_data?: any, _onEvent?: any, _options?: any) => {
              return () => {};
            },
          },
        );
        expect(callable).toBeDefined();
        expect(callable.stream).toBeDefined();
      });

      it('`FunctionsModule` type is properly exposed to end user', function () {
        const functionsInstance: Functions = (firebase.app() as unknown as FirebaseApp).functions();
        expect(functionsInstance).toBeDefined();
        expect(functionsInstance.httpsCallable).toBeDefined();
        expect(functionsInstance.httpsCallableFromUrl).toBeDefined();
        expect(functionsInstance.useFunctionsEmulator).toBeDefined();
        expect(functionsInstance.useEmulator).toBeDefined();
      });

      it('`Functions` type is properly exposed to end user', function () {
        const functionsInstance: Functions = (firebase.app() as unknown as FirebaseApp).functions();
        expect(functionsInstance).toBeDefined();
      });

      it('`FirebaseApp` type is properly exposed to end user', function () {
        const app = firebase.app() as unknown as FirebaseApp;
        expect(app).toBeDefined();
        expect(app.functions).toBeDefined();
      });
    });
  });

  describe('test `console.warn` is called for RNFB v8 API & not called for v9 API', function () {
    let functionsRefV9Deprecation: CheckV9DeprecationFunction;

    beforeEach(function () {
      functionsRefV9Deprecation = createCheckV9Deprecation(['functions']);

      // Mock the native module directly to avoid getter caching issues
      const mockNative = {
        httpsCallableStream: jest.fn(),
        httpsCallableStreamFromUrl: jest.fn(),
        removeFunctionsStreaming: jest.fn(),
      };

      // Override the registered native module (for web platform)
      setReactNativeModule('NativeRNFBTurboFunctions', mockNative);

      // Override the native getter on FirebaseModule prototype using Object.defineProperty
      // This ensures the mock is returned even if _nativeModule is cached
      Object.defineProperty(FirebaseModule.prototype, 'native', {
        get: function (this: any) {
          // Always return the mock, clearing any cache
          this._nativeModule = mockNative;
          return mockNative;
        },
        configurable: true,
        enumerable: true,
      });
    });

    describe('Cloud Functions', function () {
      it('useFunctionsEmulator()', function () {
        const functions = (getApp() as unknown as FirebaseApp).functions();
        functionsRefV9Deprecation(
          () => connectFunctionsEmulator(functions, 'localhost', 8080),
          () => functions.useEmulator('localhost', 8080),
          'useEmulator',
        );
      });

      it('httpsCallable()', function () {
        const functions = (getApp() as unknown as FirebaseApp).functions();
        functionsRefV9Deprecation(
          () => httpsCallable(functions, 'example'),
          () => functions.httpsCallable('example'),
          'httpsCallable',
        );
      });

      it('httpsCallableFromUrl()', function () {
        const functions = (getApp() as unknown as FirebaseApp).functions();
        functionsRefV9Deprecation(
          () => httpsCallableFromUrl(functions, 'https://example.com/example'),
          () => functions.httpsCallableFromUrl('https://example.com/example'),
          'httpsCallableFromUrl',
        );
      });

      it('httpsCallable().stream()', function () {
        const functions = (getApp() as unknown as FirebaseApp).functions();
        functionsRefV9Deprecation(
          () => httpsCallable(functions, 'example').stream({ test: 'data' }, () => {}),
          () => functions.httpsCallable('example').stream({ test: 'data' }, () => {}),
          'httpsCallable',
        );
      });

      it('httpsCallableFromUrl().stream()', function () {
        const functions = (getApp() as unknown as FirebaseApp).functions();
        functionsRefV9Deprecation(
          () =>
            httpsCallableFromUrl(functions, 'https://example.com/example').stream(
              { test: 'data' },
              () => {},
            ),
          () =>
            functions
              .httpsCallableFromUrl('https://example.com/example')
              .stream({ test: 'data' }, () => {}),
          'httpsCallableFromUrl',
        );
      });
    });
  });
});
