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
import { describe, expect, it, jest } from '@jest/globals';
import { type ReactNativeFirebase } from '@react-native-firebase/app';
import { AI, AIErrorCode } from '../lib/public-types';
import { AIError } from '../lib/errors';
import { VertexAIBackend } from '../lib/backend';
import { AIService } from '../lib/service';
import { initApiSettings } from '../lib/models/utils';

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

describe('initApiSettings', function () {
  it('calls regular app check token when option is set', async function () {
    const getTokenMock = jest
      .fn<() => Promise<{ token: string }>>()
      .mockResolvedValue({ token: 'mock-token' });
    const getLimitedUseTokenMock = jest
      .fn<() => Promise<{ token: string }>>()
      .mockResolvedValue({ token: 'mock-limited-token' });

    const apiSettings = initApiSettings({
      ...fakeAI,
      options: { useLimitedUseAppCheckTokens: false },
      appCheck: {
        getToken: getTokenMock,
        getLimitedUseToken: getLimitedUseTokenMock,
      },
    } as unknown as AIService);

    if (apiSettings?.getAppCheckToken) {
      await apiSettings.getAppCheckToken();
    }

    expect(getTokenMock).toHaveBeenCalled();
    expect(getLimitedUseTokenMock).not.toHaveBeenCalled();
  });

  it('calls limited use token when option is set', async function () {
    const getTokenMock = jest
      .fn<() => Promise<{ token: string }>>()
      .mockResolvedValue({ token: 'mock-token' });
    const getLimitedUseTokenMock = jest
      .fn<() => Promise<{ token: string }>>()
      .mockResolvedValue({ token: 'mock-limited-token' });

    const apiSettings = initApiSettings({
      ...fakeAI,
      options: { useLimitedUseAppCheckTokens: true },
      appCheck: {
        getToken: getTokenMock,
        getLimitedUseToken: getLimitedUseTokenMock,
      },
    } as unknown as AIService);

    if (apiSettings?.getAppCheckToken) {
      await apiSettings.getAppCheckToken();
    }

    expect(getTokenMock).not.toHaveBeenCalled();
    expect(getLimitedUseTokenMock).toHaveBeenCalled();
  });

  it('throws if not passed an api key', function () {
    const fakeAI: AI = {
      app: {
        name: 'DEFAULT',
        automaticDataCollectionEnabled: true,
        options: {
          projectId: 'my-project',
        },
      } as ReactNativeFirebase.FirebaseApp,
      backend: new VertexAIBackend('us-central1'),
      location: 'us-central1',
    };

    expect(() => {
      initApiSettings(fakeAI);
    }).toThrow(AIError);

    try {
      initApiSettings(fakeAI);
    } catch (e) {
      expect((e as AIError).code).toBe(AIErrorCode.NO_API_KEY);
    }
  });

  it('throws if not passed a project ID', function () {
    const fakeAI: AI = {
      app: {
        name: 'DEFAULT',
        automaticDataCollectionEnabled: true,
        options: {
          apiKey: 'key',
        },
      } as ReactNativeFirebase.FirebaseApp,
      backend: new VertexAIBackend('us-central1'),
      location: 'us-central1',
    };

    expect(() => {
      initApiSettings(fakeAI);
    }).toThrow(AIError);

    try {
      initApiSettings(fakeAI);
    } catch (e) {
      expect((e as AIError).code).toBe(AIErrorCode.NO_PROJECT_ID);
    }
  });

  it('throws if not passed an app ID', function () {
    const fakeAI: AI = {
      app: {
        name: 'DEFAULT',
        automaticDataCollectionEnabled: true,
        options: {
          apiKey: 'key',
          projectId: 'my-project',
        },
      } as ReactNativeFirebase.FirebaseApp,
      backend: new VertexAIBackend('us-central1'),
      location: 'us-central1',
    };

    expect(() => {
      initApiSettings(fakeAI);
    }).toThrow(AIError);

    try {
      initApiSettings(fakeAI);
    } catch (e) {
      expect((e as AIError).code).toBe(AIErrorCode.NO_APP_ID);
    }
  });
});
