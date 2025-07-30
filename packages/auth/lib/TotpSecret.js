export class TotpSecret {
  constructor(secretKey, hashingAlgorithm, codeLength, codeIntervalSeconds, enrollmentCompletionDeadline) {
    this.secretKey = secretKey;
    this.hashingAlgorithm = hashingAlgorithm;
    this.codeLength = codeLength;
    this.codeIntervalSeconds = codeIntervalSeconds;
    this.enrollmentCompletionDeadline = enrollmentCompletionDeadline;
  }

  sessionInfo = null;
  auth = null;
  /**
   * Shared secret key/seed used for enrolling in TOTP MFA and generating OTPs.
   */
  secretKey = null;
  /**
   * Hashing algorithm used.
   */
  hashingAlgorithm = null;
  /**
   * Length of the one-time passwords to be generated.
   */
  codeLength = null;
  /**
   * The interval (in seconds) when the OTP codes should change.
   */
  codeIntervalSeconds = null;
  /**
   * The timestamp (UTC string) by which TOTP enrollment should be completed.
   */
  enrollmentCompletionDeadline = null;

  /**
   * Returns a QR code URL as described in
   * https://github.com/google/google-authenticator/wiki/Key-Uri-Format
   * This can be displayed to the user as a QR code to be scanned into a TOTP app like Google Authenticator.
   * If the optional parameters are unspecified, an accountName of <userEmail> and issuer of <firebaseAppName> are used.
   *
   * @param accountName the name of the account/app along with a user identifier.
   * @param issuer issuer of the TOTP (likely the app name).
   * @returns A QR code URL string.
   */
  generateQrCodeUrl(_accountName, _issuer) {
    throw new Error("`generateQrCodeUrl` is not supported on the native Firebase SDKs.");
    // if (!this.hashingAlgorithm || !this.codeLength) {
    //   return "";
    // }

    // return (
    //   `otpauth://totp/${issuer}:${accountName}?secret=${this.secretKey}&issuer=${issuer}` +
    //   `&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`
    // );
  }
}
