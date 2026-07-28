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

export type FirebaseApp = ReactNativeFirebase.FirebaseApp;

/**
 * Firebase ML service instance for the modular API.
 *
 * Current Firebase JS SDK releases do not ship a `firebase/ml` modular entry point; this interface
 * follows the same modular service-instance pattern used elsewhere in React Native Firebase (see e.g.
 * the Firestore package's `Firestore` type).
 */
export interface FirebaseML extends ReactNativeFirebase.FirebaseModule {
  /** The FirebaseApp this module is associated with */
  app: FirebaseApp;
}
