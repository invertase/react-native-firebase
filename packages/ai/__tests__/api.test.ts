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
import { type ReactNativeFirebase } from '../../app/lib';

import { ModelParams, AIErrorCode } from '../lib/types';
import { AIError } from '../lib/errors';
import { getGenerativeModel } from '../lib/index';

import { AI } from '../lib/public-types';
import { GenerativeModel } from '../lib/models/generative-model';

import { AI_TYPE } from '../lib/constants';
import { GoogleAIBackend, VertexAIBackend } from '../lib/backend';

const fakeAI: AI = {
  app: {
    name: 'DEFAULT',
    options: {
      apiKey: 'key',
      appId: 'appId',
      projectId: 'my-project',
    },
  } as ReactNativeFirebase.FirebaseApp,
  backend: new VertexAIBackend('us-central1'),
  location: 'us-central1',
};

const fakeGoogleAI: AI = {
  app: {
    name: 'DEFAULT',
    automaticDataCollectionEnabled: true,
    options: {
      apiKey: 'key',
      projectId: 'my-project',
      appId: 'my-appid',
    },
  } as ReactNativeFirebase.FirebaseApp,
  backend: new GoogleAIBackend(),
  location: 'us-central1',
};

describe('API tests', () => {
  describe('getGenerativeModel() with VertexAIBackend', () => {
    it('should throw an error if no model is provided', () => {
      try {
        getGenerativeModel(fakeAI, {} as ModelParams);
      } catch (e) {
        expect((e as AIError).code).toContain(AIErrorCode.NO_MODEL);
        expect((e as AIError).message).toContain(
          `AI: Must provide a model name. Example: ` +
            `getGenerativeModel({ model: 'my-model-name' }) (${AI_TYPE}/${AIErrorCode.NO_MODEL})`,
        );
      }
    });

    it('getGenerativeModel throws if no apiKey is provided', () => {
      const fakeVertexNoApiKey = {
        ...fakeAI,
        app: { options: { projectId: 'my-project', appId: 'my-appid' } },
      } as AI;
      try {
        getGenerativeModel(fakeVertexNoApiKey, { model: 'my-model' });
      } catch (e) {
        expect((e as AIError).code).toContain(AIErrorCode.NO_API_KEY);
        expect((e as AIError).message).toBe(
          `AI: The "apiKey" field is empty in the local ` +
            `Firebase config. Firebase AI requires this field to` +
            ` contain a valid API key. (${AI_TYPE}/${AIErrorCode.NO_API_KEY})`,
        );
      }
    });

    it('should throw an error if no projectId is provided', () => {
      const fakeVertexNoProject = {
        ...fakeAI,
        app: { options: { apiKey: 'my-key' } },
      } as AI;
      try {
        getGenerativeModel(fakeVertexNoProject, { model: 'my-model' });
      } catch (e) {
        expect((e as AIError).code).toContain(AIErrorCode.NO_PROJECT_ID);
        expect((e as AIError).message).toBe(
          `AI: The "projectId" field is empty in the local` +
            ` Firebase config. Firebase AI requires this field ` +
            `to contain a valid project ID. (${AI_TYPE}/${AIErrorCode.NO_PROJECT_ID})`,
        );
      }
    });

    it('should throw an error if no appId is provided', () => {
      const fakeVertexNoAppId = {
        ...fakeAI,
        app: { options: { apiKey: 'my-key', projectId: 'my-projectid' } },
      } as AI;
      try {
        getGenerativeModel(fakeVertexNoAppId, { model: 'my-model' });
      } catch (e) {
        expect((e as AIError).code).toContain(AIErrorCode.NO_APP_ID);
        expect((e as AIError).message).toBe(
          `AI: The "appId" field is empty in the local` +
            ` Firebase config. Firebase AI requires this field ` +
            `to contain a valid app ID. (${AI_TYPE}/${AIErrorCode.NO_APP_ID})`,
        );
      }
    });

    it('should return an instance of GenerativeModel', () => {
      const genModel = getGenerativeModel(fakeAI, { model: 'my-model' });
      expect(genModel).toBeInstanceOf(GenerativeModel);
      expect(genModel.model).toBe('publishers/google/models/my-model');
    });
  });

  describe('getGenerativeModel() with GoogleAIBackend', () => {
    it('should throw an error if no model is provided', () => {
      try {
        getGenerativeModel(fakeGoogleAI, {} as ModelParams);
      } catch (e) {
        expect((e as AIError).code).toContain(AIErrorCode.NO_MODEL);
        expect((e as AIError).message).toContain(
          `AI: Must provide a model name. Example: ` +
            `getGenerativeModel({ model: 'my-model-name' }) (${AI_TYPE}/${AIErrorCode.NO_MODEL})`,
        );
      }
    });

    it('getGenerativeModel throws if no apiKey is provided', () => {
      const fakeGoogleNoApiKey = {
        ...fakeGoogleAI,
        app: { options: { projectId: 'my-project', appId: 'my-appid' } },
      } as AI;
      try {
        getGenerativeModel(fakeGoogleNoApiKey, { model: 'my-model' });
      } catch (e) {
        expect((e as AIError).code).toContain(AIErrorCode.NO_API_KEY);
        expect((e as AIError).message).toBe(
          `AI: The "apiKey" field is empty in the local ` +
            `Firebase config. Firebase AI requires this field to` +
            ` contain a valid API key. (${AI_TYPE}/${AIErrorCode.NO_API_KEY})`,
        );
      }
    });

    it('should throw an error if no projectId is provided', () => {
      const fakeGoogleNoProject = {
        ...fakeGoogleAI,
        app: { options: { apiKey: 'my-key' } },
      } as AI;
      try {
        getGenerativeModel(fakeGoogleNoProject, { model: 'my-model' });
      } catch (e) {
        expect((e as AIError).code).toContain(AIErrorCode.NO_PROJECT_ID);
        expect((e as AIError).message).toBe(
          `AI: The "projectId" field is empty in the local` +
            ` Firebase config. Firebase AI requires this field ` +
            `to contain a valid project ID. (${AI_TYPE}/${AIErrorCode.NO_PROJECT_ID})`,
        );
      }
    });

    it('should throw an error if no appId is provided', () => {
      const fakeGoogleNoAppId = {
        ...fakeGoogleAI,
        app: { options: { apiKey: 'my-key', projectId: 'my-projectid' } },
      } as AI;
      try {
        getGenerativeModel(fakeGoogleNoAppId, { model: 'my-model' });
      } catch (e) {
        expect((e as AIError).code).toContain(AIErrorCode.NO_APP_ID);
        expect((e as AIError).message).toBe(
          `AI: The "appId" field is empty in the local` +
            ` Firebase config. Firebase AI requires this field ` +
            `to contain a valid app ID. (${AI_TYPE}/${AIErrorCode.NO_APP_ID})`,
        );
      }
    });

    it('should return an instance of GenerativeModel', () => {
      const genModel = getGenerativeModel(fakeGoogleAI, { model: 'my-model' });
      expect(genModel).toBeInstanceOf(GenerativeModel);
      expect(genModel.model).toBe('publishers/google/models/my-model');
    });
  });
});
