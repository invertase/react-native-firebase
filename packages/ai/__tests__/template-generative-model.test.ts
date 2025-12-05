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

import { describe, expect, it, afterEach, jest } from '@jest/globals';
import { type ReactNativeFirebase } from '@react-native-firebase/app';
import { AI } from '../lib/public-types';
import { VertexAIBackend } from '../lib/backend';
import { TemplateGenerativeModel } from '../lib/models/template-generative-model';
import * as generateContentMethods from '../lib/methods/generate-content';

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

const TEMPLATE_ID = 'my-template';
const TEMPLATE_VARS = { a: 1, b: '2' };

describe('TemplateGenerativeModel', function () {
  afterEach(function () {
    jest.restoreAllMocks();
  });

  describe('constructor', function () {
    it('should initialize _apiSettings correctly', function () {
      const model = new TemplateGenerativeModel(fakeAI);
      expect(model._apiSettings.apiKey).toBe('key');
      expect(model._apiSettings.project).toBe('my-project');
      expect(model._apiSettings.appId).toBe('my-appid');
    });
  });

  describe('generateContent', function () {
    it('should call templateGenerateContent with correct parameters', async function () {
      const templateGenerateContentSpy = jest
        .spyOn(generateContentMethods, 'templateGenerateContent')
        .mockResolvedValue({} as any);
      const model = new TemplateGenerativeModel(fakeAI, { timeout: 5000 });

      await model.generateContent(TEMPLATE_ID, TEMPLATE_VARS);

      expect(templateGenerateContentSpy).toHaveBeenCalledTimes(1);
      expect(templateGenerateContentSpy).toHaveBeenCalledWith(
        model._apiSettings,
        TEMPLATE_ID,
        { inputs: TEMPLATE_VARS },
        { timeout: 5000 },
      );
    });
  });

  describe('generateContentStream', function () {
    it('should call templateGenerateContentStream with correct parameters', async function () {
      const templateGenerateContentStreamSpy = jest
        .spyOn(generateContentMethods, 'templateGenerateContentStream')
        .mockResolvedValue({} as any);
      const model = new TemplateGenerativeModel(fakeAI, { timeout: 5000 });

      await model.generateContentStream(TEMPLATE_ID, TEMPLATE_VARS);

      expect(templateGenerateContentStreamSpy).toHaveBeenCalledTimes(1);
      expect(templateGenerateContentStreamSpy).toHaveBeenCalledWith(
        model._apiSettings,
        TEMPLATE_ID,
        { inputs: TEMPLATE_VARS },
        { timeout: 5000 },
      );
    });
  });
});
