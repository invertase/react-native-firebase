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

import { Content, FunctionResponse, GenerativeContentBlob, Part } from './content';
import { AudioTranscriptionConfig, LiveGenerationConfig, Tool, ToolConfig } from './requests';
import { Transcription } from './responses';

/**
 * User input that is sent to the model.
 *
 * @internal
 */
export interface _LiveClientContent {
  clientContent: {
    turns: [Content];
    turnComplete: boolean;
    inputTranscription?: Transcription;
    outputTranscription?: Transcription;
  };
}

/**
 * User input that is sent to the model in real time.
 *
 * @internal
 */
export interface _LiveClientRealtimeInput {
  realtimeInput: {
    text?: string;
    audio?: GenerativeContentBlob;
    video?: GenerativeContentBlob;

    /**
     * @deprecated Use `text`, `audio`, and `video` instead.
     */
    mediaChunks?: GenerativeContentBlob[];
  };
}

/**
 * Function responses that are sent to the model in real time.
 */
export interface _LiveClientToolResponse {
  toolResponse: {
    functionResponses: FunctionResponse[];
  };
}

/**
 * The first message in a Live session, used to configure generation options.
 *
 * @internal
 */
export interface _LiveClientSetup {
  setup: {
    model: string;
    generationConfig?: _LiveGenerationConfig;
    tools?: Tool[];
    toolConfig?: ToolConfig;
    systemInstruction?: string | Part | Content;
    inputAudioTranscription?: AudioTranscriptionConfig;
    outputAudioTranscription?: AudioTranscriptionConfig;
  };
}

/**
 * The Live Generation Config.
 *
 * The public API ({@link LiveGenerationConfig}) has `inputAudioTranscription` and `outputAudioTranscription`,
 * but the server expects these fields to be in the top-level `setup` message. This was a conscious API decision.
 */
export type _LiveGenerationConfig = Omit<
  LiveGenerationConfig,
  'inputAudioTranscription' | 'outputAudioTranscription'
>;
