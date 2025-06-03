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
import { AIErrorCode, CustomErrorData } from './types';
import { AI_TYPE } from './constants';

/**
 * Error class for the Vertex AI in Firebase SDK.
 *
 * @public
 */
export class AIError extends FirebaseError {
  /**
   * Constructs a new instance of the `VertexAIError` class.
   *
   * @param code - The error code from <code>{@link VertexAIErrorCode}</code>.
   * @param message - A human-readable message describing the error.
   * @param customErrorData - Optional error data.
   */
  constructor(
    readonly code: AIErrorCode,
    message: string,
    readonly customErrorData?: CustomErrorData,
  ) {
    // Match error format used by FirebaseError from ErrorFactory
    const service = AI_TYPE;
    const fullCode = `${service}/${code}`;
    const fullMessage = `${service}: ${message} (${fullCode})`;
    super(code, fullMessage);

    Object.setPrototypeOf(this, AIError.prototype);

    // Since Error is an interface, we don't inherit toString and so we define it ourselves.
    this.toString = () => fullMessage;
  }
}
