const providerId = 'password';

export default class EmailAuthProvider {
  static get PROVIDER_ID() {
    return providerId;
  }

  static credential(email, password) {
    return {
      token: email,
      secret: password,
      providerId,
    };
  }

  get providerId() {
    return providerId;
  }
};
