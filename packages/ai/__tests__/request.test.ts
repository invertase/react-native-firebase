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
import { describe, expect, it, jest, afterEach, beforeEach } from '@jest/globals';
import { Platform } from 'react-native';
import {
  RequestUrl,
  Task,
  TemplateRequestUrl,
  ServerPromptTemplateTask,
  getHeaders,
  getTemplateHeaders,
  makeRequest,
} from '../lib/requests/request';
import { ApiSettings } from '../lib/types/internal';
import { DEFAULT_API_VERSION } from '../lib/constants';
import { AIErrorCode } from '../lib/types';
import { AIError } from '../lib/errors';
import { BackendName, getMockResponse } from './test-utils/mock-response';
import { AgentPlatformBackend, VertexAIBackend } from '../lib/backend';

const fakeApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  appId: 'my-appid',
  location: 'us-central1',
  backend: new VertexAIBackend(),
};

const fakeAgentPlatformApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  appId: 'my-appid',
  location: 'global',
  backend: new AgentPlatformBackend(),
};

function createAbortErrorForTest(reason?: unknown): Error {
  if (typeof DOMException !== 'undefined') {
    return new DOMException(reason == null ? 'Aborted' : String(reason), 'AbortError');
  }
  const error = new Error(reason == null ? 'Aborted' : String(reason));
  error.name = 'AbortError';
  return error;
}

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

    it('AgentPlatformBackend uses global location by default', async () => {
      const url = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        fakeAgentPlatformApiSettings,
        false,
        {},
      );
      const urlStr = url.toString();
      expect(urlStr).toContain('locations/global');
      expect(urlStr).toContain(fakeAgentPlatformApiSettings.project);
      expect(urlStr).toContain('models/model-name:generateContent');
    });

    it('AgentPlatformBackend uses custom location', async () => {
      const settings: ApiSettings = {
        ...fakeAgentPlatformApiSettings,
        location: 'europe-west1',
        backend: new AgentPlatformBackend('europe-west1'),
      };
      const url = new RequestUrl('models/model-name', Task.GENERATE_CONTENT, settings, false, {});
      expect(url.toString()).toContain('locations/europe-west1');
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

    describe('RNFB test environment emulator URL', () => {
      const ENV_KEYS = [
        'RNFB_ANDROID_EMULATOR_FUNCTIONS_PORT',
        'RNFB_IOS_EMULATOR_FUNCTIONS_PORT',
        'RNFB_MACOS_EMULATOR_FUNCTIONS_PORT',
      ] as const;
      const originalEnv: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> = {};
      const originalEmulatorFlag = (globalThis as { RNFB_VERTEXAI_EMULATOR_URL?: boolean })
        .RNFB_VERTEXAI_EMULATOR_URL;
      let originalPlatformOs: string;

      beforeEach(() => {
        originalPlatformOs = Platform.OS;
        ENV_KEYS.forEach(key => {
          originalEnv[key] = process.env[key];
          delete process.env[key];
        });
        (globalThis as { RNFB_VERTEXAI_EMULATOR_URL?: boolean }).RNFB_VERTEXAI_EMULATOR_URL = true;
      });

      afterEach(() => {
        Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOs });
        ENV_KEYS.forEach(key => {
          if (originalEnv[key] === undefined) {
            delete process.env[key];
          } else {
            process.env[key] = originalEnv[key];
          }
        });
        if (originalEmulatorFlag === undefined) {
          delete (globalThis as { RNFB_VERTEXAI_EMULATOR_URL?: boolean })
            .RNFB_VERTEXAI_EMULATOR_URL;
        } else {
          (globalThis as { RNFB_VERTEXAI_EMULATOR_URL?: boolean }).RNFB_VERTEXAI_EMULATOR_URL =
            originalEmulatorFlag;
        }
      });

      function setPlatformOs(os: string): void {
        Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
      }

      it('uses 10.0.2.2 and default port on android', () => {
        setPlatformOs('android');
        const url = new RequestUrl(
          'models/model-name',
          Task.GENERATE_CONTENT,
          fakeApiSettings,
          false,
          {},
        );
        expect(url.toString()).toBe(
          'http://10.0.2.2:5001/react-native-firebase-testing/us-central1/testFetch',
        );
      });

      it('uses 127.0.0.1 and default port on ios', () => {
        setPlatformOs('ios');
        const url = new RequestUrl(
          'models/model-name',
          Task.GENERATE_CONTENT,
          fakeApiSettings,
          false,
          {},
        );
        expect(url.toString()).toBe(
          'http://127.0.0.1:5001/react-native-firebase-testing/us-central1/testFetch',
        );
      });

      it('uses 127.0.0.1 and macos env port', () => {
        setPlatformOs('macos');
        process.env.RNFB_MACOS_EMULATOR_FUNCTIONS_PORT = '5101';
        const url = new RequestUrl(
          'models/model-name',
          Task.GENERATE_CONTENT,
          fakeApiSettings,
          false,
          {},
        );
        expect(url.toString()).toBe(
          'http://127.0.0.1:5101/react-native-firebase-testing/us-central1/testFetch',
        );
      });

      it('uses platform-prefixed functions port when set', () => {
        setPlatformOs('android');
        process.env.RNFB_ANDROID_EMULATOR_FUNCTIONS_PORT = '5201';
        const url = new RequestUrl(
          'models/model-name',
          Task.GENERATE_CONTENT,
          fakeApiSettings,
          false,
          {},
        );
        expect(url.toString()).toBe(
          'http://10.0.2.2:5201/react-native-firebase-testing/us-central1/testFetch',
        );
      });

      it('falls back to default port when env port is invalid', () => {
        setPlatformOs('ios');
        process.env.RNFB_IOS_EMULATOR_FUNCTIONS_PORT = 'not-a-number';
        const url = new RequestUrl(
          'models/model-name',
          Task.GENERATE_CONTENT,
          fakeApiSettings,
          false,
          {},
        );
        expect(url.toString()).toBe(
          'http://127.0.0.1:5001/react-native-firebase-testing/us-central1/testFetch',
        );
      });

      it('uses testFetchStream path when streaming', () => {
        setPlatformOs('android');
        const url = new RequestUrl(
          'models/model-name',
          Task.GENERATE_CONTENT,
          fakeApiSettings,
          true,
          {},
        );
        expect(url.toString()).toBe(
          'http://10.0.2.2:5001/react-native-firebase-testing/us-central1/testFetchStream',
        );
      });

      it('throws on unknown Platform.OS', () => {
        setPlatformOs('web');
        expect(() =>
          new RequestUrl(
            'models/model-name',
            Task.GENERATE_CONTENT,
            fakeApiSettings,
            false,
            {},
          ).toString(),
        ).toThrow(/Unknown Platform\.OS for e2e emulator routing.*web.*android\|ios\|macos/);
      });
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
        expect.stringMatching(/firebase\/ai/),
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

    it('adds X-Firebase-Appid and X-Firebase-AppVersion when collection enabled', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          appId: 'my-appid',
          location: 'moon',
          backend: new VertexAIBackend(),
          automaticDataCollectionEnabled: true,
          appVersion: '2.3.4',
        },
        true,
        {},
      );
      const headers = await getHeaders(fakeUrl);
      expect(headers.get('X-Firebase-Appid')).toBe('my-appid');
      expect(headers.get('X-Firebase-AppVersion')).toBe('2.3.4');
    });

    it('omits AppId and AppVersion when collection disabled', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          appId: 'my-appid',
          location: 'moon',
          backend: new VertexAIBackend(),
          automaticDataCollectionEnabled: false,
          appVersion: '2.3.4',
        },
        true,
        {},
      );
      const headers = await getHeaders(fakeUrl);
      expect(headers.has('X-Firebase-Appid')).toBe(false);
      expect(headers.has('X-Firebase-AppVersion')).toBe(false);
    });

    it('adds AppId but omits AppVersion when version missing', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          appId: 'my-appid',
          location: 'moon',
          backend: new VertexAIBackend(),
          automaticDataCollectionEnabled: true,
        },
        true,
        {},
      );
      const headers = await getHeaders(fakeUrl);
      expect(headers.get('X-Firebase-Appid')).toBe('my-appid');
      expect(headers.has('X-Firebase-AppVersion')).toBe(false);
    });

    it('omits AppVersion when version is empty string', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          appId: 'my-appid',
          location: 'moon',
          backend: new VertexAIBackend(),
          automaticDataCollectionEnabled: true,
          appVersion: '',
        },
        true,
        {},
      );
      const headers = await getHeaders(fakeUrl);
      expect(headers.get('X-Firebase-Appid')).toBe('my-appid');
      expect(headers.has('X-Firebase-AppVersion')).toBe(false);
    });
  });

  describe('getTemplateHeaders', () => {
    it('adds X-Firebase-Appid and X-Firebase-AppVersion when collection enabled', async () => {
      const fakeUrl = new TemplateRequestUrl(
        'template-id',
        ServerPromptTemplateTask.TEMPLATE_GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          appId: 'my-appid',
          location: 'moon',
          backend: new VertexAIBackend(),
          automaticDataCollectionEnabled: true,
          appVersion: '9.9.9',
        },
        false,
        {},
      );
      const headers = await getTemplateHeaders(fakeUrl);
      expect(headers.get('X-Firebase-Appid')).toBe('my-appid');
      expect(headers.get('X-Firebase-AppVersion')).toBe('9.9.9');
    });

    it('omits AppId and AppVersion when collection disabled', async () => {
      const fakeUrl = new TemplateRequestUrl(
        'template-id',
        ServerPromptTemplateTask.TEMPLATE_GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          appId: 'my-appid',
          location: 'moon',
          backend: new VertexAIBackend(),
          automaticDataCollectionEnabled: false,
          appVersion: '9.9.9',
        },
        false,
        {},
      );
      const headers = await getTemplateHeaders(fakeUrl);
      expect(headers.has('X-Firebase-Appid')).toBe(false);
      expect(headers.has('X-Firebase-AppVersion')).toBe(false);
    });

    it('adds AppId but omits AppVersion when version missing', async () => {
      const fakeUrl = new TemplateRequestUrl(
        'template-id',
        ServerPromptTemplateTask.TEMPLATE_GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          appId: 'my-appid',
          location: 'moon',
          backend: new VertexAIBackend(),
          automaticDataCollectionEnabled: true,
        },
        false,
        {},
      );
      const headers = await getTemplateHeaders(fakeUrl);
      expect(headers.get('X-Firebase-Appid')).toBe('my-appid');
      expect(headers.has('X-Firebase-AppVersion')).toBe(false);
    });

    it('omits AppVersion when version is empty string', async () => {
      const fakeUrl = new TemplateRequestUrl(
        'template-id',
        ServerPromptTemplateTask.TEMPLATE_GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          appId: 'my-appid',
          location: 'moon',
          backend: new VertexAIBackend(),
          automaticDataCollectionEnabled: true,
          appVersion: '',
        },
        false,
        {},
      );
      const headers = await getTemplateHeaders(fakeUrl);
      expect(headers.get('X-Firebase-Appid')).toBe('my-appid');
      expect(headers.has('X-Firebase-AppVersion')).toBe(false);
    });
  });

  describe('makeRequest', () => {
    it('throws an AbortError without fetching if the external signal is already aborted', async () => {
      const fetchMock = jest.spyOn(globalThis, 'fetch');
      const controller = new AbortController();
      (controller.abort as (reason?: unknown) => void)('user cancelled');

      await expect(
        makeRequest(
          {
            model: 'models/model-name',
            task: Task.GENERATE_CONTENT,
            apiSettings: fakeApiSettings,
            stream: false,
            requestOptions: {
              signal: controller.signal,
            },
          },
          '',
        ),
      ).rejects.toMatchObject({
        name: 'AbortError',
        message: 'user cancelled',
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('aborts the fetch signal when the external signal aborts', async () => {
      const controller = new AbortController();
      const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation((_url, init) => {
        return new Promise((_resolve, reject) => {
          (init?.signal as AbortSignal).addEventListener('abort', () => {
            reject(createAbortErrorForTest());
          });
          (controller.abort as (reason?: unknown) => void)('cancelled during fetch');
        });
      });

      await expect(
        makeRequest(
          {
            model: 'models/model-name',
            task: Task.GENERATE_CONTENT,
            apiSettings: fakeApiSettings,
            stream: false,
            requestOptions: {
              signal: controller.signal,
            },
          },
          '',
        ),
      ).rejects.toMatchObject({
        name: 'AbortError',
        message: expect.any(String),
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('no error', async () => {
      const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
      } as Response);
      const response = await makeRequest(
        {
          model: 'models/model-name',
          task: Task.GENERATE_CONTENT,
          apiSettings: fakeApiSettings,
          stream: false,
        },
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
        await makeRequest(
          {
            model: 'models/model-name',
            task: Task.GENERATE_CONTENT,
            apiSettings: fakeApiSettings,
            stream: false,
            requestOptions: {
              timeout: 180000,
            },
          },
          '',
        );
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
        await makeRequest(
          {
            model: 'models/model-name',
            task: Task.GENERATE_CONTENT,
            apiSettings: fakeApiSettings,
            stream: false,
          },
          '',
        );
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
        await makeRequest(
          {
            model: 'models/model-name',
            task: Task.GENERATE_CONTENT,
            apiSettings: fakeApiSettings,
            stream: false,
          },
          '',
        );
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
        await makeRequest(
          {
            model: 'models/model-name',
            task: Task.GENERATE_CONTENT,
            apiSettings: fakeApiSettings,
            stream: false,
          },
          '',
        );
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
      await makeRequest(
        {
          model: 'models/model-name',
          task: Task.GENERATE_CONTENT,
          apiSettings: fakeApiSettings,
          stream: false,
        },
        '',
      );
    } catch (e) {
      expect((e as AIError).code).toBe(AIErrorCode.API_NOT_ENABLED);
      expect((e as AIError).message).toContain('my-project');
      expect((e as AIError).message).toContain('googleapis.com');
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
