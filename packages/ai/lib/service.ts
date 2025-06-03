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

import { ReactNativeFirebase } from '@react-native-firebase/app';
import { AI, Backend } from './public-types';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { FirebaseAppCheckTypes } from '@react-native-firebase/app-check';
import { VertexAIBackend } from './backend';

export class AIService implements AI {
  auth: FirebaseAuthTypes.Module | null;
  appCheck: FirebaseAppCheckTypes.Module | null;
  location: string;

  constructor(
    public app: ReactNativeFirebase.FirebaseApp,
    public backend: Backend,
    auth?: FirebaseAuthTypes.Module,
    appCheck?: FirebaseAppCheckTypes.Module,
  ) {
    this.auth = auth || null;
    this.appCheck = appCheck || null;
    if (backend instanceof VertexAIBackend) {
      this.location = backend.location;
    } else {
      this.location = '';
    }
  }
}
