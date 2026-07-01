import { describe, expect, it, jest } from '@jest/globals';
import { TurboModuleRegistry } from 'react-native';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import FirebaseModule from '@react-native-firebase/app/dist/module/internal/FirebaseModule';
import { getNativeModule } from '@react-native-firebase/app/dist/module/internal/registry/nativeModule';
import type { WrappedNativeModule } from '@react-native-firebase/app/dist/module/internal/NativeModules';

const SPEC_METHODS = [
  'logEvent',
  'setAnalyticsCollectionEnabled',
  'setSessionTimeoutDuration',
  'getAppInstanceId',
  'getSessionId',
  'setUserId',
  'setUserProperty',
  'setUserProperties',
  'resetAnalyticsData',
  'setDefaultEventParameters',
  'setConsent',
  'logTransaction',
  'initiateOnDeviceConversionMeasurementWithEmailAddress',
  'initiateOnDeviceConversionMeasurementWithHashedEmailAddress',
  'initiateOnDeviceConversionMeasurementWithPhoneNumber',
  'initiateOnDeviceConversionMeasurementWithHashedPhoneNumber',
] as const;

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
          method.startsWith('get')
            ? Promise.resolve(method === 'getSessionId' ? 1 : 'id')
            : undefined,
        ),
      ]),
    ) as Record<string, jest.Mock>;

    const raw = createTurboModuleFixture(mocks);
    jest.mocked(TurboModuleRegistry.get).mockReturnValueOnce(raw);

    const config: ModuleConfig = {
      namespace: 'analytics',
      nativeModuleName: 'NativeRNFBTurboAnalytics',
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
      if (method === 'logEvent') {
        void wrapped[method]('test_event', { foo: 'bar' });
      } else if (method === 'setAnalyticsCollectionEnabled') {
        void wrapped[method](true);
      } else if (method === 'setSessionTimeoutDuration') {
        void wrapped[method](1800000);
      } else if (method === 'setUserId') {
        void wrapped[method]('user-1');
      } else if (method === 'setUserProperty') {
        void wrapped[method]('role', 'admin');
      } else if (method === 'setUserProperties') {
        void wrapped[method]({ role: 'admin' });
      } else if (method === 'setDefaultEventParameters') {
        void wrapped[method]({ campaign: 'spring' });
      } else if (method === 'setConsent') {
        void wrapped[method]({ analytics_storage: true });
      } else if (method === 'logTransaction') {
        void wrapped[method]('txn-1');
      } else if (method.startsWith('initiateOnDeviceConversionMeasurement')) {
        void wrapped[method]('value');
      } else {
        void wrapped[method]();
      }
      expect(mocks[method]).toHaveBeenCalledTimes(1);
      expect(Object.keys(wrapped)).toContain(method);
    }
  });
});
