const providerId = 'password';

export default class EmailAuthProvider {
  constructor() {
    throw new Error('`new EmailAuthProvider()` is not supported on react-native-firebase.');
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
