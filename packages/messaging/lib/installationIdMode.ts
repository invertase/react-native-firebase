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

import { isFunction } from '@react-native-firebase/app/dist/module/common';
import { NativeFirebaseError } from '@react-native-firebase/app/dist/module/internal';
import type { NextFn, Observer } from './types/messaging';

const OPT_IN_HINT =
  'Enable Installation ID messaging with Android meta-data ' +
  'firebase_messaging_installation_id_enabled=true, iOS Info.plist ' +
  'FirebaseMessagingInstallationIdEnabled=YES, or Expo plugin prop installationIdEnabled: true.';

const TOKEN_DISABLED_HINT =
  'FCM token APIs are disabled when Installation ID messaging is enabled ' +
  '(Android meta-data firebase_messaging_installation_id_enabled, iOS Info.plist ' +
  'FirebaseMessagingInstallationIdEnabled, or Expo plugin prop installationIdEnabled).';

export function createMessagingError(code: string, message: string): NativeFirebaseError {
  return new NativeFirebaseError({ userInfo: { code, message } }, new Error().stack!, 'messaging');
}

export function installationIdNotEnabledError(apiName: string): NativeFirebaseError {
  return createMessagingError(
    'installation-id-not-enabled',
    `${apiName} requires Installation ID messaging. ${OPT_IN_HINT} ` +
      'While the flag is off, use getToken, deleteToken, and onTokenRefresh instead.',
  );
}

export function tokenApiDisabledError(apiName: string): NativeFirebaseError {
  return createMessagingError(
    'token-api-disabled',
    `${apiName} is unavailable while Installation ID messaging is enabled. ${TOKEN_DISABLED_HINT} ` +
      'Use register, unregister, onRegistered, and onUnregistered instead.',
  );
}

export function callNextOrObserver(
  nextOrObserver: NextFn<string> | Observer<string>,
  value: string,
): void {
  if (isFunction(nextOrObserver)) {
    nextOrObserver(value);
  } else {
    nextOrObserver.next(value);
  }
}

export function isNextFnOrObserver(value: unknown): value is NextFn<string> | Observer<string> {
  if (isFunction(value)) {
    return true;
  }
  return value != null && typeof value === 'object' && isFunction((value as Observer<string>).next);
}
