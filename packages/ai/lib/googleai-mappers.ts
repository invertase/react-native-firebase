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

import { AIError } from './errors';
import { logger } from './logger';
import {
  CitationMetadata,
  CountTokensRequest,
  GenerateContentCandidate,
  GenerateContentRequest,
  GenerateContentResponse,
  HarmSeverity,
  InlineDataPart,
  PromptFeedback,
  SafetyRating,
  AIErrorCode,
} from './types';
import {
  GoogleAIGenerateContentResponse,
  GoogleAIGenerateContentCandidate,
  GoogleAICountTokensRequest,
} from './types/googleai';

/**
 * This SDK supports both the Vertex AI Gemini API and the Gemini Developer API (using Google AI).
 * The public API prioritizes the format used by the Vertex AI Gemini API.
 * We avoid having two sets of types by translating requests and responses between the two API formats.
 * This translation allows developers to switch between the Vertex AI Gemini API and the Gemini Developer API
 * with minimal code changes.
 *
 * In here are functions that map requests and responses between the two API formats.
 * Requests in the Vertex AI format are mapped to the Google AI format before being sent.
 * Responses from the Google AI backend are mapped back to the Vertex AI format before being returned to the user.
 */

/**
 * Maps a Vertex AI {@link GenerateContentRequest} to a format that can be sent to Google AI.
 *
 * @param generateContentRequest The {@link GenerateContentRequest} to map.
 * @returns A {@link GenerateContentResponse} that conforms to the Google AI format.
 *
 * @throws If the request contains properties that are unsupported by Google AI.
 *
 * @internal
 */
export function mapGenerateContentRequest(
  generateContentRequest: GenerateContentRequest,
): GenerateContentRequest {
  generateContentRequest.safetySettings?.forEach(safetySetting => {
    if (safetySetting.method) {
      throw new AIError(
        AIErrorCode.UNSUPPORTED,
        'SafetySetting.method is not supported in the the Gemini Developer API. Please remove this property.',
      );
    }
  });

  if (generateContentRequest.generationConfig?.topK) {
    const roundedTopK = Math.round(generateContentRequest.generationConfig.topK);

    if (roundedTopK !== generateContentRequest.generationConfig.topK) {
      logger.warn(
        'topK in GenerationConfig has been rounded to the nearest integer to match the format for requests to the Gemini Developer API.',
      );
      generateContentRequest.generationConfig.topK = roundedTopK;
    }
  }

  return generateContentRequest;
}

/**
 * Maps a {@link GenerateContentResponse} from Google AI to the format of the
 * {@link GenerateContentResponse} that we get from VertexAI that is exposed in the public API.
 *
 * @param googleAIResponse The {@link GenerateContentResponse} from Google AI.
 * @returns A {@link GenerateContentResponse} that conforms to the public API's format.
 *
 * @internal
 */
export function mapGenerateContentResponse(
  googleAIResponse: GoogleAIGenerateContentResponse,
): GenerateContentResponse {
  const generateContentResponse = {
    candidates: googleAIResponse.candidates
      ? mapGenerateContentCandidates(googleAIResponse.candidates)
      : undefined,
    prompt: googleAIResponse.promptFeedback
      ? mapPromptFeedback(googleAIResponse.promptFeedback)
      : undefined,
    usageMetadata: googleAIResponse.usageMetadata,
  };

  return generateContentResponse;
}

/**
 * Maps a Vertex AI {@link CountTokensRequest} to a format that can be sent to Google AI.
 *
 * @param countTokensRequest The {@link CountTokensRequest} to map.
 * @param model The model to count tokens with.
 * @returns A {@link CountTokensRequest} that conforms to the Google AI format.
 *
 * @internal
 */
export function mapCountTokensRequest(
  countTokensRequest: CountTokensRequest,
  model: string,
): GoogleAICountTokensRequest {
  const mappedCountTokensRequest: GoogleAICountTokensRequest = {
    generateContentRequest: {
      model,
      ...countTokensRequest,
    },
  };

  return mappedCountTokensRequest;
}

/**
 * Maps a Google AI {@link GoogleAIGenerateContentCandidate} to a format that conforms
 * to the Vertex AI API format.
 *
 * @param candidates The {@link GoogleAIGenerateContentCandidate} to map.
 * @returns A {@link GenerateContentCandidate} that conforms to the Vertex AI format.
 *
 * @throws If any {@link Part} in the candidates has a `videoMetadata` property.
 *
 * @internal
 */
export function mapGenerateContentCandidates(
  candidates: GoogleAIGenerateContentCandidate[],
): GenerateContentCandidate[] {
  const mappedCandidates: GenerateContentCandidate[] = [];
  let mappedSafetyRatings: SafetyRating[];
  if (mappedCandidates) {
    candidates.forEach(candidate => {
      // Map citationSources to citations.
      let citationMetadata: CitationMetadata | undefined;
      if (candidate.citationMetadata) {
        citationMetadata = {
          citations: candidate.citationMetadata.citationSources,
        };
      }

      // Assign missing candidate SafetyRatings properties to their defaults if undefined.
      if (candidate.safetyRatings) {
        mappedSafetyRatings = candidate.safetyRatings.map(safetyRating => {
          return {
            ...safetyRating,
            severity: safetyRating.severity ?? HarmSeverity.HARM_SEVERITY_UNSUPPORTED,
            probabilityScore: safetyRating.probabilityScore ?? 0,
            severityScore: safetyRating.severityScore ?? 0,
          };
        });
      }

      // videoMetadata is not supported.
      // Throw early since developers may send a long video as input and only expect to pay
      // for inference on a small portion of the video.
      if (candidate.content?.parts.some(part => (part as InlineDataPart)?.videoMetadata)) {
        throw new AIError(
          AIErrorCode.UNSUPPORTED,
          'Part.videoMetadata is not supported in the Gemini Developer API. Please remove this property.',
        );
      }

      const mappedCandidate = {
        index: candidate.index,
        content: candidate.content,
        finishReason: candidate.finishReason,
        finishMessage: candidate.finishMessage,
        safetyRatings: mappedSafetyRatings,
        citationMetadata,
        groundingMetadata: candidate.groundingMetadata,
      };
      mappedCandidates.push(mappedCandidate);
    });
  }

  return mappedCandidates;
}

/**
 * Maps a {@link GenerateContentResponse} from Google AI to the format of the
 * {@link GenerateContentResponse} that we get from VertexAI that is exposed in the public API.
 *
 * @param googleAIResponse The {@link GenerateContentResponse} from Google AI.
 * @returns A {@link GenerateContentResponse} that conforms to the public API's format.
 *
 * @internal
 */
export function mapPromptFeedback(promptFeedback: PromptFeedback): PromptFeedback {
  // Assign missing SafetyRating properties to their defaults if undefined.
  const mappedSafetyRatings: SafetyRating[] = [];
  promptFeedback.safetyRatings.forEach(safetyRating => {
    mappedSafetyRatings.push({
      category: safetyRating.category,
      probability: safetyRating.probability,
      severity: safetyRating.severity ?? HarmSeverity.HARM_SEVERITY_UNSUPPORTED,
      probabilityScore: safetyRating.probabilityScore ?? 0,
      severityScore: safetyRating.severityScore ?? 0,
      blocked: safetyRating.blocked,
    });
  });

  const mappedPromptFeedback: PromptFeedback = {
    blockReason: promptFeedback.blockReason,
    safetyRatings: mappedSafetyRatings,
    blockReasonMessage: promptFeedback.blockReasonMessage,
  };
  return mappedPromptFeedback;
}
