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

import { isIOS } from '@react-native-firebase/app/dist/module/common';
import {
  FirebaseModule,
  getOrCreateModularInstance,
} from '@react-native-firebase/app/dist/module/internal';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import './types/internal';
import type { FirebaseApp } from '@react-native-firebase/app';
import type {
  IdChangeCallbackFn,
  IdChangeUnsubscribeFn,
  Installations,
} from './types/installations';
import type { InstallationsInternal } from './types/internal';
import { version } from './version';

const nativeModuleName = 'NativeRNFBTurboInstallations';

class FirebaseInstallationsModule extends FirebaseModule<typeof nativeModuleName> {
  getId(): Promise<string> {
    return this.native.getId();
  }

  getToken(forceRefresh?: boolean): Promise<string> {
    if (!forceRefresh) {
      return this.native.getToken(false);
    } else {
      return this.native.getToken(true);
    }
  }

  delete(): Promise<void> {
    return this.native.deleteInstallations();
  }

  onIdChange(): () => void {
    if (isIOS) {
      return () => {};
    }

    // TODO implement change listener on Android
    return () => {};
  }
}

const config: ModuleConfig = {
  namespace: 'installations',
  nativeModuleName,
  nativeEvents: false, // TODO implement android id change listener: ['installations_id_changed'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  turboModule: true,
};

/**
 * RN Firebase package version string exported from the modular entry point.
 *
 * The firebase-js-sdk does not export `SDK_VERSION` from `@firebase/installations`.
 */
export const SDK_VERSION = version;

/**
 * Returns the {@link Installations} instance for the default or given {@link FirebaseApp}.
 *
 * @param app - The Firebase `FirebaseApp` to use. When omitted, the default app is used.
 * @returns The Installations service instance for that app.
 */
export function getInstallations(app?: FirebaseApp): Installations {
  return getOrCreateModularInstance(
    FirebaseInstallationsModule,
    config,
    app,
  ) as unknown as Installations;
}

/**
 * Deletes the Firebase Installation and all associated data.
 */
export function deleteInstallations(installations: Installations): Promise<void> {
  return (installations as InstallationsInternal).delete();
}

/**
 * Creates a Firebase Installation if there isn't one for the app and returns the Installation ID.
 */
export function getId(installations: Installations): Promise<string> {
  return (installations as InstallationsInternal).getId();
}

/**
 * Returns a Firebase Installations auth token, identifying the current Firebase Installation.
 */
export function getToken(installations: Installations, forceRefresh?: boolean): Promise<string> {
  return (installations as InstallationsInternal).getToken(forceRefresh);
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

export type {
  IdChangeCallbackFn,
  IdChangeUnsubscribeFn,
  Installations,
} from './types/installations';
