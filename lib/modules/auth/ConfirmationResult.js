/**
 * @url https://firebase.google.com/docs/reference/js/firebase.User
 */
export default class ConfirmationResult {
  _auth: Object;
  _verificationId: string;
  _phoneAuthRequestKey: string;

  /**
   *
   * @param auth
   * @param verificationId The phone number authentication operation's verification ID.
   * @param phoneAuthRequestKey
   */
  constructor(auth: Object, verificationId: string, phoneAuthRequestKey: string) {
    this._auth = auth;
    this._verificationId = verificationId;
    this._phoneAuthRequestKey = phoneAuthRequestKey;
  }

  /**
   *
   * @param verificationCode
   * @return {*}
   */
  confirm(verificationCode: string): Promise<Object> {
    return this._auth._native._confirmVerificationCode(
      this._phoneAuthRequestKey,
      this._verificationId,
      verificationCode,
    );
  }

  get verificationId(): String | null {
    return _verificationId;
  }
}
