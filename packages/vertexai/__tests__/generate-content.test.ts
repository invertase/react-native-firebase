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
import { describe, expect, it, afterEach, jest } from '@jest/globals';
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

const fakeApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  location: 'us-central1',
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
});
