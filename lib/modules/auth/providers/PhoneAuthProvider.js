const providerId = 'phone';

export default class PhoneAuthProvider {
  static get PROVIDER_ID() {
    return providerId;
  }

  static credential(verificationId, code) {
    return {
      token: verificationId,
      secret: code,
      providerId,
    };
  }

  get providerId() {
    return providerId;
  }
};
