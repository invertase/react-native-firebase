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

import type { FirebaseApp } from '@react-native-firebase/app';

/**
 * An user defined callback function that gets called when Installations ID changes.
 */
export type IdChangeCallbackFn = (installationId: string) => void;

/**
 * Unsubscribe a callback function previously added via {@link IdChangeCallbackFn}.
 */
export type IdChangeUnsubscribeFn = () => void;

/**
 * Firebase Installations service instance.
 */
export interface Installations {
  /**
   * The current `FirebaseApp` instance for this Firebase service.
   */
  app: FirebaseApp;
}
