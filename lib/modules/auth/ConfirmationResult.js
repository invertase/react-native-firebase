/**
 * @url https://firebase.google.com/docs/reference/js/firebase.User
 */
export default class ConfirmationResult {
  _auth: Object;
  _verificationId: string;

  /**
   *
   * @param verificationId The phone number authentication operation's verification ID.
   */
  constructor(auth: Object, verificationId: string) {
    this._auth = auth;
    this._verificationId = verificationId;
  }

  confirm(verificationCode: string): Promise<Object> {
    // verificationId is stored server side in case the app is shut when opening the SMS app
    return this._auth._native.confirmVerificationCode(verificationCode);
  }

  get verificationId(): String | null {
    return _verificationId;
  }
}
