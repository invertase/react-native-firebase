/**
 * 
 * ConfirmationResult representation wrapper
 */
import { getNativeModule } from '../../../utils/native';
export default class ConfirmationResult {
  /**
   *
   * @param auth
   * @param verificationId The phone number authentication operation's verification ID.
   */
  constructor(auth, verificationId) {
    this._auth = auth;
    this._verificationId = verificationId;
  }
  /**
   *
   * @param verificationCode
   * @return {*}
   */


  confirm(verificationCode) {
    return getNativeModule(this._auth)._confirmVerificationCode(verificationCode).then(user => this._auth._setUser(user));
  }

  get verificationId() {
    return this._verificationId;
  }

}