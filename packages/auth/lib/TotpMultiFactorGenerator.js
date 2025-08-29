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

import { isOther } from '@react-native-firebase/app/lib/common';
import { TotpSecret } from './TotpSecret';
import { getAuth } from './modular';

export default class TotpMultiFactorGenerator {
  static FACTOR_ID = 'totp';

  constructor() {
    throw new Error(
      '`new TotpMultiFactorGenerator()` is not supported on the native Firebase SDKs.',
    );
  }

  static assertionForSignIn(uid, verificationCode) {
    if (isOther) {
      // we require the web native assertion when using firebase-js-sdk
      // as it has functions used by the SDK, a shim won't do
      return getAuth().native.assertionForSignIn(uid, verificationCode);
    }
    return { uid, verificationCode };
  }

  static assertionForEnrollment(totpSecret, verificationCode) {
    return { totpSecret: totpSecret.secretKey, verificationCode };
  }

  static async generateSecret(session, auth) {
    if (!session) {
      throw new Error('Session is required to generate a TOTP secret.');
    }
    const {
      secretKey,
      // Other properties are not publicly exposed in native APIs
      // hashingAlgorithm, codeLength, codeIntervalSeconds, enrollmentCompletionDeadline
    } = await auth.native.generateTotpSecret(session);

    return new TotpSecret(secretKey, auth);
  }
}
