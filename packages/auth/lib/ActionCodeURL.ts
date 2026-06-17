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

import { ActionCodeOperation } from './constants';

function extractQuerystring(url: string): string {
  const queryIndex = url.indexOf('?');
  if (queryIndex < 0) {
    return '';
  }

  const hashIndex = url.indexOf('#');
  const end = hashIndex > queryIndex ? hashIndex : url.length;

  return url.slice(queryIndex + 1, end);
}

function querystringDecode(query: string): Record<string, string> {
  const decoded: Record<string, string> = {};

  if (!query) {
    return decoded;
  }

  for (const part of query.split('&')) {
    if (!part) {
      continue;
    }

    const separatorIndex = part.indexOf('=');
    const key = decodeURIComponent(
      separatorIndex >= 0 ? part.slice(0, separatorIndex) : part,
    );
    const value = decodeURIComponent(
      separatorIndex >= 0 ? part.slice(separatorIndex + 1) : '',
    );

    decoded[key] = value;
  }

  return decoded;
}

function parseMode(mode: string | null): string | null {
  switch (mode) {
    case 'recoverEmail':
      return ActionCodeOperation.RECOVER_EMAIL;
    case 'resetPassword':
      return ActionCodeOperation.PASSWORD_RESET;
    case 'signIn':
      return ActionCodeOperation.EMAIL_SIGNIN;
    case 'verifyEmail':
      return ActionCodeOperation.VERIFY_EMAIL;
    case 'verifyAndChangeEmail':
      return ActionCodeOperation.VERIFY_AND_CHANGE_EMAIL;
    case 'revertSecondFactorAddition':
      return ActionCodeOperation.REVERT_SECOND_FACTOR_ADDITION;
    default:
      return null;
  }
}

/**
 * Parses Firebase dynamic-link style wrappers and returns the inner action link URL.
 *
 * Ported from firebase-js-sdk `parseDeepLink` (pure URL parsing; no native bridge).
 */
function parseDeepLink(url: string): string {
  const link = querystringDecode(extractQuerystring(url)).link;
  const doubleDeepLink = link
    ? querystringDecode(extractQuerystring(link)).deep_link_id
    : null;
  const iOSDeepLink = querystringDecode(extractQuerystring(url)).deep_link_id;
  const iOSDoubleDeepLink = iOSDeepLink
    ? querystringDecode(extractQuerystring(iOSDeepLink)).link
    : null;

  return iOSDoubleDeepLink || iOSDeepLink || doubleDeepLink || link || url;
}

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
  static parseLink(link: string): ActionCodeURL | null {
    const actionLink = parseDeepLink(link);

    try {
      const searchParams = querystringDecode(extractQuerystring(actionLink));
      const apiKey = searchParams.apiKey ?? null;
      const code = searchParams.oobCode ?? null;
      const operation = parseMode(searchParams.mode ?? null);

      if (!apiKey || !code || !operation) {
        return null;
      }

      return new ActionCodeURL(
        apiKey,
        code,
        searchParams.continueUrl ?? null,
        searchParams.lang ?? null,
        operation,
        searchParams.tenantId ?? null,
      );
    } catch {
      return null;
    }
  }
}
