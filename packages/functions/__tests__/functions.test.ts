import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import functions, {
  firebase,
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
  httpsCallableFromUrl,
  HttpsErrorCode,
} from '../lib';

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
  });
});
