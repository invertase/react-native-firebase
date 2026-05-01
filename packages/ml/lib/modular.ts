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

import { getApp } from '@react-native-firebase/app';
import type { FirebaseApp, FirebaseML } from './types/ml';

/**
 * Returns the {@link FirebaseML} instance for the default or given {@link FirebaseApp}.
 *
 * @param app - The Firebase `FirebaseApp` to use. When omitted, the default app is used.
 * @returns The ML service instance for that app.
 */
export function getML(app?: FirebaseApp): FirebaseML {
  if (app) {
    return getApp(app.name).ml();
  }
  return getApp().ml();
}
