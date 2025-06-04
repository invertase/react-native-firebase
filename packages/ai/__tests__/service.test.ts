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
import { describe, expect, it } from '@jest/globals';
import { type ReactNativeFirebase } from '@react-native-firebase/app';
import { DEFAULT_LOCATION } from '../lib/constants';
import { AIService } from '../lib/service';
import { VertexAIBackend } from '../lib/backend';

const fakeApp = {
  name: 'DEFAULT',
  options: {
    apiKey: 'key',
    projectId: 'my-project',
  },
} as ReactNativeFirebase.FirebaseApp;

describe('AIService', () => {
  it('uses default location if not specified', () => {
    const vertexAI = new AIService(fakeApp, new VertexAIBackend());
    expect(vertexAI.location).toBe(DEFAULT_LOCATION);
  });

  it('uses custom location if specified', () => {
    const vertexAI = new AIService(
      fakeApp,
      new VertexAIBackend('somewhere'),
      /* appCheckProvider */ undefined,
    );
    expect(vertexAI.location).toBe('somewhere');
  });
});
