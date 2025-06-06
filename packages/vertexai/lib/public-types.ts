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
import { AI, AIErrorCode } from '@react-native-firebase/ai';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { FirebaseAppCheckTypes } from '@react-native-firebase/app-check';

/**
 * @deprecated Use the new {@link AI | AI} instead. The Vertex AI in Firebase SDK has been
 * replaced with the Firebase AI SDK to accommodate the evolving set of supported features and
 * services. For migration details, see the {@link https://firebase.google.com/docs/vertex-ai/migrate-to-latest-sdk | migration guide}.
 * An instance of the Vertex AI in Firebase SDK.
 * @public
 */
export type VertexAI = AI;

/**
 * Options when initializing the Vertex AI in Firebase SDK.
 * @public
 */
export interface VertexAIOptions {
  location?: string;
  appCheck?: FirebaseAppCheckTypes.Module | null;
  auth?: FirebaseAuthTypes.Module | null;
}

export type VertexAIErrorCode = AIErrorCode;

export const VERTEX_TYPE = 'vertexAI';
