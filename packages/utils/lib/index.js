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

import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import { isIOS } from '@react-native-firebase/common';
import UtilsStatics from './UtilsStatics';
import version from './version';

const namespace = 'utils';
const statics = UtilsStatics;

const nativeModuleName = 'RNFBUtilsModule';

class FirebaseUtilsModule extends FirebaseModule {
  get isRunningInTestLab() {
    if (isIOS) {
      return false;
    }
    return this.native.isRunningInTestLab;
  }
}

// import { SDK_VERSION } from '@react-native-firebase/utils';
export const SDK_VERSION = version;

// import utils from '@react-native-firebase/utils';
// utils().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseUtilsModule,
});

// import utils, { firebase } from '@react-native-firebase/utils';
// utils().X(...);
// firebase.utils().X(...);
export const firebase = getFirebaseRoot();
