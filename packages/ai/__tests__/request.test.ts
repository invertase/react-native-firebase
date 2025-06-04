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
import { describe, expect, it, jest, afterEach } from '@jest/globals';
import { RequestUrl, Task, getHeaders, makeRequest } from '../lib/requests/request';
import { ApiSettings } from '../lib/types/internal';
import { DEFAULT_API_VERSION } from '../lib/constants';
import { AIErrorCode } from '../lib/types';
import { AIError } from '../lib/errors';
import { BackendName, getMockResponse } from './test-utils/mock-response';
import { VertexAIBackend } from '../lib/backend';

const fakeApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  appId: 'my-appid',
  location: 'us-central1',
  backend: new VertexAIBackend(),
};

describe('request methods', () => {
  afterEach(() => {
    jest.restoreAllMocks(); // Use Jest's restoreAllMocks
  });

  describe('RequestUrl', () => {
    it('stream', async () => {
      const url = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        fakeApiSettings,
        true,
        {},
      );
      const urlStr = url.toString();
      expect(urlStr).toContain('models/model-name:generateContent');
      expect(urlStr).toContain(fakeApiSettings.project);
      expect(urlStr).toContain(fakeApiSettings.location);
      expect(urlStr).toContain('alt=sse');
    });

    it('non-stream', async () => {
      const url = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        fakeApiSettings,
        false,
        {},
      );
      const urlStr = url.toString();
      expect(urlStr).toContain('models/model-name:generateContent');
      expect(urlStr).toContain(fakeApiSettings.project);
      expect(urlStr).toContain(fakeApiSettings.location);
      expect(urlStr).not.toContain('alt=sse');
    });

    it('default apiVersion', async () => {
      const url = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        fakeApiSettings,
        false,
        {},
      );
      expect(url.toString()).toContain(DEFAULT_API_VERSION);
    });

    it('custom baseUrl', async () => {
      const url = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        fakeApiSettings,
        false,
        { baseUrl: 'https://my.special.endpoint' },
      );
      expect(url.toString()).toContain('https://my.special.endpoint');
    });

    it('non-stream - tunedModels/', async () => {
      const url = new RequestUrl(
        'tunedModels/model-name',
        Task.GENERATE_CONTENT,
        fakeApiSettings,
        false,
        {},
      );
      const urlStr = url.toString();
      expect(urlStr).toContain('tunedModels/model-name:generateContent');
      expect(urlStr).toContain(fakeApiSettings.location);
      expect(urlStr).toContain(fakeApiSettings.project);
      expect(urlStr).not.toContain('alt=sse');
    });
  });

  describe('getHeaders', () => {
    const fakeApiSettings: ApiSettings = {
      apiKey: 'key',
      project: 'myproject',
      appId: 'my-appid',
      location: 'moon',
      backend: new VertexAIBackend(),
      getAuthToken: () => Promise.resolve('authtoken'),
      getAppCheckToken: () => Promise.resolve({ token: 'appchecktoken' }),
    };
    const fakeUrl = new RequestUrl(
      'models/model-name',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      true,
      {},
    );

    it('adds client headers', async () => {
      const headers = await getHeaders(fakeUrl);
      expect(headers.get('x-goog-api-client')).toMatch(/gl-rn\/[0-9\.]+ fire\/[0-9\.]+/);
    });

    it('adds api key', async () => {
      const headers = await getHeaders(fakeUrl);
      expect(headers.get('x-goog-api-key')).toBe('key');
    });

    it('adds app check token if it exists', async () => {
      const headers = await getHeaders(fakeUrl);
      expect(headers.get('X-Firebase-AppCheck')).toBe('appchecktoken');
    });

    it('ignores app check token header if no appcheck service', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          appId: 'my-appid',
          location: 'moon',
          backend: new VertexAIBackend(),
        },
        true,
        {},
      );
      const headers = await getHeaders(fakeUrl);
      expect(headers.has('X-Firebase-AppCheck')).toBe(false);
    });

    it('ignores app check token header if returned token was undefined', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          location: 'moon',
          //@ts-ignore
          getAppCheckToken: () => Promise.resolve(),
        },
        true,
        {},
      );
      const headers = await getHeaders(fakeUrl);
      expect(headers.has('X-Firebase-AppCheck')).toBe(false);
    });

    it('ignores app check token header if returned token had error', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          location: 'moon',
          getAppCheckToken: () => Promise.reject(new Error('oops')),
          backend: new VertexAIBackend(),
          appId: 'my-appid',
        },
        true,
        {},
      );

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      await getHeaders(fakeUrl);
      // NOTE - no app check header if there is no token, this is different to firebase-js-sdk
      // See: https://github.com/firebase/firebase-js-sdk/blob/main/packages/vertexai/src/requests/request.test.ts#L172
      // expect(headers.get('X-Firebase-AppCheck')).toBe('dummytoken');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/vertexai/),
        expect.stringMatching(/App Check.*oops/),
      );
    });

    it('adds auth token if it exists', async () => {
      const headers = await getHeaders(fakeUrl);
      expect(headers.get('Authorization')).toBe('Firebase authtoken');
    });

    it('ignores auth token header if no auth service', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          appId: 'my-appid',
          location: 'moon',
          backend: new VertexAIBackend(),
        },
        true,
        {},
      );
      const headers = await getHeaders(fakeUrl);
      expect(headers.has('Authorization')).toBe(false);
    });

    it('ignores auth token header if returned token was undefined', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          location: 'moon',
          //@ts-ignore
          getAppCheckToken: () => Promise.resolve(),
        },
        true,
        {},
      );
      const headers = await getHeaders(fakeUrl);
      expect(headers.has('Authorization')).toBe(false);
    });
  });

  describe('makeRequest', () => {
    it('no error', async () => {
      const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
      } as Response);
      const response = await makeRequest(
        'models/model-name',
        Task.GENERATE_CONTENT,
        fakeApiSettings,
        false,
        '',
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(response.ok).toBe(true);
    });

    it('error with timeout', async () => {
      const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'AbortError',
      } as Response);

      try {
        await makeRequest('models/model-name', Task.GENERATE_CONTENT, fakeApiSettings, false, '', {
          timeout: 180000,
        });
      } catch (e) {
        expect((e as AIError).code).toBe(AIErrorCode.FETCH_ERROR);
        expect((e as AIError).customErrorData?.status).toBe(500);
        expect((e as AIError).customErrorData?.statusText).toBe('AbortError');
        expect((e as AIError).message).toContain('500 AbortError');
      }

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('Network error, no response.json()', async () => {
      const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      } as Response);
      try {
        await makeRequest('models/model-name', Task.GENERATE_CONTENT, fakeApiSettings, false, '');
      } catch (e) {
        expect((e as AIError).code).toBe(AIErrorCode.FETCH_ERROR);
        expect((e as AIError).customErrorData?.status).toBe(500);
        expect((e as AIError).customErrorData?.statusText).toBe('Server Error');
        expect((e as AIError).message).toContain('500 Server Error');
      }
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('Network error, includes response.json()', async () => {
      const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: () => Promise.resolve({ error: { message: 'extra info' } }),
      } as Response);
      try {
        await makeRequest('models/model-name', Task.GENERATE_CONTENT, fakeApiSettings, false, '');
      } catch (e) {
        expect((e as AIError).code).toBe(AIErrorCode.FETCH_ERROR);
        expect((e as AIError).customErrorData?.status).toBe(500);
        expect((e as AIError).customErrorData?.statusText).toBe('Server Error');
        expect((e as AIError).message).toContain('500 Server Error');
        expect((e as AIError).message).toContain('extra info');
      }
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('Network error, includes response.json() and details', async () => {
      const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: () =>
          Promise.resolve({
            error: {
              message: 'extra info',
              details: [
                {
                  '@type': 'type.googleapis.com/google.rpc.DebugInfo',
                  detail:
                    '[ORIGINAL ERROR] generic::invalid_argument: invalid status photos.thumbnailer.Status.Code::5: Source image 0 too short',
                },
              ],
            },
          }),
      } as Response);
      try {
        await makeRequest('models/model-name', Task.GENERATE_CONTENT, fakeApiSettings, false, '');
      } catch (e) {
        expect((e as AIError).code).toBe(AIErrorCode.FETCH_ERROR);
        expect((e as AIError).customErrorData?.status).toBe(500);
        expect((e as AIError).customErrorData?.statusText).toBe('Server Error');
        expect((e as AIError).message).toContain('500 Server Error');
        expect((e as AIError).message).toContain('extra info');
        expect((e as AIError).message).toContain('generic::invalid_argument');
      }
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  it('Network error, API not enabled', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-failure-firebasevertexai-api-not-enabled.json',
    );
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response);
    try {
      await makeRequest('models/model-name', Task.GENERATE_CONTENT, fakeApiSettings, false, '');
    } catch (e) {
      expect((e as AIError).code).toBe(AIErrorCode.API_NOT_ENABLED);
      expect((e as AIError).message).toContain('my-project');
      expect((e as AIError).message).toContain('googleapis.com');
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
