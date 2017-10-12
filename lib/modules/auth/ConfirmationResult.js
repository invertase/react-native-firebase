/**
 * @url https://firebase.google.com/docs/reference/js/firebase.User
 */
export default class ConfirmationResult {
  _auth: Object;
  _verificationId: string;

  /**
   *
   * @param auth
   * @param verificationId The phone number authentication operation's verification ID.
   */
  constructor(auth: Object, verificationId: string) {
    this._auth = auth;
    this._verificationId = verificationId;
  }

  /**
   *
   * @param verificationCode
   * @return {*}
   */
  confirm(verificationCode: string): Promise<Object> {
    return this._auth._interceptUserValue(
      this._auth._native._confirmVerificationCode(verificationCode)
    );
  }

  get verificationId(): String | null {
    return this._verificationId;
  }
}
