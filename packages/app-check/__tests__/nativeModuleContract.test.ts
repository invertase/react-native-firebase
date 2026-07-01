import { describe, expect, it, jest } from '@jest/globals';
import { TurboModuleRegistry } from 'react-native';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import FirebaseModule from '@react-native-firebase/app/dist/module/internal/FirebaseModule';
import { getNativeModule } from '@react-native-firebase/app/dist/module/internal/registry/nativeModule';
import type { WrappedNativeModule } from '@react-native-firebase/app/dist/module/internal/NativeModules';

const SPEC_METHODS = [
  'activate',
  'configureProvider',
  'setTokenAutoRefreshEnabled',
  'isTokenAutoRefreshEnabled',
  'getToken',
  'getLimitedUseToken',
  'addAppCheckListener',
  'removeAppCheckListener',
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
        jest.fn(() => (method.startsWith('get') ? Promise.resolve({ token: method }) : undefined)),
      ]),
    ) as Record<string, jest.Mock>;

    const raw = createTurboModuleFixture(mocks);
    jest.mocked(TurboModuleRegistry.get).mockReturnValueOnce(raw);

    const config: ModuleConfig = {
      namespace: 'appCheck',
      nativeModuleName: 'NativeRNFBTurboAppCheck',
      nativeEvents: ['appCheck_token_changed'],
      hasMultiAppSupport: true,
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
      if (method === 'setTokenAutoRefreshEnabled') {
        wrapped[method](true);
      } else if (method === 'getToken') {
        void wrapped[method](false);
      } else if (method === 'configureProvider') {
        void wrapped[method]('debug', 'token');
      } else if (method === 'activate') {
        void wrapped[method]('siteKey', true);
      } else {
        void wrapped[method]();
      }
      expect(mocks[method]).toHaveBeenCalledTimes(1);
      expect(Object.keys(wrapped)).toContain(method);
    }
  });
});
