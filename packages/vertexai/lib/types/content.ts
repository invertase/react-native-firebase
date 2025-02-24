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

import { Role } from './enums';

/**
 * Content type for both prompts and response candidates.
 * @public
 */
export interface Content {
  role: Role;
  parts: Part[];
}

/**
 * Content part - includes text, image/video, or function call/response
 * part types.
 * @public
 */
export type Part =
  | TextPart
  | InlineDataPart
  | FunctionCallPart
  | FunctionResponsePart
  | FileDataPart;

/**
 * Content part interface if the part represents a text string.
 * @public
 */
export interface TextPart {
  text: string;
  inlineData?: never;
  functionCall?: never;
  functionResponse?: never;
}

/**
 * Content part interface if the part represents an image.
 * @public
 */
export interface InlineDataPart {
  text?: never;
  inlineData: GenerativeContentBlob;
  functionCall?: never;
  functionResponse?: never;
  /**
   * Applicable if `inlineData` is a video.
   */
  videoMetadata?: VideoMetadata;
}

/**
 * Describes the input video content.
 * @public
 */
export interface VideoMetadata {
  /**
   * The start offset of the video in
   * protobuf {@link https://cloud.google.com/ruby/docs/reference/google-cloud-workflows-v1/latest/Google-Protobuf-Duration#json-mapping | Duration} format.
   */
  startOffset: string;
  /**
   * The end offset of the video in
   * protobuf {@link https://cloud.google.com/ruby/docs/reference/google-cloud-workflows-v1/latest/Google-Protobuf-Duration#json-mapping | Duration} format.
   */
  endOffset: string;
}

/**
 * Content part interface if the part represents a <code>{@link FunctionCall}</code>.
 * @public
 */
export interface FunctionCallPart {
  text?: never;
  inlineData?: never;
  functionCall: FunctionCall;
  functionResponse?: never;
}

/**
 * Content part interface if the part represents <code>{@link FunctionResponse}</code>.
 * @public
 */
export interface FunctionResponsePart {
  text?: never;
  inlineData?: never;
  functionCall?: never;
  functionResponse: FunctionResponse;
}

/**
 * Content part interface if the part represents <code>{@link FileData}</code>
 * @public
 */
export interface FileDataPart {
  text?: never;
  inlineData?: never;
  functionCall?: never;
  functionResponse?: never;
  fileData: FileData;
}

/**
 * A predicted <code>{@link FunctionCall}</code> returned from the model
 * that contains a string representing the {@link FunctionDeclaration.name}
 * and a structured JSON object containing the parameters and their values.
 * @public
 */
export interface FunctionCall {
  name: string;
  args: object;
}

/**
 * The result output from a <code>{@link FunctionCall}</code> that contains a string
 * representing the {@link FunctionDeclaration.name}
 * and a structured JSON object containing any output
 * from the function is used as context to the model.
 * This should contain the result of a <code>{@link FunctionCall}</code>
 * made based on model prediction.
 * @public
 */
export interface FunctionResponse {
  name: string;
  response: object;
}

/**
 * Interface for sending an image.
 * @public
 */
export interface GenerativeContentBlob {
  mimeType: string;
  /**
   * Image as a base64 string.
   */
  data: string;
}

/**
 * Data pointing to a file uploaded on Google Cloud Storage.
 * @public
 */
export interface FileData {
  mimeType: string;
  fileUri: string;
}
