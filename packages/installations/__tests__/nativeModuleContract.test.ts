import { describe, it, jest } from '@jest/globals';
import { assertTurboContract } from '../../app/__tests__/turboModuleContractHelper';

const SPEC_METHODS = ['deleteInstallations', 'getId', 'getToken'] as const;

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('exposes every spec method callable through the real wrapper', function () {
    assertTurboContract({
      namespace: 'installations',
      nativeModuleName: 'NativeRNFBTurboInstallations',
      nativeEvents: false,
      hasMultiAppSupport: true,
      hasCustomUrlOrRegionSupport: false,
      turboModule: true,
      specMethods: SPEC_METHODS,
      createMock: method => jest.fn(() => Promise.resolve(method)),
    });
  });
});
