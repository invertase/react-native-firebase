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

import { NativeFirebaseError } from '@react-native-firebase/app/lib/internal';

export default class HttpsError extends Error {
  constructor(code, message, details, nativeErrorInstance) {
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
      `Error: ${this.message}`,
      nativeErrorInstance.jsStack,
    );
  }
}
