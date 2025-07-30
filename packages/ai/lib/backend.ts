/**
 * @license
 * Copyright 2025 Google LLC
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

import { DEFAULT_LOCATION } from './constants';
import { BackendType } from './public-types';

/**
 * Abstract base class representing the configuration for an AI service backend.
 * This class should not be instantiated directly. Use its subclasses; {@link GoogleAIBackend} for
 * the Gemini Developer API (via {@link https://ai.google/ | Google AI}), and
 * {@link VertexAIBackend} for the Vertex AI Gemini API.
 *
 * @public
 */
export abstract class Backend {
  /**
   * Specifies the backend type.
   */
  readonly backendType: BackendType;

  /**
   * Protected constructor for use by subclasses.
   * @param type - The backend type.
   */
  protected constructor(type: BackendType) {
    this.backendType = type;
  }
}

/**
 * Configuration class for the Gemini Developer API.
 *
 * Use this with {@link AIOptions} when initializing the AI service via
 * {@link getAI | getAI()} to specify the Gemini Developer API as the backend.
 *
 * @public
 */
export class GoogleAIBackend extends Backend {
  /**
   * Creates a configuration object for the Gemini Developer API backend.
   */
  constructor() {
    super(BackendType.GOOGLE_AI);
  }
}

/**
 * Configuration class for the Vertex AI Gemini API.
 *
 * Use this with {@link AIOptions} when initializing the AI service via
 * {@link getAI | getAI()} to specify the Vertex AI Gemini API as the backend.
 *
 * @public
 */
export class VertexAIBackend extends Backend {
  /**
   * The region identifier.
   * See {@link https://firebase.google.com/docs/vertex-ai/locations#available-locations | Vertex AI locations}
   * for a list of supported locations.
   */
  readonly location: string;

  /**
   * Creates a configuration object for the Vertex AI backend.
   *
   * @param location - The region identifier, defaulting to `us-central1`;
   * see {@link https://firebase.google.com/docs/vertex-ai/locations#available-locations | Vertex AI locations}
   * for a list of supported locations.
   */
  constructor(location: string = DEFAULT_LOCATION) {
    super(BackendType.VERTEX_AI);
    if (!location) {
      this.location = DEFAULT_LOCATION;
    } else {
      this.location = location;
    }
  }
}
