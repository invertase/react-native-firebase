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

// Export types from types/appcheck
export type {
  AppCheckProvider,
  CustomProviderOptions,
  AppCheckOptions,
  AppCheckToken,
  AppCheckTokenResult,
  AppCheckListenerResult,
  PartialObserver,
  Observer,
  NextFn,
  ErrorFn,
  CompleteFn,
  Unsubscribe,
  ReactNativeFirebaseAppCheckProviderOptions,
  ReactNativeFirebaseAppCheckProviderWebOptions,
  ReactNativeFirebaseAppCheckProviderAppleOptions,
  ReactNativeFirebaseAppCheckProviderAndroidOptions,
  ReactNativeFirebaseAppCheckProvider,
  AppCheck,
  FirebaseAppCheckTypes,
} from './types/appcheck';

// Export modular API functions
export * from './modular';

// Export namespaced API
export * from './namespaced';
export { default } from './namespaced';
