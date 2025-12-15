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

import { DeviceEventEmitter } from 'react-native';

// A general purpose guard function to catch errors and return a structured error object.
export function guard<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch(e => Promise.reject(getWebError(e)));
}

// Converts a thrown error to a structured error object
// required by RNFirebase native module internals.
export function getWebError(error: Error & { code?: string }): {
  code: string;
  message: string;
  userInfo: { code: string; message: string };
} {
  const obj = {
    code: error.code || 'unknown',
    message: error.message,
  };

  // Some modules send codes as PERMISSION_DENIED, which is not
  // the same as the Firebase error code format.
  obj.code = obj.code.toLowerCase();
  // Replace _ with - in code
  obj.code = obj.code.replace(/_/g, '-');

  // Split out prefix, since we internally prefix all error codes already.
  if (obj.code.includes('/')) {
    const parts = obj.code.split('/');
    obj.code = parts[1] || obj.code;
  }

  return {
    ...obj,
    userInfo: obj,
  };
}

export function emitEvent(eventName: string, event: unknown): void {
  setImmediate(() => DeviceEventEmitter.emit('rnfb_' + eventName, event));
}
