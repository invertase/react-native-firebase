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
import type { FirebaseRemoteConfigTypes } from './types/namespaced';

export type { FirebaseRemoteConfigTypes } from './types/namespaced';

export type {
  RemoteConfigLogLevel,
  ConfigValue,
  ConfigValues,
  ConfigSettings,
  ConfigDefaults,
  LastFetchStatusType,
  ConfigUpdate,
  ConfigUpdateObserver,
  Unsubscribe,
  CustomSignals,
  RemoteConfig,
} from './types/remote-config';

type RemoteConfigNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseRemoteConfigTypes.Module,
  FirebaseRemoteConfigTypes.Statics
> & {
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

declare const defaultExport: RemoteConfigNamespace;

export const firebase: ReactNativeFirebase.Module & {
  remoteConfig: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { remoteConfig(): FirebaseRemoteConfigTypes.Module };
};

export default defaultExport;

export * from './modular';
