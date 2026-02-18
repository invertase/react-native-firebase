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
  /**
   * Aggregates and returns every {@link FunctionCall} from the first candidate of
   * {@link GenerateContentResponse}.
   *
   * @throws If the prompt or candidate was blocked.
   */
  functionCalls: () => FunctionCall[] | undefined;
  /**
   * Aggregates and returns every {@link TextPart} with their `thought` property set
   * to `true` from the first candidate of {@link GenerateContentResponse}.
   *
   * @throws If the prompt or candidate was blocked.
   *
   * @remarks
   * Thought summaries provide a brief overview of the model's internal thinking process,
   * offering insight into how it arrived at the final answer. This can be useful for
   * debugging, understanding the model's reasoning, and verifying its accuracy.
   *
   * Thoughts will only be included if {@link ThinkingConfig.includeThoughts} is
   * set to `true`.
   */
  thoughtSummary: () => string | undefined;
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
  /**
   * The number of tokens used by the model's internal "thinking" process.
   */
  thoughtsTokenCount?: number;
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
 * Metadata returned when grounding is enabled.
 *
 * Currently, only Grounding with Google Search is supported (see {@link GoogleSearchTool}).
 *
 * Important: If using Grounding with Google Search, you are required to comply with the
 * "Grounding with Google Search" usage requirements for your chosen API provider: {@link https://ai.google.dev/gemini-api/terms#grounding-with-google-search | Gemini Developer API}
 * or Vertex AI Gemini API (see {@link https://cloud.google.com/terms/service-terms | Service Terms}
 * section within the Service Specific Terms).
 *
 * @public
 */
export interface GroundingMetadata {
  /**
   * Google Search entry point for web searches. This contains an HTML/CSS snippet that must be
   * embedded in an app to display a Google Search entry point for follow-up web searches related to
   * a model's "Grounded Response".
   */
  searchEntryPoint?: SearchEntrypoint;
  /**
   * A list of {@link GroundingChunk} objects. Each chunk represents a piece of retrieved content
   * (for example, from a web page). that the model used to ground its response.
   */
  groundingChunks?: GroundingChunk[];
  /**
   * A list of {@link GroundingSupport} objects. Each object details how specific segments of the
   * model's response are supported by the `groundingChunks`.
   */
  groundingSupports?: GroundingSupport[];
  /**
   * A list of web search queries that the model performed to gather the grounding information.
   * These can be used to allow users to explore the search results themselves.
   */
  webSearchQueries?: string[];
  /**
   * @deprecated Use {@link GroundingSupport} instead.
   */
  retrievalQueries?: string[];
}

/**
 * Google search entry point.
 *
 * @public
 */
export interface SearchEntrypoint {
  /**
   * HTML/CSS snippet that must be embedded in a web page. The snippet is designed to avoid
   * undesired interaction with the rest of the page's CSS.
   *
   * To ensure proper rendering and prevent CSS conflicts, it is recommended
   * to encapsulate this `renderedContent` within a shadow DOM when embedding it
   * into a webpage. See {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM | MDN: Using shadow DOM}.
   *
   * @example
   * ```javascript
   * const container = document.createElement('div');
   * document.body.appendChild(container);
   * container.attachShadow({ mode: 'open' }).innerHTML = renderedContent;
   * ```
   */
  renderedContent?: string;
}

/**
 * Represents a chunk of retrieved data that supports a claim in the model's response. This is part
 * of the grounding information provided when grounding is enabled.
 *
 * @public
 */
export interface GroundingChunk {
  /**
   * Contains details if the grounding chunk is from a web source.
   */
  web?: WebGroundingChunk;
}

/**
 * A grounding chunk from the web.
 *
 * Important: If using Grounding with Google Search, you are required to comply with the
 * {@link https://cloud.google.com/terms/service-terms | Service Specific Terms} for "Grounding with Google Search".
 *
 * @public
 */
export interface WebGroundingChunk {
  /**
   * The URI of the retrieved web page.
   */
  uri?: string;
  /**
   * The title of the retrieved web page.
   */
  title?: string;
  /**
   * The domain of the original URI from which the content was retrieved.
   *
   * This property is only supported in the Vertex AI Gemini API ({@link VertexAIBackend}).
   * When using the Gemini Developer API ({@link GoogleAIBackend}), this property will be
   * `undefined`.
   */
  domain?: string;
}

/**
 * Provides information about how a specific segment of the model's response is supported by the
 * retrieved grounding chunks.
 *
 * @public
 */
export interface GroundingSupport {
  /**
   * Specifies the segment of the model's response content that this grounding support pertains to.
   */
  segment?: Segment;
  /**
   * A list of indices that refer to specific {@link GroundingChunk} objects within the
   * {@link GroundingMetadata.groundingChunks} array. These referenced chunks
   * are the sources that support the claim made in the associated `segment` of the response.
   * For example, an array `[1, 3, 4]` means that `groundingChunks[1]`, `groundingChunks[3]`,
   * and `groundingChunks[4]` are the retrieved content supporting this part of the response.
   */
  groundingChunkIndices?: number[];
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
 * Represents a specific segment within a {@link Content} object, often used to
 * pinpoint the exact location of text or data that grounding information refers to.
 *
 * @public
 */
export interface Segment {
  /**
   * The zero-based index of the {@link Part} object within the `parts` array
   * of its parent {@link Content} object. This identifies which part of the
   * content the segment belongs to.
   */
  partIndex: number;
  /**
   * The zero-based start index of the segment within the specified `Part`,
   * measured in UTF-8 bytes. This offset is inclusive, starting from 0 at the
   * beginning of the part's content (e.g., `Part.text`).
   */
  startIndex: number;
  /**
   * The zero-based end index of the segment within the specified `Part`,
   * measured in UTF-8 bytes. This offset is exclusive, meaning the character
   * at this index is not included in the segment.
   */
  endIndex: number;
  /**
   * The text corresponding to the segment from the response.
   */
  text: string;
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

/**
 * An incremental content update from the model.
 *
 * @beta
 */
export interface LiveServerContent {
  type: 'serverContent';
  /**
   * The content that the model has generated as part of the current conversation with the user.
   */
  modelTurn?: Content;
  /**
   * Indicates whether the turn is complete. This is `undefined` if the turn is not complete.
   */
  turnComplete?: boolean;
  /**
   * Indicates whether the model was interrupted by the client. An interruption occurs when
   * the client sends a message before the model finishes it's turn. This is `undefined` if the
   * model was not interrupted.
   */
  interrupted?: boolean;
  /**
   * Transcription of the audio that was input to the model.
   */
  inputTranscription?: Transcription;
  /**
   * Transcription of the audio output from the model.
   */
  outputTranscription?: Transcription;
}

/**
 * Transcription of audio. This can be returned from a {@link LiveGenerativeModel} if transcription
 * is enabled with the `inputAudioTranscription` or `outputAudioTranscription` properties on
 * the {@link LiveGenerationConfig}.
 *
 * @beta
 */

export interface Transcription {
  /**
   * The text transcription of the audio.
   */
  text?: string;
}

/**
 * A request from the model for the client to execute one or more functions.
 *
 * @beta
 */
export interface LiveServerToolCall {
  type: 'toolCall';
  /**
   * An array of function calls to run.
   */
  functionCalls: FunctionCall[];
}

/**
 * Notification to cancel a previous function call triggered by {@link LiveServerToolCall}.
 *
 * @beta
 */
export interface LiveServerToolCallCancellation {
  type: 'toolCallCancellation';
  /**
   * IDs of function calls that were cancelled. These refer to the `id` property of a {@link FunctionCall}.
   */
  functionIds: string[];
}

/**
 * The types of responses that can be returned by {@link LiveSession.receive}.
 *
 * @beta
 */
export const LiveResponseType = {
  SERVER_CONTENT: 'serverContent',
  TOOL_CALL: 'toolCall',
  TOOL_CALL_CANCELLATION: 'toolCallCancellation',
};

/**
 * The types of responses that can be returned by {@link LiveSession.receive}.
 * This is a property on all messages that can be used for type narrowing. This property is not
 * returned by the server, it is assigned to a server message object once it's parsed.
 *
 * @beta
 */
export type LiveResponseType = (typeof LiveResponseType)[keyof typeof LiveResponseType];
