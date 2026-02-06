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
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/dist/module/internal';

import { version } from './version';
import type { Statics, Installations } from './types/installations';

const statics: Statics = {
  SDK_VERSION: version,
};

const namespace = 'installations';

const nativeModuleName = 'RNFBInstallationsModule';

class FirebaseInstallationsModule extends FirebaseModule implements Installations {
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
    return this.native.delete();
  }

  onIdChange(): () => void {
    if (isIOS) {
      return () => {};
    }

    // TODO implement change listener on Android
    return () => {};
  }
}

// import { SDK_VERSION } from '@react-native-firebase/installations';
export const SDK_VERSION: string = version;

// import installations from '@react-native-firebase/installations';
// installations().X(...);
const installationsNamespace = createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false, // TODO implement android id change listener: ['installations_id_changed'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseInstallationsModule,
});

type InstallationsNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  Installations,
  Statics
> & {
  installations: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<Installations, Statics>;
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

export default installationsNamespace as unknown as InstallationsNamespace;

// import installations, { firebase } from '@react-native-firebase/installations';
// installations().X(...);
// firebase.installations().X(...);
export const firebase =
  getFirebaseRoot() as unknown as ReactNativeFirebase.FirebaseNamespacedExport<
    'installations',
    Installations,
    Statics,
    false
  >;
