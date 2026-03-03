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

import type { ReactNativeFirebase } from '@react-native-firebase/app';

// ============ Statics Interface ============

export interface Statics {
  SDK_VERSION: string;
}

// ============ Module Interface (public/modular API) ============

/**
 * The Firebase Installations service interface (modular/public API).
 * Only exposes the app reference; use modular functions or the internal type for methods.
 *
 * > This module is available for the default app or a given app.
 *
 * #### Example
 *
 * Get the installations instance for the default app:
 *
 * ```js
 * const defaultInstallations = getInstallations();
 * ```
 */
export interface Installations {
  /** The FirebaseApp this module is associated with */
  app: ReactNativeFirebase.FirebaseApp;
}
