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

import { isObject } from '@react-native-firebase/app/dist/module/common';
import NativeFirebaseError from '@react-native-firebase/app/dist/module/internal/NativeFirebaseError';
import type { NativeError } from '@react-native-firebase/app/dist/module/types/internal';

const INVALID_TOTP_SECRET_CODE = 'invalid-multi-factor-secret';
const INVALID_TOTP_SECRET_MESSAGE = "can't find secret for provided key";

function hasAuthFirebaseErrorCode(error: unknown): error is { code: string } {
  return (
    isObject(error) &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string' &&
    ((error as { code: string }).code.startsWith('auth/') ||
      (error as { code: string }).code === INVALID_TOTP_SECRET_CODE)
  );
}

function getNativeErrorUserInfo(error: unknown): NativeError['userInfo'] | null {
  if (!isObject(error)) {
    return null;
  }

  if ('userInfo' in error && isObject((error as NativeError).userInfo)) {
    return (error as NativeError).userInfo;
  }

  if ('code' in error && 'message' in error) {
    const code = (error as { code?: unknown }).code;
    const message = (error as { message?: unknown }).message;
    if (typeof code === 'string' && typeof message === 'string') {
      return { code, message };
    }
  }

  return null;
}

/**
 * Converts sync native TurboModule throws into {@link NativeFirebaseError} using the same
 * {@code code}/{@code message} shape as promise rejects.
 */
export function rethrowAuthSyncNativeError(error: unknown): never {
  if (error instanceof NativeFirebaseError) {
    throw error;
  }

  if (hasAuthFirebaseErrorCode(error)) {
    throw error;
  }

  const userInfo = getNativeErrorUserInfo(error);
  if (userInfo?.code && userInfo.message) {
    throw new NativeFirebaseError({ userInfo }, new Error().stack!, 'auth');
  }

  const message = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : undefined;

  if (message === INVALID_TOTP_SECRET_MESSAGE || name === INVALID_TOTP_SECRET_CODE) {
    throw new NativeFirebaseError(
      {
        userInfo: {
          code: INVALID_TOTP_SECRET_CODE,
          message: INVALID_TOTP_SECRET_MESSAGE,
        },
      },
      new Error().stack!,
      'auth',
    );
  }

  throw error;
}
