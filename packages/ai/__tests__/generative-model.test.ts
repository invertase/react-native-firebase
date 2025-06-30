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
import { describe, expect, it, jest } from '@jest/globals';
import { type ReactNativeFirebase } from '@react-native-firebase/app';
import { GenerativeModel } from '../lib/models/generative-model';
import { AI, FunctionCallingMode } from '../lib/public-types';
import * as request from '../lib/requests/request';
import { BackendName, getMockResponse } from './test-utils/mock-response';
import { VertexAIBackend } from '../lib/backend';

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

describe('GenerativeModel', () => {
  it('passes params through to generateContent', async () => {
    const genModel = new GenerativeModel(fakeAI, {
      model: 'my-model',
      tools: [
        {
          functionDeclarations: [
            {
              name: 'myfunc',
              description: 'mydesc',
            },
          ],
        },
      ],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.NONE } },
      systemInstruction: { role: 'system', parts: [{ text: 'be friendly' }] },
    });
    expect(genModel.tools?.length).toBe(1);
    expect(genModel.toolConfig?.functionCallingConfig?.mode).toBe(FunctionCallingMode.NONE);
    expect(genModel.systemInstruction?.parts[0]!.text).toBe('be friendly');
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-basic-reply-short.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    await genModel.generateContent('hello');
    expect(makeRequestStub).toHaveBeenCalledWith(
      'publishers/google/models/my-model',
      request.Task.GENERATE_CONTENT,
      expect.anything(),
      false,
      expect.stringMatching(new RegExp(`myfunc|be friendly|${FunctionCallingMode.NONE}`)),
      {},
    );
    makeRequestStub.mockRestore();
  });

  it('passes text-only systemInstruction through to generateContent', async () => {
    const genModel = new GenerativeModel(fakeAI, {
      model: 'my-model',
      systemInstruction: 'be friendly',
    });
    expect(genModel.systemInstruction?.parts[0]!.text).toBe('be friendly');
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-basic-reply-short.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    await genModel.generateContent('hello');
    expect(makeRequestStub).toHaveBeenCalledWith(
      'publishers/google/models/my-model',
      request.Task.GENERATE_CONTENT,
      expect.anything(),
      false,
      expect.stringContaining('be friendly'),
      {},
    );
    makeRequestStub.mockRestore();
  });

  it('generateContent overrides model values', async () => {
    const genModel = new GenerativeModel(fakeAI, {
      model: 'my-model',
      tools: [
        {
          functionDeclarations: [
            {
              name: 'myfunc',
              description: 'mydesc',
            },
          ],
        },
      ],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.NONE } },
      systemInstruction: { role: 'system', parts: [{ text: 'be friendly' }] },
    });
    expect(genModel.tools?.length).toBe(1);
    expect(genModel.toolConfig?.functionCallingConfig?.mode).toBe(FunctionCallingMode.NONE);
    expect(genModel.systemInstruction?.parts[0]!.text).toBe('be friendly');
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-basic-reply-short.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    await genModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'hello' }] }],
      tools: [
        {
          functionDeclarations: [{ name: 'otherfunc', description: 'otherdesc' }],
        },
      ],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
      systemInstruction: { role: 'system', parts: [{ text: 'be formal' }] },
    });
    expect(makeRequestStub).toHaveBeenCalledWith(
      'publishers/google/models/my-model',
      request.Task.GENERATE_CONTENT,
      expect.anything(),
      false,
      expect.stringMatching(new RegExp(`be formal|otherfunc|${FunctionCallingMode.AUTO}`)),
      {},
    );
    makeRequestStub.mockRestore();
  });

  it('passes base model params through to ChatSession when there are no startChatParams', async () => {
    const genModel = new GenerativeModel(fakeAI, {
      model: 'my-model',
      generationConfig: {
        topK: 1,
      },
    });
    const chatSession = genModel.startChat();
    expect(chatSession.params?.generationConfig).toEqual({
      topK: 1,
    });
  });

  it('overrides base model params with startChatParams', () => {
    const genModel = new GenerativeModel(fakeAI, {
      model: 'my-model',
      generationConfig: {
        topK: 1,
      },
    });
    const chatSession = genModel.startChat({
      generationConfig: {
        topK: 2,
      },
    });
    expect(chatSession.params?.generationConfig).toEqual({
      topK: 2,
    });
  });

  it('passes params through to chat.sendMessage', async () => {
    const genModel = new GenerativeModel(fakeAI, {
      model: 'my-model',
      tools: [{ functionDeclarations: [{ name: 'myfunc', description: 'mydesc' }] }],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.NONE } },
      systemInstruction: { role: 'system', parts: [{ text: 'be friendly' }] },
    });
    expect(genModel.tools?.length).toBe(1);
    expect(genModel.toolConfig?.functionCallingConfig?.mode).toBe(FunctionCallingMode.NONE);
    expect(genModel.systemInstruction?.parts[0]!.text).toBe('be friendly');
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-basic-reply-short.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    await genModel.startChat().sendMessage('hello');
    expect(makeRequestStub).toHaveBeenCalledWith(
      'publishers/google/models/my-model',
      request.Task.GENERATE_CONTENT,
      expect.anything(),
      false,
      expect.stringMatching(new RegExp(`myfunc|be friendly|${FunctionCallingMode.NONE}`)),
      {},
    );
    makeRequestStub.mockRestore();
  });

  it('passes text-only systemInstruction through to chat.sendMessage', async () => {
    const genModel = new GenerativeModel(fakeAI, {
      model: 'my-model',
      systemInstruction: 'be friendly',
    });
    expect(genModel.systemInstruction?.parts[0]!.text).toBe('be friendly');
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-basic-reply-short.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    await genModel.startChat().sendMessage('hello');
    expect(makeRequestStub).toHaveBeenCalledWith(
      'publishers/google/models/my-model',
      request.Task.GENERATE_CONTENT,
      expect.anything(),
      false,
      expect.stringContaining('be friendly'),
      {},
    );
    makeRequestStub.mockRestore();
  });

  it('startChat overrides model values', async () => {
    const genModel = new GenerativeModel(fakeAI, {
      model: 'my-model',
      tools: [{ functionDeclarations: [{ name: 'myfunc', description: 'mydesc' }] }],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.NONE } },
      systemInstruction: { role: 'system', parts: [{ text: 'be friendly' }] },
    });
    expect(genModel.tools?.length).toBe(1);
    expect(genModel.toolConfig?.functionCallingConfig?.mode).toBe(FunctionCallingMode.NONE);
    expect(genModel.systemInstruction?.parts[0]!.text).toBe('be friendly');
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-basic-reply-short.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    await genModel
      .startChat({
        tools: [
          {
            functionDeclarations: [{ name: 'otherfunc', description: 'otherdesc' }],
          },
        ],
        toolConfig: {
          functionCallingConfig: { mode: FunctionCallingMode.AUTO },
        },
        systemInstruction: { role: 'system', parts: [{ text: 'be formal' }] },
      })
      .sendMessage('hello');
    expect(makeRequestStub).toHaveBeenCalledWith(
      'publishers/google/models/my-model',
      request.Task.GENERATE_CONTENT,
      expect.anything(),
      false,
      expect.stringMatching(new RegExp(`otherfunc|be formal|${FunctionCallingMode.AUTO}`)),
      {},
    );
    makeRequestStub.mockRestore();
  });

  it('calls countTokens', async () => {
    const genModel = new GenerativeModel(fakeAI, { model: 'my-model' });
    const mockResponse = getMockResponse(BackendName.VertexAI, 'unary-success-total-tokens.json');
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    await genModel.countTokens('hello');
    expect(makeRequestStub).toHaveBeenCalledWith(
      'publishers/google/models/my-model',
      request.Task.COUNT_TOKENS,
      expect.anything(),
      false,
      expect.stringContaining('hello'),
      undefined,
    );
    makeRequestStub.mockRestore();
  });
});
