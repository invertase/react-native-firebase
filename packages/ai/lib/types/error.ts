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
import { GenerateContentResponse } from './responses';
import { VERTEX_TYPE } from '../constants';

/**
 * Details object that may be included in an error response.
 *
 * @public
 */
export interface ErrorDetails {
  '@type'?: string;

  /** The reason for the error. */
  reason?: string;

  /** The domain where the error occurred. */
  domain?: string;

  /** Additional metadata about the error. */
  metadata?: Record<string, unknown>;

  /** Any other relevant information about the error. */
  [key: string]: unknown;
}

/**
 * Details object that contains data originating from a bad HTTP response.
 *
 * @public
 */
export interface CustomErrorData {
  /** HTTP status code of the error response. */
  status?: number;

  /** HTTP status text of the error response. */
  statusText?: string;

  /** Response from a {@link GenerateContentRequest} */
  response?: GenerateContentResponse;

  /** Optional additional details about the error. */
  errorDetails?: ErrorDetails[];
}

/**
 * Standardized error codes that {@link AIError} can have.
 *
 * @public
 */
export const enum AIErrorCode {
  /** A generic error occurred. */
  ERROR = 'error',

  /** An error occurred in a request. */
  REQUEST_ERROR = 'request-error',

  /** An error occurred in a response. */
  RESPONSE_ERROR = 'response-error',

  /** An error occurred while performing a fetch. */
  FETCH_ERROR = 'fetch-error',

  /** An error associated with a Content object.  */
  INVALID_CONTENT = 'invalid-content',

  /** An error due to the Firebase API not being enabled in the Console. */
  API_NOT_ENABLED = 'api-not-enabled',

  /** An error due to invalid Schema input.  */
  INVALID_SCHEMA = 'invalid-schema',

  /** An error occurred due to a missing Firebase API key. */
  NO_API_KEY = 'no-api-key',

  /** An error occurred due to a missing Firebase app ID. */
  NO_APP_ID = 'no-app-id',

  /** An error occurred due to a model name not being specified during initialization. */
  NO_MODEL = 'no-model',

  /** An error occurred due to a missing project ID. */
  NO_PROJECT_ID = 'no-project-id',

  /** An error occurred while parsing. */
  PARSE_FAILED = 'parse-failed',

  /** An error occurred due an attempt to use an unsupported feature. */
  UNSUPPORTED = 'unsupported',
}

/**
 * Standardized error codes that <code>{@link VertexAIError}</code> can have.
 *
 * @public
 */
export const enum VertexAIErrorCode {
  /** A generic error occurred. */
  ERROR = 'error',

  /** An error occurred in a request. */
  REQUEST_ERROR = 'request-error',

  /** An error occurred in a response. */
  RESPONSE_ERROR = 'response-error',

  /** An error occurred while performing a fetch. */
  FETCH_ERROR = 'fetch-error',

  /** An error associated with a Content object.  */
  INVALID_CONTENT = 'invalid-content',

  /** An error due to the Firebase API not being enabled in the Console. */
  API_NOT_ENABLED = 'api-not-enabled',

  /** An error due to invalid Schema input.  */
  INVALID_SCHEMA = 'invalid-schema',

  /** An error occurred due to a missing Firebase API key. */
  NO_API_KEY = 'no-api-key',

  /** An error occurred due to a model name not being specified during initialization. */
  NO_MODEL = 'no-model',

  /** An error occurred due to a missing project ID. */
  NO_PROJECT_ID = 'no-project-id',

  /** An error occurred while parsing. */
  PARSE_FAILED = 'parse-failed',
}

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

    Object.setPrototypeOf(this, VertexAIError.prototype);

    // Since Error is an interface, we don't inherit toString and so we define it ourselves.
    this.toString = () => fullMessage;
  }
}
