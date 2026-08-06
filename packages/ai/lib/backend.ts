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

import { DEFAULT_API_VERSION, DEFAULT_LOCATION, LEGACY_DEFAULT_LOCATION } from './constants';
import { BackendType } from './public-types';

/**
 * Abstract base class representing the configuration for an AI service backend.
 * This class should not be instantiated directly. Use its subclasses; {@link GoogleAIBackend} for
 * the Gemini Developer API (via {@link https://ai.google/ | Google AI}) and {@link AgentPlatformBackend}
 * for the Agent Platform Gemini API.
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

  /**
   * @internal
   */
  abstract _getModelPath(project: string, model: string): string;

  /**
   * @internal
   */
  abstract _getTemplatePath(project: string, templateId: string): string;
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

  /**
   * @internal
   */
  _getModelPath(project: string, model: string): string {
    return `/${DEFAULT_API_VERSION}/projects/${project}/${model}`;
  }

  /**
   * @internal
   */
  _getTemplatePath(project: string, templateId: string): string {
    return `/${DEFAULT_API_VERSION}/projects/${project}/templates/${templateId}`;
  }
}

/**
 * Configuration class for the Agent Platform Gemini API (formerly known as the
 * Vertex AI Gemini API).
 *
 * Use this with {@link AIOptions} when initializing the AI service via
 * {@link getAI | getAI()} to specify the Agent Platform Gemini API as the backend.
 *
 * @deprecated Use {@link AgentPlatformBackend} instead.
 *
 * @public
 */
export class VertexAIBackend extends Backend {
  /**
   * The region identifier.
   * See {@link https://firebase.google.com/docs/ai-logic/locations?api=vertex#available-locations | Agent Platform Gemini API locations}
   * for a list of supported locations.
   */
  readonly location: string = LEGACY_DEFAULT_LOCATION;

  /**
   * Creates a configuration object for the Agent Platform Gemini API (formerly
   * known as the Vertex AI Gemini API) backend.
   *
   * @param location - The region identifier, defaulting to `us-central1`;
   * see {@link https://firebase.google.com/docs/ai-logic/locations?api=vertex#available-locations | Agent Platform Gemini API locations}
   * for a list of supported locations.
   */
  constructor(location?: string) {
    super(BackendType.VERTEX_AI);
    if (location) {
      this.location = location;
    }
  }

  /**
   * @internal
   */
  _getModelPath(project: string, model: string): string {
    return `/${DEFAULT_API_VERSION}/projects/${project}/locations/${this.location}/${model}`;
  }

  /**
   * @internal
   */
  _getTemplatePath(project: string, templateId: string): string {
    return `/${DEFAULT_API_VERSION}/projects/${project}/locations/${this.location}/templates/${templateId}`;
  }
}

/**
 * Configuration class for the Agent Platform Gemini API.
 *
 * Use this with {@link AIOptions} when initializing the AI service via
 * {@link getAI | getAI()} to specify the Agent Platform Gemini API as the backend.
 *
 * @public
 */
export class AgentPlatformBackend extends Backend {
  /**
   * The region identifier.
   * See {@link https://firebase.google.com/docs/ai-logic/locations?api=vertex#available-locations | Agent Platform locations}
   * for a list of supported locations.
   */
  readonly location: string = DEFAULT_LOCATION;

  /**
   * Creates a configuration object for the Agent Platform backend.
   *
   * @param location - The region identifier, defaulting to `global`;
   * see {@link https://firebase.google.com/docs/ai-logic/locations?api=vertex#available-locations | Agent Platform locations}
   * for a list of supported locations.
   */
  constructor(location?: string) {
    super(BackendType.AGENT_PLATFORM);
    if (location) {
      this.location = location;
    }
  }

  /**
   * @internal
   */
  _getModelPath(project: string, model: string): string {
    return `/${DEFAULT_API_VERSION}/projects/${project}/locations/${this.location}/${model}`;
  }

  /**
   * @internal
   */
  _getTemplatePath(project: string, templateId: string): string {
    return `/${DEFAULT_API_VERSION}/projects/${project}/locations/${this.location}/templates/${templateId}`;
  }
}
