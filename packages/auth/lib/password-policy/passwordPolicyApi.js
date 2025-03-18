/**
 * Enum for HTTP methods.
 * @enum {string}
 */
export const HttpMethod = {
  POST: 'POST',
  GET: 'GET',
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
