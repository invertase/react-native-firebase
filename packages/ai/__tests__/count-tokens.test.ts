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
import { describe, expect, it, afterEach, jest, beforeEach } from '@jest/globals';
import { BackendName, getMockResponse } from './test-utils/mock-response';
import * as request from '../lib/requests/request';
import { countTokens } from '../lib/methods/count-tokens';
import { CountTokensRequest, RequestOptions } from '../lib/types';
import { ApiSettings } from '../lib/types/internal';
import { Task } from '../lib/requests/request';
import { GoogleAIBackend } from '../lib/backend';
import { SpiedFunction } from 'jest-mock';
import { mapCountTokensRequest } from '../lib/googleai-mappers';

const fakeApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  location: 'us-central1',
  appId: '',
  backend: new GoogleAIBackend(),
};

const fakeGoogleAIApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  appId: 'my-appid',
  location: '',
  backend: new GoogleAIBackend(),
};

const fakeRequestParams: CountTokensRequest = {
  contents: [{ parts: [{ text: 'hello' }], role: 'user' }],
};

describe('countTokens()', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('total tokens', async () => {
    const mockResponse = getMockResponse(BackendName.VertexAI, 'unary-success-total-tokens.json');
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await countTokens(fakeApiSettings, 'model', fakeRequestParams);
    expect(result.totalTokens).toBe(6);
    expect(result.totalBillableCharacters).toBe(16);
    expect(makeRequestStub).toHaveBeenCalledWith(
      'model',
      Task.COUNT_TOKENS,
      fakeApiSettings,
      false,
      expect.stringContaining('contents'),
      undefined,
    );
  });

  it('total tokens with modality details', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-detailed-token-response.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await countTokens(fakeApiSettings, 'model', fakeRequestParams);

    expect(result.totalTokens).toBe(1837);
    expect(result.totalBillableCharacters).toBe(117);
    expect(result.promptTokensDetails?.[0]?.modality).toBe('IMAGE');
    expect(result.promptTokensDetails?.[0]?.tokenCount).toBe(1806);
    expect(makeRequestStub).toHaveBeenCalledWith(
      'model',
      Task.COUNT_TOKENS,
      fakeApiSettings,
      false,
      expect.stringContaining('contents'),
      undefined,
    );
  });

  it('total tokens no billable characters', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-no-billable-characters.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await countTokens(fakeApiSettings, 'model', fakeRequestParams);
    expect(result.totalTokens).toBe(258);
    expect(result).not.toHaveProperty('totalBillableCharacters');
    expect(makeRequestStub).toHaveBeenCalledWith(
      'model',
      Task.COUNT_TOKENS,
      fakeApiSettings,
      false,
      expect.stringContaining('contents'),
      undefined,
    );
  });

  it('model not found', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-failure-model-not-found.json',
    );
    const mockFetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: mockResponse.json,
    } as Response);
    await expect(countTokens(fakeApiSettings, 'model', fakeRequestParams)).rejects.toThrow(
      /404.*not found/,
    );
    expect(mockFetch).toHaveBeenCalled();
  });

  describe('googleAI', () => {
    let makeRequestStub: SpiedFunction<
      (
        model: string,
        task: Task,
        apiSettings: ApiSettings,
        stream: boolean,
        body: string,
        requestOptions?: RequestOptions,
      ) => Promise<Response>
    >;

    beforeEach(() => {
      makeRequestStub = jest.spyOn(request, 'makeRequest');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('maps request to GoogleAI format', async () => {
      makeRequestStub.mockResolvedValue({ ok: true, json: () => {} } as Response);

      await countTokens(fakeGoogleAIApiSettings, 'model', fakeRequestParams);

      expect(makeRequestStub).toHaveBeenCalledWith(
        'model',
        Task.COUNT_TOKENS,
        fakeGoogleAIApiSettings,
        false,
        JSON.stringify(mapCountTokensRequest(fakeRequestParams, 'model')),
        undefined,
      );
    });
  });
});
