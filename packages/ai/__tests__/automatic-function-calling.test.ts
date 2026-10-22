/**
 * @license
 * Copyright 2026 Google LLC
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
 */
import { describe, expect, it, jest } from '@jest/globals';
import {
  generateContentStreamWithAutomaticFunctionCalling,
  generateContentWithAutomaticFunctionCalling,
  templateGenerateContentStreamWithAutomaticFunctionCalling,
  templateGenerateContentWithAutomaticFunctionCalling,
} from '../lib/methods/automatic-function-calling';
import { createEnhancedContentResponse } from '../lib/requests/response-helpers';
import { AgentPlatformBackend } from '../lib/backend';
import { ApiSettings } from '../lib/types/internal';
import {
  EnhancedGenerateContentResponse,
  GenerateContentResult,
  GenerateContentStreamResult,
} from '../lib/types';
import * as generateContentMethods from '../lib/methods/generate-content';

const fakeApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  appId: 'my-appid',
  location: 'us-central1',
  backend: new AgentPlatformBackend(),
};

function resultWithCalls(
  calls: Array<{ name: string; args: object; id?: string }> | undefined,
  candidates?: GenerateContentResult['response']['candidates'],
): GenerateContentResult {
  const base = createEnhancedContentResponse({
    candidates:
      candidates ??
      (calls?.length
        ? [
            {
              index: 0,
              content: {
                role: 'model',
                parts: calls.map(call => ({
                  type: 'functionCall' as const,
                  functionCall: call,
                })),
              },
            },
          ]
        : [
            {
              index: 0,
              content: { role: 'model', parts: [{ type: 'text' as const, text: 'done' }] },
            },
          ]),
  });
  return { response: base };
}

function streamResultWithCalls(
  calls: Array<{ name: string; args: object; id?: string }> | undefined,
): GenerateContentStreamResult {
  const response = resultWithCalls(calls).response;
  return {
    stream: (async function* () {
      yield response;
    })(),
    response: Promise.resolve(response),
  };
}

describe('automatic-function-calling early returns', () => {
  it('returns immediately when unary response has no function calls', async () => {
    const initial = resultWithCalls(undefined);
    const out = await generateContentWithAutomaticFunctionCalling(
      fakeApiSettings,
      'model',
      { contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }] },
      initial,
    );
    expect(out.result).toBe(initial);
    expect(out.addedContents).toEqual([]);
  });

  it('stops when a function call has no matching functionReference', async () => {
    const initial = resultWithCalls([{ name: 'missing', args: {} }]);
    const out = await generateContentWithAutomaticFunctionCalling(
      fakeApiSettings,
      'model',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [
          {
            functionDeclarations: [
              {
                name: 'other',
                description: 'other',
                functionReference: () => ({}),
              },
            ],
          },
        ],
      },
      initial,
    );
    expect(out.result).toBe(initial);
    expect(out.addedContents).toEqual([]);
  });

  it('stops when model response has no candidate content', async () => {
    const emptyCandidateResponse = createEnhancedContentResponse({
      candidates: [{ index: 0, content: undefined as any }],
    });
    // Force functionCalls() to report a call while candidates lack content.
    (emptyCandidateResponse as EnhancedGenerateContentResponse).functionCalls = () => [
      { name: 'getWeather', args: {} },
    ];
    const initial = { response: emptyCandidateResponse };
    const out = await generateContentWithAutomaticFunctionCalling(
      fakeApiSettings,
      'model',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [
          {
            functionDeclarations: [
              {
                name: 'getWeather',
                description: 'weather',
                functionReference: () => ({ temp: 1 }),
              },
            ],
          },
        ],
      },
      initial,
    );
    expect(out.result).toBe(initial);
    expect(out.addedContents).toEqual([]);
  });

  it('template unary stops when functionReference is missing', async () => {
    const initial = resultWithCalls([{ name: 'missing', args: {} }]);
    const out = await templateGenerateContentWithAutomaticFunctionCalling(
      fakeApiSettings,
      'tmpl',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [
          {
            functionDeclarations: [
              {
                name: 'other',
                functionReference: () => ({}),
              },
            ],
          },
        ],
      },
      initial,
    );
    expect(out.result).toBe(initial);
    expect(out.addedContents).toEqual([]);
  });

  it('stream AFC returns early when tools have no functionReferences', async () => {
    const initial = streamResultWithCalls([{ name: 'getWeather', args: {} }]);
    const out = await generateContentStreamWithAutomaticFunctionCalling(
      fakeApiSettings,
      'model',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [{ functionDeclarations: [{ name: 'getWeather', description: 'weather' }] }],
      },
      initial,
    );
    expect(out.result).toBe(initial);
    expect(out.addedContents).toEqual([]);
  });

  it('stream AFC stops when functionReference is missing for a call', async () => {
    const initial = streamResultWithCalls([{ name: 'missing', args: {} }]);
    const out = await generateContentStreamWithAutomaticFunctionCalling(
      fakeApiSettings,
      'model',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [
          {
            functionDeclarations: [
              {
                name: 'other',
                description: 'other',
                functionReference: () => ({}),
              },
            ],
          },
        ],
      },
      initial,
    );
    expect(out.result).toBe(initial);
    expect(out.addedContents).toEqual([]);
  });

  it('template stream AFC returns early when tools have no functionReferences', async () => {
    const initial = streamResultWithCalls([{ name: 'getWeather', args: {} }]);
    const out = await templateGenerateContentStreamWithAutomaticFunctionCalling(
      fakeApiSettings,
      'tmpl',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [{ functionDeclarations: [{ name: 'getWeather' }] }],
      },
      initial,
    );
    expect(out.result).toBe(initial);
    expect(out.addedContents).toEqual([]);
  });

  it('template stream AFC stops when model response has no content', async () => {
    const emptyResponse = createEnhancedContentResponse({
      candidates: [{ index: 0, content: undefined as any }],
    });
    (emptyResponse as EnhancedGenerateContentResponse).functionCalls = () => [
      { name: 'getWeather', args: {} },
    ];
    const initial: GenerateContentStreamResult = {
      stream: (async function* () {
        yield emptyResponse;
      })(),
      response: Promise.resolve(emptyResponse),
    };
    const out = await templateGenerateContentStreamWithAutomaticFunctionCalling(
      fakeApiSettings,
      'tmpl',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [
          {
            functionDeclarations: [
              {
                name: 'getWeather',
                functionReference: () => ({ temp: 1 }),
              },
            ],
          },
        ],
      },
      initial,
    );
    expect(out.result).toBe(initial);
    expect(out.addedContents).toEqual([]);
  });

  it('unary AFC exhausts the sequential call budget and returns the last result', async () => {
    const generateContentSpy = jest
      .spyOn(generateContentMethods, 'generateContent')
      .mockResolvedValue(resultWithCalls([{ name: 'getWeather', args: { city: 'x' } }]));
    const initial = resultWithCalls([{ name: 'getWeather', args: { city: 'x' } }]);
    const out = await generateContentWithAutomaticFunctionCalling(
      fakeApiSettings,
      'model',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [
          {
            functionDeclarations: [
              {
                name: 'getWeather',
                description: 'weather',
                functionReference: () => ({ temp: 1 }),
              },
            ],
          },
        ],
      },
      initial,
      { maxSequentialFunctionCalls: 1 },
    );
    expect(generateContentSpy).toHaveBeenCalledTimes(1);
    expect(out.addedContents.length).toBe(2);
    generateContentSpy.mockRestore();
  });

  it('template unary AFC exhausts the sequential call budget and returns the last result', async () => {
    const templateGenerateContentSpy = jest
      .spyOn(generateContentMethods, 'templateGenerateContent')
      .mockResolvedValue(resultWithCalls([{ name: 'getWeather', args: { city: 'x' } }]));
    const initial = resultWithCalls([{ name: 'getWeather', args: { city: 'x' } }]);
    const out = await templateGenerateContentWithAutomaticFunctionCalling(
      fakeApiSettings,
      'tmpl',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [
          {
            functionDeclarations: [
              {
                name: 'getWeather',
                functionReference: () => ({ temp: 1 }),
              },
            ],
          },
        ],
      },
      initial,
      { maxSequentialFunctionCalls: 1 },
    );
    expect(templateGenerateContentSpy).toHaveBeenCalledTimes(1);
    expect(out.addedContents.length).toBe(2);
    templateGenerateContentSpy.mockRestore();
  });

  it('stream AFC exhausts the sequential call budget and returns the last result', async () => {
    const generateContentStreamSpy = jest
      .spyOn(generateContentMethods, 'generateContentStream')
      .mockResolvedValue(streamResultWithCalls([{ name: 'getWeather', args: { city: 'x' } }]));
    const initial = streamResultWithCalls([{ name: 'getWeather', args: { city: 'x' } }]);
    const out = await generateContentStreamWithAutomaticFunctionCalling(
      fakeApiSettings,
      'model',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [
          {
            functionDeclarations: [
              {
                name: 'getWeather',
                description: 'weather',
                functionReference: () => ({ temp: 1 }),
              },
            ],
          },
        ],
      },
      initial,
      { maxSequentialFunctionCalls: 1 },
    );
    expect(generateContentStreamSpy).toHaveBeenCalledTimes(1);
    expect(out.addedContents.length).toBe(2);
    generateContentStreamSpy.mockRestore();
  });

  it('template stream AFC exhausts the sequential call budget and returns the last result', async () => {
    const templateGenerateContentStreamSpy = jest
      .spyOn(generateContentMethods, 'templateGenerateContentStream')
      .mockResolvedValue(streamResultWithCalls([{ name: 'getWeather', args: { city: 'x' } }]));
    const initial = streamResultWithCalls([{ name: 'getWeather', args: { city: 'x' } }]);
    const out = await templateGenerateContentStreamWithAutomaticFunctionCalling(
      fakeApiSettings,
      'tmpl',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [
          {
            functionDeclarations: [
              {
                name: 'getWeather',
                functionReference: () => ({ temp: 1 }),
              },
            ],
          },
        ],
      },
      initial,
      { maxSequentialFunctionCalls: 1 },
    );
    expect(templateGenerateContentStreamSpy).toHaveBeenCalledTimes(1);
    expect(out.addedContents.length).toBe(2);
    templateGenerateContentStreamSpy.mockRestore();
  });

  it('template stream AFC stops when functionReference is missing for a call', async () => {
    const initial = streamResultWithCalls([{ name: 'missing', args: {} }]);
    const out = await templateGenerateContentStreamWithAutomaticFunctionCalling(
      fakeApiSettings,
      'tmpl',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [
          {
            functionDeclarations: [
              {
                name: 'other',
                functionReference: () => ({}),
              },
            ],
          },
        ],
      },
      initial,
    );
    expect(out.result).toBe(initial);
    expect(out.addedContents).toEqual([]);
  });

  it('template unary stops when model response has no content', async () => {
    const emptyCandidateResponse = createEnhancedContentResponse({
      candidates: [{ index: 0, content: undefined as any }],
    });
    (emptyCandidateResponse as EnhancedGenerateContentResponse).functionCalls = () => [
      { name: 'getWeather', args: {} },
    ];
    const initial = { response: emptyCandidateResponse };
    const out = await templateGenerateContentWithAutomaticFunctionCalling(
      fakeApiSettings,
      'tmpl',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [
          {
            functionDeclarations: [
              {
                name: 'getWeather',
                functionReference: () => ({ temp: 1 }),
              },
            ],
          },
        ],
      },
      initial,
    );
    expect(out.result).toBe(initial);
    expect(out.addedContents).toEqual([]);
  });

  it('stream AFC stops when model response has no content', async () => {
    const emptyResponse = createEnhancedContentResponse({
      candidates: [{ index: 0, content: undefined as any }],
    });
    (emptyResponse as EnhancedGenerateContentResponse).functionCalls = () => [
      { name: 'getWeather', args: {} },
    ];
    const initial: GenerateContentStreamResult = {
      stream: (async function* () {
        yield emptyResponse;
      })(),
      response: Promise.resolve(emptyResponse),
    };
    const out = await generateContentStreamWithAutomaticFunctionCalling(
      fakeApiSettings,
      'model',
      {
        contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
        tools: [
          {
            functionDeclarations: [
              {
                name: 'getWeather',
                description: 'weather',
                functionReference: () => ({ temp: 1 }),
              },
            ],
          },
        ],
      },
      initial,
    );
    expect(out.result).toBe(initial);
    expect(out.addedContents).toEqual([]);
  });

  it('callFunctionReferences returns undefined when tools are missing', async () => {
    const initial = resultWithCalls([{ name: 'getWeather', args: {} }]);
    const out = await generateContentWithAutomaticFunctionCalling(
      fakeApiSettings,
      'model',
      { contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }] },
      initial,
    );
    expect(out.result).toBe(initial);
    expect(out.addedContents).toEqual([]);
  });
});
