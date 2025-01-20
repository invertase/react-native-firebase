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

import { generateContent, generateContentStream } from '../methods/generate-content';
import {
  Content,
  CountTokensRequest,
  CountTokensResponse,
  GenerateContentRequest,
  GenerateContentResult,
  GenerateContentStreamResult,
  GenerationConfig,
  ModelParams,
  Part,
  RequestOptions,
  SafetySetting,
  StartChatParams,
  Tool,
  ToolConfig,
  VertexAIErrorCode,
} from '../types';
import { VertexAIError } from '../errors';
import { ChatSession } from '../methods/chat-session';
import { countTokens } from '../methods/count-tokens';
import { formatGenerateContentInput, formatSystemInstruction } from '../requests/request-helpers';
import { VertexAI } from '../public-types';
import { ApiSettings } from '../types/internal';
import { VertexAIService } from '../service';

/**
 * Class for generative model APIs.
 * @public
 */
export class GenerativeModel {
  private _apiSettings: ApiSettings;
  model: string;
  generationConfig: GenerationConfig;
  safetySettings: SafetySetting[];
  requestOptions?: RequestOptions;
  tools?: Tool[];
  toolConfig?: ToolConfig;
  systemInstruction?: Content;

  constructor(vertexAI: VertexAI, modelParams: ModelParams, requestOptions?: RequestOptions) {
    if (!vertexAI.app?.options?.apiKey) {
      throw new VertexAIError(
        VertexAIErrorCode.NO_API_KEY,
        `The "apiKey" field is empty in the local Firebase config. Firebase VertexAI requires this field to contain a valid API key.`,
      );
    } else if (!vertexAI.app?.options?.projectId) {
      throw new VertexAIError(
        VertexAIErrorCode.NO_PROJECT_ID,
        `The "projectId" field is empty in the local Firebase config. Firebase VertexAI requires this field to contain a valid project ID.`,
      );
    } else {
      this._apiSettings = {
        apiKey: vertexAI.app.options.apiKey,
        project: vertexAI.app.options.projectId,
        location: vertexAI.location,
      };
      if ((vertexAI as VertexAIService).appCheck) {
        this._apiSettings.getAppCheckToken = () =>
          (vertexAI as VertexAIService).appCheck!.getToken();
      }

      if ((vertexAI as VertexAIService).auth?.currentUser) {
        this._apiSettings.getAuthToken = () =>
          (vertexAI as VertexAIService).auth!.currentUser!.getIdToken();
      }
    }
    if (modelParams.model.includes('/')) {
      if (modelParams.model.startsWith('models/')) {
        // Add "publishers/google" if the user is only passing in 'models/model-name'.
        this.model = `publishers/google/${modelParams.model}`;
      } else {
        // Any other custom format (e.g. tuned models) must be passed in correctly.
        this.model = modelParams.model;
      }
    } else {
      // If path is not included, assume it's a non-tuned model.
      this.model = `publishers/google/models/${modelParams.model}`;
    }
    this.generationConfig = modelParams.generationConfig || {};
    this.safetySettings = modelParams.safetySettings || [];
    this.tools = modelParams.tools;
    this.toolConfig = modelParams.toolConfig;
    this.systemInstruction = formatSystemInstruction(modelParams.systemInstruction);
    this.requestOptions = requestOptions || {};
  }

  /**
   * Makes a single non-streaming call to the model
   * and returns an object containing a single <code>{@link GenerateContentResponse}</code>.
   */
  async generateContent(
    request: GenerateContentRequest | string | Array<string | Part>,
  ): Promise<GenerateContentResult> {
    const formattedParams = formatGenerateContentInput(request);
    return generateContent(
      this._apiSettings,
      this.model,
      {
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
        tools: this.tools,
        toolConfig: this.toolConfig,
        systemInstruction: this.systemInstruction,
        ...formattedParams,
      },
      this.requestOptions,
    );
  }

  /**
   * Makes a single streaming call to the model
   * and returns an object containing an iterable stream that iterates
   * over all chunks in the streaming response as well as
   * a promise that returns the final aggregated response.
   */
  async generateContentStream(
    request: GenerateContentRequest | string | Array<string | Part>,
  ): Promise<GenerateContentStreamResult> {
    const formattedParams = formatGenerateContentInput(request);
    return generateContentStream(
      this._apiSettings,
      this.model,
      {
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
        tools: this.tools,
        toolConfig: this.toolConfig,
        systemInstruction: this.systemInstruction,
        ...formattedParams,
      },
      this.requestOptions,
    );
  }

  /**
   * Gets a new <code>{@link ChatSession}</code> instance which can be used for
   * multi-turn chats.
   */
  startChat(startChatParams?: StartChatParams): ChatSession {
    return new ChatSession(
      this._apiSettings,
      this.model,
      {
        tools: this.tools,
        toolConfig: this.toolConfig,
        systemInstruction: this.systemInstruction,
        ...startChatParams,
      },
      this.requestOptions,
    );
  }

  /**
   * Counts the tokens in the provided request.
   */
  async countTokens(
    request: CountTokensRequest | string | Array<string | Part>,
  ): Promise<CountTokensResponse> {
    const formattedParams = formatGenerateContentInput(request);
    return countTokens(this._apiSettings, this.model, formattedParams);
  }
}
