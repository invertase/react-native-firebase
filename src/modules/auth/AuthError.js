import type { AuthErrorCode } from './types.flow';

export default class AuthError {
  +code: AuthErrorCode;

  +message: string;

  +nativeMessage: string;

  +credential: ?any;

  /**
   *
   * @param code
   * @param nativeMessage
   * @param credential
   */
  constructor(
    code: AuthErrorCode,
    nativeMessage: string,
    credential?: any // TODO AuthCredential type
  ) {
    // this.code = code;
    // this.details = details;
    // this.message = message;
    // TODO babel 7 issue... can't extend builtin classes properly.
    this._error = new Error(''); // TODO code to message lookup or revert to nativeMessage
    this._error.code = code;
    this._error.credential = credential;
    this._error.constructor = AuthError;
    return this._error;
  }
}
