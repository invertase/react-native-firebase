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
 * See the License for the License for the specific language governing permissions and
 * limitations under the License.
 */

import { AIModel } from './ai-model';
import { LiveSession } from '../methods/live-session';
import {
  AI,
  BackendType,
  Content,
  LiveGenerationConfig,
  LiveModelParams,
  SessionResumptionConfig,
  Tool,
  ToolConfig,
} from '../public-types';
import { WebSocketHandler } from '../websocket';
import { formatSystemInstruction } from '../requests/request-helpers';
import { _LiveClientSetup } from '../types/live-responses';

/**
 * Class for Live generative model APIs. The Live API enables low-latency, two-way multimodal
 * interactions with Gemini.
 *
 * This class should only be instantiated with {@link getLiveGenerativeModel}.
 *
 * @beta
 */
export class LiveGenerativeModel extends AIModel {
  generationConfig: LiveGenerationConfig;
  tools?: Tool[];
  toolConfig?: ToolConfig;
  systemInstruction?: Content;

  /**
   * @internal
   */
  constructor(
    ai: AI,
    modelParams: LiveModelParams,
    /**
     * @internal
     */
    private _webSocketHandler: WebSocketHandler,
  ) {
    super(ai, modelParams.model);
    this.generationConfig = modelParams.generationConfig || {};
    this.tools = modelParams.tools;
    this.toolConfig = modelParams.toolConfig;
    this.systemInstruction = formatSystemInstruction(modelParams.systemInstruction);
  }

  /**
   * Starts a {@link LiveSession}.
   *
   * @param sessionResumption - Optional configuration for resuming a previous live session.
   * @returns A {@link LiveSession}.
   * @throws If the connection failed to be established with the server.
   *
   * @beta
   */
  async connect(sessionResumption?: SessionResumptionConfig): Promise<LiveSession> {
    let fullModelPath: string;
    if (this._apiSettings.backend.backendType === BackendType.GOOGLE_AI) {
      fullModelPath = `projects/${this._apiSettings.project}/${this.model}`;
    } else {
      fullModelPath = `projects/${this._apiSettings.project}/locations/${this._apiSettings.location}/${this.model}`;
    }

    // inputAudioTranscription and outputAudioTranscription are on the generation config in the public API,
    // but the backend expects them to be in the `setup` message.
    const { inputAudioTranscription, outputAudioTranscription, ...generationConfig } =
      this.generationConfig;
    const contextWindowCompression = generationConfig.contextWindowCompression;
    delete generationConfig.contextWindowCompression;

    const setupMessage: _LiveClientSetup = {
      setup: {
        model: fullModelPath,
        generationConfig,
        contextWindowCompression,
        tools: this.tools,
        toolConfig: this.toolConfig,
        systemInstruction: this.systemInstruction,
        inputAudioTranscription,
        outputAudioTranscription,
        sessionResumption,
      },
    };

    const session = new LiveSession(
      setupMessage,
      this._apiSettings,
      sessionResumption,
      this._webSocketHandler,
    );
    await session.connectionPromise;
    return session;
  }
}
