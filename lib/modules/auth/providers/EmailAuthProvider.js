const providerId = 'password';

export default class EmailAuthProvider {
  constructor() {
    throw new Error('`new EmailAuthProvider()` is not supported on the native Firebase SDKs.');
  }

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
}
