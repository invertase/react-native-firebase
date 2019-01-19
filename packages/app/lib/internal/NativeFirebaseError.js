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

export default class NativeFirebaseError extends Error {
  constructor(nativeError, jsStack, namespace) {
    super();
    const { userInfo, nativeStackAndroid } = nativeError;

    this.namespace = namespace;
    this.code = `${this.namespace}/${userInfo.code || 'unknown'}`;
    this.message = `[${this.code}] ${userInfo.message || nativeError.message}`;

    this.nativeErrorCode = userInfo.nativeErrorCode;
    this.nativeErrorMessage = userInfo.nativeErrorMessage;
    this.stack = this.getCombinedStack(jsStack, nativeStackAndroid);
  }

  /**
   * Build a combined stack trace that includes JS & Native Stack Frames.
   *
   * @param jsStack
   * @param nativeStackAndroid
   * @returns {string}
   */
  getCombinedStack(jsStack, nativeStackAndroid) {
    const combinedStack = [
      `NativeFirebaseError: ${this.message}`,
      ...jsStack.split('\n').slice(2, 8),
    ];

    if (nativeStackAndroid && nativeStackAndroid.length) {
      for (let i = 0; i < 5; i++) {
        const { methodName, lineNumber, file } = nativeStackAndroid[i];
        combinedStack.push(`    at native.android.*.${methodName} (${file} ${lineNumber}:0)`);
      }
    }

    return combinedStack.join('\n');
  }
}
