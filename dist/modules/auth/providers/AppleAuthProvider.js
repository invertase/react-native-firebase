/**
 * 
 * AppleAuthProvider representation wrapper
 */
const providerId = 'apple.com';
export default class AppleAuthProvider {
  constructor() {
    throw new Error('`new AppleAuthProvider()` is not supported on the native Firebase SDKs.');
  }

  static get PROVIDER_ID() {
    return providerId;
  }

  static credential(token, secret) {
    return {
      token,
      secret,
      providerId
    };
  }

}