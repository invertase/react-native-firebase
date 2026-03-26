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

import { ReadableStream } from 'web-streams-polyfill';
import {
  EnhancedGenerateContentResponse,
  GenerateContentCandidate,
  GenerateContentResponse,
  GenerateContentStreamResult,
  Part,
  AIErrorCode,
  URLContextMetadata,
} from '../types';
import { AIError } from '../errors';
import { createEnhancedContentResponse } from './response-helpers';
import { ApiSettings } from '../types/internal';
import { BackendType } from '../public-types';
import * as GoogleAIMapper from '../googleai-mappers';
import { GoogleAIGenerateContentResponse } from '../types/googleai';

const responseLineRE = /^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;

/**
 * Process a response.body stream from the backend and return an
 * iterator that provides one complete GenerateContentResponse at a time
 * and a promise that resolves with a single aggregated
 * GenerateContentResponse.
 *
 * @param response - Response from a fetch call
 */
export function processStream(
  response: Response,
  apiSettings: ApiSettings,
): GenerateContentStreamResult {
  const inputStream = new ReadableStream<string>({
    async start(controller) {
      const reader = response.body!.getReader();
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
  const responseStream = getResponseStream<GenerateContentResponse>(inputStream);
  const [stream1, stream2] = responseStream.tee();
  return {
    stream: generateResponseSequence(stream1, apiSettings),
    response: getResponsePromise(stream2, apiSettings),
  };
}

async function getResponsePromise(
  stream: ReadableStream<GenerateContentResponse>,
  apiSettings: ApiSettings,
): Promise<EnhancedGenerateContentResponse> {
  const allResponses: GenerateContentResponse[] = [];
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      let generateContentResponse = aggregateResponses(allResponses);
      if (apiSettings.backend.backendType === BackendType.GOOGLE_AI) {
        generateContentResponse = GoogleAIMapper.mapGenerateContentResponse(
          generateContentResponse as GoogleAIGenerateContentResponse,
        );
      }
      return createEnhancedContentResponse(generateContentResponse);
    }

    allResponses.push(value);
  }
}

async function* generateResponseSequence(
  stream: ReadableStream<GenerateContentResponse>,
  apiSettings: ApiSettings,
): AsyncGenerator<EnhancedGenerateContentResponse> {
  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    const firstCandidate = (
      apiSettings.backend.backendType === BackendType.GOOGLE_AI
        ? GoogleAIMapper.mapGenerateContentResponse(value as GoogleAIGenerateContentResponse)
        : value
    ).candidates?.[0];
    if (
      !firstCandidate?.content?.parts &&
      !firstCandidate?.finishReason &&
      !firstCandidate?.citationMetadata &&
      !firstCandidate?.urlContextMetadata
    ) {
      continue;
    }

    let enhancedResponse: EnhancedGenerateContentResponse;
    if (apiSettings.backend.backendType === BackendType.GOOGLE_AI) {
      enhancedResponse = createEnhancedContentResponse(
        GoogleAIMapper.mapGenerateContentResponse(value as GoogleAIGenerateContentResponse),
      );
    } else {
      enhancedResponse = createEnhancedContentResponse(value);
    }

    yield enhancedResponse;
  }
}

/**
 * Reads a raw stream from the fetch response and join incomplete
 * chunks, returning a new stream that provides a single complete
 * GenerateContentResponse in each iteration.
 */
export function getResponseStream<T>(inputStream: ReadableStream<string>): ReadableStream<T> {
  const reader = inputStream.getReader();
  const stream = new ReadableStream<T>({
    start(controller) {
      let currentText = '';
      return pump().then(() => undefined);
      function pump(): Promise<(() => Promise<void>) | undefined> {
        return reader.read().then(({ value, done }) => {
          if (done) {
            if (currentText.trim()) {
              controller.error(new AIError(AIErrorCode.PARSE_FAILED, 'Failed to parse stream'));
              return;
            }
            controller.close();
            return;
          }

          currentText += value;
          let match = currentText.match(responseLineRE);
          let parsedResponse: T;
          while (match) {
            try {
              parsedResponse = JSON.parse(match[1]!);
            } catch (_) {
              controller.error(
                new AIError(AIErrorCode.PARSE_FAILED, `Error parsing JSON response: "${match[1]}`),
              );
              return;
            }
            controller.enqueue(parsedResponse);
            currentText = currentText.substring(match[0].length);
            match = currentText.match(responseLineRE);
          }
          return pump();
        });
      }
    },
  });
  return stream;
}

/**
 * Aggregates an array of `GenerateContentResponse`s into a single
 * GenerateContentResponse.
 */
export function aggregateResponses(responses: GenerateContentResponse[]): GenerateContentResponse {
  const lastResponse = responses[responses.length - 1];
  const aggregatedResponse: GenerateContentResponse = {
    promptFeedback: lastResponse?.promptFeedback,
  };
  for (const response of responses) {
    if (response.candidates) {
      for (const candidate of response.candidates) {
        // Index will be undefined if it's the first index (0), so we should use 0 if it's undefined.
        // See: https://github.com/firebase/firebase-js-sdk/issues/8566
        const i = candidate.index || 0;
        if (!aggregatedResponse.candidates) {
          aggregatedResponse.candidates = [];
        }
        if (!aggregatedResponse.candidates[i]) {
          aggregatedResponse.candidates[i] = {
            index: candidate.index,
          } as GenerateContentCandidate;
        }
        // Keep overwriting, the last one will be final
        aggregatedResponse.candidates[i].citationMetadata = candidate.citationMetadata;
        aggregatedResponse.candidates[i].finishReason = candidate.finishReason;
        aggregatedResponse.candidates[i].finishMessage = candidate.finishMessage;
        aggregatedResponse.candidates[i].safetyRatings = candidate.safetyRatings;
        aggregatedResponse.candidates[i].groundingMetadata = candidate.groundingMetadata;

        // urlContextMetadata is defined in the first chunk of the response stream.
        // In subsequent chunks it is often undefined; do not overwrite the first value.
        const urlContextMetadata = candidate.urlContextMetadata as unknown;
        if (
          typeof urlContextMetadata === 'object' &&
          urlContextMetadata !== null &&
          Object.keys(urlContextMetadata).length > 0
        ) {
          aggregatedResponse.candidates[i].urlContextMetadata =
            urlContextMetadata as URLContextMetadata;
        }

        /**
         * Candidates should always have content and parts, but this handles
         * possible malformed responses.
         */
        if (candidate.content && candidate.content.parts) {
          if (!aggregatedResponse.candidates[i].content) {
            aggregatedResponse.candidates[i].content = {
              role: candidate.content.role || 'user',
              parts: [],
            };
          }
          const newPart: Partial<Part> = {};
          for (const part of candidate.content.parts) {
            if (part.text !== undefined) {
              // The backend can send empty text parts. If these are sent back
              // (e.g. in chat history), the backend will respond with an error.
              // To prevent this, ignore empty text parts.
              if (part.text === '') {
                continue;
              }
              newPart.text = part.text;
            }
            if (part.functionCall) {
              newPart.functionCall = part.functionCall;
            }
            if (Object.keys(newPart).length === 0) {
              throw new AIError(
                AIErrorCode.INVALID_CONTENT,
                'Part should have at least one property, but there are none. This is likely caused ' +
                  'by a malformed response from the backend.',
              );
            }
            aggregatedResponse.candidates[i].content.parts.push(newPart as Part);
          }
        }
      }
    }
  }
  return aggregatedResponse;
}
