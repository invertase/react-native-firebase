/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
  Content,
  GenerateContentRequest,
  GenerateContentResult,
  GenerateContentStreamResult,
  Part,
  RequestOptions,
  StartChatParams,
  EnhancedGenerateContentResponse,
} from '../types';
import { formatNewContent } from '../requests/request-helpers';
import { formatBlockErrorMessage } from '../requests/response-helpers';
import { validateChatHistory } from './chat-session-helpers';
import { generateContent, generateContentStream } from './generate-content';
import { ApiSettings } from '../types/internal';
import { logger } from '../logger';

/**
 * Do not log a message for this error.
 */
const SILENT_ERROR = 'SILENT_ERROR';

/**
 * ChatSession class that enables sending chat messages and stores
 * history of sent and received messages so far.
 *
 * @public
 */
export class ChatSession {
  private _apiSettings: ApiSettings;
  private _history: Content[] = [];
  private _sendPromise: Promise<void> = Promise.resolve();

  constructor(
    apiSettings: ApiSettings,
    public model: string,
    public params?: StartChatParams,
    public requestOptions?: RequestOptions,
  ) {
    this._apiSettings = apiSettings;
    if (params?.history) {
      validateChatHistory(params.history);
      this._history = params.history;
    }
  }

  /**
   * Gets the chat history so far. Blocked prompts are not added to history.
   * Neither blocked candidates nor the prompts that generated them are added
   * to history.
   */
  async getHistory(): Promise<Content[]> {
    await this._sendPromise;
    return this._history;
  }

  /**
   * Sends a chat message and receives a non-streaming
   * <code>{@link GenerateContentResult}</code>
   */
  async sendMessage(request: string | Array<string | Part>): Promise<GenerateContentResult> {
    await this._sendPromise;
    const newContent = formatNewContent(request);
    const generateContentRequest: GenerateContentRequest = {
      safetySettings: this.params?.safetySettings,
      generationConfig: this.params?.generationConfig,
      tools: this.params?.tools,
      toolConfig: this.params?.toolConfig,
      systemInstruction: this.params?.systemInstruction,
      contents: [...this._history, newContent],
    };
    let finalResult = {} as GenerateContentResult;
    // Add onto the chain.
    this._sendPromise = this._sendPromise
      .then(() =>
        generateContent(this._apiSettings, this.model, generateContentRequest, this.requestOptions),
      )
      .then((result: GenerateContentResult) => {
        if (result.response.candidates && result.response.candidates.length > 0) {
          this._history.push(newContent);
          const responseContent: Content = {
            parts: result.response.candidates?.[0]?.content.parts || [],
            // Response seems to come back without a role set.
            role: result.response.candidates?.[0]?.content.role || 'model',
          };
          this._history.push(responseContent);
        } else {
          const blockErrorMessage = formatBlockErrorMessage(result.response);
          if (blockErrorMessage) {
            logger.warn(
              `sendMessage() was unsuccessful. ${blockErrorMessage}. Inspect response object for details.`,
            );
          }
        }
        finalResult = result;
      });
    await this._sendPromise;
    return finalResult;
  }

  /**
   * Sends a chat message and receives the response as a
   * <code>{@link GenerateContentStreamResult}</code> containing an iterable stream
   * and a response promise.
   */
  async sendMessageStream(
    request: string | Array<string | Part>,
  ): Promise<GenerateContentStreamResult> {
    await this._sendPromise;
    const newContent = formatNewContent(request);
    const generateContentRequest: GenerateContentRequest = {
      safetySettings: this.params?.safetySettings,
      generationConfig: this.params?.generationConfig,
      tools: this.params?.tools,
      toolConfig: this.params?.toolConfig,
      systemInstruction: this.params?.systemInstruction,
      contents: [...this._history, newContent],
    };
    const streamPromise = generateContentStream(
      this._apiSettings,
      this.model,
      generateContentRequest,
      this.requestOptions,
    );

    // Add onto the chain.
    this._sendPromise = this._sendPromise
      .then(() => streamPromise)
      // This must be handled to avoid unhandled rejection, but jump
      // to the final catch block with a label to not log this error.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch(_ignored => {
        throw new Error(SILENT_ERROR);
      })
      .then(streamResult => streamResult.response)
      .then((response: EnhancedGenerateContentResponse) => {
        if (response.candidates && response.candidates.length > 0) {
          this._history.push(newContent);
          const responseContent = { ...response.candidates[0]?.content };
          // Response seems to come back without a role set.
          if (!responseContent.role) {
            responseContent.role = 'model';
          }
          this._history.push(responseContent as Content);
        } else {
          const blockErrorMessage = formatBlockErrorMessage(response);
          if (blockErrorMessage) {
            logger.warn(
              `sendMessageStream() was unsuccessful. ${blockErrorMessage}. Inspect response object for details.`,
            );
          }
        }
      })
      .catch(e => {
        // Errors in streamPromise are already catchable by the user as
        // streamPromise is returned.
        // Avoid duplicating the error message in logs.
        if (e.message !== SILENT_ERROR) {
          // Users do not have access to _sendPromise to catch errors
          // downstream from streamPromise, so they should not throw.
          logger.error(e);
        }
      });
    return streamPromise;
  }
}
