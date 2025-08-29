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

import {
  GenerateContentRequest,
  GenerateContentResponse,
  GenerateContentResult,
  GenerateContentStreamResult,
  RequestOptions,
} from '../types';
import { Task, makeRequest } from '../requests/request';
import { createEnhancedContentResponse } from '../requests/response-helpers';
import { processStream } from '../requests/stream-reader';
import { ApiSettings } from '../types/internal';
import { BackendType } from '../public-types';
import * as GoogleAIMapper from '../googleai-mappers';

/**
 * Generates a content stream from a request body.
 *
 * @param apiSettings The {@link ApiSettings} to use for the request.
 * @param model The model to use for the request.
 * @param params The {@link GenerateContentRequest} to send.
 * @param requestOptions The {@link RequestOptions} to use for the request.
 * @returns The {@link GenerateContentStreamResult} from the request.
 */
export async function generateContentStream(
  apiSettings: ApiSettings,
  model: string,
  params: GenerateContentRequest,
  requestOptions?: RequestOptions,
): Promise<GenerateContentStreamResult> {
  if (apiSettings.backend.backendType === BackendType.GOOGLE_AI) {
    params = GoogleAIMapper.mapGenerateContentRequest(params);
  }
  const response = await makeRequest(
    model,
    Task.STREAM_GENERATE_CONTENT,
    apiSettings,
    /* stream */ true,
    JSON.stringify(params),
    requestOptions,
  );
  return processStream(response, apiSettings);
}

/**
 * Generates content from a request body.
 *
 * @param apiSettings The {@link ApiSettings} to use for the request.
 * @param model The model to use for the request.
 * @param params The {@link GenerateContentRequest} to send.
 * @param requestOptions The {@link RequestOptions} to use for the request.
 * @returns The {@link GenerateContentResult} from the request.
 */

export async function generateContent(
  apiSettings: ApiSettings,
  model: string,
  params: GenerateContentRequest,
  requestOptions?: RequestOptions,
): Promise<GenerateContentResult> {
  if (apiSettings.backend.backendType === BackendType.GOOGLE_AI) {
    params = GoogleAIMapper.mapGenerateContentRequest(params);
  }
  const response = await makeRequest(
    model,
    Task.GENERATE_CONTENT,
    apiSettings,
    /* stream */ false,
    JSON.stringify(params),
    requestOptions,
  );
  const generateContentResponse = await processGenerateContentResponse(response, apiSettings);
  const enhancedResponse = createEnhancedContentResponse(generateContentResponse);
  return {
    response: enhancedResponse,
  };
}

/**
 * Processes a generate content response from a request.
 *
 * @param response The {@link Response} to process.
 * @param apiSettings The {@link ApiSettings} to use for the request.
 * @returns The {@link GenerateContentResponse} from the request.
 */
async function processGenerateContentResponse(
  response: Response,
  apiSettings: ApiSettings,
): Promise<GenerateContentResponse> {
  const responseJson = await response.json();
  if (apiSettings.backend.backendType === BackendType.GOOGLE_AI) {
    return GoogleAIMapper.mapGenerateContentResponse(responseJson);
  } else {
    return responseJson;
  }
}
