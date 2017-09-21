const providerId = 'github';

export default class GithubAuthProvider {
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

  get providerId() {
    return providerId;
  }
};
