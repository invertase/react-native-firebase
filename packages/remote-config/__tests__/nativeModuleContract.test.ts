import { describe, expect, it, jest } from '@jest/globals';
import { assertTurboContract } from '../../app/__tests__/turboModuleContractHelper';

const SPEC_METHODS = [
  'activate',
  'setConfigSettings',
  'fetch',
  'fetchAndActivate',
  'ensureInitialized',
  'setDefaults',
  'setDefaultsFromResource',
  'reset',
  'onConfigUpdated',
  'removeConfigUpdateRegistration',
  'setCustomSignals',
] as const;

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('exposes every spec method callable through the real wrapper', function () {
    assertTurboContract({
      namespace: 'remoteConfig',
      nativeModuleName: 'NativeRNFBTurboConfig',
      nativeEvents: ['on_config_updated'],
      hasMultiAppSupport: true,
      hasCustomUrlOrRegionSupport: false,
      turboModule: true,
      specMethods: SPEC_METHODS,
      createMock: () => jest.fn(() => Promise.resolve(null)),
      constants: {
        lastFetchTime: Date.now(),
        lastFetchStatus: 'success',
        fetchTimeout: 60,
        minimumFetchInterval: 43200,
        values: {},
      },
      assertExtra: wrapped => {
        expect(wrapped.lastFetchStatus).toBe('success');
        expect(wrapped.fetchTimeout).toBe(60);
        expect(wrapped.minimumFetchInterval).toBe(43200);
        expect(wrapped.values).toEqual({});
      },
    });
  });
});
