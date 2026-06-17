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

export const ACTION_CODE_URL_PARSE_NOT_IMPLEMENTED =
  'parseURL is not currently implemented in react-native-firebase';

/**
 * A structure to help parse out the different components involved in an action link URL.
 *
 * @public
 */
export class ActionCodeURL {
  /**
   * The API key of the email action link.
   */
  readonly apiKey: string;
  /**
   * The action code of the email action link.
   */
  readonly code: string;
  /**
   * The continue URL of the email action link. Null if not provided.
   */
  readonly continueUrl: string | null;
  /**
   * The language code of the email action link. Null if not provided.
   */
  readonly languageCode: string | null;
  /**
   * The action performed by the email action link.
   */
  readonly operation: string;
  /**
   * The tenant ID of the email action link. Null if the email action is from the parent project.
   */
  readonly tenantId: string | null;

  private constructor(
    apiKey: string,
    code: string,
    continueUrl: string | null,
    languageCode: string | null,
    operation: string,
    tenantId: string | null,
  ) {
    this.apiKey = apiKey;
    this.code = code;
    this.continueUrl = continueUrl;
    this.languageCode = languageCode;
    this.operation = operation;
    this.tenantId = tenantId;
  }

  /**
   * Parses the email action link string and returns an {@link ActionCodeURL} if the link is valid,
   * otherwise returns null.
   *
   * @param link - The email action link string.
   * @returns The {@link ActionCodeURL} object, or null if the link is invalid.
   */
  static parseLink(link: string): Promise<ActionCodeURL | null> {
    void link;
    return Promise.reject(new Error(ACTION_CODE_URL_PARSE_NOT_IMPLEMENTED));
  }
}
