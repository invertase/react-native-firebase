import { describe, expect, it, jest } from '@jest/globals';
import { assertTurboContract } from '../../app/__tests__/turboModuleContractHelper';

const SPEC_METHODS = [
  'setPerformanceCollectionEnabled',
  'instrumentationEnabled',
  'startTrace',
  'stopTrace',
  'startScreenTrace',
  'stopScreenTrace',
  'startHttpMetric',
  'stopHttpMetric',
] as const;

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('exposes every spec method callable through the real wrapper', function () {
    assertTurboContract({
      namespace: 'perf',
      nativeModuleName: 'NativeRNFBTurboPerf',
      nativeEvents: false,
      hasMultiAppSupport: false,
      hasCustomUrlOrRegionSupport: false,
      turboModule: true,
      specMethods: SPEC_METHODS,
      createMock: () => jest.fn(() => Promise.resolve(null)),
      constants: {
        isPerformanceCollectionEnabled: true,
        isInstrumentationEnabled: true,
      },
      assertExtra: wrapped => {
        expect(wrapped.isPerformanceCollectionEnabled).toBe(true);
        expect(wrapped.isInstrumentationEnabled).toBe(true);
      },
    });
  });
});
