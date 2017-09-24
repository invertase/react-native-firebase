const providerId = 'github';

export default class GithubAuthProvider {
  constructor() {
    throw new Error('`new GithubAuthProvider()` is not supported on react-native-firebase.');
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
