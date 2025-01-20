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
import { countTokens } from '../lib/methods/count-tokens';
import { CountTokensRequest } from '../lib/types';
import { ApiSettings } from '../lib/types/internal';
import { Task } from '../lib/requests/request';

const fakeApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  location: 'us-central1',
};

const fakeRequestParams: CountTokensRequest = {
  contents: [{ parts: [{ text: 'hello' }], role: 'user' }],
};

describe('countTokens()', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('total tokens', async () => {
    const mockResponse = getMockResponse('unary-success-total-tokens.json');
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

  it('total tokens no billable characters', async () => {
    const mockResponse = getMockResponse('unary-success-no-billable-characters.json');
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
    const mockResponse = getMockResponse('unary-failure-model-not-found.json');
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
});
