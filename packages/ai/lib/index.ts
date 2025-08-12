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
import { GoogleAIBackend, VertexAIBackend } from './backend';
import { AIErrorCode, ModelParams, RequestOptions } from './types';
import { AI, AIOptions } from './public-types';
import { AIError } from './errors';
import { GenerativeModel } from './models/generative-model';
import { AIModel } from './models/ai-model';

export * from './public-types';
export { ChatSession } from './methods/chat-session';
export * from './requests/schema-builder';
export { GoogleAIBackend, VertexAIBackend } from './backend';
export { GenerativeModel, AIError, AIModel };

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
export function getAI(
  app: ReactNativeFirebase.FirebaseApp = getApp(),
  options: AIOptions = { backend: new GoogleAIBackend() },
): AI {
  return {
    app,
    backend: options.backend,
    location: (options.backend as VertexAIBackend)?.location || '',
    appCheck: options.appCheck || null,
    auth: options.auth || null,
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
