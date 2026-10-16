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
import {
  BlockReason,
  EnhancedGenerateContentResponse,
  GenerateContentStreamResult,
} from '../lib/types';
import { ChatSessionImpl, TemplateChatSessionImpl } from '../lib/methods/chat-session';
import { ApiSettings } from '../lib/types/internal';
import { RequestOptions } from '../lib/types/requests';
import { AgentPlatformBackend } from '../lib/backend';

const fakeApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  appId: 'my-appid',
  location: 'us-central1',
  backend: new AgentPlatformBackend(),
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

const blockedResponse = {
  candidates: [],
  promptFeedback: { blockReason: BlockReason.SAFETY },
} as unknown as EnhancedGenerateContentResponse;

describe('ChatSession', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('validates and stores provided history', async () => {
      const history = [{ role: 'user' as const, parts: [{ type: 'text' as const, text: 'hi' }] }];
      const chatSession = new ChatSessionImpl(fakeApiSettings, 'a-model', { history });
      expect(await chatSession.getHistory()).toEqual(history);
    });
  });

  describe('sendMessage()', () => {
    it('generateContent errors should be catchable', async () => {
      const generateContentStub = jest
        .spyOn(generateContentMethods, 'generateContent')
        .mockRejectedValue('generateContent failed');

      const chatSession = new ChatSessionImpl(fakeApiSettings, 'a-model', {}, requestOptions);

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
      const chatSession = new ChatSessionImpl(fakeApiSettings, 'a-model', {}, requestOptions);

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

    it('logs a warning when the response is blocked and does not update history', async () => {
      const warnStub = jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(generateContentMethods, 'generateContent').mockResolvedValue({
        response: blockedResponse,
      } as any);
      const chatSession = new ChatSessionImpl(fakeApiSettings, 'a-model', {}, requestOptions);

      await chatSession.sendMessage('hello');

      expect(warnStub).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('sendMessage() was unsuccessful'),
      );
      expect(await chatSession.getHistory()).toEqual([]);
    });

    it('defaults missing response role to model when updating history', async () => {
      jest.spyOn(generateContentMethods, 'generateContent').mockResolvedValue({
        response: {
          candidates: [
            {
              index: 0,
              content: {
                parts: [{ type: 'text', text: 'hi back' }],
              },
            },
          ],
        },
      } as any);
      const chatSession = new ChatSessionImpl(fakeApiSettings, 'a-model', {}, requestOptions);

      await chatSession.sendMessage('hello');

      expect(await chatSession.getHistory()).toEqual([
        { role: 'user', parts: [{ type: 'text', text: 'hello' }] },
        { role: 'model', parts: [{ type: 'text', text: 'hi back' }] },
      ]);
    });
  });

  describe('sendMessageStream()', () => {
    it('generateContentStream errors should be catchable', async () => {
      jest.useFakeTimers();
      const consoleStub = jest.spyOn(console, 'error').mockImplementation(() => {});
      const generateContentStreamStub = jest
        .spyOn(generateContentMethods, 'generateContentStream')
        .mockRejectedValue('generateContentStream failed');
      const chatSession = new ChatSessionImpl(fakeApiSettings, 'a-model', {}, requestOptions);
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
      const chatSession = new ChatSessionImpl(fakeApiSettings, 'a-model', {}, requestOptions);

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
                  type: 'functionCall',
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
              parts: [{ type: 'text', text: 'It is 72 degrees.' }],
            },
          },
        ],
        functionCalls: () => undefined,
      } as EnhancedGenerateContentResponse;
      const generateContentStreamStub = jest
        .spyOn(generateContentMethods, 'generateContentStream')
        .mockResolvedValueOnce(streamResult(functionCallResponse))
        .mockResolvedValueOnce(streamResult(finalResponse));
      const chatSession = new ChatSessionImpl(
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
          parts: [{ type: 'text', text: 'weather in London' }],
        },
        {
          role: 'model',
          parts: [
            {
              type: 'functionCall',
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
              type: 'functionResponse',
              functionResponse: {
                name: 'getWeather',
                response: { temperature: 72 },
              },
            },
          ],
        },
        {
          role: 'model',
          parts: [{ type: 'text', text: 'It is 72 degrees.' }],
        },
      ]);
    });

    it('downstream sendPromise errors should log but not throw', async () => {
      const consoleStub = jest.spyOn(console, 'error').mockImplementation(() => {});
      // make response undefined so that response.candidates errors
      const generateContentStreamStub = jest
        .spyOn(generateContentMethods, 'generateContentStream')
        .mockResolvedValue({} as unknown as GenerateContentStreamResult);
      const chatSession = new ChatSessionImpl(fakeApiSettings, 'a-model', {}, requestOptions);
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

    it('logs a warning when the stream response is blocked and does not update history', async () => {
      const warnStub = jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest
        .spyOn(generateContentMethods, 'generateContentStream')
        .mockResolvedValue(streamResult(blockedResponse));
      const chatSession = new ChatSessionImpl(fakeApiSettings, 'a-model', {}, requestOptions);

      const result = await chatSession.sendMessageStream('hello');
      await result.response;
      expect(await chatSession.getHistory()).toEqual([]);

      expect(warnStub).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('sendMessageStream() was unsuccessful'),
      );
    });

    it('defaults missing stream response role to model when updating history', async () => {
      const response = {
        candidates: [
          {
            index: 0,
            content: {
              parts: [{ type: 'text', text: 'streamed' }],
            },
          },
        ],
      } as EnhancedGenerateContentResponse;
      jest
        .spyOn(generateContentMethods, 'generateContentStream')
        .mockResolvedValue(streamResult(response));
      const chatSession = new ChatSessionImpl(fakeApiSettings, 'a-model', {}, requestOptions);

      const result = await chatSession.sendMessageStream('hello');
      await result.response;

      expect(await chatSession.getHistory()).toEqual([
        { role: 'user', parts: [{ type: 'text', text: 'hello' }] },
        { role: 'model', parts: [{ type: 'text', text: 'streamed' }] },
      ]);
    });
  });
});

describe('TemplateChatSession', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('validates and stores provided history', async () => {
    const history = [{ role: 'user' as const, parts: [{ type: 'text' as const, text: 'hi' }] }];
    const chatSession = new TemplateChatSessionImpl(fakeApiSettings, {
      templateId: 'tmpl',
      templateVariables: {},
      history,
    });
    expect(await chatSession.getHistory()).toEqual(history);
  });

  it('logs a warning when template sendMessage is blocked', async () => {
    const warnStub = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const templateGenerateContentStub = jest
      .spyOn(generateContentMethods, 'templateGenerateContent')
      .mockResolvedValue({ response: blockedResponse } as any);
    const chatSession = new TemplateChatSessionImpl(
      fakeApiSettings,
      // Runtime may omit templateVariables; exercise the no-inputs request branch.
      { templateId: 'tmpl', templateVariables: undefined as unknown as Record<string, unknown> },
      requestOptions,
    );

    await chatSession.sendMessage('hello');

    expect(templateGenerateContentStub).toHaveBeenCalledWith(
      fakeApiSettings,
      'tmpl',
      expect.objectContaining({
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hello' }] }],
      }),
      requestOptions,
    );
    expect(templateGenerateContentStub.mock.calls[0]?.[2]).not.toHaveProperty('inputs');
    expect(warnStub).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('sendMessage() was unsuccessful'),
    );
    expect(await chatSession.getHistory()).toEqual([]);
  });

  it('defaults missing template response role to model when updating history', async () => {
    jest.spyOn(generateContentMethods, 'templateGenerateContent').mockResolvedValue({
      response: {
        candidates: [
          {
            index: 0,
            content: {
              parts: [{ type: 'text', text: 'templated' }],
            },
          },
        ],
      },
    } as any);
    const chatSession = new TemplateChatSessionImpl(fakeApiSettings, {
      templateId: 'tmpl',
      templateVariables: { name: 'Ada' },
    });

    await chatSession.sendMessage('hello');

    expect(await chatSession.getHistory()).toEqual([
      { role: 'user', parts: [{ type: 'text', text: 'hello' }] },
      { role: 'model', parts: [{ type: 'text', text: 'templated' }] },
    ]);
  });

  it('logs a warning when template sendMessageStream is blocked', async () => {
    const warnStub = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest
      .spyOn(generateContentMethods, 'templateGenerateContentStream')
      .mockResolvedValue(streamResult(blockedResponse));
    const chatSession = new TemplateChatSessionImpl(fakeApiSettings, {
      templateId: 'tmpl',
      templateVariables: {},
    });

    const result = await chatSession.sendMessageStream('hello');
    await result.response;
    expect(await chatSession.getHistory()).toEqual([]);

    expect(warnStub).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('sendMessageStream() was unsuccessful'),
    );
  });

  it('template generateContentStream errors should be catchable without logging', async () => {
    jest.useFakeTimers();
    const consoleStub = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest
      .spyOn(generateContentMethods, 'templateGenerateContentStream')
      .mockRejectedValue('templateGenerateContentStream failed');
    const chatSession = new TemplateChatSessionImpl(
      fakeApiSettings,
      { templateId: 'tmpl', templateVariables: {} },
      requestOptions,
    );

    await expect(chatSession.sendMessageStream('hello')).rejects.toMatch(
      /templateGenerateContentStream failed/,
    );
    jest.runAllTimers();
    expect(consoleStub).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('template downstream sendPromise errors should log but not throw', async () => {
    const consoleStub = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest
      .spyOn(generateContentMethods, 'templateGenerateContentStream')
      .mockResolvedValue({} as unknown as GenerateContentStreamResult);
    const chatSession = new TemplateChatSessionImpl(fakeApiSettings, {
      templateId: 'tmpl',
      templateVariables: {},
    });

    await chatSession.sendMessageStream('hello');
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(consoleStub).toHaveBeenCalledTimes(1);
  });

  it('defaults missing template stream response role to model when updating history', async () => {
    const response = {
      candidates: [
        {
          index: 0,
          content: {
            parts: [{ type: 'text', text: 'streamed template' }],
          },
        },
      ],
    } as EnhancedGenerateContentResponse;
    jest
      .spyOn(generateContentMethods, 'templateGenerateContentStream')
      .mockResolvedValue(streamResult(response));
    const chatSession = new TemplateChatSessionImpl(fakeApiSettings, {
      templateId: 'tmpl',
      templateVariables: {},
    });

    const result = await chatSession.sendMessageStream('hello');
    await result.response;

    expect(await chatSession.getHistory()).toEqual([
      { role: 'user', parts: [{ type: 'text', text: 'hello' }] },
      { role: 'model', parts: [{ type: 'text', text: 'streamed template' }] },
    ]);
  });
});
