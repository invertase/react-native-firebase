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

import { Content, FunctionCall } from './content';
import { BlockReason, FinishReason, HarmCategory, HarmProbability, HarmSeverity } from './enums';

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
 * Usage metadata about a <code>{@link GenerateContentResponse}</code>.
 *
 * @public
 */
export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

/**
 * If the prompt was blocked, this will be populated with `blockReason` and
 * the relevant `safetyRatings`.
 * @public
 */
export interface PromptFeedback {
  blockReason?: BlockReason;
  safetyRatings: SafetyRating[];
  blockReasonMessage?: string;
}

/**
 * A candidate returned as part of a <code>{@link GenerateContentResponse}</code>.
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
 * Citation metadata that may be found on a <code>{@link GenerateContentCandidate}</code>.
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
  title?: string;
  publicationDate?: Date;
}

/**
 * Metadata returned to client when grounding is enabled.
 * @public
 */
export interface GroundingMetadata {
  webSearchQueries?: string[];
  retrievalQueries?: string[];
  groundingAttributions: GroundingAttribution[];
}

/**
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
 * A safety rating associated with a <code>{@link GenerateContentCandidate}</code>
 * @public
 */
export interface SafetyRating {
  category: HarmCategory;
  probability: HarmProbability;
  severity: HarmSeverity;
  probabilityScore: number;
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
   * The total number of billable characters counted across all instances
   * from the request.
   */
  totalBillableCharacters?: number;
}
