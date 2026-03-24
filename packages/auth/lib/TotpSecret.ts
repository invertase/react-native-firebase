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
 *
 */

import { isString } from '@react-native-firebase/app/dist/module/common';
import type { AuthInternal } from './types/internal';

export class TotpSecret {
  readonly secretKey: string;

  readonly auth: AuthInternal;

  constructor(secretKey: string, auth: AuthInternal) {
    this.secretKey = secretKey;
    this.auth = auth;
  }

  /**
   * Returns a QR code URL as described in
   * https://github.com/google/google-authenticator/wiki/Key-Uri-Format
   * This can be displayed to the user as a QR code to be scanned into a TOTP app like Google Authenticator.
   * If the optional parameters are unspecified, an accountName of <userEmail> and issuer of <firebaseAppName> are used.
   */
  async generateQrCodeUrl(accountName?: string, issuer?: string): Promise<string> {
    if (!isString(accountName) || !isString(issuer) || accountName === '' || issuer === '') {
      return '';
    }
    const name = accountName;
    const iss = issuer;
    return this.auth.native.generateQrCodeUrl(this.secretKey, name, iss);
  }

  /**
   * Opens the specified QR Code URL in an OTP authenticator app on the device.
   */
  openInOtpApp(qrCodeUrl: string): void | Promise<unknown> | unknown {
    if (isString(qrCodeUrl) && qrCodeUrl !== '') {
      return this.auth.native.openInOtpApp(this.secretKey, qrCodeUrl);
    }
    return undefined;
  }
}
