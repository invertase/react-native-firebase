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
 * Unconditionally fails, throwing an internal error with the given message.
 *
 * @param {string} failure - Type of failure encountered
 * @throws {Error}
 */
export function debugFail(failure) {
  // Log the failure in addition to throwing an exception, just in case the
  // exception is swallowed.
  const message = `INTERNAL ASSERTION FAILED: ` + failure;
  _logError(message);

  // NOTE: We don't use FirebaseError here because these are internal failures
  // that cannot be handled by the user. (Also it would create a circular
  // dependency between the error and assert modules which doesn't work.)
  throw new Error(message);
}

export const FetchProvider = (() => {
  let fetchImpl = null;
  let headersImpl = null;
  let responseImpl = null;

  return {
    initialize(fetchImplementation, headersImplementation, responseImplementation) {
      fetchImpl = fetchImplementation;
      if (headersImplementation) {
        headersImpl = headersImplementation;
      }
      if (responseImplementation) {
        responseImpl = responseImplementation;
      }
    },

    fetch() {
      if (fetchImpl) {
        return fetchImpl;
      }
      if (typeof self !== 'undefined' && 'fetch' in self) {
        return self.fetch;
      }
      if (typeof globalThis !== 'undefined' && globalThis.fetch) {
        return globalThis.fetch;
      }
      if (typeof fetch !== 'undefined') {
        return fetch;
      }
      debugFail(
        'Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill'
      );
    },

    headers() {
      if (headersImpl) {
        return headersImpl;
      }
      if (typeof self !== 'undefined' && 'Headers' in self) {
        return self.Headers;
      }
      if (typeof globalThis !== 'undefined' && globalThis.Headers) {
        return globalThis.Headers;
      }
      if (typeof Headers !== 'undefined') {
        return Headers;
      }
      debugFail(
        'Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill'
      );
    },

    response() {
      if (responseImpl) {
        return responseImpl;
      }
      if (typeof self !== 'undefined' && 'Response' in self) {
        return self.Response;
      }
      if (typeof globalThis !== 'undefined' && globalThis.Response) {
        return globalThis.Response;
      }
      if (typeof Response !== 'undefined') {
        return Response;
      }
      debugFail(
        'Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill'
      );
    }
  };
})();
