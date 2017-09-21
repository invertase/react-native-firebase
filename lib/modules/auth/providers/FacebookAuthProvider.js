const providerId = 'facebook';

export default class FacebookAuthProvider {
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
