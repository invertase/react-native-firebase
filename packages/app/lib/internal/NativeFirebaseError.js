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
  static fromEvent(errorEvent, namespace, stack) {
    return new NativeFirebaseError({ userInfo: errorEvent }, stack || new Error().stack, namespace);
  }

  constructor(nativeError, jsStack, namespace) {
    super();
    const { userInfo } = nativeError;

    Object.defineProperty(this, 'namespace', {
      enumerable: false,
      value: namespace,
    });

    Object.defineProperty(this, 'code', {
      enumerable: false,
      value: `${this.namespace}/${userInfo.code || 'unknown'}`,
    });

    Object.defineProperty(this, 'message', {
      enumerable: false,
      value: `[${this.code}] ${userInfo.message || nativeError.message}`,
    });

    Object.defineProperty(this, 'jsStack', {
      enumerable: false,
      value: jsStack,
    });

    Object.defineProperty(this, 'userInfo', {
      enumerable: false,
      value: userInfo,
    });

    Object.defineProperty(this, 'nativeErrorCode', {
      enumerable: false,
      value: userInfo.nativeErrorCode || null,
    });

    Object.defineProperty(this, 'nativeErrorMessage', {
      enumerable: false,
      value: userInfo.nativeErrorMessage || null,
    });

    this.stack = this.getStackWithMessage(`NativeFirebaseError: ${this.message}`);

    // Unused
    // this.nativeStackIOS = nativeError.nativeStackIOS;
    // this.nativeStackAndroid = nativeError.nativeStackAndroid;
  }

  /**
   * Build a stack trace that includes JS stack prior to calling the native method.
   *
   * @returns {string}
   */
  getStackWithMessage(message) {
    return [message, ...this.jsStack.split('\n').slice(2, 13)].join('\n');
  }
}
