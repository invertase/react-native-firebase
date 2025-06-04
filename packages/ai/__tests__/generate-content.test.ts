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
import { describe, expect, it, afterEach, jest, beforeEach } from '@jest/globals';
import { getMockResponse } from './test-utils/mock-response';
import * as request from '../lib/requests/request';
import { generateContent } from '../lib/methods/generate-content';
import {
  GenerateContentRequest,
  HarmBlockMethod,
  HarmBlockThreshold,
  HarmCategory,
  // RequestOptions,
} from '../lib/types';
import { ApiSettings } from '../lib/types/internal';
import { Task } from '../lib/requests/request';
import { GoogleAIBackend, VertexAIBackend } from '../lib/backend';
import { SpiedFunction } from 'jest-mock';
import { AIError } from '../lib/errors';
import { mapGenerateContentRequest } from '../lib/googleai-mappers';

const fakeApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  appId: 'my-appid',
  location: 'us-central1',
  backend: new VertexAIBackend(),
};

const fakeGoogleAIApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  appId: 'my-appid',
  location: 'us-central1',
  backend: new GoogleAIBackend(),
};

const fakeRequestParams: GenerateContentRequest = {
  contents: [{ parts: [{ text: 'hello' }], role: 'user' }],
  generationConfig: {
    topK: 16,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      method: HarmBlockMethod.SEVERITY,
    },
  ],
};

const fakeGoogleAIRequestParams: GenerateContentRequest = {
  contents: [{ parts: [{ text: 'hello' }], role: 'user' }],
  generationConfig: {
    topK: 16,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ],
};

describe('generateContent()', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('short response', async () => {
    const mockResponse = getMockResponse('unary-success-basic-reply-short.json');
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(await result.response.text()).toContain('Mountain View, California');
    expect(makeRequestStub).toHaveBeenCalledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      expect.stringContaining('contents'),
      undefined,
    );
  });

  it('long response', async () => {
    const mockResponse = getMockResponse('unary-success-basic-reply-long.json');
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(result.response.text()).toContain('Use Freshly Ground Coffee');
    expect(result.response.text()).toContain('30 minutes of brewing');
    expect(makeRequestStub).toHaveBeenCalledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      expect.anything(),
      undefined,
    );
  });

  it('long response with token details', async () => {
    const mockResponse = getMockResponse('unary-success-basic-response-long-usage-metadata.json');
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(result.response.usageMetadata?.totalTokenCount).toEqual(1913);
    expect(result.response.usageMetadata?.candidatesTokenCount).toEqual(76);
    expect(result.response.usageMetadata?.promptTokensDetails?.[0]?.modality).toEqual('IMAGE');
    expect(result.response.usageMetadata?.promptTokensDetails?.[0]?.tokenCount).toEqual(1806);
    expect(result.response.usageMetadata?.candidatesTokensDetails?.[0]?.modality).toEqual('TEXT');
    expect(result.response.usageMetadata?.candidatesTokensDetails?.[0]?.tokenCount).toEqual(76);
    expect(makeRequestStub).toHaveBeenCalledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      expect.anything(),
      undefined,
    );
  });

  it('citations', async () => {
    const mockResponse = getMockResponse('unary-success-citations.json');
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(result.response.text()).toContain('Some information cited from an external source');
    expect(result.response.candidates?.[0]!.citationMetadata?.citations.length).toBe(3);
    expect(makeRequestStub).toHaveBeenCalledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      expect.anything(),
      undefined,
    );
  });

  it('blocked prompt', async () => {
    const mockResponse = getMockResponse('unary-failure-prompt-blocked-safety.json');
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);

    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);

    expect(() => result.response.text()).toThrowError('SAFETY');
    expect(makeRequestStub).toHaveBeenCalledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      expect.anything(),
      undefined,
    );
  });

  it('finishReason safety', async () => {
    const mockResponse = getMockResponse('unary-failure-finish-reason-safety.json');
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(() => result.response.text()).toThrow('SAFETY');
    expect(makeRequestStub).toHaveBeenCalledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      expect.anything(),
      undefined,
    );
  });

  it('empty content', async () => {
    const mockResponse = getMockResponse('unary-failure-empty-content.json');
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(result.response.text()).toBe('');
    expect(makeRequestStub).toHaveBeenCalledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      expect.anything(),
      undefined,
    );
  });

  it('unknown enum - should ignore', async () => {
    const mockResponse = getMockResponse('unary-success-unknown-enum-safety-ratings.json');
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(result.response.text()).toContain('Some text');
    expect(makeRequestStub).toHaveBeenCalledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      expect.anything(),
      undefined,
    );
  });

  it('image rejected (400)', async () => {
    const mockResponse = getMockResponse('unary-failure-image-rejected.json');
    const mockFetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: mockResponse.json,
    } as Response);
    await expect(generateContent(fakeApiSettings, 'model', fakeRequestParams)).rejects.toThrow(
      /400.*invalid argument/,
    );
    expect(mockFetch).toHaveBeenCalled();
  });

  it('api not enabled (403)', async () => {
    const mockResponse = getMockResponse('unary-failure-firebasevertexai-api-not-enabled.json');
    const mockFetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
      json: mockResponse.json,
    } as Response);
    await expect(generateContent(fakeApiSettings, 'model', fakeRequestParams)).rejects.toThrow(
      /firebasevertexai\.googleapis[\s\S]*my-project[\s\S]*api-not-enabled/,
    );
    expect(mockFetch).toHaveBeenCalled();
  });

  describe('googleAI', () => {
    let makeRequestStub: SpiedFunction<typeof request.makeRequest>;

    beforeEach(() => {
      makeRequestStub = jest.spyOn(request, 'makeRequest');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('throws error when method is defined', async () => {
      const mockResponse = getMockResponse('unary-success-basic-reply-short.txt');
      makeRequestStub.mockResolvedValue(mockResponse as Response);

      const requestParamsWithMethod: GenerateContentRequest = {
        contents: [{ parts: [{ text: 'hello' }], role: 'user' }],
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            method: HarmBlockMethod.SEVERITY, // Unsupported in Google AI.
          },
        ],
      };

      // Expect generateContent to throw a AIError that method is not supported.
      await expect(
        generateContent(fakeGoogleAIApiSettings, 'model', requestParamsWithMethod),
      ).rejects.toThrow(AIError);
      expect(makeRequestStub).not.toHaveBeenCalled();
    });

    it('maps request to GoogleAI format', async () => {
      const mockResponse = getMockResponse('unary-success-basic-reply-short.txt');
      makeRequestStub.mockResolvedValue(mockResponse as Response);

      await generateContent(fakeGoogleAIApiSettings, 'model', fakeGoogleAIRequestParams);

      expect(makeRequestStub).toHaveBeenCalledWith(
        'model',
        Task.GENERATE_CONTENT,
        fakeGoogleAIApiSettings,
        false,
        JSON.stringify(mapGenerateContentRequest(fakeGoogleAIRequestParams)),
        undefined,
      );
    });
  });
});
