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
import { describe, expect, it } from '@jest/globals';
import { type ReactNativeFirebase } from '@react-native-firebase/app';
import { AI, AIErrorCode } from '../lib/public-types';
import { AIModel } from '../lib/models/ai-model';
import { AIError } from '../lib/errors';
import { VertexAIBackend } from '../lib/backend';

/**
 * A class that extends AIModel that allows us to test the protected constructor.
 */
class TestModel extends AIModel {
  constructor(ai: AI, modelName: string) {
    super(ai, modelName);
  }
}

const fakeAI: AI = {
  app: {
    name: 'DEFAULT',
    automaticDataCollectionEnabled: true,
    options: {
      apiKey: 'key',
      projectId: 'my-project',
      appId: 'my-appid',
    },
  } as ReactNativeFirebase.FirebaseApp,
  backend: new VertexAIBackend('us-central1'),
  location: 'us-central1',
};

describe('AIModel', () => {
  it('handles plain model name', () => {
    const testModel = new TestModel(fakeAI, 'my-model');

    expect(testModel.model).toBe('publishers/google/models/my-model');
  });

  it('handles models/ prefixed model name', () => {
    const testModel = new TestModel(fakeAI, 'models/my-model');

    expect(testModel.model).toBe('publishers/google/models/my-model');
  });

  it('handles full model name', () => {
    const testModel = new TestModel(fakeAI, 'publishers/google/models/my-model');

    expect(testModel.model).toBe('publishers/google/models/my-model');
  });

  it('handles prefixed tuned model name', () => {
    const testModel = new TestModel(fakeAI, 'tunedModels/my-model');

    expect(testModel.model).toBe('tunedModels/my-model');
  });

  it('throws if not passed an api key', () => {
    const fakeAI: AI = {
      app: {
        name: 'DEFAULT',
        automaticDataCollectionEnabled: true,
        options: {
          projectId: 'my-project',
        },
      } as ReactNativeFirebase.FirebaseApp,
      backend: new VertexAIBackend('us-central1'),
      location: 'us-central1',
    };
    expect(() => {
      new TestModel(fakeAI, 'my-model');
    }).toThrow();
    try {
      new TestModel(fakeAI, 'my-model');
    } catch (e) {
      expect((e as AIError).code).toBe(AIErrorCode.NO_API_KEY);
    }
  });

  it('throws if not passed a project ID', () => {
    const fakeAI: AI = {
      app: {
        name: 'DEFAULT',
        automaticDataCollectionEnabled: true,
        options: {
          apiKey: 'key',
        },
      } as ReactNativeFirebase.FirebaseApp,
      backend: new VertexAIBackend('us-central1'),
      location: 'us-central1',
    };
    expect(() => {
      new TestModel(fakeAI, 'my-model');
    }).toThrow();
    try {
      new TestModel(fakeAI, 'my-model');
    } catch (e) {
      expect((e as AIError).code).toBe(AIErrorCode.NO_PROJECT_ID);
    }
  });

  it('throws if not passed an app ID', () => {
    const fakeAI: AI = {
      app: {
        name: 'DEFAULT',
        automaticDataCollectionEnabled: true,
        options: {
          apiKey: 'key',
          projectId: 'my-project',
        },
      } as ReactNativeFirebase.FirebaseApp,
      backend: new VertexAIBackend('us-central1'),
      location: 'us-central1',
    };
    expect(() => {
      new TestModel(fakeAI, 'my-model');
    }).toThrow();
    try {
      new TestModel(fakeAI, 'my-model');
    } catch (e) {
      expect((e as AIError).code).toBe(AIErrorCode.NO_APP_ID);
    }
  });
});
