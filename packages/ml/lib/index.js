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
import version from './version';

const statics = {};

const namespace = 'ml';

const nativeModuleName = 'RNFBMLModule';

class FirebaseMLModule extends FirebaseModule {}

// import { SDK_VERSION } from '@react-native-firebase/ml';
export const SDK_VERSION = version;

// import ML from '@react-native-firebase/ml';
// ml().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseMLModule,
});

// import ml, { firebase } from '@react-native-firebase/ml';
// ml().X(...);
// firebase.ml().X(...);
export const firebase = getFirebaseRoot();

// e.g.
// // import { MLCloudTextRecognizerModelType } from '@react-native-firebase/ml';
