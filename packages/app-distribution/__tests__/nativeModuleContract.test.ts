import { describe, it, jest } from '@jest/globals';
import { assertTurboContract } from '../../app/__tests__/turboModuleContractHelper';

const SPEC_METHODS = [
  'isTesterSignedIn',
  'signInTester',
  'signOutTester',
  'checkForUpdate',
] as const;

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('exposes every spec method callable through the real wrapper', function () {
    assertTurboContract({
      namespace: 'appDistribution',
      nativeModuleName: 'NativeRNFBTurboAppDistribution',
      nativeEvents: false,
      hasMultiAppSupport: false,
      hasCustomUrlOrRegionSupport: false,
      turboModule: true,
      specMethods: SPEC_METHODS,
      createMock: () => jest.fn(() => Promise.resolve(null)),
    });
  });
});
