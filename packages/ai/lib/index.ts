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

import './polyfills';
import { getApp, ReactNativeFirebase } from '@react-native-firebase/app';
import { Backend, GoogleAIBackend, VertexAIBackend } from './backend';
import { AIErrorCode, ModelParams, RequestOptions } from './types';
import { AI, AIOptions, ImagenModelParams } from './public-types';
import { AIError } from './errors';
import { GenerativeModel } from './models/generative-model';
import { AIModel, ImagenModel } from './models';

export * from './public-types';
export { ChatSession } from './methods/chat-session';
export * from './requests/schema-builder';
export { ImagenImageFormat } from './requests/imagen-image-format';
export { Backend, GoogleAIBackend, VertexAIBackend } from './backend';
export { GenerativeModel, AIError, AIModel, ImagenModel };

/**
 * Returns the default {@link AI} instance that is associated with the provided
 * {@link @firebase/app#FirebaseApp}. If no instance exists, initializes a new instance with the
 * default settings.
 *
 * @example
 * ```javascript
 * const ai = getAI(app);
 * ```
 *
 * @example
 * ```javascript
 * // Get an AI instance configured to use the Gemini Developer API (via Google AI).
 * const ai = getAI(app, { backend: new GoogleAIBackend() });
 * ```
 *
 * @example
 * ```javascript
 * // Get an AI instance configured to use the Vertex AI Gemini API.
 * const ai = getAI(app, { backend: new VertexAIBackend() });
 * ```
 *
 * @param app - The {@link @firebase/app#FirebaseApp} to use.
 * @param options - {@link AIOptions} that configure the AI instance.
 * @returns The default {@link AI} instance for the given {@link @firebase/app#FirebaseApp}.
 *
 * @public
 */
export function getAI(app: ReactNativeFirebase.FirebaseApp = getApp(), options?: AIOptions): AI {
  const backend: Backend = options?.backend ?? new GoogleAIBackend();

  const finalOptions: Omit<AIOptions, 'backend'> = {
    useLimitedUseAppCheckTokens: options?.useLimitedUseAppCheckTokens ?? false,
    appCheck: options?.appCheck || null,
    auth: options?.auth || null,
  };

  return {
    app,
    backend,
    options: finalOptions,
    location: (backend as VertexAIBackend)?.location || '',
    appCheck: options?.appCheck || null,
    auth: options?.auth || null,
  } as AI;
}

/**
 * Returns a {@link GenerativeModel} class with methods for inference
 * and other functionality.
 *
 * @public
 */
export function getGenerativeModel(
  ai: AI,
  modelParams: ModelParams,
  requestOptions?: RequestOptions,
): GenerativeModel {
  if (!modelParams.model) {
    throw new AIError(
      AIErrorCode.NO_MODEL,
      `Must provide a model name. Example: getGenerativeModel({ model: 'my-model-name' })`,
    );
  }
  return new GenerativeModel(ai, modelParams, requestOptions);
}

/**
 * Returns an {@link ImagenModel} class with methods for using Imagen.
 *
 * Only Imagen 3 models (named `imagen-3.0-*`) are supported.
 *
 * @param ai - An {@link AI} instance.
 * @param modelParams - Parameters to use when making Imagen requests.
 * @param requestOptions - Additional options to use when making requests.
 *
 * @throws If the `apiKey` or `projectId` fields are missing in your
 * Firebase config.
 *
 * @beta
 */
export function getImagenModel(
  ai: AI,
  modelParams: ImagenModelParams,
  requestOptions?: RequestOptions,
): ImagenModel {
  if (!modelParams.model) {
    throw new AIError(
      AIErrorCode.NO_MODEL,
      `Must provide a model name. Example: getImagenModel({ model: 'my-model-name' })`,
    );
  }
  return new ImagenModel(ai, modelParams, requestOptions);
}
