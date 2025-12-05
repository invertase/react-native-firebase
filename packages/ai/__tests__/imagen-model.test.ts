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
import { describe, expect, it, jest, afterEach } from '@jest/globals';
import { type ReactNativeFirebase } from '@react-native-firebase/app';
import { ImagenModel } from '../lib/models/imagen-model';
import {
  ImagenAspectRatio,
  ImagenPersonFilterLevel,
  ImagenSafetyFilterLevel,
  AI,
  AIErrorCode,
} from '../lib/public-types';
import * as request from '../lib/requests/request';
import { AIError } from '../lib/errors';
import { BackendName, getMockResponse } from './test-utils/mock-response';
import { VertexAIBackend } from '../lib/backend';

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

describe('ImagenModel', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('generateImages makes a request to predict with default parameters', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-generate-images-base64.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);

    const imagenModel = new ImagenModel(fakeAI, {
      model: 'my-model',
    });
    const prompt = 'A photorealistic image of a toy boat at sea.';
    await imagenModel.generateImages(prompt);
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'publishers/google/models/my-model',
        task: request.Task.PREDICT,
        apiSettings: expect.anything(),
        stream: false,
        requestOptions: undefined,
      }),
      expect.stringMatching(new RegExp(`"prompt":"${prompt}"`)),
    );
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'publishers/google/models/my-model',
        task: request.Task.PREDICT,
        apiSettings: expect.anything(),
        stream: false,
        requestOptions: undefined,
      }),
      expect.stringContaining(`"sampleCount":1`),
    );
  });

  it('generateImages makes a request to predict with generation config and safety settings', async () => {
    const imagenModel = new ImagenModel(fakeAI, {
      model: 'my-model',
      generationConfig: {
        negativePrompt: 'do not hallucinate',
        numberOfImages: 4,
        aspectRatio: ImagenAspectRatio.LANDSCAPE_16x9,
        imageFormat: { mimeType: 'image/jpeg', compressionQuality: 75 },
        addWatermark: true,
      },
      safetySettings: {
        safetyFilterLevel: ImagenSafetyFilterLevel.BLOCK_ONLY_HIGH,
        personFilterLevel: ImagenPersonFilterLevel.ALLOW_ADULT,
      },
    });

    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-generate-images-base64.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const prompt = 'A photorealistic image of a toy boat at sea.';
    await imagenModel.generateImages(prompt);
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'publishers/google/models/my-model',
        task: request.Task.PREDICT,
        apiSettings: expect.anything(),
        stream: false,
        requestOptions: undefined,
      }),
      expect.stringContaining(`"negativePrompt":"${imagenModel.generationConfig?.negativePrompt}"`),
    );
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'publishers/google/models/my-model',
        task: request.Task.PREDICT,
        apiSettings: expect.anything(),
        stream: false,
        requestOptions: undefined,
      }),
      expect.stringContaining(`"sampleCount":${imagenModel.generationConfig?.numberOfImages}`),
    );
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'publishers/google/models/my-model',
        task: request.Task.PREDICT,
        apiSettings: expect.anything(),
        stream: false,
        requestOptions: undefined,
      }),
      expect.stringContaining(`"aspectRatio":"${imagenModel.generationConfig?.aspectRatio}"`),
    );
  });

  it('throws if prompt blocked', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-failure-generate-images-prompt-blocked.json',
    );

    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: mockResponse.json,
    } as Response);

    const imagenModel = new ImagenModel(fakeAI, {
      model: 'my-model',
    });
    await expect(imagenModel.generateImages('some inappropriate prompt.')).rejects.toThrow();

    try {
      await imagenModel.generateImages('some inappropriate prompt.');
    } catch (e) {
      expect((e as AIError).code).toBe(AIErrorCode.FETCH_ERROR);
      expect((e as AIError).message).toContain('400');
      expect((e as AIError).message).toContain(
        "Image generation failed with the following error: The prompt could not be submitted. This prompt contains sensitive words that violate Google's Responsible AI practices. Try rephrasing the prompt. If you think this was an error, send feedback.",
      );
    }
  });
});
