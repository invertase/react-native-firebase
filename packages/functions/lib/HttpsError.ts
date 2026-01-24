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

import { NativeFirebaseError } from '@react-native-firebase/app/dist/module/internal';

export interface NativeError {
  userInfo?: {
    code?: string;
    message?: string;
    details?: Record<string, string>;
  };
  jsStack?: string;
  message?: string;
}
export class HttpsError extends Error {
  readonly code!: string;
  readonly details!: Record<string, string> | null;
  readonly message!: string;

  constructor(
    code: string,
    message?: string,
    details?: Record<string, string> | null,
    nativeErrorInstance?: NativeError,
  ) {
    super(message);

    Object.defineProperty(this, 'code', {
      enumerable: false,
      value: code,
    });

    Object.defineProperty(this, 'details', {
      enumerable: false,
      value: details,
    });

    Object.defineProperty(this, 'message', {
      enumerable: false,
      value: message,
    });

    this.stack = NativeFirebaseError.getStackWithMessage(
      `Error: ${message}`,
      nativeErrorInstance?.jsStack as string,
    );
  }
}
