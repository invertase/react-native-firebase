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

import { isOther } from '@react-native-firebase/app/dist/module/common';
import { TotpSecret } from './TotpSecret';
import { getAuth } from './modular';
import type { MultiFactorAssertion } from './types/auth';
import type { AuthInternal } from './types/internal';

export default class TotpMultiFactorGenerator {
  static FACTOR_ID = 'totp';

  constructor() {
    throw new Error(
      '`new TotpMultiFactorGenerator()` is not supported on the native Firebase SDKs.',
    );
  }

  static assertionForSignIn(uid: string, verificationCode: string): unknown {
    if (isOther) {
      return (getAuth() as AuthInternal).native.assertionForSignIn!(uid, verificationCode);
    }
    return { uid, verificationCode };
  }

  static assertionForEnrollment(
    totpSecret: TotpSecret,
    verificationCode: string,
  ): MultiFactorAssertion {
    return {
      totpSecret: totpSecret.secretKey,
      verificationCode,
    } as unknown as MultiFactorAssertion;
  }

  static async generateSecret(session: unknown, auth: AuthInternal): Promise<TotpSecret> {
    if (!session) {
      throw new Error('Session is required to generate a TOTP secret.');
    }
    const { secretKey } = await auth.native.generateTotpSecret(session);

    return new TotpSecret(secretKey, auth);
  }
}
