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
import { AgentPlatformBackend, GoogleAIBackend } from '../lib/backend';
import { getAI } from '../lib/index';
import { BackendType } from '../lib/public-types';

const fakeApp = {
  name: 'DEFAULT',
  options: {
    apiKey: 'key',
    projectId: 'my-project',
  },
} as ReactNativeFirebase.FirebaseApp;

describe('AIService', () => {
  it('uses Agent Platform default location if not specified', () => {
    const ai = new AIService(fakeApp, new AgentPlatformBackend());
    expect(ai.location).toBe(DEFAULT_LOCATION);
  });

  it('uses custom Agent Platform location if specified', () => {
    const ai = new AIService(fakeApp, new AgentPlatformBackend('somewhere'));
    expect(ai.location).toBe('somewhere');
  });

  it('uses Agent Platform global default location if not specified', () => {
    const ai = new AIService(fakeApp, new AgentPlatformBackend());
    expect(ai.location).toBe(DEFAULT_LOCATION);
  });

  it('uses custom Agent Platform location if specified', () => {
    const ai = new AIService(
      fakeApp,
      new AgentPlatformBackend('somewhere'),
      /* appCheckProvider */ undefined,
    );
    expect(ai.location).toBe('somewhere');
  });

  it('uses empty location for GoogleAIBackend', () => {
    const ai = new AIService(fakeApp, new GoogleAIBackend());
    expect(ai.location).toBe('');
  });
});

describe('getAI', () => {
  it('uses AgentPlatformBackend location', () => {
    const ai = getAI(fakeApp, { backend: new AgentPlatformBackend() });
    expect(ai.backend.backendType).toBe(BackendType.AGENT_PLATFORM);
    expect(ai.location).toBe(DEFAULT_LOCATION);
  });

  it('uses empty location for GoogleAIBackend', () => {
    const ai = getAI(fakeApp, { backend: new GoogleAIBackend() });
    expect(ai.backend.backendType).toBe(BackendType.GOOGLE_AI);
    expect(ai.location).toBe('');
  });
});
