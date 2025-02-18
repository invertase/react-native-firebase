/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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

import { FirebaseError } from '@firebase/util';
import { VertexAIErrorCode, CustomErrorData } from './types';
import { VERTEX_TYPE } from './constants';

/**
 * Error class for the Vertex AI in Firebase SDK.
 *
 * @public
 */
export class VertexAIError extends FirebaseError {
  /**
   * Constructs a new instance of the `VertexAIError` class.
   *
   * @param code - The error code from <code>{@link VertexAIErrorCode}</code>.
   * @param message - A human-readable message describing the error.
   * @param customErrorData - Optional error data.
   */
  constructor(
    readonly code: VertexAIErrorCode,
    message: string,
    readonly customErrorData?: CustomErrorData,
  ) {
    // Match error format used by FirebaseError from ErrorFactory
    const service = VERTEX_TYPE;
    const serviceName = 'VertexAI';
    const fullCode = `${service}/${code}`;
    const fullMessage = `${serviceName}: ${message} (${fullCode})`;
    super(code, fullMessage);

    // FirebaseError initializes a stack trace, but it assumes the error is created from the error
    // factory. Since we break this assumption, we set the stack trace to be originating from this
    // constructor.
    // This is only supported in V8.
    if (Error.captureStackTrace) {
      // Allows us to initialize the stack trace without including the constructor itself at the
      // top level of the stack trace.
      Error.captureStackTrace(this, VertexAIError);
    }

    // Allows instanceof VertexAIError in ES5/ES6
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    // TODO(dlarocque): Replace this with `new.target`: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
    //                   which we can now use since we no longer target ES5.
    Object.setPrototypeOf(this, VertexAIError.prototype);

    // Since Error is an interface, we don't inherit toString and so we define it ourselves.
    this.toString = () => fullMessage;
  }
}
