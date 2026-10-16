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
import { describe, expect, it, afterEach, jest, beforeEach } from '@jest/globals';
import { BackendName, getMockResponse, getMockResponseStreaming } from './test-utils/mock-response';
import * as request from '../lib/requests/request';
import {
  generateContent,
  generateContentStream,
  templateGenerateContent,
  templateGenerateContentStream,
} from '../lib/methods/generate-content';
import {
  GenerateContentRequest,
  HarmBlockMethod,
  HarmBlockThreshold,
  HarmCategory,
  Language,
  Outcome,
  ThinkingLevel,
  // RequestOptions,
} from '../lib/types';
import { ApiSettings } from '../lib/types/internal';
import { ServerPromptTemplateTask, Task } from '../lib/requests/request';
import { GoogleAIBackend, AgentPlatformBackend } from '../lib/backend';
import { SpiedFunction } from 'jest-mock';
import { AIError } from '../lib/errors';
import { mapGenerateContentRequest } from '../lib/googleai-mappers';
import { cleanGenerateContentRequestForWire } from '../lib/requests/request-helpers';

const fakeApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  appId: 'my-appid',
  location: 'us-central1',
  backend: new AgentPlatformBackend(),
};

const fakeGoogleAIApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  appId: 'my-appid',
  location: 'us-central1',
  backend: new GoogleAIBackend(),
};

const fakeRequestParams: GenerateContentRequest = {
  contents: [{ parts: [{ type: 'text', text: 'hello' }], role: 'user' }],
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

const fakeGoogleAIRequestParams: GenerateContentRequest = {
  contents: [{ parts: [{ type: 'text', text: 'hello' }], role: 'user' }],
  generationConfig: {
    topK: 16,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ],
};

describe('generateContent()', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('short response', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-basic-reply-short.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(await result.response.text()).toContain('Mountain View, California');
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model',
        task: Task.GENERATE_CONTENT,
        apiSettings: fakeApiSettings,
        stream: false,
        requestOptions: undefined,
      }),
      expect.stringContaining('contents'),
    );
  });

  it('long response', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-basic-reply-long.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(result.response.text()).toContain('Use Freshly Ground Coffee');
    expect(result.response.text()).toContain('30 minutes of brewing');
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model',
        task: Task.GENERATE_CONTENT,
        apiSettings: fakeApiSettings,
        stream: false,
        requestOptions: undefined,
      }),
      expect.anything(),
    );
  });

  it('passes FunctionResponse.parts through in request bodies', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-basic-reply-short.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const params: GenerateContentRequest = {
      contents: [
        {
          role: 'function',
          parts: [
            {
              type: 'functionResponse',
              functionResponse: {
                name: 'getWeather',
                response: { temperature: 72 },
                parts: [{ type: 'text', text: 'Weather lookup complete.' }],
              },
            },
          ],
        },
      ],
    };

    await generateContent(fakeApiSettings, 'model', params);

    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model',
        task: Task.GENERATE_CONTENT,
      }),
      expect.stringContaining('"parts":[{"text":"Weather lookup complete."}]'),
    );
  });

  it('long response with token details', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-basic-response-long-usage-metadata.json',
    ) as Response;
    const mockResponseJson = await mockResponse.json();
    mockResponseJson.usageMetadata = {
      ...mockResponseJson.usageMetadata,
      toolUsePromptTokenCount: 3,
      toolUsePromptTokensDetails: [{ modality: 'TEXT', tokenCount: 3 }],
      cachedContentTokenCount: 5,
      cacheTokensDetails: [{ modality: 'TEXT', tokenCount: 5 }],
    };
    const makeRequestStub = jest.spyOn(request, 'makeRequest').mockResolvedValue({
      ...mockResponse,
      json: () => Promise.resolve(mockResponseJson),
    } as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(result.response.usageMetadata?.totalTokenCount).toEqual(1913);
    expect(result.response.usageMetadata?.candidatesTokenCount).toEqual(76);
    expect(result.response.usageMetadata?.promptTokensDetails?.[0]?.modality).toEqual('IMAGE');
    expect(result.response.usageMetadata?.promptTokensDetails?.[0]?.tokenCount).toEqual(1806);
    expect(result.response.usageMetadata?.candidatesTokensDetails?.[0]?.modality).toEqual('TEXT');
    expect(result.response.usageMetadata?.candidatesTokensDetails?.[0]?.tokenCount).toEqual(76);
    expect(result.response.usageMetadata).toMatchObject({
      toolUsePromptTokenCount: 3,
      toolUsePromptTokensDetails: [{ modality: 'TEXT', tokenCount: 3 }],
      cachedContentTokenCount: 5,
      cacheTokensDetails: [{ modality: 'TEXT', tokenCount: 5 }],
    });
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model',
        task: Task.GENERATE_CONTENT,
        apiSettings: fakeApiSettings,
        stream: false,
        requestOptions: undefined,
      }),
      expect.anything(),
    );
  });

  it('citations', async () => {
    const mockResponse = getMockResponse(BackendName.VertexAI, 'unary-success-citations.json');
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(result.response.text()).toContain('Some information cited from an external source');
    expect(result.response.candidates?.[0]!.citationMetadata?.citations.length).toBe(3);
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model',
        task: Task.GENERATE_CONTENT,
        apiSettings: fakeApiSettings,
        stream: false,
        requestOptions: undefined,
      }),
      expect.anything(),
    );
  });

  it('codeExecution', async function () {
    const mockResponse = getMockResponse(BackendName.VertexAI, 'unary-success-code-execution.json');
    jest.spyOn(request, 'makeRequest').mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    const parts = result.response.candidates?.[0]?.content?.parts;
    expect(
      parts?.some(
        part =>
          (part as { codeExecutionResult?: { outcome?: Outcome } }).codeExecutionResult?.outcome ===
          Outcome.OK,
      ),
    ).toBe(true);
    expect(
      parts?.some(
        part =>
          (part as { executableCode?: { language?: Language } }).executableCode?.language ===
          Language.PYTHON,
      ),
    ).toBe(true);
  });

  it('blocked prompt', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-failure-prompt-blocked-safety.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);

    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);

    expect(() => result.response.text()).toThrow('SAFETY');
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model',
        task: Task.GENERATE_CONTENT,
        apiSettings: fakeApiSettings,
        stream: false,
        requestOptions: undefined,
      }),
      expect.anything(),
    );
  });

  it('finishReason safety', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-failure-finish-reason-safety.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(() => result.response.text()).toThrow('SAFETY');
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model',
        task: Task.GENERATE_CONTENT,
        apiSettings: fakeApiSettings,
        stream: false,
        requestOptions: undefined,
      }),
      expect.anything(),
    );
  });

  it('empty content', async () => {
    const mockResponse = getMockResponse(BackendName.VertexAI, 'unary-failure-empty-content.json');
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(result.response.text()).toBe('');
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model',
        task: Task.GENERATE_CONTENT,
        apiSettings: fakeApiSettings,
        stream: false,
        requestOptions: undefined,
      }),
      expect.anything(),
    );
  });

  it('unknown enum - should ignore', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-unknown-enum-safety-ratings.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContent(fakeApiSettings, 'model', fakeRequestParams);
    expect(result.response.text()).toContain('Some text');
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model',
        task: Task.GENERATE_CONTENT,
        apiSettings: fakeApiSettings,
        stream: false,
        requestOptions: undefined,
      }),
      expect.anything(),
    );
  });

  it('image rejected (400)', async () => {
    const mockResponse = getMockResponse(BackendName.VertexAI, 'unary-failure-image-rejected.json');
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
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-failure-firebasevertexai-api-not-enabled.json',
    );
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

  describe('googleAI', () => {
    let makeRequestStub: SpiedFunction<typeof request.makeRequest>;

    beforeEach(() => {
      makeRequestStub = jest.spyOn(request, 'makeRequest');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('throws error when method is defined', async () => {
      const mockResponse = getMockResponse(
        BackendName.GoogleAI,
        'unary-success-basic-reply-short.txt',
      );
      makeRequestStub.mockResolvedValue(mockResponse as Response);

      const requestParamsWithMethod: GenerateContentRequest = {
        contents: [{ parts: [{ type: 'text', text: 'hello' }], role: 'user' }],
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            method: HarmBlockMethod.SEVERITY, // Unsupported in Google AI.
          },
        ],
      };

      // Expect generateContent to throw a AIError that method is not supported.
      await expect(
        generateContent(fakeGoogleAIApiSettings, 'model', requestParamsWithMethod),
      ).rejects.toThrow(AIError);
      expect(makeRequestStub).not.toHaveBeenCalled();
    });

    it('maps request to GoogleAI format', async () => {
      const mockResponse = getMockResponse(
        BackendName.GoogleAI,
        'unary-success-basic-reply-short.txt',
      );
      makeRequestStub.mockResolvedValue(mockResponse as Response);

      await generateContent(fakeGoogleAIApiSettings, 'model', fakeGoogleAIRequestParams);

      expect(makeRequestStub).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'model',
          task: Task.GENERATE_CONTENT,
          apiSettings: fakeGoogleAIApiSettings,
          stream: false,
          requestOptions: undefined,
        }),
        JSON.stringify(
          cleanGenerateContentRequestForWire(mapGenerateContentRequest(fakeGoogleAIRequestParams)),
        ),
      );
    });
  });
});

describe('generateContentStream()', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('streams a short response', async () => {
    const mockResponse = getMockResponseStreaming(
      BackendName.VertexAI,
      'streaming-success-basic-reply-short.txt',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const result = await generateContentStream(fakeApiSettings, 'model', fakeRequestParams);
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model',
        task: Task.STREAM_GENERATE_CONTENT,
        apiSettings: fakeApiSettings,
        stream: true,
      }),
      expect.stringContaining('contents'),
    );
    const chunks: string[] = [];
    for await (const item of result.stream) {
      const text = item.text();
      if (text) {
        chunks.push(text);
      }
    }
    expect(chunks.join('').length).toBeGreaterThan(0);
    const aggregated = await result.response;
    expect(aggregated.text().length).toBeGreaterThan(0);
  });

  it('maps Google AI streaming requests', async () => {
    const mockResponse = getMockResponseStreaming(
      BackendName.GoogleAI,
      'streaming-success-basic-reply-short.txt',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    await generateContentStream(fakeGoogleAIApiSettings, 'model', fakeGoogleAIRequestParams);
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'model',
        task: Task.STREAM_GENERATE_CONTENT,
        apiSettings: fakeGoogleAIApiSettings,
        stream: true,
      }),
      JSON.stringify(
        cleanGenerateContentRequestForWire(mapGenerateContentRequest(fakeGoogleAIRequestParams)),
      ),
    );
  });

  it('rejects when thinkingBudget and thinkingLevel are both set', async () => {
    await expect(
      generateContentStream(fakeApiSettings, 'model', {
        ...fakeRequestParams,
        generationConfig: {
          thinkingConfig: {
            thinkingBudget: 100,
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      }),
    ).rejects.toThrow('Cannot set both thinkingBudget and thinkingLevel in a config.');
  });
});

describe('templateGenerateContent()', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls makeRequest with template task and returns text', async () => {
    const mockResponse = getMockResponse(
      BackendName.VertexAI,
      'unary-success-basic-reply-short.json',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const templateParams = {
      inputs: { city: 'Boston' },
      toolConfig: { retrievalConfig: { languageCode: 'en-US' } },
    };
    const result = await templateGenerateContent(
      fakeApiSettings,
      'weather-assistant-template',
      templateParams,
    );
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        task: ServerPromptTemplateTask.TEMPLATE_GENERATE_CONTENT,
        templateId: 'weather-assistant-template',
        apiSettings: fakeApiSettings,
        stream: false,
      }),
      JSON.stringify(templateParams),
    );
    expect(await result.response.text()).toContain('Mountain View, California');
  });

  it('maps Google AI template unary responses', async () => {
    const mockResponse = getMockResponse(
      BackendName.GoogleAI,
      'unary-success-basic-reply-short.txt',
    );
    jest.spyOn(request, 'makeRequest').mockResolvedValue(mockResponse as Response);
    const result = await templateGenerateContent(fakeGoogleAIApiSettings, 'tmpl', {
      inputs: { q: 'hi' },
    });
    expect((await result.response.text()).length).toBeGreaterThan(0);
  });
});

describe('templateGenerateContentStream()', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls makeRequest with template stream task', async () => {
    const mockResponse = getMockResponseStreaming(
      BackendName.VertexAI,
      'streaming-success-basic-reply-short.txt',
    );
    const makeRequestStub = jest
      .spyOn(request, 'makeRequest')
      .mockResolvedValue(mockResponse as Response);
    const templateParams = { inputs: { city: 'Boston' } };
    const result = await templateGenerateContentStream(
      fakeApiSettings,
      'weather-assistant-template',
      templateParams,
    );
    expect(makeRequestStub).toHaveBeenCalledWith(
      expect.objectContaining({
        task: ServerPromptTemplateTask.TEMPLATE_STREAM_GENERATE_CONTENT,
        templateId: 'weather-assistant-template',
        apiSettings: fakeApiSettings,
        stream: true,
      }),
      JSON.stringify(templateParams),
    );
    const aggregated = await result.response;
    expect(aggregated.text().length).toBeGreaterThan(0);
  });
});
