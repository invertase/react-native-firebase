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

import type { Functions } from 'firebase/functions';

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
 * Extends the Firebase Functions type to include properties that may be set
 * internally but are not part of the public API.
 */
export interface FunctionsWebInternal extends Functions {
  emulatorOrigin?: string;
}
