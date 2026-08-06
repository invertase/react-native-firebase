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

import { describe, expect, it, afterEach, jest } from '@jest/globals';
import { type ReactNativeFirebase } from '@react-native-firebase/app';
import { AI } from '../lib/public-types';
import { VertexAIBackend } from '../lib/backend';
import { TemplateGenerativeModel } from '../lib/models/template-generative-model';
import * as generateContentMethods from '../lib/methods/generate-content';
import { EnhancedGenerateContentResponse, GenerateContentStreamResult } from '../lib/types';

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

const TEMPLATE_ID = 'my-template';
const TEMPLATE_VARS = { a: 1, b: '2' };

function streamResult(response: EnhancedGenerateContentResponse): GenerateContentStreamResult {
  return {
    stream: (async function* () {
      yield response;
    })(),
    response: Promise.resolve(response),
  };
}

describe('TemplateGenerativeModel', function () {
  afterEach(function () {
    jest.restoreAllMocks();
  });

  describe('constructor', function () {
    it('should initialize _apiSettings correctly', function () {
      const model = new TemplateGenerativeModel(fakeAI);
      expect(model._apiSettings.apiKey).toBe('key');
      expect(model._apiSettings.project).toBe('my-project');
      expect(model._apiSettings.appId).toBe('my-appid');
    });
  });

  describe('generateContent', function () {
    it('should call templateGenerateContent with correct parameters', async function () {
      const templateGenerateContentSpy = jest
        .spyOn(generateContentMethods, 'templateGenerateContent')
        .mockResolvedValue({} as any);
      const model = new TemplateGenerativeModel(fakeAI, { timeout: 5000 });

      await model.generateContent(TEMPLATE_ID, TEMPLATE_VARS);

      expect(templateGenerateContentSpy).toHaveBeenCalledTimes(1);
      expect(templateGenerateContentSpy).toHaveBeenCalledWith(
        model._apiSettings,
        TEMPLATE_ID,
        { inputs: TEMPLATE_VARS },
        { timeout: 5000 },
      );
    });

    it('should merge per-call request options over model request options', async function () {
      const controller = new AbortController();
      const templateGenerateContentSpy = jest
        .spyOn(generateContentMethods, 'templateGenerateContent')
        .mockResolvedValue({} as any);
      const model = new TemplateGenerativeModel(fakeAI, {
        timeout: 5000,
        baseUrl: 'https://model.example.com',
      });

      await model.generateContent(TEMPLATE_ID, TEMPLATE_VARS, {
        timeout: 2000,
        signal: controller.signal,
      });

      expect(templateGenerateContentSpy).toHaveBeenCalledWith(
        model._apiSettings,
        TEMPLATE_ID,
        { inputs: TEMPLATE_VARS },
        {
          timeout: 2000,
          baseUrl: 'https://model.example.com',
          signal: controller.signal,
        },
      );
    });
  });

  describe('generateContentStream', function () {
    it('should call templateGenerateContentStream with correct parameters', async function () {
      const templateGenerateContentStreamSpy = jest
        .spyOn(generateContentMethods, 'templateGenerateContentStream')
        .mockResolvedValue({} as any);
      const model = new TemplateGenerativeModel(fakeAI, { timeout: 5000 });

      await model.generateContentStream(TEMPLATE_ID, TEMPLATE_VARS);

      expect(templateGenerateContentStreamSpy).toHaveBeenCalledTimes(1);
      expect(templateGenerateContentStreamSpy).toHaveBeenCalledWith(
        model._apiSettings,
        TEMPLATE_ID,
        { inputs: TEMPLATE_VARS },
        { timeout: 5000 },
      );
    });

    it('should merge per-call request options over model request options', async function () {
      const controller = new AbortController();
      const templateGenerateContentStreamSpy = jest
        .spyOn(generateContentMethods, 'templateGenerateContentStream')
        .mockResolvedValue({} as any);
      const model = new TemplateGenerativeModel(fakeAI, {
        timeout: 5000,
        baseUrl: 'https://model.example.com',
      });

      await model.generateContentStream(TEMPLATE_ID, TEMPLATE_VARS, {
        timeout: 2000,
        signal: controller.signal,
      });

      expect(templateGenerateContentStreamSpy).toHaveBeenCalledWith(
        model._apiSettings,
        TEMPLATE_ID,
        { inputs: TEMPLATE_VARS },
        {
          timeout: 2000,
          baseUrl: 'https://model.example.com',
          signal: controller.signal,
        },
      );
    });
  });

  describe('startChat', function () {
    it('should create a template chat session with the configured request options', function () {
      const model = new TemplateGenerativeModel(fakeAI, { timeout: 5000 });
      const chat = model.startChat({
        templateId: TEMPLATE_ID,
        templateVariables: TEMPLATE_VARS,
      });

      expect(chat.params).toEqual({
        templateId: TEMPLATE_ID,
        templateVariables: TEMPLATE_VARS,
      });
      expect(chat.requestOptions).toEqual({ timeout: 5000 });
    });

    it('should call templateGenerateContent with template chat parameters', async function () {
      const templateGenerateContentSpy = jest
        .spyOn(generateContentMethods, 'templateGenerateContent')
        .mockResolvedValue({
          response: {
            candidates: [{ content: { parts: [{ text: 'hello back' }] } }],
          },
        } as any);
      const model = new TemplateGenerativeModel(fakeAI, {
        timeout: 5000,
        baseUrl: 'https://model.example.com',
      });
      const chat = model.startChat({
        templateId: TEMPLATE_ID,
        templateVariables: TEMPLATE_VARS,
      });
      const controller = new AbortController();

      await chat.sendMessage('hello', {
        timeout: 2000,
        signal: controller.signal,
      });

      expect(templateGenerateContentSpy).toHaveBeenCalledWith(
        model._apiSettings,
        TEMPLATE_ID,
        expect.objectContaining({
          inputs: TEMPLATE_VARS,
          contents: [{ role: 'user', parts: [{ text: 'hello' }] }],
        }),
        {
          timeout: 2000,
          baseUrl: 'https://model.example.com',
          signal: controller.signal,
        },
      );
      await expect(chat.getHistory()).resolves.toEqual([
        { role: 'user', parts: [{ text: 'hello' }] },
        { role: 'model', parts: [{ text: 'hello back' }] },
      ]);
    });

    it('automatically calls functionReference from template chat function calls', async function () {
      const getWeather = jest.fn<(args: object) => object>().mockReturnValue({ temperature: 72 });
      const functionCallResponse = {
        candidates: [
          {
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
            content: {
              role: 'model',
              parts: [{ text: 'It is 72 degrees.' }],
            },
          },
        ],
        text: () => 'It is 72 degrees.',
        functionCalls: () => undefined,
      } as EnhancedGenerateContentResponse;
      const templateGenerateContentSpy = jest
        .spyOn(generateContentMethods, 'templateGenerateContent')
        .mockResolvedValueOnce({ response: functionCallResponse })
        .mockResolvedValueOnce({ response: finalResponse });
      const model = new TemplateGenerativeModel(fakeAI, { timeout: 5000 });
      const chat = model.startChat({
        templateId: TEMPLATE_ID,
        templateVariables: TEMPLATE_VARS,
        tools: [
          {
            functionDeclarations: [
              {
                name: 'getWeather',
                functionReference: getWeather,
              },
            ],
          },
        ],
      });

      const result = await chat.sendMessage('weather in London');
      const history = await chat.getHistory();

      expect(result.response.text()).toBe('It is 72 degrees.');
      expect(getWeather).toHaveBeenCalledWith({ city: 'London' });
      expect(templateGenerateContentSpy).toHaveBeenCalledTimes(2);
      expect(templateGenerateContentSpy).toHaveBeenLastCalledWith(
        model._apiSettings,
        TEMPLATE_ID,
        expect.objectContaining({
          inputs: TEMPLATE_VARS,
          contents: [
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
          ],
        }),
        { timeout: 5000 },
      );
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

    it('should call templateGenerateContentStream with template chat parameters', async function () {
      const templateGenerateContentStreamSpy = jest
        .spyOn(generateContentMethods, 'templateGenerateContentStream')
        .mockResolvedValue({
          response: Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'stream back' }] } }],
          }),
        } as any);
      const model = new TemplateGenerativeModel(fakeAI, { timeout: 5000 });
      const chat = model.startChat({
        templateId: TEMPLATE_ID,
        templateVariables: TEMPLATE_VARS,
      });

      const result = await chat.sendMessageStream('hello');
      await result.response;

      expect(templateGenerateContentStreamSpy).toHaveBeenCalledWith(
        model._apiSettings,
        TEMPLATE_ID,
        expect.objectContaining({
          inputs: TEMPLATE_VARS,
          contents: [{ role: 'user', parts: [{ text: 'hello' }] }],
        }),
        { timeout: 5000 },
      );
      await expect(chat.getHistory()).resolves.toEqual([
        { role: 'user', parts: [{ text: 'hello' }] },
        { role: 'model', parts: [{ text: 'stream back' }] },
      ]);
    });

    it('automatically calls functionReference from streaming template chat function calls', async function () {
      const getWeather = jest.fn<(args: object) => object>().mockReturnValue({ temperature: 72 });
      const functionCallResponse = {
        candidates: [
          {
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
            content: {
              role: 'model',
              parts: [{ text: 'It is 72 degrees.' }],
            },
          },
        ],
        text: () => 'It is 72 degrees.',
        functionCalls: () => undefined,
      } as EnhancedGenerateContentResponse;
      const templateGenerateContentStreamSpy = jest
        .spyOn(generateContentMethods, 'templateGenerateContentStream')
        .mockResolvedValueOnce(streamResult(functionCallResponse))
        .mockResolvedValueOnce(streamResult(finalResponse));
      const model = new TemplateGenerativeModel(fakeAI, { timeout: 5000 });
      const chat = model.startChat({
        templateId: TEMPLATE_ID,
        templateVariables: TEMPLATE_VARS,
        tools: [
          {
            functionDeclarations: [
              {
                name: 'getWeather',
                functionReference: getWeather,
              },
            ],
          },
        ],
      });

      const result = await chat.sendMessageStream('weather in London');
      await result.response;
      const history = await chat.getHistory();

      expect(getWeather).toHaveBeenCalledWith({ city: 'London' });
      expect(templateGenerateContentStreamSpy).toHaveBeenCalledTimes(2);
      expect(templateGenerateContentStreamSpy).toHaveBeenLastCalledWith(
        model._apiSettings,
        TEMPLATE_ID,
        expect.objectContaining({
          inputs: TEMPLATE_VARS,
          contents: [
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
          ],
        }),
        { timeout: 5000 },
      );
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
  });
});
