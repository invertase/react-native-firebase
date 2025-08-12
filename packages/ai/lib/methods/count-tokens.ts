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

import { CountTokensRequest, CountTokensResponse, RequestOptions } from '../types';
import { Task, makeRequest } from '../requests/request';
import { ApiSettings } from '../types/internal';
import { BackendType } from '../public-types';
import * as GoogleAIMapper from '../googleai-mappers';

/**
 * Counts the number of tokens in a request body.
 *
 * @param apiSettings The {@link ApiSettings} to use for the request.
 * @param model The model to use for the request.
 * @param params The {@link CountTokensRequest} to send.
 * @param requestOptions The {@link RequestOptions} to use for the request.
 * @returns The {@link CountTokensResponse} from the request.
 */
export async function countTokens(
  apiSettings: ApiSettings,
  model: string,
  params: CountTokensRequest,
  requestOptions?: RequestOptions,
): Promise<CountTokensResponse> {
  let body: string = '';
  switch (apiSettings.backend.backendType) {
    case BackendType.GOOGLE_AI:
      const mappedParams = GoogleAIMapper.mapCountTokensRequest(params, model);
      body = JSON.stringify(mappedParams);
      break;
    case BackendType.VERTEX_AI:
    default:
      body = JSON.stringify(params);
      break;
  }

  const response = await makeRequest(
    model,
    Task.COUNT_TOKENS,
    apiSettings,
    false,
    body,
    requestOptions,
  );
  return response.json();
}
