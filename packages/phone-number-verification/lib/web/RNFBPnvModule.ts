const UNSUPPORTED_MSG = 'Firebase Phone Number Verification is only supported on Android.';

interface PnvModule {
  enableTestSession(appName: string, token: string): Promise<void>;
  getVerificationSupportInfo(appName: string): Promise<never>;
  getVerifiedPhoneNumber(appName: string): Promise<never>;
  getDigitalCredentialPayload(appName: string, nonce: string): Promise<never>;
  exchangeCredentialResponseForPhoneNumber(
    appName: string,
    dcApiResponse: string,
  ): Promise<never>;
}

const pnvWebModule: PnvModule = {
  enableTestSession() {
    return Promise.reject(new Error(UNSUPPORTED_MSG));
  },
  getVerificationSupportInfo() {
    return Promise.reject(new Error(UNSUPPORTED_MSG));
  },
  getVerifiedPhoneNumber() {
    return Promise.reject(new Error(UNSUPPORTED_MSG));
  },
  getDigitalCredentialPayload() {
    return Promise.reject(new Error(UNSUPPORTED_MSG));
  },
  exchangeCredentialResponseForPhoneNumber() {
    return Promise.reject(new Error(UNSUPPORTED_MSG));
  },
};

export default pnvWebModule;
