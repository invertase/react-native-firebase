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

import type { Functions as FirebaseFunctionsSdk } from 'firebase/functions';
import type { Functions, HttpsCallableOptions, HttpsCallableStreamOptions } from './functions';

export interface FunctionsInternal extends Functions {
  httpsCallable<RequestData = unknown, ResponseData = unknown, StreamData = unknown>(
    name: string,
    options?: HttpsCallableOptions,
  ): import('./functions').HttpsCallable<RequestData, ResponseData, StreamData>;
  httpsCallableFromUrl<RequestData = unknown, ResponseData = unknown, StreamData = unknown>(
    url: string,
    options?: HttpsCallableOptions,
  ): import('./functions').HttpsCallable<RequestData, ResponseData, StreamData>;
  useEmulator(host: string, port: number): void;
}

export interface FunctionsStreamingEventBody {
  data?: unknown;
  done?: boolean;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export interface FunctionsStreamingEvent {
  eventName: string;
  listenerId: number;
  body: FunctionsStreamingEventBody;
}

/**
 * Internal type for web Functions instance with additional internal properties.
 * Intersects firebase-js-sdk Functions (not the RNFB modular instance) with RNFB web hacks.
 */
export type FunctionsWebInternal = FirebaseFunctionsSdk & {
  region?: string;
  customDomain?: string | null;
  emulatorOrigin?: string;
};

/**
 * Internal type for custom https callable options.
 * Extends the HttpsCallableOptions type to include the httpsCallableStreamOptions property.
 */
export interface CustomHttpsCallableOptions extends HttpsCallableOptions {
  httpsCallableStreamOptions: HttpsCallableStreamOptions;
}
