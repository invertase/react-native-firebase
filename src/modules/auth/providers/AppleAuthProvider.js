/**
 * @flow
 * AppleAuthProvider representation wrapper
 */
import type { AuthCredential } from '../types';

const providerId = 'apple.com';

export default class AppleAuthProvider {
  constructor() {
    throw new Error(
      '`new AppleAuthProvider()` is not supported on the native Firebase SDKs.'
    );
  }

  static get PROVIDER_ID(): string {
    return providerId;
  }

  static credential(token: string, secret: string): AuthCredential {
    return {
      token,
      secret,
      providerId,
    };
  }
}
