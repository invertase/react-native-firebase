import { describe, expect, it, jest } from '@jest/globals';
import { TurboModuleRegistry } from 'react-native';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import FirebaseModule from '@react-native-firebase/app/dist/module/internal/FirebaseModule';
import { getNativeModule } from '@react-native-firebase/app/dist/module/internal/registry/nativeModule';
import type { WrappedNativeModule } from '@react-native-firebase/app/dist/module/internal/NativeModules';

const SPEC_METHODS = [
  'deleteObject',
  'getDownloadURL',
  'getMetadata',
  'updateMetadata',
  'list',
  'listAll',
  'setMaxDownloadRetryTime',
  'setMaxOperationRetryTime',
  'setMaxUploadRetryTime',
  'useEmulator',
  'writeToFile',
  'putFile',
  'putString',
  'setTaskStatus',
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
          method === 'useEmulator' || method === 'setTaskStatus'
            ? method === 'setTaskStatus'
              ? Promise.resolve(true)
              : undefined
            : Promise.resolve(),
        ),
      ]),
    ) as Record<string, jest.Mock>;

    const raw = createTurboModuleFixture(mocks);
    Object.defineProperty(raw, 'getConstants', {
      value: jest.fn(() => ({
        maxUploadRetryTime: 0,
        maxDownloadRetryTime: 0,
        maxOperationRetryTime: 0,
      })),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(raw, 'maxUploadRetryTime', {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(raw, 'maxDownloadRetryTime', {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(raw, 'maxOperationRetryTime', {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    jest.mocked(TurboModuleRegistry.get).mockReturnValueOnce(raw);

    const config: ModuleConfig = {
      namespace: 'storage',
      nativeModuleName: 'NativeRNFBTurboStorage',
      nativeEvents: ['storage_event'],
      hasMultiAppSupport: true,
      hasCustomUrlOrRegionSupport: true,
      disablePrependCustomUrlOrRegion: true,
      turboModule: true,
    };

    class ContractModule extends FirebaseModule<any> {
      constructor() {
        super({ name: '[DEFAULT]' } as any, config, 'gs://test-bucket');
      }
    }

    const wrapped = getNativeModule(new ContractModule()) as WrappedNativeModule &
      Record<(typeof SPEC_METHODS)[number], (...args: unknown[]) => unknown>;

    for (const method of SPEC_METHODS) {
      if (method === 'useEmulator') {
        wrapped[method]('localhost', 9199, 'gs://test-bucket');
      } else if (method === 'list') {
        void wrapped[method]('gs://test-bucket/path', { maxResults: 10, pageToken: null });
      } else if (method === 'updateMetadata' || method === 'putFile' || method === 'putString') {
        if (method === 'putString') {
          void wrapped[method]('gs://test-bucket/path', 'data', 'raw', {}, 1);
        } else if (method === 'putFile') {
          void wrapped[method]('gs://test-bucket/path', '/tmp/file', {}, 1);
        } else {
          void wrapped[method]('gs://test-bucket/path', { contentType: 'text/plain' });
        }
      } else if (method === 'writeToFile') {
        void wrapped[method]('gs://test-bucket/path', '/tmp/file', 1);
      } else if (method === 'setTaskStatus') {
        void wrapped[method](1, 0);
      } else if (method.startsWith('setMax')) {
        void wrapped[method](60000);
      } else if (method === 'getDownloadURL' || method === 'getMetadata' || method === 'listAll') {
        void wrapped[method]('gs://test-bucket/path');
      } else if (method === 'deleteObject') {
        void wrapped[method]('gs://test-bucket/path');
      } else {
        void wrapped[method]();
      }
      expect(mocks[method]).toHaveBeenCalledTimes(1);
      expect(Object.keys(wrapped)).toContain(method);
    }
  });
});
