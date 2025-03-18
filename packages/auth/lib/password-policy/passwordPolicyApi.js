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

/**
 * Enum for HTTP methods.
 * @enum {string}
 */
export const HttpMethod = {
  POST: 'POST',
  GET: 'GET',
};

export const DefaultConfig = {
  TOKEN_API_HOST: 'securetoken.googleapis.com',
  API_HOST: 'identitytoolkit.googleapis.com',
  API_SCHEME: 'https',
};

/**
 * Enum for HTTP headers used in API requests.
 * @enum {string}
 */
export const HttpHeader = {
  CONTENT_TYPE: 'Content-Type',
  X_FIREBASE_LOCALE: 'X-Firebase-Locale',
  X_CLIENT_VERSION: 'X-Client-Version',
  X_FIREBASE_GMPID: 'X-Firebase-gmpid',
  X_FIREBASE_CLIENT: 'X-Firebase-Client',
  X_FIREBASE_APP_CHECK: 'X-Firebase-AppCheck',
};

/**
 * Enum for API endpoints.
 * @enum {string}
 */
export const Endpoint = {
  GET_PASSWORD_POLICY: '/v2/passwordPolicy',
};

/**
 * Adds the tenant ID to the request if it is not already present.
 *
 * @param {Object} auth - The authentication object containing tenant information.
 * @param {Object} request - The request object to be modified.
 * @returns {Object} The modified request object with the tenant ID added if necessary.
 */
export function _addTidIfNecessary(auth, request) {
  if (auth.tenantId && !request.tenantId) {
    return {
      ...request,
      tenantId: auth.tenantId,
    };
  }
  return request;
}

/**
 * Performs an API request with error handling.
 *
 * @param {Object} auth - The authentication object containing configuration and headers.
 * @param {string} method - The HTTP method to use for the request (e.g., 'GET', 'POST').
 * @param {string} path - The API endpoint path.
 * @param {Object} [request] - The request payload or query parameters.
 * @param {Object} [customErrorMap={}] - A custom error map for handling specific errors.
 * @returns {Promise<Response>} A promise that resolves to the API response.
 * @throws {Error} Throws an error if the request fails or encounters an issue.
 */
export async function _performApiRequest(auth, method, path, request, customErrorMap = {}) {
  return _performFetchWithErrorHandling(auth, customErrorMap, async () => {
    let body = {};
    let params = {};
    if (request) {
      if (method === HttpMethod.GET) {
        params = request;
      } else {
        body = {
          body: JSON.stringify(request),
        };
      }
    }

    const query = querystring({
      key: firebase.app().options.apiKey,
      ...params,
    }).slice(1);

    const headers = await auth._getAdditionalHeaders();
    headers[HttpHeader.CONTENT_TYPE] = 'application/json';

    if (auth.languageCode) {
      headers[HttpHeader.X_FIREBASE_LOCALE] = auth.languageCode;
    }

    const fetchArgs = {
      method,
      headers,
      ...body,
    };

    return FetchProvider.fetch()(
      _getFinalTarget(auth, auth.config.apiHost, path, query),
      fetchArgs,
    );
  });
}

/**
 * Constructs the final target URL based on the provided authentication configuration,
 * host, path, and query parameters. If the emulator is being used, it generates
 * the URL for the emulator; otherwise, it constructs the URL using the API scheme.
 *
 * @param {Object} auth - The authentication object containing configuration details.
 * @param {Object} auth.config - The configuration object for authentication.
 * @param {boolean} auth.config.emulator - Indicates whether the emulator is being used.
 * @param {string} auth.config.apiScheme - The scheme to use for the API (e.g., "https").
 * @param {string} host - The host of the API.
 * @param {string} path - The path of the API endpoint.
 * @param {string} query - The query string to append to the URL.
 * @returns {string} The constructed target URL.
 */
export function _getFinalTarget(auth, host, path, query) {
  const base = `${host}${path}?${query}`;

  if (!auth.config.emulator) {
    return `${auth.config.apiScheme}://${base}`;
  }

  return _emulatorUrl(auth.config, base);
}
