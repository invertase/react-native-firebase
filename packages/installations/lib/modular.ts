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
import type { FirebaseApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type { Installations } from './types/installations';
import type { InstallationsInternal } from './types/internal';

function withModularDeprecationArg(installations: Installations): InstallationsInternal {
  return installations as InstallationsInternal;
}

type IdChangeCallbackFn = (installationId: string) => void;
type IdChangeUnsubscribeFn = () => void;

/**
 * Returns an instance of Installations associated with the given FirebaseApp instance.
 */
export function getInstallations(app?: FirebaseApp): Installations {
  if (app) {
    return getApp(app.name).installations();
  }
  return getApp().installations();
}

/**
 * Deletes the Firebase Installation and all associated data.
 */
export function deleteInstallations(installations?: Installations): Promise<void> {
  const internalInstallations = withModularDeprecationArg(installations as Installations);
  return internalInstallations.delete.call(internalInstallations, MODULAR_DEPRECATION_ARG);
}

/**
 * Creates a Firebase Installation if there isn't one for the app and returns the Installation ID.
 */
export function getId(installations: Installations): Promise<string> {
  const internalInstallations = withModularDeprecationArg(installations);
  return internalInstallations.getId.call(internalInstallations, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a Firebase Installations auth token, identifying the current Firebase Installation.
 */
export function getToken(installations: Installations, forceRefresh?: boolean): Promise<string> {
  const internalInstallations = withModularDeprecationArg(installations);
  return internalInstallations.getToken.call(
    internalInstallations,
    forceRefresh,
    MODULAR_DEPRECATION_ARG,
  );
}

/**
 * Throw an error since react-native-firebase does not support this method.
 *
 * Sets a new callback that will get called when Installation ID changes. Returns an unsubscribe function that will remove the callback when called.
 */
export function onIdChange(
  _installations: Installations,
  _callback: IdChangeCallbackFn,
): IdChangeUnsubscribeFn {
  throw new Error('onIdChange() is unsupported by the React Native Firebase SDK.');
}
