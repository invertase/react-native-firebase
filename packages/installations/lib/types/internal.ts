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

import type { Installations } from './installations';

export interface RNFBInstallationsModule {
  getId(): Promise<string>;
  getToken(forceRefresh: boolean): Promise<string>;
  deleteInstallations(): Promise<void>;
}

declare module '@react-native-firebase/app/dist/module/internal/NativeModules' {
  interface ReactNativeFirebaseNativeModules {
    NativeRNFBTurboInstallations: RNFBInstallationsModule;
  }
}

export interface InstallationsInternal extends Installations {
  getId(): Promise<string>;
  getToken(forceRefresh?: boolean): Promise<string>;
  delete(): Promise<void>;
  readonly native: RNFBInstallationsModule;
}
