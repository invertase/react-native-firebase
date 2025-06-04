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
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AIError } from 'lib';
import {
  mapCountTokensRequest,
  mapGenerateContentCandidates,
  mapGenerateContentRequest,
  mapGenerateContentResponse,
  mapPromptFeedback,
} from 'lib/googleai-mappers';
import {
  AIErrorCode,
  BlockReason,
  CountTokensRequest,
  Content,
  FinishReason,
  GenerateContentRequest,
  GoogleAICountTokensRequest,
  GoogleAIGenerateContentCandidate,
  GoogleAIGenerateContentResponse,
  HarmBlockMethod,
  HarmBlockThreshold,
  HarmCategory,
  HarmProbability,
  HarmSeverity,
  PromptFeedback,
  SafetyRating,
} from 'lib/public-types';
import { getMockResponse } from './test-utils/mock-response';
import { SpiedFunction } from 'jest-mock';

const fakeModel = 'models/gemini-pro';

const fakeContents: Content[] = [{ role: 'user', parts: [{ text: 'hello' }] }];

describe('Google AI Mappers', () => {
  let loggerWarnSpy: SpiedFunction<{
    (message?: any, ...optionalParams: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
  }>;

  beforeEach(() => {
    loggerWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('mapGenerateContentRequest', () => {
    it('should throw if safetySettings contain method', () => {
      const request: GenerateContentRequest = {
        contents: fakeContents,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            method: HarmBlockMethod.SEVERITY,
          },
        ],
      };
      const error = new AIError(
        AIErrorCode.UNSUPPORTED,
        'SafetySettings.method is not supported in requests to the Gemini Developer API',
      );
      expect(() => mapGenerateContentRequest(request)).toThrowError(error);
    });

    it('should warn and round topK if present', () => {
      const request: GenerateContentRequest = {
        contents: fakeContents,
        generationConfig: {
          topK: 15.7,
        },
      };
      const mappedRequest = mapGenerateContentRequest(request);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'topK in GenerationConfig has been rounded to the nearest integer to match the format for requests to the Gemini Developer API.',
      );
      expect(mappedRequest.generationConfig?.topK).toBe(16);
    });

    it('should not modify topK if it is already an integer', () => {
      const request: GenerateContentRequest = {
        contents: fakeContents,
        generationConfig: {
          topK: 16,
        },
      };
      const mappedRequest = mapGenerateContentRequest(request);
      expect(loggerWarnSpy).not.toHaveBeenCalled();
      expect(mappedRequest.generationConfig?.topK).toBe(16);
    });

    it('should return the request mostly unchanged if valid', () => {
      const request: GenerateContentRequest = {
        contents: fakeContents,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
        generationConfig: {
          temperature: 0.5,
        },
      };
      const mappedRequest = mapGenerateContentRequest({ ...request });
      expect(mappedRequest).toEqual(request);
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('mapGenerateContentResponse', () => {
    it('should map a full Google AI response', async () => {
      const googleAIMockResponse: GoogleAIGenerateContentResponse = await (
        getMockResponse('unary-success-citations.json') as Response
      ).json();
      const mappedResponse = mapGenerateContentResponse(googleAIMockResponse);

      expect(mappedResponse.candidates).toBeDefined();
      expect(mappedResponse.candidates?.[0]?.content.parts[0]?.text).toContain('quantum mechanics');

      // Mapped citations
      expect(mappedResponse.candidates?.[0]?.citationMetadata?.citations[0]?.startIndex).toBe(
        googleAIMockResponse.candidates?.[0]?.citationMetadata?.citationSources[0]?.startIndex,
      );
      expect(mappedResponse.candidates?.[0]?.citationMetadata?.citations[0]?.endIndex).toBe(
        googleAIMockResponse.candidates?.[0]?.citationMetadata?.citationSources[0]?.endIndex,
      );

      // Mapped safety ratings
      expect(mappedResponse.candidates?.[0]?.safetyRatings?.[0]?.probabilityScore).toBe(0);
      expect(mappedResponse.candidates?.[0]?.safetyRatings?.[0]?.severityScore).toBe(0);
      expect(mappedResponse.candidates?.[0]?.safetyRatings?.[0]?.severity).toBe(
        HarmSeverity.HARM_SEVERITY_UNSUPPORTED,
      );

      expect(mappedResponse.candidates?.[0]?.finishReason).toBe(FinishReason.STOP);

      // Check usage metadata passthrough
      expect(mappedResponse.usageMetadata).toEqual(googleAIMockResponse.usageMetadata);
    });

    it('should handle missing candidates and promptFeedback', () => {
      const googleAIResponse: GoogleAIGenerateContentResponse = {
        // No candidates
        // No promptFeedback
        usageMetadata: {
          promptTokenCount: 5,
          candidatesTokenCount: 0,
          totalTokenCount: 5,
        },
      };
      const mappedResponse = mapGenerateContentResponse(googleAIResponse);
      expect(mappedResponse.candidates).toBeUndefined();
      expect(mappedResponse.promptFeedback).toBeUndefined(); // Mapped to undefined
      expect(mappedResponse.usageMetadata).toEqual(googleAIResponse.usageMetadata);
    });

    it('should handle empty candidates array', () => {
      const googleAIResponse: GoogleAIGenerateContentResponse = {
        candidates: [],
        usageMetadata: {
          promptTokenCount: 5,
          candidatesTokenCount: 0,
          totalTokenCount: 5,
        },
      };
      const mappedResponse = mapGenerateContentResponse(googleAIResponse);
      expect(mappedResponse.candidates).toEqual([]);
      expect(mappedResponse.promptFeedback).toBeUndefined();
      expect(mappedResponse.usageMetadata).toEqual(googleAIResponse.usageMetadata);
    });
  });

  describe('mapCountTokensRequest', () => {
    it('should map a Vertex AI CountTokensRequest to Google AI format', () => {
      const vertexRequest: CountTokensRequest = {
        contents: fakeContents,
        systemInstruction: { role: 'system', parts: [{ text: 'Be nice' }] },
        tools: [{ functionDeclarations: [{ name: 'foo', description: 'bar' }] }],
        generationConfig: { temperature: 0.8 },
      };

      const expectedGoogleAIRequest: GoogleAICountTokensRequest = {
        generateContentRequest: {
          model: fakeModel,
          contents: vertexRequest.contents,
          systemInstruction: vertexRequest.systemInstruction,
          tools: vertexRequest.tools,
          generationConfig: vertexRequest.generationConfig,
        },
      };

      const mappedRequest = mapCountTokensRequest(vertexRequest, fakeModel);
      expect(mappedRequest).toEqual(expectedGoogleAIRequest);
    });

    it('should map a minimal Vertex AI CountTokensRequest', () => {
      const vertexRequest: CountTokensRequest = {
        contents: fakeContents,
        systemInstruction: { role: 'system', parts: [{ text: 'Be nice' }] },
        generationConfig: { temperature: 0.8 },
      };

      const expectedGoogleAIRequest: GoogleAICountTokensRequest = {
        generateContentRequest: {
          model: fakeModel,
          contents: vertexRequest.contents,
          systemInstruction: { role: 'system', parts: [{ text: 'Be nice' }] },
          generationConfig: { temperature: 0.8 },
        },
      };

      const mappedRequest = mapCountTokensRequest(vertexRequest, fakeModel);
      expect(mappedRequest).toEqual(expectedGoogleAIRequest);
    });
  });

  describe('mapGenerateContentCandidates', () => {
    it('should map citationSources to citationMetadata.citations', () => {
      const candidates: GoogleAIGenerateContentCandidate[] = [
        {
          index: 0,
          content: { role: 'model', parts: [{ text: 'Cited text' }] },
          citationMetadata: {
            citationSources: [
              { startIndex: 0, endIndex: 5, uri: 'uri1', license: 'MIT' },
              { startIndex: 6, endIndex: 10, uri: 'uri2' },
            ],
          },
        },
      ];
      const mapped = mapGenerateContentCandidates(candidates);
      expect(mapped[0]?.citationMetadata).toBeDefined();
      expect(mapped[0]?.citationMetadata?.citations).toEqual(
        candidates[0]?.citationMetadata?.citationSources,
      );
      expect(mapped[0]?.citationMetadata?.citations[0]?.title).toBeUndefined(); // Not in Google AI
      expect(mapped[0]?.citationMetadata?.citations[0]?.publicationDate).toBeUndefined(); // Not in Google AI
    });

    it('should add default safety rating properties', () => {
      const candidates: GoogleAIGenerateContentCandidate[] = [
        {
          index: 0,
          content: { role: 'model', parts: [{ text: 'Maybe unsafe' }] },
          safetyRatings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              probability: HarmProbability.MEDIUM,
              blocked: false,
              // Missing severity, probabilityScore, severityScore
            } as any,
          ],
        },
      ];
      const mapped = mapGenerateContentCandidates(candidates);
      expect(mapped[0]?.safetyRatings).toBeDefined();
      const safetyRating = mapped[0]?.safetyRatings?.[0] as SafetyRating; // Type assertion
      expect(safetyRating.severity).toBe(HarmSeverity.HARM_SEVERITY_UNSUPPORTED);
      expect(safetyRating.probabilityScore).toBe(0);
      expect(safetyRating.severityScore).toBe(0);
      // Existing properties should be preserved
      expect(safetyRating.category).toBe(HarmCategory.HARM_CATEGORY_HARASSMENT);
      expect(safetyRating.probability).toBe(HarmProbability.MEDIUM);
      expect(safetyRating.blocked).toBe(false);
    });

    it('should throw if videoMetadata is present in parts', () => {
      const candidates: GoogleAIGenerateContentCandidate[] = [
        {
          index: 0,
          content: {
            role: 'model',
            parts: [
              {
                inlineData: { mimeType: 'video/mp4', data: 'base64==' },
                videoMetadata: { startOffset: '0s', endOffset: '5s' }, // Unsupported
              },
            ],
          },
        },
      ];
      expect(() => mapGenerateContentCandidates(candidates)).toThrowError(
        new AIError(AIErrorCode.UNSUPPORTED, 'Part.videoMetadata is not supported'),
      );
    });

    it('should handle candidates without citation or safety ratings', () => {
      const candidates: GoogleAIGenerateContentCandidate[] = [
        {
          index: 0,
          content: { role: 'model', parts: [{ text: 'Simple text' }] },
          finishReason: FinishReason.STOP,
        },
      ];
      const mapped = mapGenerateContentCandidates(candidates);
      expect(mapped[0]?.citationMetadata).toBeUndefined();
      expect(mapped[0]?.safetyRatings).toBeUndefined();
      expect(mapped[0]?.content?.parts[0]?.text).toBe('Simple text');
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('should handle empty candidate array', () => {
      const candidates: GoogleAIGenerateContentCandidate[] = [];
      const mapped = mapGenerateContentCandidates(candidates);
      expect(mapped).toEqual([]);
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('mapPromptFeedback', () => {
    it('should add default safety rating properties', () => {
      const feedback: PromptFeedback = {
        blockReason: BlockReason.OTHER,
        safetyRatings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            probability: HarmProbability.HIGH,
            blocked: true,
            // Missing severity, probabilityScore, severityScore
          } as any,
        ],
        // Missing blockReasonMessage
      };
      const mapped = mapPromptFeedback(feedback);
      expect(mapped.safetyRatings).toBeDefined();
      const safetyRating = mapped.safetyRatings[0] as SafetyRating; // Type assertion
      expect(safetyRating.severity).toBe(HarmSeverity.HARM_SEVERITY_UNSUPPORTED);
      expect(safetyRating.probabilityScore).toBe(0);
      expect(safetyRating.severityScore).toBe(0);
      // Existing properties should be preserved
      expect(safetyRating.category).toBe(HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT);
      expect(safetyRating.probability).toBe(HarmProbability.HIGH);
      expect(safetyRating.blocked).toBe(true);
      // Other properties
      expect(mapped.blockReason).toBe(BlockReason.OTHER);
      expect(mapped.blockReasonMessage).toBeUndefined(); // Not present in input
    });
  });
});
