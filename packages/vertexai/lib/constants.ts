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

import { version } from './version';

export const DEFAULT_LOCATION = 'us-central1';

export const DEFAULT_BASE_URL = 'https://firebasevertexai.googleapis.com';

// This is the default API version for the VertexAI API. At some point, should be able to change when the feature becomes available.
// `v1beta` & `stable` available: https://cloud.google.com/vertex-ai/docs/reference#versions
export const DEFAULT_API_VERSION = 'v1beta';

export const PACKAGE_VERSION = version;

export const LANGUAGE_TAG = 'gl-rn';

// Timeout is 180s by default
export const DEFAULT_FETCH_TIMEOUT_MS = 180 * 1000;
