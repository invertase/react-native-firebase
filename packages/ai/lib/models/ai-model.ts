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

import { ApiSettings } from '../types/internal';
import { AI, BackendType } from '../public-types';
import { initApiSettings } from './utils';

/**
 * Base class for Firebase AI model APIs.
 *
 * Instances of this class are associated with a specific Firebase AI {@link Backend}
 * and provide methods for interacting with the configured generative model.
 *
 * @public
 */
export abstract class AIModel {
  /**
   * The fully qualified model resource name to use for generating images
   * (for example, `publishers/google/models/imagen-3.0-generate-002`).
   */
  readonly model: string;

  /**
   * @internal
   */
  protected _apiSettings: ApiSettings;

  /**
   * Constructs a new instance of the {@link AIModel} class.
   *
   * This constructor should only be called from subclasses that provide
   * a model API.
   *
   * @param ai - an {@link AI} instance.
   * @param modelName - The name of the model being used. It can be in one of the following formats:
   * - `my-model` (short name, will resolve to `publishers/google/models/my-model`)
   * - `models/my-model` (will resolve to `publishers/google/models/my-model`)
   * - `publishers/my-publisher/models/my-model` (fully qualified model name)
   *
   * @throws If the `apiKey` or `projectId` fields are missing in your
   * Firebase config.
   *
   * @internal
   */
  protected constructor(ai: AI, modelName: string) {
    this._apiSettings = initApiSettings(ai);
    this.model = AIModel.normalizeModelName(modelName, this._apiSettings.backend.backendType);
  }

  /**
   * Normalizes the given model name to a fully qualified model resource name.
   *
   * @param modelName - The model name to normalize.
   * @returns The fully qualified model resource name.
   *
   * @internal
   */
  static normalizeModelName(modelName: string, backendType: BackendType): string {
    if (backendType === BackendType.GOOGLE_AI) {
      return AIModel.normalizeGoogleAIModelName(modelName);
    } else {
      return AIModel.normalizeVertexAIModelName(modelName);
    }
  }

  /**
   * @internal
   */
  private static normalizeGoogleAIModelName(modelName: string): string {
    return `models/${modelName}`;
  }

  /**
   * @internal
   */
  private static normalizeVertexAIModelName(modelName: string): string {
    let model: string;
    if (modelName.includes('/')) {
      if (modelName.startsWith('models/')) {
        // Add 'publishers/google' if the user is only passing in 'models/model-name'.
        model = `publishers/google/${modelName}`;
      } else {
        // Any other custom format (e.g. tuned models) must be passed in correctly.
        model = modelName;
      }
    } else {
      // If path is not included, assume it's a non-tuned model.
      model = `publishers/google/models/${modelName}`;
    }

    return model;
  }
}
