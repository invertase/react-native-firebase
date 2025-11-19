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

import { TypedSchema } from '../requests/schema-builder';
import { Content, Part } from './content';
import {
  FunctionCallingMode,
  HarmBlockMethod,
  HarmBlockThreshold,
  HarmCategory,
  ResponseModality,
} from './enums';
import { ObjectSchemaInterface, SchemaRequest } from './schema';

/**
 * Base parameters for a number of methods.
 * @public
 */
export interface BaseParams {
  safetySettings?: SafetySetting[];
  generationConfig?: GenerationConfig;
}

/**
 * Params passed to {@link getGenerativeModel}.
 * @public
 */
export interface ModelParams extends BaseParams {
  model: string;
  tools?: Tool[];
  toolConfig?: ToolConfig;
  systemInstruction?: string | Part | Content;
}

/**
 * Params passed to {@link getLiveGenerativeModel}.
 * @beta
 */
export interface LiveModelParams {
  model: string;
  generationConfig?: LiveGenerationConfig;
  tools?: Tool[];
  toolConfig?: ToolConfig;
  systemInstruction?: string | Part | Content;
}

/**
 * Request sent through {@link GenerativeModel.generateContent}
 * @public
 */
export interface GenerateContentRequest extends BaseParams {
  contents: Content[];
  tools?: Tool[];
  toolConfig?: ToolConfig;
  systemInstruction?: string | Part | Content;
}

/**
 * Safety setting that can be sent as part of request parameters.
 * @public
 */
export interface SafetySetting {
  category: HarmCategory;
  threshold: HarmBlockThreshold;
  /**
   * The harm block method.
   *
   * This property is only supported in the Vertex AI Gemini API ({@link VertexAIBackend}).
   * When using the Gemini Developer API ({@link GoogleAIBackend}), an {@link AIError} will be
   * thrown if this property is defined.
   */
  method?: HarmBlockMethod;
}

/**
 * Config options for content-related requests
 * @public
 */
export interface GenerationConfig {
  candidateCount?: number;
  stopSequences?: string[];
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  /**
   * Output response MIME type of the generated candidate text.
   * Supported MIME types are `text/plain` (default, text output),
   * `application/json` (JSON response in the candidates), and
   * `text/x.enum`.
   */
  responseMimeType?: string;
  /**
   * Output response schema of the generated candidate text. This
   * value can be a class generated with a {@link Schema} static method
   * like `Schema.string()` or `Schema.object()` or it can be a plain
   * JS object matching the {@link SchemaRequest} interface.
   * <br/>Note: This only applies when the specified `responseMIMEType` supports a schema; currently
   * this is limited to `application/json` and `text/x.enum`.
   */
  responseSchema?: TypedSchema | SchemaRequest;
  /**
   * Generation modalities to be returned in generation responses.
   *
   * @remarks
   *  - Multimodal response generation is only supported by some Gemini models and versions; see {@link https://firebase.google.com/docs/vertex-ai/models | model versions}.
   *  - Only image generation (`ResponseModality.IMAGE`) is supported.
   *
   * @beta
   */
  responseModalities?: ResponseModality[];
  /**
   * Configuration for "thinking" behavior of compatible Gemini models.
   */
  thinkingConfig?: ThinkingConfig;
}

/**
 * Configuration parameters used by {@link LiveGenerativeModel} to control live content generation.
 *
 * @beta
 */
export interface LiveGenerationConfig {
  /**
   * Configuration for speech synthesis.
   */
  speechConfig?: SpeechConfig;
  /**
   * Specifies the maximum number of tokens that can be generated in the response. The number of
   * tokens per word varies depending on the language outputted. Is unbounded by default.
   */
  maxOutputTokens?: number;
  /**
   * Controls the degree of randomness in token selection. A `temperature` value of 0 means that the highest
   * probability tokens are always selected. In this case, responses for a given prompt are mostly
   * deterministic, but a small amount of variation is still possible.
   */
  temperature?: number;
  /**
   * Changes how the model selects tokens for output. Tokens are
   * selected from the most to least probable until the sum of their probabilities equals the `topP`
   * value. For example, if tokens A, B, and C have probabilities of 0.3, 0.2, and 0.1 respectively
   * and the `topP` value is 0.5, then the model will select either A or B as the next token by using
   * the `temperature` and exclude C as a candidate. Defaults to 0.95 if unset.
   */
  topP?: number;
  /**
   * Changes how the model selects token for output. A `topK` value of 1 means the select token is
   * the most probable among all tokens in the model's vocabulary, while a `topK` value 3 means that
   * the next token is selected from among the 3 most probably using probabilities sampled. Tokens
   * are then further filtered with the highest selected `temperature` sampling. Defaults to 40
   * if unspecified.
   */
  topK?: number;
  /**
   * Positive penalties.
   */
  presencePenalty?: number;
  /**
   * Frequency penalties.
   */
  frequencyPenalty?: number;
  /**
   * The modalities of the response.
   */
  responseModalities?: ResponseModality[];
  /**
   * Enables transcription of audio input.
   *
   * When enabled, the model will respond with transcriptions of your audio input in the `inputTranscriptions` property
   * in {@link LiveServerContent} messages. Note that the transcriptions are broken up across
   * messages, so you may only receive small amounts of text per message. For example, if you ask the model
   * "How are you today?", the model may transcribe that input across three messages, broken up as "How a", "re yo", "u today?".
   */
  inputAudioTranscription?: AudioTranscriptionConfig;
  /**
   * Enables transcription of audio input.
   *
   * When enabled, the model will respond with transcriptions of its audio output in the `outputTranscription` property
   * in {@link LiveServerContent} messages. Note that the transcriptions are broken up across
   * messages, so you may only receive small amounts of text per message. For example, if the model says
   * "How are you today?", the model may transcribe that output across three messages, broken up as "How a", "re yo", "u today?".
   */
  outputAudioTranscription?: AudioTranscriptionConfig;
}

/**
 * Params for {@link GenerativeModel.startChat}.
 * @public
 */
export interface StartChatParams extends BaseParams {
  history?: Content[];
  tools?: Tool[];
  toolConfig?: ToolConfig;
  systemInstruction?: string | Part | Content;
}

/**
 * Params for calling {@link GenerativeModel.countTokens}
 * @public
 */
export interface CountTokensRequest {
  contents: Content[];
  /**
   * Instructions that direct the model to behave a certain way.
   */
  systemInstruction?: string | Part | Content;
  /**
   * {@link Tool} configuration.
   */
  tools?: Tool[];
  /**
   * Configuration options that control how the model generates a response.
   */
  generationConfig?: GenerationConfig;
}

/**
 * Params passed to {@link getGenerativeModel}.
 * @public
 */
export interface RequestOptions {
  /**
   * Request timeout in milliseconds. Defaults to 180 seconds (180000ms).
   */
  timeout?: number;
  /**
   * Base url for endpoint. Defaults to https://firebasevertexai.googleapis.com
   */
  baseUrl?: string;
}

/**
 * Defines a tool that model can call to access external knowledge.
 * @public
 */
export type Tool = FunctionDeclarationsTool | GoogleSearchTool;

/**
 * Structured representation of a function declaration as defined by the
 * {@link https://spec.openapis.org/oas/v3.0.3 | OpenAPI 3.0 specification}.
 * Included
 * in this declaration are the function name and parameters. This
 * `FunctionDeclaration` is a representation of a block of code that can be used
 * as a Tool by the model and executed by the client.
 * @public
 */
export interface FunctionDeclaration {
  /**
   * The name of the function to call. Must start with a letter or an
   * underscore. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with
   * a max length of 64.
   */
  name: string;
  /**
   * Description and purpose of the function. Model uses it to decide
   * how and whether to call the function.
   */
  description: string;
  /**
   * Optional. Describes the parameters to this function in JSON Schema Object
   * format. Reflects the Open API 3.03 Parameter Object. Parameter names are
   * case-sensitive. For a function with no parameters, this can be left unset.
   */
  parameters?: ObjectSchemaInterface;
}

/**
 * A tool that allows a Gemini model to connect to Google Search to access and incorporate
 * up-to-date information from the web into its responses.
 *
 * Important: If using Grounding with Google Search, you are required to comply with the
 * "Grounding with Google Search" usage requirements for your chosen API provider: {@link https://ai.google.dev/gemini-api/terms#grounding-with-google-search | Gemini Developer API}
 * or Vertex AI Gemini API (see {@link https://cloud.google.com/terms/service-terms | Service Terms}
 * section within the Service Specific Terms).
 *
 * @public
 */
export interface GoogleSearchTool {
  /**
   * Specifies the Google Search configuration.
   * Currently, this is an empty object, but it's reserved for future configuration options.
   * Specifies the Google Search configuration.
   *
   * When using this feature, you are required to comply with the "Grounding with Google Search"
   * usage requirements for your chosen API provider: {@link https://ai.google.dev/gemini-api/terms#grounding-with-google-search | Gemini Developer API}
   * or Vertex AI Gemini API (see {@link https://cloud.google.com/terms/service-terms | Service Terms}
   * section within the Service Specific Terms).
   */
  googleSearch: GoogleSearch;
}

/**
 * Specifies the Google Search configuration.
 *
 * @remarks Currently, this is an empty object, but it's reserved for future configuration options.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GoogleSearch {}

/**
 * A `FunctionDeclarationsTool` is a piece of code that enables the system to
 * interact with external systems to perform an action, or set of actions,
 * outside of knowledge and scope of the model.
 * @public
 */
export interface FunctionDeclarationsTool {
  /**
   * Optional. One or more function declarations
   * to be passed to the model along with the current user query. Model may
   * decide to call a subset of these functions by populating
   * {@link FunctionCall} in the response. User should
   * provide a {@link FunctionResponse} for each
   * function call in the next turn. Based on the function responses, the model will
   * generate the final response back to the user. Maximum 64 function
   * declarations can be provided.
   */
  functionDeclarations?: FunctionDeclaration[];
}

/**
 * Tool config. This config is shared for all tools provided in the request.
 * @public
 */
export interface ToolConfig {
  functionCallingConfig?: FunctionCallingConfig;
}

/**
 * @public
 */
export interface FunctionCallingConfig {
  mode?: FunctionCallingMode;
  allowedFunctionNames?: string[];
}

/**
 * Configuration for "thinking" behavior of compatible Gemini models.
 *
 * Certain models utilize a thinking process before generating a response. This allows them to
 * reason through complex problems and plan a more coherent and accurate answer.
 *
 * @public
 */
export interface ThinkingConfig {
  /**
   * The thinking budget, in tokens.
   *
   * This parameter sets an upper limit on the number of tokens the model can use for its internal
   * "thinking" process. A higher budget may result in higher quality responses for complex tasks
   * but can also increase latency and cost.
   *
   * If you don't specify a budget, the model will determine the appropriate amount
   * of thinking based on the complexity of the prompt.
   *
   * An error will be thrown if you set a thinking budget for a model that does not support this
   * feature or if the specified budget is not within the model's supported range.
   */
  thinkingBudget?: number;

  /**
   * Whether to include "thought summaries" in the model's response.
   *
   * @remarks
   * Thought summaries provide a brief overview of the model's internal thinking process,
   * offering insight into how it arrived at the final answer. This can be useful for
   * debugging, understanding the model's reasoning, and verifying its accuracy.
   */
  includeThoughts?: boolean;
}

/**
 * Configuration for a pre-built voice.
 *
 * @beta
 */
export interface PrebuiltVoiceConfig {
  /**
   * The voice name to use for speech synthesis.
   *
   * For a full list of names and demos of what each voice sounds like, see {@link https://cloud.google.com/text-to-speech/docs/chirp3-hd | Chirp 3: HD Voices}.
   */
  voiceName?: string;
}

/**
 * Configuration for the voice to used in speech synthesis.
 *
 * @beta
 */
export interface VoiceConfig {
  /**
   * Configures the voice using a pre-built voice configuration.
   */
  prebuiltVoiceConfig?: PrebuiltVoiceConfig;
}

/**
 * Configures speech synthesis.
 *
 * @beta
 */
export interface SpeechConfig {
  /**
   * Configures the voice to be used in speech synthesis.
   */
  voiceConfig?: VoiceConfig;
}

/**
 * Configuration for audio transcription in Live sessions.
 *
 * @beta
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AudioTranscriptionConfig {}
