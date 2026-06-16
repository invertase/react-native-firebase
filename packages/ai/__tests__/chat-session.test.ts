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
import { describe, expect, it, afterEach, jest } from '@jest/globals';

import * as generateContentMethods from '../lib/methods/generate-content';
import { EnhancedGenerateContentResponse, GenerateContentStreamResult } from '../lib/types';
import { ChatSession } from '../lib/methods/chat-session';
import { ApiSettings } from '../lib/types/internal';
import { RequestOptions } from '../lib/types/requests';
import { VertexAIBackend } from '../lib/backend';

const fakeApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  appId: 'my-appid',
  location: 'us-central1',
  backend: new VertexAIBackend(),
};

const requestOptions: RequestOptions = {
  timeout: 1000,
};

function streamResult(response: EnhancedGenerateContentResponse): GenerateContentStreamResult {
  return {
    stream: (async function* () {
      yield response;
    })(),
    response: Promise.resolve(response),
  };
}

describe('ChatSession', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendMessage()', () => {
    it('generateContent errors should be catchable', async () => {
      const generateContentStub = jest
        .spyOn(generateContentMethods, 'generateContent')
        .mockRejectedValue('generateContent failed');

      const chatSession = new ChatSession(fakeApiSettings, 'a-model', {}, requestOptions);

      await expect(chatSession.sendMessage('hello')).rejects.toMatch(/generateContent failed/);

      expect(generateContentStub).toHaveBeenCalledWith(
        fakeApiSettings,
        'a-model',
        expect.anything(),
        requestOptions,
      );
    });

    it('merges per-call request options over session request options', async () => {
      const controller = new AbortController();
      const generateContentStub = jest
        .spyOn(generateContentMethods, 'generateContent')
        .mockResolvedValue({ response: { candidates: [] } } as any);
      const chatSession = new ChatSession(fakeApiSettings, 'a-model', {}, requestOptions);

      await chatSession.sendMessage('hello', {
        timeout: 2000,
        signal: controller.signal,
      });

      expect(generateContentStub).toHaveBeenCalledWith(
        fakeApiSettings,
        'a-model',
        expect.anything(),
        {
          timeout: 2000,
          signal: controller.signal,
        },
      );
    });
  });

  describe('sendMessageStream()', () => {
    it('generateContentStream errors should be catchable', async () => {
      jest.useFakeTimers();
      const consoleStub = jest.spyOn(console, 'error').mockImplementation(() => {});
      const generateContentStreamStub = jest
        .spyOn(generateContentMethods, 'generateContentStream')
        .mockRejectedValue('generateContentStream failed');
      const chatSession = new ChatSession(fakeApiSettings, 'a-model', {}, requestOptions);
      await expect(chatSession.sendMessageStream('hello')).rejects.toMatch(
        /generateContentStream failed/,
      );
      expect(generateContentStreamStub).toHaveBeenCalledWith(
        fakeApiSettings,
        'a-model',
        expect.anything(),
        requestOptions,
      );
      jest.runAllTimers();
      expect(consoleStub).not.toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('merges per-call request options over session request options', async () => {
      const controller = new AbortController();
      const generateContentStreamStub = jest
        .spyOn(generateContentMethods, 'generateContentStream')
        .mockResolvedValue({
          response: Promise.resolve({ candidates: [] }),
        } as unknown as GenerateContentStreamResult);
      const chatSession = new ChatSession(fakeApiSettings, 'a-model', {}, requestOptions);

      await chatSession.sendMessageStream('hello', {
        timeout: 2000,
        signal: controller.signal,
      });

      expect(generateContentStreamStub).toHaveBeenCalledWith(
        fakeApiSettings,
        'a-model',
        expect.anything(),
        {
          timeout: 2000,
          signal: controller.signal,
        },
      );
    });

    it('automatically calls functionReference from stream function calls', async () => {
      const getWeather = jest.fn<(args: object) => object>().mockReturnValue({ temperature: 72 });
      const functionCallResponse = {
        candidates: [
          {
            index: 0,
            content: {
              role: 'model',
              parts: [
                {
                  functionCall: {
                    name: 'getWeather',
                    args: { city: 'London' },
                  },
                },
              ],
            },
          },
        ],
        functionCalls: () => [{ name: 'getWeather', args: { city: 'London' } }],
      } as EnhancedGenerateContentResponse;
      const finalResponse = {
        candidates: [
          {
            index: 0,
            content: {
              role: 'model',
              parts: [{ text: 'It is 72 degrees.' }],
            },
          },
        ],
        functionCalls: () => undefined,
      } as EnhancedGenerateContentResponse;
      const generateContentStreamStub = jest
        .spyOn(generateContentMethods, 'generateContentStream')
        .mockResolvedValueOnce(streamResult(functionCallResponse))
        .mockResolvedValueOnce(streamResult(finalResponse));
      const chatSession = new ChatSession(
        fakeApiSettings,
        'a-model',
        {
          tools: [
            {
              functionDeclarations: [
                {
                  name: 'getWeather',
                  description: 'Gets weather for a city.',
                  functionReference: getWeather,
                },
              ],
            },
          ],
        },
        requestOptions,
      );

      const result = await chatSession.sendMessageStream('weather in London');
      await result.response;
      const history = await chatSession.getHistory();

      expect(getWeather).toHaveBeenCalledWith({ city: 'London' });
      expect(generateContentStreamStub).toHaveBeenCalledTimes(2);
      expect(history).toEqual([
        {
          role: 'user',
          parts: [{ text: 'weather in London' }],
        },
        {
          role: 'model',
          parts: [
            {
              functionCall: {
                name: 'getWeather',
                args: { city: 'London' },
              },
            },
          ],
        },
        {
          role: 'function',
          parts: [
            {
              functionResponse: {
                name: 'getWeather',
                response: { temperature: 72 },
              },
            },
          ],
        },
        {
          role: 'model',
          parts: [{ text: 'It is 72 degrees.' }],
        },
      ]);
    });

    it('downstream sendPromise errors should log but not throw', async () => {
      const consoleStub = jest.spyOn(console, 'error').mockImplementation(() => {});
      // make response undefined so that response.candidates errors
      const generateContentStreamStub = jest
        .spyOn(generateContentMethods, 'generateContentStream')
        .mockResolvedValue({} as unknown as GenerateContentStreamResult);
      const chatSession = new ChatSession(fakeApiSettings, 'a-model', {}, requestOptions);
      await chatSession.sendMessageStream('hello');
      expect(generateContentStreamStub).toHaveBeenCalledWith(
        fakeApiSettings,
        'a-model',
        expect.anything(),
        requestOptions,
      );
      // wait for the console.error to be called, due to number of promises in the chain
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(consoleStub).toHaveBeenCalledTimes(1);
    });
  });
});
