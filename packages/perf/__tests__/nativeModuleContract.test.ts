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

const SYNC_METHODS = [
  'startTrace',
  'stopTrace',
  'startScreenTrace',
  'stopScreenTrace',
  'startHttpMetric',
  'stopHttpMetric',
] as const;

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('exposes every spec method callable through the real wrapper, with sync start/stop', function () {
    assertTurboContract(
      {
        namespace: 'perf',
        nativeModuleName: 'NativeRNFBTurboPerf',
        nativeEvents: false,
        hasMultiAppSupport: false,
        hasCustomUrlOrRegionSupport: false,
        turboModule: true,
        specMethods: SPEC_METHODS,
        createMock: method =>
          jest.fn(() => {
            if (SYNC_METHODS.includes(method as (typeof SYNC_METHODS)[number])) {
              return undefined;
            }
            return Promise.resolve(null);
          }),
        constants: {
          isPerformanceCollectionEnabled: true,
          isInstrumentationEnabled: true,
        },
        assertExtra: wrapped => {
          expect(wrapped.isPerformanceCollectionEnabled).toBe(true);
          expect(wrapped.isInstrumentationEnabled).toBe(true);
        },
      },
      {
        startTrace: wrapped => {
          const result = wrapped.startTrace(0, 'trace');
          expect(result).toBeUndefined();
          expect(result).not.toBeInstanceOf(Promise);
        },
        stopTrace: wrapped => {
          const result = wrapped.stopTrace(0, { metrics: {}, attributes: {} });
          expect(result).toBeUndefined();
          expect(result).not.toBeInstanceOf(Promise);
        },
        startScreenTrace: wrapped => {
          const result = wrapped.startScreenTrace(0, 'screen');
          expect(result).toBeUndefined();
          expect(result).not.toBeInstanceOf(Promise);
        },
        stopScreenTrace: wrapped => {
          const result = wrapped.stopScreenTrace(0);
          expect(result).toBeUndefined();
          expect(result).not.toBeInstanceOf(Promise);
        },
        startHttpMetric: wrapped => {
          const result = wrapped.startHttpMetric(0, 'https://example.com', 'GET');
          expect(result).toBeUndefined();
          expect(result).not.toBeInstanceOf(Promise);
        },
        stopHttpMetric: wrapped => {
          const result = wrapped.stopHttpMetric(0, { attributes: {} });
          expect(result).toBeUndefined();
          expect(result).not.toBeInstanceOf(Promise);
        },
      },
    );
  });
});
