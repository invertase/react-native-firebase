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

import {
  FirebaseModule,
  getOrCreateModularInstance,
} from '@react-native-firebase/app/dist/module/internal';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import './types/internal';
import type { FirebaseApp, FirebaseML } from './types/ml';
import { version } from './version';

const nativeModuleName = 'NativeRNFBTurboML';

class FirebaseMLModule extends FirebaseModule<typeof nativeModuleName> {}

const config: ModuleConfig = {
  namespace: 'ml',
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  turboModule: true,
};

/**
 * RN Firebase package version string exported from the modular entry point.
 *
 * The firebase-js-sdk does not ship a `firebase/ml` modular entry point or `SDK_VERSION` export.
 */
export const SDK_VERSION = version;

/**
 * Returns the {@link FirebaseML} instance for the default or given {@link FirebaseApp}.
 *
 * @param app - The Firebase `FirebaseApp` to use. When omitted, the default app is used.
 * @returns The ML service instance for that app.
 */
export function getML(app?: FirebaseApp): FirebaseML {
  return getOrCreateModularInstance(FirebaseMLModule, config, app) as unknown as FirebaseML;
}

export type { FirebaseApp, FirebaseML } from './types/ml';
