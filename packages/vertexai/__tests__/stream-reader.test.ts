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
import { describe, expect, it, jest, afterEach, beforeAll } from '@jest/globals';
import { ReadableStream } from 'web-streams-polyfill';
import {
  aggregateResponses,
  getResponseStream,
  processStream,
} from '../lib/requests/stream-reader';

import { getChunkedStream, getMockResponseStreaming } from './test-utils/mock-response';
import {
  BlockReason,
  FinishReason,
  GenerateContentResponse,
  HarmCategory,
  HarmProbability,
  SafetyRating,
  VertexAIErrorCode,
} from '../lib/types';
import { VertexAIError } from '../lib/errors';

describe('stream-reader', () => {
  describe('getResponseStream', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('two lines', async () => {
      const src = [{ text: 'A' }, { text: 'B' }];
      const inputStream = getChunkedStream(
        src
          .map(v => JSON.stringify(v))
          .map(v => 'data: ' + v + '\r\n\r\n')
          .join(''),
      );

      const decodeStream = new ReadableStream<string>({
        async start(controller) {
          const reader = inputStream.getReader();
          const decoder = new TextDecoder('utf-8');
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            const decodedValue = decoder.decode(value, { stream: true });
            controller.enqueue(decodedValue);
          }
        },
      });

      const responseStream = getResponseStream<{ text: string }>(decodeStream);
      const reader = responseStream.getReader();
      const responses: Array<{ text: string }> = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        responses.push(value);
      }
      expect(responses).toEqual(src);
    });
  });

  describe('processStream', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('streaming response - short', async () => {
      const fakeResponse = getMockResponseStreaming('streaming-success-basic-reply-short.txt');
      const result = processStream(fakeResponse as Response);
      for await (const response of result.stream) {
        expect(response.text()).not.toBe('');
      }
      const aggregatedResponse = await result.response;
      expect(aggregatedResponse.text()).toContain('Cheyenne');
    });

    it('streaming response - functioncall', async () => {
      const fakeResponse = getMockResponseStreaming('streaming-success-function-call-short.txt');
      const result = processStream(fakeResponse as Response);
      for await (const response of result.stream) {
        expect(response.text()).toBe('');
        expect(response.functionCalls()).toEqual([
          {
            name: 'getTemperature',
            args: { city: 'San Jose' },
          },
        ]);
      }
      const aggregatedResponse = await result.response;
      expect(aggregatedResponse.text()).toBe('');
      expect(aggregatedResponse.functionCalls()).toEqual([
        {
          name: 'getTemperature',
          args: { city: 'San Jose' },
        },
      ]);
    });

    it('handles citations', async () => {
      const fakeResponse = getMockResponseStreaming('streaming-success-citations.txt');
      const result = processStream(fakeResponse as Response);
      const aggregatedResponse = await result.response;
      expect(aggregatedResponse.text()).toContain('Quantum mechanics is');
      expect(aggregatedResponse.candidates?.[0]!.citationMetadata?.citations.length).toBe(3);
      let foundCitationMetadata = false;
      for await (const response of result.stream) {
        expect(response.text()).not.toBe('');
        if (response.candidates?.[0]?.citationMetadata) {
          foundCitationMetadata = true;
        }
      }
      expect(foundCitationMetadata).toBe(true);
    });

    it('removes empty text parts', async () => {
      const fakeResponse = getMockResponseStreaming('streaming-success-empty-text-part.txt');
      const result = processStream(fakeResponse as Response);
      const aggregatedResponse = await result.response;
      expect(aggregatedResponse.text()).toBe('1');
      expect(aggregatedResponse.candidates?.length).toBe(1);
      expect(aggregatedResponse.candidates?.[0]?.content.parts.length).toBe(1);

      // The chunk with the empty text part will still go through the stream
      let numChunks = 0;
      for await (const _ of result.stream) {
        numChunks++;
      }
      expect(numChunks).toBe(2);
    });
  });

  describe('aggregateResponses', () => {
    it('handles no candidates, and promptFeedback', () => {
      const responsesToAggregate: GenerateContentResponse[] = [
        {
          promptFeedback: {
            blockReason: BlockReason.SAFETY,
            safetyRatings: [
              {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                probability: HarmProbability.LOW,
              } as SafetyRating,
            ],
          },
        },
      ];
      const response = aggregateResponses(responsesToAggregate);
      expect(response.candidates).toBeUndefined();
      expect(response.promptFeedback?.blockReason).toBe(BlockReason.SAFETY);
    });

    describe('multiple responses, has candidates', () => {
      let response: GenerateContentResponse;
      beforeAll(() => {
        const responsesToAggregate: GenerateContentResponse[] = [
          {
            candidates: [
              {
                index: 0,
                content: {
                  role: 'user',
                  parts: [{ text: 'hello.' }],
                },
                finishReason: FinishReason.STOP,
                finishMessage: 'something',
                safetyRatings: [
                  {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    probability: HarmProbability.NEGLIGIBLE,
                  } as SafetyRating,
                ],
              },
            ],
            promptFeedback: {
              blockReason: BlockReason.SAFETY,
              safetyRatings: [
                {
                  category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                  probability: HarmProbability.LOW,
                } as SafetyRating,
              ],
            },
          },
          {
            candidates: [
              {
                index: 0,
                content: {
                  role: 'user',
                  parts: [{ text: 'angry stuff' }],
                },
                finishReason: FinishReason.STOP,
                finishMessage: 'something',
                safetyRatings: [
                  {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    probability: HarmProbability.NEGLIGIBLE,
                  } as SafetyRating,
                ],
                citationMetadata: {
                  citations: [
                    {
                      startIndex: 0,
                      endIndex: 20,
                      uri: 'sourceurl',
                      license: '',
                    },
                  ],
                },
              },
            ],
            promptFeedback: {
              blockReason: BlockReason.OTHER,
              safetyRatings: [
                {
                  category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                  probability: HarmProbability.HIGH,
                } as SafetyRating,
              ],
            },
          },
          {
            candidates: [
              {
                index: 0,
                content: {
                  role: 'user',
                  parts: [{ text: '...more stuff' }],
                },
                finishReason: FinishReason.MAX_TOKENS,
                finishMessage: 'too many tokens',
                safetyRatings: [
                  {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    probability: HarmProbability.MEDIUM,
                  } as SafetyRating,
                ],
                citationMetadata: {
                  citations: [
                    {
                      startIndex: 0,
                      endIndex: 20,
                      uri: 'sourceurl',
                      license: '',
                    },
                    {
                      startIndex: 150,
                      endIndex: 155,
                      uri: 'sourceurl',
                      license: '',
                    },
                  ],
                },
              },
            ],
            promptFeedback: {
              blockReason: BlockReason.OTHER,
              safetyRatings: [
                {
                  category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                  probability: HarmProbability.HIGH,
                } as SafetyRating,
              ],
            },
          },
        ];
        response = aggregateResponses(responsesToAggregate);
      });

      it('aggregates text across responses', () => {
        expect(response.candidates?.length).toBe(1);
        expect(response.candidates?.[0]!.content.parts.map(({ text }) => text)).toEqual([
          'hello.',
          'angry stuff',
          '...more stuff',
        ]);
      });

      it("takes the last response's promptFeedback", () => {
        expect(response.promptFeedback?.blockReason).toBe(BlockReason.OTHER);
      });

      it("takes the last response's finishReason", () => {
        expect(response.candidates?.[0]!.finishReason).toBe(FinishReason.MAX_TOKENS);
      });

      it("takes the last response's finishMessage", () => {
        expect(response.candidates?.[0]!.finishMessage).toBe('too many tokens');
      });

      it("takes the last response's candidate safetyRatings", () => {
        expect(response.candidates?.[0]!.safetyRatings?.[0]!.category).toBe(
          HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        );
        expect(response.candidates?.[0]!.safetyRatings?.[0]!.probability).toBe(
          HarmProbability.MEDIUM,
        );
      });

      it('collects all citations into one array', () => {
        expect(response.candidates?.[0]!.citationMetadata?.citations.length).toBe(2);
        expect(response.candidates?.[0]!.citationMetadata?.citations[0]!.startIndex).toBe(0);
        expect(response.candidates?.[0]!.citationMetadata?.citations[1]!.startIndex).toBe(150);
      });

      it('throws if a part has no properties', () => {
        const responsesToAggregate: GenerateContentResponse[] = [
          {
            candidates: [
              {
                index: 0,
                content: {
                  role: 'user',
                  parts: [{} as any], // Empty
                },
                finishReason: FinishReason.STOP,
                finishMessage: 'something',
                safetyRatings: [
                  {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    probability: HarmProbability.NEGLIGIBLE,
                  } as SafetyRating,
                ],
              },
            ],
            promptFeedback: {
              blockReason: BlockReason.SAFETY,
              safetyRatings: [
                {
                  category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                  probability: HarmProbability.LOW,
                } as SafetyRating,
              ],
            },
          },
        ];

        try {
          aggregateResponses(responsesToAggregate);
        } catch (e) {
          expect((e as VertexAIError).code).toBe(VertexAIErrorCode.INVALID_CONTENT);
          expect((e as VertexAIError).message).toContain(
            'Part should have at least one property, but there are none. This is likely caused ' +
              'by a malformed response from the backend.',
          );
        }
      });
    });
  });
});
