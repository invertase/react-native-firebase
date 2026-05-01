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
import type { FirebaseAuthTypes } from './types/namespaced';
import type { AuthInternal } from './types/internal';

export default class TotpMultiFactorGenerator {
  static FACTOR_ID = 'totp';

  constructor() {
    throw new Error(
      '`new TotpMultiFactorGenerator()` is not supported on the native Firebase SDKs.',
    );
  }

  static assertionForSignIn(
    uid: string,
    verificationCode: string,
  ): FirebaseAuthTypes.MultiFactorAssertion {
    if (isOther) {
      // we require the web native assertion when using firebase-js-sdk
      // as it has functions used by the SDK, a shim won't do
      return (getAuth() as unknown as AuthInternal).native.assertionForSignIn(
        uid,
        verificationCode,
      ) as unknown as FirebaseAuthTypes.MultiFactorAssertion;
    }
    return {
      uid,
      verificationCode,
      factorId: 'totp',
    } as unknown as FirebaseAuthTypes.MultiFactorAssertion;
  }

  static assertionForEnrollment(
    totpSecret: TotpSecret,
    verificationCode: string,
  ): FirebaseAuthTypes.MultiFactorAssertion {
    return {
      totpSecret: totpSecret.secretKey,
      verificationCode,
      factorId: 'totp',
    } as unknown as FirebaseAuthTypes.MultiFactorAssertion;
  }

  static async generateSecret(
    session: FirebaseAuthTypes.MultiFactorSession,
    auth: FirebaseAuthTypes.Module,
  ): Promise<TotpSecret> {
    if (!session) {
      throw new Error('Session is required to generate a TOTP secret.');
    }
    const {
      secretKey,
      // Other properties are not publicly exposed in native APIs
      // hashingAlgorithm, codeLength, codeIntervalSeconds, enrollmentCompletionDeadline
    } = await (auth as unknown as AuthInternal).native.generateTotpSecret(session);

    return new TotpSecret(secretKey, auth as unknown as AuthInternal);
  }
}
