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
      it('throws an error with an incorrect timeout', function () {
        const app = firebase.app();

        // @ts-ignore
        expect(() => app.functions().httpsCallable('example', { timeout: 'test' })).toThrow(
          'HttpsCallableOptions.timeout expected a Number in milliseconds',
        );
      });
    });
  });

  describe('modular', function () {
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

    describe('types', function () {
      it('`HttpsCallableOptions` type is properly exposed to end user', function () {
        const options: HttpsCallableOptions = { timeout: 5000 };
        expect(options).toBeDefined();
        expect(options.timeout).toBe(5000);
      });

      it('`HttpsCallable` type is properly exposed to end user', function () {
        // Type check - this will fail at compile time if type is not exported
        const callable: HttpsCallableType<{ test: string }, { result: number }> = async () => {
          return { data: { result: 42 } };
        };
        expect(callable).toBeDefined();
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

      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: () =>
              jest.fn().mockResolvedValue({
                source: 'cache',
                changes: [],
                documents: [],
                metadata: {},
                path: 'foo',
              } as never),
          },
        );
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
    });
  });
});
