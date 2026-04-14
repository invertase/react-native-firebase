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

import type { FirebaseRemoteConfigTypes } from './types/namespaced';

// Export modular API functions
export * from './modular';
export type {
  ConfigUpdate,
  ConfigUpdateObserver,
  CustomSignals,
  FetchStatus,
  LogLevel,
  RemoteConfig,
  RemoteConfigSettings,
  Unsubscribe,
  Value,
} from './types/remote-config';
export type { FirebaseRemoteConfigTypes } from './types/namespaced';
export type ConfigSettings = FirebaseRemoteConfigTypes.ConfigSettings;
export type ConfigDefaults = FirebaseRemoteConfigTypes.ConfigDefaults;
export type ConfigValue = FirebaseRemoteConfigTypes.ConfigValue;
export type ConfigValues = FirebaseRemoteConfigTypes.ConfigValues;
export type LastFetchStatusType = FirebaseRemoteConfigTypes.LastFetchStatusType;
export type RemoteConfigLogLevel = FirebaseRemoteConfigTypes.RemoteConfigLogLevel;
export { LastFetchStatus, ValueSource } from './statics';

// Export namespaced API
export { SDK_VERSION, firebase } from './namespaced';
export { default } from './namespaced';
