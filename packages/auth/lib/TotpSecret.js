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

import { isString } from '@react-native-firebase/app/lib/common';

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
   * @returns A Promise that resolves to a QR code URL string.
   */
  async generateQrCodeUrl(accountName, issuer) {
    // accountName and issure are nullable in the API specification but are
    // required by tha native SDK. The JS SDK returns '' if they are missing/empty.
    if (!isString(accountName) || !isString(issuer) || accountName === '' || issuer === '') {
      return '';
    }
    return this.auth.native.generateQrCodeUrl(this.secretKey, accountName, issuer);
  }

  /**
   * Opens the specified QR Code URL in an OTP authenticator app on the device.
   * The shared secret key and account name will be populated in the OTP authenticator app.
   * The URL uses the otpauth:// scheme and will be opened on an app that handles this scheme,
   * if it exists on the device, possibly opening the ecocystem-specific app store with a generic
   * query for compatible apps if no app exists on the device.
   *
   * @param qrCodeUrl the URL to open in the app, from generateQrCodeUrl
   */
  openInOtpApp(qrCodeUrl) {
    if (isString(qrCodeUrl) && !qrCodeUrl !== '') {
      return this.auth.native.openInOtpApp(this.secretKey, qrCodeUrl);
    }
  }
}
