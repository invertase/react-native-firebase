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

import { ReactNativeFirebase } from '@react-native-firebase/app';
import { VertexAI, VertexAIOptions } from './public-types';
import { DEFAULT_LOCATION } from './constants';
import { InternalAppCheck, InternalAuth } from './types/internal';

export class VertexAIService implements VertexAI {
  auth: InternalAuth | null;
  appCheck: InternalAppCheck | null;
  location: string;

  constructor(
    public app: ReactNativeFirebase.FirebaseApp,
    auth?: InternalAuth,
    appCheck?: InternalAppCheck,
    public options?: VertexAIOptions,
  ) {
    this.auth = auth || null;
    this.appCheck = appCheck || null;
    this.location = this.options?.location || DEFAULT_LOCATION;
  }
}
