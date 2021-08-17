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

import { isIOS } from '@react-native-firebase/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';

import version from './version';

const statics = {};

const namespace = 'installations';

const nativeModuleName = 'RNFBInstallationsModule';

class FirebaseInstallationsModule extends FirebaseModule {
  getId() {
    return this.native.getId();
  }

  getToken(forceRefresh) {
    if (!forceRefresh) {
      return this.native.getToken(false);
    } else {
      return this.native.getToken(true);
    }
  }

  delete() {
    return this.native.delete();
  }

  onIdChange() {
    if (isIOS) {
      return () => {};
    }

    // TODO implement change listener on Android
    return () => {};
  }
}

// import { SDK_VERSION } from '@react-native-firebase/installations';
export const SDK_VERSION = version;

// import installations from '@react-native-firebase/installations';
// installations().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false, // TODO implement android id change listener: ['installations_id_changed'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseInstallationsModule,
});

// import installations, { firebase } from '@react-native-firebase/installations';
// installations().X(...);
// firebase.installations().X(...);
export const firebase = getFirebaseRoot();
