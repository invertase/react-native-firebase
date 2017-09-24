const providerId = 'twitter';

export default class TwitterAuthProvider {
  constructor() {
    throw new Error('`new TwitterAuthProvider()` is not supported on react-native-firebase.');
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
