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

const namespace = '_template_';

const nativeModuleName = 'RNFB_Template_Module';

class Firebase_Template_Module extends FirebaseModule {

}

// import { SDK_VERSION } from '@react-native-firebase/_template_';
export const SDK_VERSION = version;

// import _template_ from '@react-native-firebase/_template_';
// _template_().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: Firebase_Template_Module,
});

// import _template_, { firebase } from '@react-native-firebase/_template_';
// _template_().X(...);
// firebase._template_().X(...);
export const firebase = getFirebaseRoot();
