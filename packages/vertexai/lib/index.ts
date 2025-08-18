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

import { getApp, ReactNativeFirebase } from '@react-native-firebase/app';
import { VertexAIBackend, AIModel, AIError, AIErrorCode } from '@react-native-firebase/ai';
import { VertexAIOptions, VertexAI } from './public-types';

const DEFAULT_LOCATION = 'us-central1';

/**
 * @deprecated Use the new {@link getAI | getAI()} instead. The Vertex AI in Firebase SDK has been
 * replaced with the Firebase AI SDK to accommodate the evolving set of supported features and
 * services. For migration details, see the {@link https://firebase.google.com/docs/vertex-ai/migrate-to-latest-sdk | migration guide}.
 *
 * Returns a {@link VertexAI} instance for the given app, configured to use the
 * Vertex AI Gemini API. This instance will be
 * configured to use the Vertex AI Gemini API.
 *
 * Returns a <code>{@link VertexAI}</code> instance for the given app.
 *
 * @public
 *
 * @param app - The {@link @FirebaseApp} to use.
 * @param options - The {@link VertexAIOptions} to use.
 * @param appCheck - The {@link @AppCheck} to use.
 * @param auth - The {@link @Auth} to use.
 */
export function getVertexAI(
  app: ReactNativeFirebase.FirebaseApp = getApp(),
  options?: VertexAIOptions,
): VertexAI {
  return {
    app,
    location: options?.location || DEFAULT_LOCATION,
    appCheck: options?.appCheck || null,
    auth: options?.auth || null,
    backend: new VertexAIBackend(options?.location || DEFAULT_LOCATION),
  };
}

/**
 * @deprecated Use the new {@link AIModel} instead. The Vertex AI in Firebase SDK has been
 * replaced with the Firebase AI SDK to accommodate the evolving set of supported features and
 * services. For migration details, see the {@link https://firebase.google.com/docs/vertex-ai/migrate-to-latest-sdk | migration guide}.
 *
 * Base class for Firebase AI model APIs.
 *
 * @public
 */
export const VertexAIModel = AIModel;

/**
 * @deprecated Use the new {@link AIError} instead. The Vertex AI in Firebase SDK has been
 * replaced with the Firebase AI SDK to accommodate the evolving set of supported features and
 * services. For migration details, see the {@link https://firebase.google.com/docs/vertex-ai/migrate-to-latest-sdk | migration guide}.
 *
 * Error class for the Firebase AI SDK.
 *
 * @public
 */
export const VertexAIError = AIError;

export { AIErrorCode as VertexAIErrorCode };
export { VertexAIBackend, AIModel, AIError };

export * from './public-types';
export * from '@react-native-firebase/ai';
