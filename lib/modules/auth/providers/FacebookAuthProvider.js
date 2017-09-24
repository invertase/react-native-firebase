const providerId = 'facebook';

export default class FacebookAuthProvider {
  constructor() {
    throw new Error('`new FacebookAuthProvider()` is not supported on react-native-firebase.');
  }

  static get PROVIDER_ID() {
    return providerId;
  }

  static credential(token) {
    return {
      token,
      secret: '',
      providerId,
    };
  }
}
