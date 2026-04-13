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
const { polyfillGlobal } = require('react-native/Libraries/Utilities/PolyfillFunctions') as {
  polyfillGlobal: <T>(name: string, getValue: () => T) => void;
};
const { fetch, Headers, Request, Response } = require('react-native-fetch-api') as {
  fetch: typeof globalThis.fetch;
  Headers: typeof globalThis.Headers;
  Request: typeof globalThis.Request;
  Response: typeof globalThis.Response;
};
const { ReadableStream } = require('web-streams-polyfill/dist/ponyfill') as {
  ReadableStream: typeof globalThis.ReadableStream;
};

type PolyfilledFetch = typeof fetch;
type PolyfilledFetchArgs = Parameters<PolyfilledFetch>;
type StreamingFetchInit = NonNullable<PolyfilledFetchArgs[1]> & {
  reactNative?: {
    textStreaming?: boolean;
  };
};

const fetchWithTextStreaming: PolyfilledFetch = (...args) => {
  const [input, init] = args;
  const nextInit: StreamingFetchInit = {
    ...(init as StreamingFetchInit | undefined),
    reactNative: { textStreaming: true },
  };

  return fetch(input, nextInit);
};

polyfillGlobal('fetch', (): PolyfilledFetch => fetchWithTextStreaming);
polyfillGlobal('Headers', () => Headers);
polyfillGlobal('Request', () => Request);
polyfillGlobal('Response', () => Response);
polyfillGlobal('ReadableStream', () => ReadableStream);

import 'text-encoding';
