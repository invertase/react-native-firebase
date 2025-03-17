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

export const HttpMethod = {
    POST: 'POST',
    GET: 'GET',
  };
  
export const HttpHeader = {
    CONTENT_TYPE: 'Content-Type',
    X_FIREBASE_LOCALE: 'X-Firebase-Locale',
    X_CLIENT_VERSION: 'X-Client-Version',
    X_FIREBASE_GMPID: 'X-Firebase-gmpid',
    X_FIREBASE_CLIENT: 'X-Firebase-Client',
    X_FIREBASE_APP_CHECK: 'X-Firebase-AppCheck',
};

export const Endpoint = {
    GET_PASSWORD_POLICY: '/v2/passwordPolicy',
};

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
      key: auth.config.apiKey,
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

    if (!isCloudflareWorker()) {
      fetchArgs.referrerPolicy = 'no-referrer';
    }

    return FetchProvider.fetch()(
      _getFinalTarget(auth, auth.config.apiHost, path, query),
      fetchArgs,
    );
  });
}
