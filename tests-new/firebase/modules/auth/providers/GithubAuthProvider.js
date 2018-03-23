/**
 * @flow
 * GithubAuthProvider representation wrapper
 */
import type { AuthCredential } from '../types';

const providerId = 'github.com';

export default class GithubAuthProvider {
  constructor() {
    throw new Error(
      '`new GithubAuthProvider()` is not supported on the native Firebase SDKs.'
    );
  }

  static get PROVIDER_ID(): string {
    return providerId;
  }

  static credential(token: string): AuthCredential {
    return {
      token,
      secret: '',
      providerId,
    };
  }
}
