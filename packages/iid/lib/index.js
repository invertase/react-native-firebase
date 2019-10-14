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

const namespace = 'iid';

const nativeModuleName = 'RNFBIidModule';

class FirebaseIidModule extends FirebaseModule {
  get() {
    return this.native.get();
  }

  getToken(authorizedEntity, scope) {
    return this.native.getToken(
      authorizedEntity || this.app.options.messagingSenderId,
      scope || '*',
    );
  }

  deleteToken(authorizedEntity, scope) {
    return this.native.deleteToken(
      authorizedEntity || this.app.options.messagingSenderId,
      scope || '*',
    );
  }

  delete() {
    return this.native.delete();
  }
}

// import { SDK_VERSION } from '@react-native-firebase/iid';
export const SDK_VERSION = version;

// import iid from '@react-native-firebase/iid';
// iid().get();
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseIidModule,
});

// import iid, { firebase } from '@react-native-firebase/iid';
// iid().get();
// firebase.iid().get();
export const firebase = getFirebaseRoot();
