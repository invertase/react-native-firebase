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

const namespace = 'appCheck';

const nativeModuleName = 'RNFBAppCheckModule';

class FirebaseAppCheckModule extends FirebaseModule {
  activate(siteKeyOrProvider, isTokenAutoRefreshEnabled) {
    return this.native.activate(siteKeyOrProvider, isTokenAutoRefreshEnabled);
  }

  setTokenAutoRefreshEnabled(isTokenAutoRefreshEnabled) {
    this.native.setTokenAutoRefreshEnabled(isTokenAutoRefreshEnabled);
  }

  getToken(forceRefresh) {
    if (!forceRefresh) {
      return this.native.getToken(false);
    } else {
      return this.native.getToken(true);
    }
  }

  onTokenChanged() {
    // iOS does not provide any native listening feature
    if (isIOS) {
      return () => {};
    }
    // TODO unimplemented on Android
    return () => {};
  }
}

// import { SDK_VERSION } from '@react-native-firebase/app-check';
export const SDK_VERSION = version;

// import appCheck from '@react-native-firebase/app-check';
// appCheck().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false, // TODO implement ['appcheck-token-changed'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseAppCheckModule,
});

// import appCheck, { firebase } from '@react-native-firebase/app-check';
// appCheck().X(...);
// firebase.appCheck().X(...);
export const firebase = getFirebaseRoot();
