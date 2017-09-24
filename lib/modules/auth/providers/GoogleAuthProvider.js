const providerId = 'google';

export default class GoogleAuthProvider {
  constructor() {
    throw new Error('`new GoogleAuthProvider()` is not supported on react-native-firebase.');
  }

  static get PROVIDER_ID() {
    return providerId;
  }

  static credential(token, secret) {
    return {
      token,
      secret,
      providerId,
    };
  }
}
