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
import { AI, AIErrorCode } from '../lib/public-types';
import { VertexAIBackend } from '../lib/backend';
import { TemplateImagenModel } from '../lib/models/template-imagen-model';
import { AIError } from '../lib/errors';
import * as request from '../lib/requests/request';
import { ServerPromptTemplateTask } from '../lib/requests/request';

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

const TEMPLATE_ID = 'my-imagen-template';
const TEMPLATE_VARS = { a: 1, b: '2' };

describe('TemplateImagenModel', function () {
  afterEach(function () {
    jest.restoreAllMocks();
  });

  describe('constructor', function () {
    it('should initialize _apiSettings correctly', function () {
      const model = new TemplateImagenModel(fakeAI);
      expect(model._apiSettings.apiKey).toBe('key');
      expect(model._apiSettings.project).toBe('my-project');
      expect(model._apiSettings.appId).toBe('my-appid');
    });
  });

  describe('generateImages', function () {
    it('should call makeRequest with correct parameters', async function () {
      const makeRequestSpy = jest.spyOn(request, 'makeRequest').mockResolvedValue({
        json: () =>
          Promise.resolve({
            predictions: [
              {
                bytesBase64Encoded:
                  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
                mimeType: 'image/png',
              },
            ],
          }),
      } as Response);
      const model = new TemplateImagenModel(fakeAI, { timeout: 5000 });

      await model.generateImages(TEMPLATE_ID, TEMPLATE_VARS);

      expect(makeRequestSpy).toHaveBeenCalledTimes(1);
      expect(makeRequestSpy).toHaveBeenCalledWith(
        {
          task: ServerPromptTemplateTask.TEMPLATE_PREDICT,
          templateId: TEMPLATE_ID,
          apiSettings: model._apiSettings,
          stream: false,
          requestOptions: { timeout: 5000 },
        },
        JSON.stringify({ inputs: TEMPLATE_VARS }),
      );
    });

    it('should return the result of handlePredictResponse', async function () {
      const mockPrediction = {
        bytesBase64Encoded:
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        mimeType: 'image/png',
      };
      jest.spyOn(request, 'makeRequest').mockResolvedValue({
        json: () => Promise.resolve({ predictions: [mockPrediction] }),
      } as Response);

      const model = new TemplateImagenModel(fakeAI);
      const result = await model.generateImages(TEMPLATE_ID, TEMPLATE_VARS);

      expect(result.images).toEqual([mockPrediction]);
    });

    it('should throw an AIError if the prompt is blocked', async function () {
      const error = new AIError(AIErrorCode.FETCH_ERROR, 'Request failed');
      jest.spyOn(request, 'makeRequest').mockRejectedValue(error);

      const model = new TemplateImagenModel(fakeAI);
      await expect(model.generateImages(TEMPLATE_ID, TEMPLATE_VARS)).rejects.toThrow(error);
    });

    it('should handle responses with filtered images', async function () {
      const mockPrediction = {
        bytesBase64Encoded: 'iVBOR...ggg==',
        mimeType: 'image/png',
      };
      const filteredReason = 'This image was filtered for safety reasons.';
      jest.spyOn(request, 'makeRequest').mockResolvedValue({
        json: () =>
          Promise.resolve({
            predictions: [mockPrediction, { raiFilteredReason: filteredReason }],
          }),
      } as Response);

      const model = new TemplateImagenModel(fakeAI);
      const result = await model.generateImages(TEMPLATE_ID, TEMPLATE_VARS);

      expect(result.images).toHaveLength(1);
      expect(result.images[0]).toEqual(mockPrediction);
      expect(result.filteredReason).toBe(filteredReason);
    });
  });
});
