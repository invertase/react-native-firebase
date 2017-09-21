const providerId = 'google';

export default class GoogleAuthProvider {
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

  get providerId() {
    return providerId;
  }
};
