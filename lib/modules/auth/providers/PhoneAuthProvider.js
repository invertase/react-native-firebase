const providerId = 'phone';

export default class PhoneAuthProvider {
  constructor() {
    throw new Error('`new PhoneAuthProvider()` is not supported on react-native-firebase.');
  }

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
}
