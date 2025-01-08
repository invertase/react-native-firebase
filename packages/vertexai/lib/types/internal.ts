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

import { AppCheckTokenResult } from '@firebase/app-check-interop-types';
import { FirebaseAuthTokenData } from '@firebase/auth-interop-types';
import { FirebaseApp } from '@firebase/app';

export interface ApiSettings {
  apiKey: string;
  project: string;
  location: string;
  getAuthToken?: () => Promise<FirebaseAuthTokenData | null>;
  getAppCheckToken?: () => Promise<AppCheckTokenResult>;
}

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface _FirebaseService {
  app: FirebaseApp;
  /**
   * Delete the service and free it's resources - called from
   * {@link @firebase/app#deleteApp | deleteApp()}
   */
  _delete(): Promise<void>;
}
