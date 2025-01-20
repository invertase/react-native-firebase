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

export async function generateContentStream(
  apiSettings: ApiSettings,
  model: string,
  params: GenerateContentRequest,
  requestOptions?: RequestOptions,
): Promise<GenerateContentStreamResult> {
  const response = await makeRequest(
    model,
    Task.STREAM_GENERATE_CONTENT,
    apiSettings,
    /* stream */ true,
    JSON.stringify(params),
    requestOptions,
  );
  return processStream(response);
}

export async function generateContent(
  apiSettings: ApiSettings,
  model: string,
  params: GenerateContentRequest,
  requestOptions?: RequestOptions,
): Promise<GenerateContentResult> {
  const response = await makeRequest(
    model,
    Task.GENERATE_CONTENT,
    apiSettings,
    /* stream */ false,
    JSON.stringify(params),
    requestOptions,
  );
  const responseJson: GenerateContentResponse = await response.json();
  const enhancedResponse = createEnhancedContentResponse(responseJson);
  return {
    response: enhancedResponse,
  };
}
