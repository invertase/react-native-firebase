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

import { appleAuth } from '@invertase/react-native-apple-authentication';
import type { AppleFullPersonName } from '@react-native-firebase/auth';

// Thin wrapper around `@invertase/react-native-apple-authentication`, driving the real
// AuthenticationServices "Sign in with Apple" sheet so this sample exercises a genuine
// ASAuthorizationAppleIDCredential (rather than a hand-typed fake one).
export type NativeAppleSignInResult = {
  identityToken: string;
  rawNonce: string;
  user: string;
  email: string | null;
  /**
   * Only populated by Apple on the user's FIRST authorization for this app/bundle id. See
   * {@link AppleFullPersonName}.
   */
  fullName: AppleFullPersonName;
};

export function isNativeAppleSignInAvailable(): boolean {
  return appleAuth.isSupported;
}

export async function performAppleSignInRequest(): Promise<NativeAppleSignInResult> {
  if (!appleAuth.isSupported) {
    return Promise.reject(
      new Error(
        'Sign in with Apple is not supported on this device/OS version (requires a physical ' +
          'or simulated iOS 13+ device).',
      ),
    );
  }

  // Note: putting FULL_NAME first appears to matter for some Apple ID/device combinations, see
  // https://github.com/invertase/react-native-apple-authentication/issues/293
  const response = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });

  if (!response.identityToken || !response.nonce) {
    throw new Error('Apple sign-in did not return an identityToken/nonce.');
  }

  return {
    identityToken: response.identityToken,
    rawNonce: response.nonce,
    user: response.user,
    email: response.email,
    fullName: response.fullName ?? {},
  };
}
