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

import { Content, FunctionCall, InlineDataPart } from './content';
import {
  BlockReason,
  FinishReason,
  HarmCategory,
  HarmProbability,
  HarmSeverity,
  Modality,
} from './enums';

/**
 * Result object returned from {@link GenerativeModel.generateContent} call.
 *
 * @public
 */
export interface GenerateContentResult {
  response: EnhancedGenerateContentResponse;
}

/**
 * Result object returned from {@link GenerativeModel.generateContentStream} call.
 * Iterate over `stream` to get chunks as they come in and/or
 * use the `response` promise to get the aggregated response when
 * the stream is done.
 *
 * @public
 */
export interface GenerateContentStreamResult {
  stream: AsyncGenerator<EnhancedGenerateContentResponse>;
  response: Promise<EnhancedGenerateContentResponse>;
}

/**
 * Response object wrapped with helper methods.
 *
 * @public
 */
export interface EnhancedGenerateContentResponse extends GenerateContentResponse {
  /**
   * Returns the text string from the response, if available.
   * Throws if the prompt or candidate was blocked.
   */
  text: () => string;
  /**
   * Aggregates and returns all {@link InlineDataPart}s from the {@link GenerateContentResponse}'s
   * first candidate.
   *
   * @returns An array of {@link InlineDataPart}s containing data from the response, if available.
   *
   * @throws If the prompt or candidate was blocked.
   */
  inlineDataParts: () => InlineDataPart[] | undefined;
  functionCalls: () => FunctionCall[] | undefined;
}

/**
 * Individual response from {@link GenerativeModel.generateContent} and
 * {@link GenerativeModel.generateContentStream}.
 * `generateContentStream()` will return one in each chunk until
 * the stream is done.
 * @public
 */
export interface GenerateContentResponse {
  candidates?: GenerateContentCandidate[];
  promptFeedback?: PromptFeedback;
  usageMetadata?: UsageMetadata;
}

/**
 * Usage metadata about a {@link GenerateContentResponse}.
 *
 * @public
 */
export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  promptTokensDetails?: ModalityTokenCount[];
  candidatesTokensDetails?: ModalityTokenCount[];
}

/**
 * Represents token counting info for a single modality.
 *
 * @public
 */
export interface ModalityTokenCount {
  /** The modality associated with this token count. */
  modality: Modality;
  /** The number of tokens counted. */
  tokenCount: number;
}

/**
 * If the prompt was blocked, this will be populated with `blockReason` and
 * the relevant `safetyRatings`.
 * @public
 */
export interface PromptFeedback {
  blockReason?: BlockReason;
  safetyRatings: SafetyRating[];
  /**
   * A human-readable description of the `blockReason`.
   *
   * This property is only supported in the Vertex AI Gemini API ({@link VertexAIBackend}).
   */
  blockReasonMessage?: string;
}

/**
 * A candidate returned as part of a {@link GenerateContentResponse}.
 * @public
 */
export interface GenerateContentCandidate {
  index: number;
  content: Content;
  finishReason?: FinishReason;
  finishMessage?: string;
  safetyRatings?: SafetyRating[];
  citationMetadata?: CitationMetadata;
  groundingMetadata?: GroundingMetadata;
}

/**
 * Citation metadata that may be found on a {@link GenerateContentCandidate}.
 * @public
 */
export interface CitationMetadata {
  citations: Citation[];
}

/**
 * A single citation.
 * @public
 */
export interface Citation {
  startIndex?: number;
  endIndex?: number;
  uri?: string;
  license?: string;
  /**
   * The title of the cited source, if available.
   *
   * This property is only supported in the Vertex AI Gemini API ({@link VertexAIBackend}).
   */
  title?: string;
  /**
   * The publication date of the cited source, if available.
   *
   * This property is only supported in the Vertex AI Gemini API ({@link VertexAIBackend}).
   */
  publicationDate?: Date;
}

/**
 * Metadata returned to client when grounding is enabled.
 * @public
 */
export interface GroundingMetadata {
  webSearchQueries?: string[];
  retrievalQueries?: string[];
  /**
   * @deprecated
   */
  groundingAttributions: GroundingAttribution[];
}

/**
 * @deprecated
 * @public
 */
export interface GroundingAttribution {
  segment: Segment;
  confidenceScore?: number;
  web?: WebAttribution;
  retrievedContext?: RetrievedContextAttribution;
}

/**
 * @public
 */
export interface Segment {
  partIndex: number;
  startIndex: number;
  endIndex: number;
}

/**
 * @public
 */
export interface WebAttribution {
  uri: string;
  title: string;
}

/**
 * @public
 */
export interface RetrievedContextAttribution {
  uri: string;
  title: string;
}

/**
 * Protobuf google.type.Date
 * @public
 */
export interface Date {
  year: number;
  month: number;
  day: number;
}

/**
 * A safety rating associated with a {@link GenerateContentCandidate}
 * @public
 */
export interface SafetyRating {
  category: HarmCategory;
  probability: HarmProbability;
  /**
   * The harm severity level.
   *
   * This property is only supported when using the Vertex AI Gemini API ({@link VertexAIBackend}).
   * When using the Gemini Developer API ({@link GoogleAIBackend}), this property is not supported and will default to `HarmSeverity.UNSUPPORTED`.
   */
  severity: HarmSeverity;
  /**
   * The probability score of the harm category.
   *
   * This property is only supported when using the Vertex AI Gemini API ({@link VertexAIBackend}).
   * When using the Gemini Developer API ({@link GoogleAIBackend}), this property is not supported and will default to 0.
   */
  probabilityScore: number;
  /**
   * The severity score of the harm category.
   *
   * This property is only supported when using the Vertex AI Gemini API ({@link VertexAIBackend}).
   * When using the Gemini Developer API ({@link GoogleAIBackend}), this property is not supported and will default to 0.
   */
  severityScore: number;
  blocked: boolean;
}

/**
 * Response from calling {@link GenerativeModel.countTokens}.
 * @public
 */
export interface CountTokensResponse {
  /**
   * The total number of tokens counted across all instances from the request.
   */
  totalTokens: number;
  /**
   * @deprecated Use `totalTokens` instead. This property is undefined when using models greater than `gemini-1.5-*`.
   *
   * The total number of billable characters counted across all instances
   * from the request.
   *
   * This property is only supported when using the Vertex AI Gemini API ({@link VertexAIBackend}).
   * When using the Gemini Developer API ({@link GoogleAIBackend}), this property is not supported and will default to 0.
   */
  totalBillableCharacters?: number;
  /**
   * The breakdown, by modality, of how many tokens are consumed by the prompt.
   */
  promptTokensDetails?: ModalityTokenCount[];
}
