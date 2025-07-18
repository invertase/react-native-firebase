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
import {
  AIError,
  AIModel,
  GenerativeModel,
  VertexAIError,
  VertexAIErrorCode,
  VertexAIModel,
  VertexAI,
  getGenerativeModel,
} from '../lib/index';
import { AI, AIErrorCode } from '@react-native-firebase/ai';
import { VertexAIBackend } from '@react-native-firebase/ai';
import { ReactNativeFirebase } from '@react-native-firebase/app';

function assertAssignable<T, _U extends T>(): void {}

const fakeAI: AI = {
  app: {
    name: 'DEFAULT',
    automaticDataCollectionEnabled: true,
    options: {
      apiKey: 'key',
      projectId: 'my-project',
      appId: 'app-id',
    },
  } as ReactNativeFirebase.FirebaseApp,
  backend: new VertexAIBackend('us-central1'),
  location: 'us-central1',
};

const fakeVertexAI: VertexAI = fakeAI;

describe('VertexAI backward compatibility', function () {
  it('should allow VertexAI to be assignable to AI', function () {
    assertAssignable<VertexAI, AI>();
  });

  it('should allow VertexAIError to extend AIError, function () {
    assertAssignable<typeof VertexAIError, typeof AIError>();
    const err = new VertexAIError(VertexAIErrorCode.ERROR, '');
    expect(err).toBeInstanceOf(AIError);
    expect(err).toBeInstanceOf(VertexAIError);
  });

  it('should allow VertexAIErrorCode to be assignable to AIErrorCode', () => {
    assertAssignable<VertexAIErrorCode, AIErrorCode>();
    const errCode = AIErrorCode.ERROR;
    expect(errCode).toBe(VertexAIErrorCode.ERROR);
  });

  it('should allow VertexAIModel to extend AIModel', () => {
    assertAssignable<typeof VertexAIModel, typeof AIModel>();

    const model = new GenerativeModel(fakeAI, { model: 'model-name' });
    expect(model).toBeInstanceOf(AIModel);
    expect(model).toBeInstanceOf(VertexAIModel);
  });

  describe('VertexAI functions', () => {
    it('should return a VertexAIModel assignable to AIModel from getGenerativeModel()l', () => {
      const model = getGenerativeModel(fakeVertexAI, { model: 'model-name' });
      expect(model).toBeInstanceOf(AIModel);
      expect(model).toBeInstanceOf(VertexAIModel);
    });
  });
});
