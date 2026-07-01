import { describe, expect, it, jest } from '@jest/globals';
import { TurboModuleRegistry } from 'react-native';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import FirebaseModule from '@react-native-firebase/app/dist/module/internal/FirebaseModule';
import { getNativeModule } from '@react-native-firebase/app/dist/module/internal/registry/nativeModule';
import type { WrappedNativeModule } from '@react-native-firebase/app/dist/module/internal/NativeModules';

const SPEC_METHODS = [
  'checkForUnsentReports',
  'crash',
  'crashWithStackPromise',
  'deleteUnsentReports',
  'didCrashOnPreviousExecution',
  'log',
  'logPromise',
  'sendUnsentReports',
  'setAttribute',
  'setAttributes',
  'setUserId',
  'recordError',
  'recordErrorPromise',
  'setCrashlyticsCollectionEnabled',
] as const;

const ERROR_FIXTURE = {
  message: 'test',
  isUnhandledRejection: false,
  frames: [{ src: '<unknown>', line: 0, col: 0, fn: '<unknown>', file: 'test:0:0' }],
};

function createTurboModuleFixture(methods: Record<string, jest.Mock>): Record<string, unknown> {
  const proto = Object.create(Object.prototype);

  for (const [name, fn] of Object.entries(methods)) {
    Object.defineProperty(proto, name, {
      value: fn,
      enumerable: true,
      configurable: true,
    });
  }

  return Object.create(proto);
}

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('exposes every spec method callable through the real wrapper', function () {
    const mocks = Object.fromEntries(
      SPEC_METHODS.map(method => [
        method,
        jest.fn(() =>
          method.startsWith('check') || method.startsWith('did')
            ? Promise.resolve(false)
            : Promise.resolve(),
        ),
      ]),
    ) as Record<string, jest.Mock>;

    const raw = createTurboModuleFixture(mocks);
    Object.defineProperty(raw, 'getConstants', {
      value: jest.fn(() => ({
        isCrashlyticsCollectionEnabled: false,
        isErrorGenerationOnJSCrashEnabled: false,
        isCrashlyticsJavascriptExceptionHandlerChainingEnabled: false,
      })),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(raw, 'isCrashlyticsCollectionEnabled', {
      value: false,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(raw, 'isErrorGenerationOnJSCrashEnabled', {
      value: false,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(raw, 'isCrashlyticsJavascriptExceptionHandlerChainingEnabled', {
      value: false,
      enumerable: true,
      configurable: true,
    });
    jest.mocked(TurboModuleRegistry.get).mockReturnValueOnce(raw);

    const config: ModuleConfig = {
      namespace: 'crashlytics',
      nativeModuleName: 'NativeRNFBTurboCrashlytics',
      nativeEvents: false,
      hasMultiAppSupport: false,
      hasCustomUrlOrRegionSupport: false,
      turboModule: true,
    };

    class ContractModule extends FirebaseModule<any> {
      constructor() {
        super({ name: '[DEFAULT]' } as any, config);
      }
    }

    const wrapped = getNativeModule(new ContractModule()) as WrappedNativeModule &
      Record<(typeof SPEC_METHODS)[number], (...args: unknown[]) => unknown>;

    for (const method of SPEC_METHODS) {
      if (method === 'setAttribute') {
        void wrapped[method]('key', 'value');
      } else if (method === 'setAttributes') {
        void wrapped[method]({ key: 'value' });
      } else if (method === 'setUserId') {
        void wrapped[method]('user');
      } else if (method === 'setCrashlyticsCollectionEnabled') {
        void wrapped[method](true);
      } else if (method === 'log' || method === 'logPromise') {
        wrapped[method]('message');
      } else if (
        method === 'recordError' ||
        method === 'recordErrorPromise' ||
        method === 'crashWithStackPromise'
      ) {
        if (method === 'recordError') {
          wrapped[method](ERROR_FIXTURE);
        } else {
          void wrapped[method](ERROR_FIXTURE);
        }
      } else if (method === 'crash' || method === 'sendUnsentReports') {
        wrapped[method]();
      } else {
        void wrapped[method]();
      }
      expect(mocks[method]).toHaveBeenCalledTimes(1);
      expect(Object.keys(wrapped)).toContain(method);
    }
  });
});
