import { describe, expect, it, jest } from '@jest/globals';
import { createTurboModuleFixture } from '../../app/__tests__/turboModuleContractHelper';

const SPEC_METHODS = [
  'enableTestSession',
  'getVerificationSupportInfo',
  'getVerificationSupportInfoForSimSlot',
  'getVerifiedPhoneNumber',
  'getDigitalCredentialPayload',
  'exchangeCredentialResponseForPhoneNumber',
] as const;

describe('TurboModule direct resolver contract (NewArch-AD-17.1 / NewArch-AD-18 E10)', function () {
  it('resolves every spec method through the direct turbo resolver', async function () {
    const mocks = Object.fromEntries(
      SPEC_METHODS.map(method => [
        method,
        jest.fn(() =>
          method === 'enableTestSession'
            ? Promise.resolve()
            : method === 'getDigitalCredentialPayload'
              ? Promise.resolve('payload')
              : method === 'getVerificationSupportInfo' ||
                  method === 'getVerificationSupportInfoForSimSlot'
                ? Promise.resolve([])
                : Promise.resolve({
                    phoneNumber: '+15555550100',
                    token: 'jwt',
                    expirationTimestamp: 0,
                    issuedAtTimestamp: 0,
                    nonce: null,
                    claims: null,
                  }),
        ),
      ]),
    ) as Record<string, jest.Mock>;

    const raw = createTurboModuleFixture(mocks);

    jest.resetModules();
    const { setReactNativeModule } =
      await import('@react-native-firebase/app/dist/module/internal/nativeModule');
    setReactNativeModule('NativeRNFBTurboPnv', raw);
    const { getVerificationSupportInfo } = await import('../lib/index');

    await getVerificationSupportInfo();

    expect(mocks.getVerificationSupportInfo).toHaveBeenCalledTimes(1);
    for (const method of SPEC_METHODS) {
      expect(typeof raw[method]).toBe('function');
    }
  });
});
