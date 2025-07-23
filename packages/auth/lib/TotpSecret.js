/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export class TotpSecret {
  constructor(secretKey, auth) {
    // The native TotpSecret has many more properties, but they are
    // internal to the native SDKs, we only maintain the secret in JS layer
    this.secretKey = secretKey;

    // we do need a handle to the correct auth instance to generate QR codes etc
    this.auth = auth;
  }

  /**
   * Shared secret key/seed used for enrolling in TOTP MFA and generating OTPs.
   */
  secretKey = null;

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
    throw new Error('`generateQrCodeUrl` is not supported on the native Firebase SDKs.');
    // if (!this.hashingAlgorithm || !this.codeLength) {
    //   return "";
    // }

    // return (
    //   `otpauth://totp/${issuer}:${accountName}?secret=${this.secretKey}&issuer=${issuer}` +
    //   `&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`
    // );
  }
}
