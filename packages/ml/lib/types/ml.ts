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

// ============ Module Interface (public/modular API) ============

/**
 * ML module instance - returned from firebase.ml() or getML().
 * Note: Firebase ML Kit has no JavaScript SDK; types match RNFB native API.
 */
export interface ML {
  /** The FirebaseApp this module is associated with */
  app: ReactNativeFirebase.FirebaseApp;
}

// ============ Statics Interface ============

export interface Statics {
  SDK_VERSION: string;
}

/**
 * FirebaseApp type with ml() method.
 * @deprecated Import FirebaseApp from '@react-native-firebase/app' instead.
 */
export type FirebaseApp = ReactNativeFirebase.FirebaseApp;
