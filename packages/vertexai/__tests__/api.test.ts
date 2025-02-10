/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { describe, expect, it } from '@jest/globals';
import { getApp, type ReactNativeFirebase } from '../../app/lib';

import { ModelParams, VertexAIErrorCode } from '../lib/types';
import { VertexAIError } from '../lib/errors';
import { getGenerativeModel, getVertexAI } from '../lib/index';

import { VertexAI } from '../lib/public-types';
import { GenerativeModel } from '../lib/models/generative-model';

import '../../auth/lib';
import '../../app-check/lib';
import { getAuth } from '../../auth/lib';

const fakeVertexAI: VertexAI = {
  app: {
    name: 'DEFAULT',
    options: {
      apiKey: 'key',
      appId: 'appId',
      projectId: 'my-project',
    },
  } as ReactNativeFirebase.FirebaseApp,
  location: 'us-central1',
};

describe('Top level API', () => {
  it('should allow auth and app check instances to be passed in', () => {
    const app = getApp();
    const auth = getAuth();
    const appCheck = app.appCheck();

    getVertexAI(app, { appCheck, auth });
  });

  it('getGenerativeModel throws if no model is provided', () => {
    try {
      getGenerativeModel(fakeVertexAI, {} as ModelParams);
    } catch (e) {
      expect((e as VertexAIError).code).toContain(VertexAIErrorCode.NO_MODEL);
      expect((e as VertexAIError).message).toContain(
        `VertexAI: Must provide a model name. Example: ` +
          `getGenerativeModel({ model: 'my-model-name' }) (vertexAI/${VertexAIErrorCode.NO_MODEL})`,
      );
    }
  });

  it('getGenerativeModel throws if no apiKey is provided', () => {
    const fakeVertexNoApiKey = {
      ...fakeVertexAI,
      app: { options: { projectId: 'my-project' } },
    } as VertexAI;
    try {
      getGenerativeModel(fakeVertexNoApiKey, { model: 'my-model' });
    } catch (e) {
      expect((e as VertexAIError).code).toContain(VertexAIErrorCode.NO_API_KEY);
      expect((e as VertexAIError).message).toBe(
        `VertexAI: The "apiKey" field is empty in the local ` +
          `Firebase config. Firebase VertexAI requires this field to` +
          ` contain a valid API key. (vertexAI/${VertexAIErrorCode.NO_API_KEY})`,
      );
    }
  });

  it('getGenerativeModel throws if no projectId is provided', () => {
    const fakeVertexNoProject = {
      ...fakeVertexAI,
      app: { options: { apiKey: 'my-key' } },
    } as VertexAI;
    try {
      getGenerativeModel(fakeVertexNoProject, { model: 'my-model' });
    } catch (e) {
      expect((e as VertexAIError).code).toContain(VertexAIErrorCode.NO_PROJECT_ID);
      expect((e as VertexAIError).message).toBe(
        `VertexAI: The "projectId" field is empty in the local` +
          ` Firebase config. Firebase VertexAI requires this field ` +
          `to contain a valid project ID. (vertexAI/${VertexAIErrorCode.NO_PROJECT_ID})`,
      );
    }
  });

  it('getGenerativeModel gets a GenerativeModel', () => {
    const genModel = getGenerativeModel(fakeVertexAI, { model: 'my-model' });
    expect(genModel).toBeInstanceOf(GenerativeModel);
    expect(genModel.model).toBe('publishers/google/models/my-model');
  });
});
