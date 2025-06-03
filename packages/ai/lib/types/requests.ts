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
export declare type Tool = FunctionDeclarationsTool;

/**
 * Structured representation of a function declaration as defined by the
 * {@link https://spec.openapis.org/oas/v3.0.3 | OpenAPI 3.0 specification}.
 * Included
 * in this declaration are the function name and parameters. This
 * `FunctionDeclaration` is a representation of a block of code that can be used
 * as a Tool by the model and executed by the client.
 * @public
 */
export declare interface FunctionDeclaration {
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
 * A `FunctionDeclarationsTool` is a piece of code that enables the system to
 * interact with external systems to perform an action, or set of actions,
 * outside of knowledge and scope of the model.
 * @public
 */
export declare interface FunctionDeclarationsTool {
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
