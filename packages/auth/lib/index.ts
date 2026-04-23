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

export type FirebaseApp = import('@react-native-firebase/app').ReactNativeFirebase.FirebaseApp;
export type Observer<T> = {
  next?: ((value: T) => void) | null;
  error?: ((error: Error) => void) | null;
  complete?: (() => void) | null;
};
export type ActionCodeInfoData = import('./types/namespaced').FirebaseAuthTypes.ActionCodeInfoData;
export type ActionCodeSettingsAndroid =
  import('./types/namespaced').FirebaseAuthTypes.ActionCodeSettingsAndroid;
export type ActionCodeSettingsIos =
  import('./types/namespaced').FirebaseAuthTypes.ActionCodeSettingsIos;
export type AuthListenerCallback =
  import('./types/namespaced').FirebaseAuthTypes.AuthListenerCallback;
export type MultiFactor = import('./types/namespaced').FirebaseAuthTypes.MultiFactor;
export type MultiFactorInfoCommon =
  import('./types/namespaced').FirebaseAuthTypes.MultiFactorInfoCommon;
export type UpdateProfile = import('./types/namespaced').FirebaseAuthTypes.UpdateProfile;

export {
  ActionCodeOperation,
  FactorId,
  OperationType,
  ProviderId,
  SignInMethod,
} from './types/auth';

export type * from './types/auth';
export * from './types/namespaced';
export * from './modular';
export { SDK_VERSION, firebase } from './namespaced';
export { default } from './namespaced';
