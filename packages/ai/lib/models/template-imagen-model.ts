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

import { RequestOptions } from '../types';
import { AI, ImagenGenerationResponse, ImagenInlineImage } from '../public-types';
import { ApiSettings } from '../types/internal';
import { makeRequest, ServerPromptTemplateTask } from '../requests/request';
import { handlePredictResponse } from '../requests/response-helpers';
import { initApiSettings } from './utils';

/**
 * Class for Imagen model APIs that execute on a server-side template.
 *
 * This class should only be instantiated with {@link getTemplateImagenModel}.
 *
 * @beta
 */
export class TemplateImagenModel {
  /**
   * @internal
   */
  _apiSettings: ApiSettings;

  /**
   * Additional options to use when making requests.
   */
  requestOptions?: RequestOptions;

  /**
   * @hideconstructor
   */
  constructor(ai: AI, requestOptions?: RequestOptions) {
    this.requestOptions = requestOptions || {};
    this._apiSettings = initApiSettings(ai);
  }

  /**
   * Makes a single call to the model and returns an object containing a single
   * {@link ImagenGenerationResponse}.
   *
   * @param templateId - The ID of the server-side template to execute.
   * @param templateVariables - A key-value map of variables to populate the
   * template with.
   *
   * @beta
   */
  async generateImages(
    templateId: string,
    templateVariables: object,
  ): Promise<ImagenGenerationResponse<ImagenInlineImage>> {
    const response = await makeRequest(
      {
        task: ServerPromptTemplateTask.TEMPLATE_PREDICT,
        templateId,
        apiSettings: this._apiSettings,
        stream: false,
        requestOptions: this.requestOptions,
      },
      JSON.stringify({ inputs: templateVariables }),
    );
    return handlePredictResponse<ImagenInlineImage>(response);
  }
}
