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

import { AIModel } from './ai-model';
import { LiveSession } from '../methods/live-session';
import { AIError } from '../errors';
import {
  AI,
  AIErrorCode,
  BackendType,
  Content,
  LiveGenerationConfig,
  LiveModelParams,
  Tool,
  ToolConfig,
} from '../public-types';
import { WebSocketHandler } from '../websocket';
import { WebSocketUrl } from '../requests/request';
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
   * @returns A {@link LiveSession}.
   * @throws If the connection failed to be established with the server.
   *
   * @beta
   */
  async connect(): Promise<LiveSession> {
    const url = new WebSocketUrl(this._apiSettings);
    await this._webSocketHandler.connect(url.toString());

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

    const setupMessage: _LiveClientSetup = {
      setup: {
        model: fullModelPath,
        generationConfig,
        tools: this.tools,
        toolConfig: this.toolConfig,
        systemInstruction: this.systemInstruction,
        inputAudioTranscription,
        outputAudioTranscription,
      },
    };

    try {
      // Begin listening for server messages, and begin the handshake by sending the 'setupMessage'
      const serverMessages = this._webSocketHandler.listen();
      this._webSocketHandler.send(JSON.stringify(setupMessage));

      // Verify we received the handshake response 'setupComplete'
      const firstMessage = (await serverMessages.next()).value;
      if (
        !firstMessage ||
        !(typeof firstMessage === 'object') ||
        !('setupComplete' in firstMessage)
      ) {
        await this._webSocketHandler.close(1011, 'Handshake failure');
        throw new AIError(
          AIErrorCode.RESPONSE_ERROR,
          'Server connection handshake failed. The server did not respond with a setupComplete message.',
        );
      }

      return new LiveSession(this._webSocketHandler, serverMessages);
    } catch (e) {
      // Ensure connection is closed on any setup error
      await this._webSocketHandler.close();
      throw e;
    }
  }
}
