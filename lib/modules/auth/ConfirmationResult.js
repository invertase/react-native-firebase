/**
 * @flow
 * ConfirmationResult representation wrapper
 */
import { getNativeModule } from '../../utils/native';
import type Auth from './';
import type User from './User';

export default class ConfirmationResult {
  _auth: Auth;
  _verificationId: string;

  /**
   *
   * @param auth
   * @param verificationId The phone number authentication operation's verification ID.
   */
  constructor(auth: Auth, verificationId: string) {
    this._auth = auth;
    this._verificationId = verificationId;
  }

  /**
   *
   * @param verificationCode
   * @return {*}
   */
  confirm(verificationCode: string): Promise<?User> {
    return this._auth._interceptUserValue(getNativeModule(this._auth)._confirmVerificationCode(verificationCode));
  }

  get verificationId(): string | null {
    return this._verificationId;
  }
}
