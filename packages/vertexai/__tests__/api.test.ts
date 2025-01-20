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
import { ModelParams, VertexAIErrorCode } from '../lib/types';
import { VertexAIError } from '../lib/errors';
import { getGenerativeModel } from '../lib/index';
import { expect } from 'chai';
import { VertexAI } from './public-types';
import { GenerativeModel } from './models/generative-model';

const fakeVertexAI: VertexAI = {
  app: {
    name: 'DEFAULT',
    automaticDataCollectionEnabled: true,
    options: {
      apiKey: 'key',
      projectId: 'my-project'
    }
  },
  location: 'us-central1'
};

describe('Top level API', () => {
  it('getGenerativeModel throws if no model is provided', () => {
    try {
      getGenerativeModel(fakeVertexAI, {} as ModelParams);
    } catch (e) {
      expect((e as VertexAIError).code).includes(VertexAIErrorCode.NO_MODEL);
      expect((e as VertexAIError).message).includes(
        `VertexAI: Must provide a model name. Example: ` +
          `getGenerativeModel({ model: 'my-model-name' }) (vertexAI/${VertexAIErrorCode.NO_MODEL})`
      );
    }
  });
  it('getGenerativeModel throws if no apiKey is provided', () => {
    const fakeVertexNoApiKey = {
      ...fakeVertexAI,
      app: { options: { projectId: 'my-project' } }
    } as VertexAI;
    try {
      getGenerativeModel(fakeVertexNoApiKey, { model: 'my-model' });
    } catch (e) {
      expect((e as VertexAIError).code).includes(VertexAIErrorCode.NO_API_KEY);
      expect((e as VertexAIError).message).equals(
        `VertexAI: The "apiKey" field is empty in the local ` +
          `Firebase config. Firebase VertexAI requires this field to` +
          ` contain a valid API key. (vertexAI/${VertexAIErrorCode.NO_API_KEY})`
      );
    }
  });
  it('getGenerativeModel throws if no projectId is provided', () => {
    const fakeVertexNoProject = {
      ...fakeVertexAI,
      app: { options: { apiKey: 'my-key' } }
    } as VertexAI;
    try {
      getGenerativeModel(fakeVertexNoProject, { model: 'my-model' });
    } catch (e) {
      expect((e as VertexAIError).code).includes(
        VertexAIErrorCode.NO_PROJECT_ID
      );
      expect((e as VertexAIError).message).equals(
        `VertexAI: The "projectId" field is empty in the local` +
          ` Firebase config. Firebase VertexAI requires this field ` +
          `to contain a valid project ID. (vertexAI/${VertexAIErrorCode.NO_PROJECT_ID})`
      );
    }
  });
  it('getGenerativeModel gets a GenerativeModel', () => {
    const genModel = getGenerativeModel(fakeVertexAI, { model: 'my-model' });
    expect(genModel).to.be.an.instanceOf(GenerativeModel);
    expect(genModel.model).to.equal('publishers/google/models/my-model');
  });
});
