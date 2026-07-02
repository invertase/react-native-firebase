import { describe, expect, it, jest } from '@jest/globals';
import { assertTurboContract } from '../../app/__tests__/turboModuleContractHelper';

const SPEC_METHODS = [
  'setAutomaticDataCollectionEnabled',
  'setMessagesDisplaySuppressed',
  'triggerEvent',
] as const;

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('exposes every spec method callable through the real wrapper', function () {
    assertTurboContract({
      namespace: 'inAppMessaging',
      nativeModuleName: 'NativeRNFBTurboFiam',
      nativeEvents: false,
      hasMultiAppSupport: false,
      hasCustomUrlOrRegionSupport: false,
      turboModule: true,
      specMethods: SPEC_METHODS,
      createMock: () => jest.fn(() => Promise.resolve(null)),
      constants: {
        isMessagesDisplaySuppressed: false,
        isAutomaticDataCollectionEnabled: true,
      },
      assertExtra: wrapped => {
        expect(wrapped.isMessagesDisplaySuppressed).toBe(false);
        expect(wrapped.isAutomaticDataCollectionEnabled).toBe(true);
      },
    });
  });
});
