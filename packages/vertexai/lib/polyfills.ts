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
// @ts-ignore
import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';
// @ts-ignore
import { ReadableStream } from 'web-streams-polyfill/dist/ponyfill';
// @ts-ignore
import { fetch, Headers, Request, Response } from 'react-native-fetch-api';

polyfillGlobal(
  'fetch',
  () =>
    (...args: any[]) =>
      fetch(args[0], { ...args[1], reactNative: { textStreaming: true } }),
);
polyfillGlobal('Headers', () => Headers);
polyfillGlobal('Request', () => Request);
polyfillGlobal('Response', () => Response);
polyfillGlobal('ReadableStream', () => ReadableStream);

import 'text-encoding';
