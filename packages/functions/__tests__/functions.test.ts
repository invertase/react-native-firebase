import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
  httpsCallableFromUrl,
  HttpsErrorCode,
  type HttpsCallableOptions,
  type HttpsCallable,
  type Functions,
} from '../lib';
import type { HttpsCallableStreamOptions, HttpsCallableStreamResult } from '../lib/types/functions';

// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';

describe('Cloud Functions', function () {
  describe('modular', function () {
    beforeEach(function () {
      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: () =>
              jest.fn().mockResolvedValue({
                constants: {},
              } as never),
          },
        );
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

    describe('types', function () {
      it('`HttpsCallableOptions` type is properly exposed to end user', function () {
        const options: HttpsCallableOptions = { timeout: 5000 };
        expect(options).toBeDefined();
        expect(options.timeout).toBe(5000);
      });

      it('`HttpsCallable` type is properly exposed to end user', function () {
        const callable = (async () => {
          return { data: { result: 42 } };
        }) as HttpsCallable<{ test: string }, { result: number }>;
        callable.stream = async (
          _data?: { test: string } | null,
          _options?: HttpsCallableStreamOptions,
        ): Promise<HttpsCallableStreamResult<{ result: number }, unknown>> => {
          return {
            data: Promise.resolve({ result: 42 }),
            stream: (async function* () {
              // Empty async generator for stream
            })(),
          };
        };
        expect(callable).toBeDefined();
      });

      it('`Functions` type is properly exposed to end user', function () {
        const functionsInstance: Functions = getFunctions();
        expect(functionsInstance).toBeDefined();
        expect(functionsInstance.httpsCallable).toBeDefined();
        expect(functionsInstance.httpsCallableFromUrl).toBeDefined();
        expect(functionsInstance.useFunctionsEmulator).toBeDefined();
        expect(functionsInstance.useEmulator).toBeDefined();
      });
    });
  });
});
