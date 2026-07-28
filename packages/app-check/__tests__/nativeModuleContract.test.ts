import { describe, it, jest } from '@jest/globals';
import { assertTurboContract } from '../../app/__tests__/turboModuleContractHelper';

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

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('exposes every spec method callable through the real wrapper', function () {
    assertTurboContract(
      {
        namespace: 'appCheck',
        nativeModuleName: 'NativeRNFBTurboAppCheck',
        nativeEvents: ['appCheck_token_changed'],
        hasMultiAppSupport: true,
        hasCustomUrlOrRegionSupport: false,
        turboModule: true,
        specMethods: SPEC_METHODS,
        createMock: method =>
          jest.fn(() =>
            method.startsWith('get') ? Promise.resolve({ token: method }) : undefined,
          ),
      },
      {
        setTokenAutoRefreshEnabled: wrapped => {
          wrapped.setTokenAutoRefreshEnabled(true);
        },
        getToken: wrapped => {
          void wrapped.getToken(false);
        },
        configureProvider: wrapped => {
          void wrapped.configureProvider('debug', 'token');
        },
        activate: wrapped => {
          void wrapped.activate('siteKey', true);
        },
      },
    );
  });
});
